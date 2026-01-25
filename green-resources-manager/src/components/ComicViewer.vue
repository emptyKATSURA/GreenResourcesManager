<template>
  <!-- 漫画阅读器 -->
  <div v-if="visible" class="comic-viewer-overlay" @click="closeViewer">
    <div class="comic-viewer-content" @click.stop>
      <!-- 阅读器头部 -->
      <div class="comic-viewer-header">
        <div class="comic-info">
          <h3 class="comic-title">{{ album?.name || '漫画阅读器' }}</h3>
          <span class="page-info">{{ currentPageIndex + 1 }} / {{ pages.length }}</span>
        </div>
        <div class="comic-controls">
          <fun-button
            type="secondary"
            icon="🔍-"
            @click="zoomOut"
            :disabled="zoomLevel <= 0.5"
          />
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <fun-button
            type="secondary"
            icon="🔍+"
            @click="zoomIn"
            :disabled="zoomLevel >= 3"
          />
          <div class="quality-controls">
            <select v-model="imageQuality" @change="setImageQuality(imageQuality)" class="quality-select">
              <option value="high">高质量</option>
              <option value="medium">中等质量</option>
              <option value="low">低质量</option>
            </select>
          </div>
          <fun-button
            type="secondary"
            icon="⛶"
            @click="toggleFullscreen"
          >
            全屏
          </fun-button>
          <fun-button
            type="danger"
            icon="✕"
            @click="closeViewer"
          />
        </div>
      </div>
      
      <!-- 阅读器主体 -->
      <div class="comic-viewer-body" ref="comicViewerBody">
        <div class="comic-image-container" ref="imageContainer">
          <img 
            v-if="currentPageImage"
            :src="currentPageImage" 
            :alt="`第 ${currentPageIndex + 1} 页`"
            class="comic-image"
            :style="{ transform: `translate3d(${imageOffsetX}px, ${imageOffsetY}px, 0) scale(${zoomLevel})` }"
            @load="onImageLoad"
            @error="onImageError"
            @wheel="onImageWheel"
            @mousedown="onImageMouseDown"
            @mousemove="onImageMouseMove"
            @mouseup="onImageMouseUp"
            @mouseleave="onImageMouseUp"
          >
          <div v-else class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
      </div>
      
      <!-- 图片文件名显示 -->
      <div class="image-filename" v-if="currentPageImage && pages[currentPageIndex]">
        {{ getImageFileName(pages[currentPageIndex]) }}
        <span class="file-size">({{ currentFileSize > 0 ? formatFileSize(currentFileSize) : '获取中...' }})</span>
      </div>
      
      <!-- 阅读器底部导航 -->
      <div class="comic-viewer-footer">
        <div class="navigation-controls">
          <fun-button
            type="primary"
            icon="◀"
            @click="previousPage"
            :disabled="currentPageIndex <= 0"
          >
            上一页
          </fun-button>
          <div class="page-jump">
            <input 
              type="number" 
              v-model.number="jumpToPage" 
              :min="1" 
              :max="pages.length"
              @keyup.enter="jumpToPageNumber"
              class="page-input"
            >
            <fun-button
              type="secondary"
              @click="jumpToPageNumber"
            >
              跳转
            </fun-button>
          </div>
          <fun-button
            type="primary"
            icon="▶"
            @click="nextPage"
            :disabled="currentPageIndex >= pages.length - 1"
          >
            下一页
          </fun-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComicViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    album: {
      type: Object,
      default: null
    },
    pages: {
      type: Array,
      default: () => []
    },
    initialPageIndex: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'page-change', 'view-count-update'],
  data() {
    return {
      currentPageIndex: 0,
      currentPageImage: null,
      currentFileSize: 0,
      zoomLevel: 1,
      jumpToPage: 1,
      isFullscreen: false,
      // 图片拖动相关
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      // 图片质量设置
      imageQuality: 'high',
      // 优化的图片缓存系统
      imageCache: new Map(),
      imageCacheSize: 0,
      maxCacheSize: 50 * 1024 * 1024, // 50MB缓存限制
      preloadQueue: [],
      isPreloading: false,
      // 从设置中加载的配置
      jpegQuality: 80,
      thumbnailSize: 200,
      cacheSize: 50,
      preloadCount: 3,
      hardwareAcceleration: true,
      renderQuality: 'high'
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.currentPageIndex = this.initialPageIndex
        this.jumpToPage = this.initialPageIndex + 1
        this.loadCurrentPage()
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeydown)
      } else {
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeydown)
      }
    },
    initialPageIndex(newVal) {
      if (this.visible) {
        this.currentPageIndex = newVal
        this.jumpToPage = newVal + 1
        this.loadCurrentPage()
      }
    },
    pages: {
      handler(newPages, oldPages) {
        // 当pages数组从空变为有内容时，重新加载当前页
        if (this.visible && newPages && newPages.length > 0 && (!oldPages || oldPages.length === 0)) {
          console.log('ComicViewer: pages数组已加载，重新加载当前页')
          this.loadCurrentPage()
        }
      },
      immediate: false
    }
  },
  methods: {
    // 关闭阅读器
    closeViewer() {
      this.$emit('close')
      this.cleanup()
    },

    // 清理资源
    cleanup() {
      this.currentPageIndex = 0
      this.currentPageImage = null
      this.currentFileSize = 0
      this.zoomLevel = 1
      this.jumpToPage = 1
      
      // 重置拖动状态
      this.endDragging()
      this.imageOffsetX = 0
      this.imageOffsetY = 0
      
      // 清理缓存以释放内存
      this.clearImageCache()
      
      // 退出全屏
      if (this.isFullscreen && document.fullscreenElement) {
        document.exitFullscreen()
        this.isFullscreen = false
      }
    },

    // 加载当前页
    async loadCurrentPage() {
      if (this.pages && this.pages.length > 0 && this.currentPageIndex >= 0 && this.currentPageIndex < this.pages.length) {
        const imagePath = this.pages[this.currentPageIndex]
        console.log('加载当前页，图片路径:', imagePath)
        
        // 先清空当前图片，确保显示加载状态
        this.currentPageImage = null
        
        try {
          // 使用优化的图片解析
          const imageUrl = await this.resolveImageAsync(imagePath)
          
          // 验证 URL 是否有效
          if (!imageUrl || imageUrl.trim() === '') {
            console.error('图片解析返回空URL:', imagePath)
            this.currentPageImage = './default-image.png'
            return
          }
          
          this.currentPageImage = imageUrl
          this.jumpToPage = this.currentPageIndex + 1
          
          // 异步获取文件大小，不阻塞图片显示
          this.getFileSize(imagePath).then(size => {
            this.currentFileSize = size
          }).catch(error => {
            console.error('获取文件大小失败:', error)
            this.currentFileSize = 0
          })
          
          // 预加载相邻图片
          this.preloadImages(this.currentPageIndex, 2)
          
          // 通知父组件页面变化
          this.$emit('page-change', this.currentPageIndex)
        } catch (error) {
          console.error('加载当前页失败:', imagePath, error)
          // 加载失败时设置默认图片，避免无限加载
          this.currentPageImage = './default-image.png'
        }
      }
    },

    // 下一页
    async nextPage() {
      if (this.currentPageIndex < this.pages.length - 1) {
        this.currentPageIndex++
        // 切换页面时重置拖动偏移
        this.imageOffsetX = 0
        this.imageOffsetY = 0
        await this.loadCurrentPage()
        // 预加载更多图片
        this.preloadImages(this.currentPageIndex, 3)
      }
    },

    // 上一页
    async previousPage() {
      if (this.currentPageIndex > 0) {
        this.currentPageIndex--
        // 切换页面时重置拖动偏移
        this.imageOffsetX = 0
        this.imageOffsetY = 0
        await this.loadCurrentPage()
        // 预加载更多图片
        this.preloadImages(this.currentPageIndex, 3)
      }
    },

    // 跳转到指定页
    async jumpToPageNumber() {
      const pageNum = parseInt(this.jumpToPage)
      if (pageNum >= 1 && pageNum <= this.pages.length) {
        this.currentPageIndex = pageNum - 1
        // 跳转页面时重置拖动偏移
        this.imageOffsetX = 0
        this.imageOffsetY = 0
        await this.loadCurrentPage()
      }
    },

    // 放大
    zoomIn() {
      if (this.zoomLevel < 3) {
        this.zoomLevel = Math.min(3, this.zoomLevel + 0.25)
        // 如果缩放到1倍以下，重置拖动偏移
        if (this.zoomLevel <= 1) {
          this.imageOffsetX = 0
          this.imageOffsetY = 0
        } else {
          // 缩放后重新约束位置
          this.$nextTick(() => {
            this.constrainImagePosition()
          })
        }
      }
    },

    // 缩小
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.25)
        // 如果缩放到1倍以下，重置拖动偏移
        if (this.zoomLevel <= 1) {
          this.imageOffsetX = 0
          this.imageOffsetY = 0
        } else {
          // 缩放后重新约束位置
          this.$nextTick(() => {
            this.constrainImagePosition()
          })
        }
      }
    },

    // 全屏切换
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        // 让整个漫画阅读器全屏，而不是只有图片部分
        const comicViewerContent = document.querySelector('.comic-viewer-content')
        if (comicViewerContent) {
          comicViewerContent.requestFullscreen()
          this.isFullscreen = true
        }
      } else {
        document.exitFullscreen()
        this.isFullscreen = false
      }
    },

    // 设置图片质量
    setImageQuality(quality) {
      this.imageQuality = quality
      console.log('图片质量设置为:', quality)
      
      // 根据质量调整缓存大小，优先使用设置中的值
      const cacheSizeMB = this.cacheSize || 50
      switch (quality) {
        case 'high':
          this.maxCacheSize = Math.max(cacheSizeMB, 100) * 1024 * 1024
          break
        case 'medium':
          this.maxCacheSize = Math.max(cacheSizeMB, 50) * 1024 * 1024
          break
        case 'low':
          this.maxCacheSize = Math.max(cacheSizeMB, 20) * 1024 * 1024
          break
      }
      
      // 如果当前缓存超过新限制，清理缓存
      if (this.imageCacheSize > this.maxCacheSize) {
        this.clearImageCache()
      }
    },


    // 异步图片解析 - 用于需要DataURL的场景（如封面预览）
    async resolveImageAsync(imagePath) {
      if (!imagePath || (typeof imagePath === 'string' && imagePath.trim() === '')) {
        return './default-image.png'
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
        return imagePath
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('file:'))) {
        return imagePath
      }
      
      // 对于阅读器，强制使用原图，忽略缩略图缓存
      const normalizedPath = String(imagePath).replace(/\\/g, '/')
      const fileUrl = `file:///${normalizedPath}`
      
      // 为阅读器创建专用的原图缓存键
      const fullImageKey = `full_${imagePath}`
      this.addToCache(fullImageKey, fileUrl, 0)
      
      console.log('阅读器加载原图:', imagePath)
      return fileUrl
    },

    // LRU缓存管理方法
    addToCache(imagePath, url, size) {
      // 如果缓存已满，清理最旧的条目
      while (this.imageCacheSize + size > this.maxCacheSize && this.imageCache.size > 0) {
        this.evictOldestCache()
      }
      
      this.imageCache.set(imagePath, {
        url: url,
        size: size,
        lastAccessed: Date.now()
      })
      this.imageCacheSize += size
    },

    evictOldestCache() {
      let oldestKey = null
      let oldestTime = Date.now()
      
      for (const [key, value] of this.imageCache.entries()) {
        if (value.lastAccessed < oldestTime) {
          oldestTime = value.lastAccessed
          oldestKey = key
        }
      }
      
      if (oldestKey) {
        const removed = this.imageCache.get(oldestKey)
        this.imageCacheSize -= removed.size
        this.imageCache.delete(oldestKey)
        console.log('缓存清理:', oldestKey, '释放内存:', removed.size, 'bytes')
      }
    },

    // 预加载图片
    async preloadImages(startIndex, count = null) {
      // 使用设置中的预加载数量，如果没有指定则使用默认值
      const preloadCount = count || this.preloadCount || 3
      if (this.isPreloading || !this.pages || this.pages.length === 0) return
      
      this.isPreloading = true
      const preloadPromises = []
      
      // 预加载当前页前后的图片
      for (let i = Math.max(0, startIndex - 1); i <= Math.min(this.pages.length - 1, startIndex + preloadCount); i++) {
        if (i !== startIndex && !this.imageCache.has(this.pages[i])) {
          preloadPromises.push(this.preloadImage(this.pages[i]))
        }
      }
      
      try {
        await Promise.all(preloadPromises)
      } catch (error) {
        console.error('预加载图片失败:', error)
      } finally {
        this.isPreloading = false
      }
    },

    async preloadImage(imagePath) {
      try {
        const normalizedPath = String(imagePath).replace(/\\/g, '/')
        const fileUrl = `file:///${normalizedPath}`
        this.addToCache(imagePath, fileUrl, 0)
        
        // 创建Image对象预加载
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = fileUrl
        })
      } catch (error) {
        console.error('预加载单张图片失败:', imagePath, error)
      }
    },

    // 获取文件大小（异步）
    async getFileSize(filePath) {
      try {
        console.log('尝试获取文件大小:', filePath)
        if (window.electronAPI && window.electronAPI.getFileStats) {
          const result = await window.electronAPI.getFileStats(filePath)
          console.log('文件统计信息:', result)
          if (result && result.success && result.stats) {
            return result.stats.size || 0
          } else {
            console.error('获取文件统计信息失败:', result?.error || '未知错误')
            return 0
          }
        } else {
          console.log('Electron API 不可用，尝试使用 fetch 获取文件大小')
          // 降级方案：尝试通过 fetch 获取文件大小
          try {
            const response = await fetch(filePath, { method: 'HEAD' })
            const contentLength = response.headers.get('content-length')
            return contentLength ? parseInt(contentLength) : 0
          } catch (fetchError) {
            console.log('fetch 方法也失败:', fetchError)
            return 0
          }
        }
      } catch (error) {
        console.error('获取文件大小失败:', error)
        return 0
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },

    // 获取图片文件名
    getImageFileName(imagePath) {
      if (!imagePath) return ''
      // 从完整路径中提取文件名
      const fileName = imagePath.split(/[\\/]/).pop()
      return fileName || imagePath
    },

    // 图片加载事件
    onImageLoad() {
      // 图片加载完成后的处理
    },

    onImageError() {
      console.error('图片加载失败:', this.pages[this.currentPageIndex])
      this.currentPageImage = './default-image.png'
    },

    // 鼠标滚轮缩放
    onImageWheel(event) {
      event.preventDefault()
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },

    // 图片拖动相关方法
    onImageMouseDown(event) {
      // 只有在放大状态下才允许拖动
      if (this.zoomLevel > 1) {
        event.preventDefault()
        this.isDragging = true
        this.dragStartX = event.clientX - this.imageOffsetX
        this.dragStartY = event.clientY - this.imageOffsetY
        
        // 添加全局鼠标事件监听
        document.addEventListener('mousemove', this.onDocumentMouseMove)
        document.addEventListener('mouseup', this.onDocumentMouseUp)
      }
    },

    onImageMouseMove(event) {
      // 这个方法主要用于防止默认行为，实际拖动在 onDocumentMouseMove 中处理
      if (this.isDragging) {
        event.preventDefault()
      }
    },

    onImageMouseUp(event) {
      this.endDragging()
    },

    onDocumentMouseMove(event) {
      if (this.isDragging) {
        event.preventDefault()
        this.imageOffsetX = event.clientX - this.dragStartX
        this.imageOffsetY = event.clientY - this.dragStartY
        
        // 根据图片和容器尺寸动态计算拖动边界
        this.constrainImagePosition()
      }
    },

    onDocumentMouseUp(event) {
      this.endDragging()
    },

    endDragging() {
      if (this.isDragging) {
        this.isDragging = false
        
        // 移除全局鼠标事件监听
        document.removeEventListener('mousemove', this.onDocumentMouseMove)
        document.removeEventListener('mouseup', this.onDocumentMouseUp)
      }
    },

    // 约束图片位置，防止拖出合理范围
    constrainImagePosition() {
      const imageElement = document.querySelector('.comic-image')
      const containerElement = document.querySelector('.comic-image-container')
      
      if (!imageElement || !containerElement) return
      
      // 获取容器尺寸
      const containerRect = containerElement.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      // 获取图片原始尺寸
      const imageWidth = imageElement.naturalWidth
      const imageHeight = imageElement.naturalHeight
      
      if (imageWidth === 0 || imageHeight === 0) return
      
      // 计算缩放后的图片尺寸
      const scaledWidth = imageWidth * this.zoomLevel
      const scaledHeight = imageHeight * this.zoomLevel
      
      // 计算图片在容器中的显示尺寸（考虑 object-fit: contain）
      const containerAspectRatio = containerWidth / containerHeight
      const imageAspectRatio = imageWidth / imageHeight
      
      let displayWidth, displayHeight
      if (imageAspectRatio > containerAspectRatio) {
        // 图片更宽，以宽度为准
        displayWidth = Math.min(scaledWidth, containerWidth)
        displayHeight = displayWidth / imageAspectRatio
      } else {
        // 图片更高，以高度为准
        displayHeight = Math.min(scaledHeight, containerHeight)
        displayWidth = displayHeight * imageAspectRatio
      }
      
      // 计算最大允许的偏移量
      // 当图片放大后超出容器时，允许拖动的距离
      const maxOffsetX = Math.max(0, (scaledWidth - containerWidth) / 2)
      const maxOffsetY = Math.max(0, (scaledHeight - containerHeight) / 2)
      
      // 限制X轴偏移
      if (scaledWidth <= containerWidth) {
        // 图片宽度小于等于容器，不允许水平拖动
        this.imageOffsetX = 0
      } else {
        // 图片宽度大于容器，限制拖动范围
        this.imageOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, this.imageOffsetX))
      }
      
      // 限制Y轴偏移
      if (scaledHeight <= containerHeight) {
        // 图片高度小于等于容器，不允许垂直拖动
        this.imageOffsetY = 0
      } else {
        // 图片高度大于容器，限制拖动范围
        this.imageOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, this.imageOffsetY))
      }
    },

    // 清理图片缓存
    clearImageCache() {
      console.log('清理图片缓存，释放内存:', this.imageCacheSize, 'bytes')
      this.imageCache.clear()
      this.imageCacheSize = 0
      this.preloadQueue = []
      this.isPreloading = false
    },

    // 键盘快捷键处理
    handleKeydown(event) {
      if (!this.visible) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          this.previousPage()
          break
        case 'ArrowRight':
          event.preventDefault()
          this.nextPage()
          break
        case 'Escape':
          event.preventDefault()
          this.closeViewer()
          break
        case '+':
        case '=':
          event.preventDefault()
          this.zoomIn()
          break
        case '-':
          event.preventDefault()
          this.zoomOut()
          break
        case '0':
          event.preventDefault()
          this.zoomLevel = 1
          break
        case 'f':
        case 'F':
          event.preventDefault()
          this.toggleFullscreen()
          break
      }
    }
  },

  beforeUnmount() {
    // 清理事件监听器
    document.removeEventListener('keydown', this.handleKeydown)
    this.cleanup()
  }
}
</script>

<style scoped>
/* 漫画阅读器样式 */
.comic-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
}

.comic-viewer-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 95vw;
  height: 95vh;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
}

.comic-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: 12px 12px 0 0;
}

.comic-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.comic-title {
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.3s ease;
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.comic-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}


.zoom-level {
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-width: 50px;
  text-align: center;
}

.quality-controls {
  display: flex;
  align-items: center;
}

.quality-select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quality-select:hover {
  border-color: var(--accent-color);
}

.quality-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.1);
}

.comic-viewer-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
  overflow: hidden;
  position: relative;
  /* GPU硬件加速优化 */
  will-change: transform;
  transform: translateZ(0);
  /* 优化渲染性能 */
  contain: layout style paint;
}

.comic-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  /* GPU硬件加速优化 */
  will-change: transform;
  transform: translateZ(0);
  /* 优化渲染性能 */
  contain: layout style paint;
}

.comic-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  cursor: grab;
  user-select: none;
  /* GPU硬件加速优化 */
  will-change: transform;
  transform: translateZ(0); /* 强制启用硬件加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  /* 优化渲染性能 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  /* 减少重绘 */
  contain: layout style paint;
}

.comic-image:active {
  cursor: grabbing;
}

/* 当图片放大时显示拖动光标 */
.comic-image[style*="scale(1.25)"],
.comic-image[style*="scale(1.5)"],
.comic-image[style*="scale(1.75)"],
.comic-image[style*="scale(2)"],
.comic-image[style*="scale(2.25)"],
.comic-image[style*="scale(2.5)"],
.comic-image[style*="scale(2.75)"],
.comic-image[style*="scale(3)"] {
  cursor: grab;
}

.image-filename {
  text-align: center;
  padding: 8px 16px;
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  margin-left: 8px;
  opacity: 0.8;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comic-viewer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: 0 0 12px 12px;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}


.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-align: center;
  font-size: 0.9rem;
}


/* 全屏模式 */
.comic-viewer-content:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  max-width: none;
  max-height: none;
  background: var(--bg-primary);
}

.comic-viewer-content:fullscreen .comic-viewer-header,
.comic-viewer-content:fullscreen .comic-viewer-footer {
  border-radius: 0;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border: none;
}

.comic-viewer-content:fullscreen .comic-viewer-header {
  border-bottom: 1px solid var(--border-color);
}

.comic-viewer-content:fullscreen .comic-viewer-footer {
  border-top: 1px solid var(--border-color);
}

/* 全屏时隐藏文件名显示，避免遮挡图片 */
.comic-viewer-content:fullscreen .image-filename {
  display: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .comic-viewer-content {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .comic-viewer-header {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }
  
  .comic-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  
  .comic-viewer-footer {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }
  
  .navigation-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
