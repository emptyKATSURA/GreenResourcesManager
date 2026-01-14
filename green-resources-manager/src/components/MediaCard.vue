<template>
  <fun-card
    class="media-card"
    :class="ratingBorderClass"
    :data-type="type"
    :style="{ '--card-scale': scale / 100 }"
    :bordered="false"
    :shadow="false"
    :clickable="true"
    @click="$emit('click', item)"
    @contextmenu="$emit('contextmenu', $event, item)"
  >
    <div class="media-image">
      <img 
        :src="resolveImage(coverImagePath)" 
        :alt="itemName"
        loading="lazy"
        @error="handleImageError"
      >
      <!-- 动态徽章 -->
      <div v-if="badgeText && scale >= 30" class="media-badge">
        {{ badgeText }}
      </div>
      <!-- 左上角标识容器（文件丢失 + 压缩包） -->
      <div v-if="showFileError || showArchiveIcon" class="top-left-indicators">
        <!-- 文件不存在错误图标 -->
        <div v-if="showFileError" class="file-error-icon" title="本地文件不存在">
          ⚠️
        </div>
        <!-- 压缩包标识 -->
        <div v-if="showArchiveIcon" class="archive-icon" title="压缩包文件">
          📦
        </div>
      </div>
      <!-- 文件夹标识 -->
      <div v-if="type === 'folder'" class="folder-indicator" title="文件夹">
        📁
      </div>
      <!-- 收藏标识 -->
      <div v-if="itemIsFavorite" class="favorite-indicator" title="已收藏">
        ⭐
      </div>
      <div class="media-overlay" v-if="showActionButton">
        <div class="action-button" @click.stop="$emit('action', item)">
          <span class="action-icon">{{ actionIcon }}</span>
        </div>
      </div>
    </div>
    <div class="media-info">
      <h3 class="media-title" v-if="scale >= 30 || (type === 'game' && exeIcon && scale >= 20)">
        <img 
          v-if="type === 'game' && exeIcon && scale >= 20" 
          :src="exeIcon" 
          class="exe-icon"
          alt=""
          loading="lazy"
        >
        <span v-if="scale >= 30" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">{{ displayName }}</span>
      </h3>
      
      <!-- 游戏特有信息 -->
      <template v-if="type === 'game'">
        <p class="media-subtitle" v-if="scale >= 50">{{ itemDeveloper }}</p>
        <p class="media-tertiary" v-if="itemPublisher && itemPublisher !== '未知发行商' && scale >= 50">{{ itemPublisher }}</p>
        <p class="media-description" v-if="itemDescription && scale >= 50">{{ itemDescription }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <fun-tag 
            v-for="tag in displayTags.slice(0, 9)" 
            :key="tag" 
            :text="tag"
          />
          <span v-if="displayTags.length > 9" class="media-tag-more">+{{ displayTags.length - 9 }}</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <span class="stat-item">
            <span class="play-time-label">总时长:</span>
            {{ formatPlayTime(item.playTime) }}
          </span>
          <span class="stat-item" :class="{ 'running-status': isRunning }">
            <span v-if="isRunning" class="running-info">
              <span class="running-indicator">
                <span class="running-icon">▶️</span>
                <span class="running-text">运行中</span>
              </span>
              <span class="session-time" v-if="sessionDuration > 0">
                本次: {{ formatPlayTime(sessionDuration) }}
              </span>
            </span>
            <span v-else>{{ formatLastPlayed(item.lastPlayed) }}</span>
          </span>
        </div>
      </template>
      
      <!-- 图片特有信息 -->
      <template v-if="type === 'image'">
        <p class="media-subtitle" v-if="itemAuthor && scale >= 50">{{ itemAuthor }}</p>
        <p class="media-description" v-if="itemDescription && scale >= 50">{{ itemDescription }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <span 
            v-for="tag in displayTags.slice(0, 3)" 
            :key="tag" 
            class="media-tag"
          >{{ tag }}</span>
          <span v-if="displayTags.length > 3" class="media-tag-more">+{{ displayTags.length - 3 }}</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <span class="stat-item">{{ formatLastViewed(item.lastViewed) }}</span>
        </div>
      </template>
      
      <!-- 小说特有信息 -->
      <template v-if="type === 'novel'">
        <p class="media-subtitle" v-if="itemAuthor && scale >= 50">{{ itemAuthor }}</p>
        <p class="media-tertiary" v-if="itemGenre && scale >= 50">{{ itemGenre }}</p>
        <p class="media-description" v-if="itemDescription && scale >= 50">{{ itemDescription }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <span 
            v-for="tag in displayTags.slice(0, 3)" 
            :key="tag" 
            class="media-tag"
          >{{ tag }}</span>
          <span v-if="displayTags.length > 3" class="media-tag-more">+{{ displayTags.length - 3 }}</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (item.readProgress || 0) + '%' }"></div>
          </div>
          <div class="stats-row">
            <span class="stat-item">{{ item.readProgress || 0 }}%</span>
            <span class="stat-item">{{ formatReadTime(item.readTime) }}</span>
          </div>
          <div class="last-read">
            <span v-if="item.lastRead">{{ formatLastRead(item.lastRead) }}</span>
            <span v-else>从未阅读</span>
          </div>
        </div>
      </template>
      
      <!-- 视频特有信息 -->
      <template v-if="type === 'video'">
        <p class="media-subtitle" v-if="itemSeries && scale >= 50">{{ itemSeries }}</p>
        <p class="media-description" v-if="itemDescription && scale >= 50">{{ itemDescription }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <span 
            v-for="tag in displayTags.slice(0, 3)" 
            :key="tag" 
            class="media-tag"
          >{{ tag }}</span>
          <span v-if="displayTags.length > 3" class="media-tag-more">+{{ displayTags.length - 3 }}</span>
        </div>
        <div class="media-actors" v-if="item.actors && item.actors.length > 0 && scale >= 50">
          <span class="actors-label">演员:</span>
          <span class="actors-list">{{ item.actors.slice(0, 2).join(', ') }}</span>
          <span v-if="item.actors.length > 2" class="actors-more">等{{ item.actors.length }}人</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <div class="stats-row">
            <span class="watch-count">观看 {{ item.watchCount || 0 }} 次</span>
            <span class="last-watched">{{ formatLastWatched(item.lastWatched) }}</span>
          </div>
        </div>
      </template>
      
      <!-- 音频特有信息 -->
      <template v-if="type === 'audio'">
        <p class="media-subtitle" v-if="item.artist && scale >= 50">{{ item.artist }}</p>
        <p class="media-description" v-if="item.notes && scale >= 50">{{ item.notes }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <span 
            v-for="tag in displayTags.slice(0, 3)" 
            :key="tag" 
            class="media-tag"
          >{{ tag }}</span>
          <span v-if="displayTags.length > 3" class="media-tag-more">+{{ displayTags.length - 3 }}</span>
        </div>
        <div class="media-actors" v-if="item.actors && item.actors.length > 0 && scale >= 50">
          <span class="actors-label">演员:</span>
          <span class="actors-list">{{ item.actors.slice(0, 2).join(', ') }}</span>
          <span v-if="item.actors.length > 2" class="actors-more">等{{ item.actors.length }}人</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <div class="stats-row">
            <span class="play-count">播放 {{ item.playCount || 0 }} 次</span>
            <span class="last-played">{{ formatLastPlayed(item.lastPlayed) }}</span>
          </div>
        </div>
      </template>
      
      <!-- 文件夹特有信息 -->
      <template v-if="type === 'folder'">
        <p class="media-subtitle" v-if="itemSeries && scale >= 50">{{ itemSeries }}</p>
        <p class="media-description" v-if="itemDescription && scale >= 50">{{ itemDescription }}</p>
        <div class="media-tags" v-if="displayTags.length > 0 && scale >= 40">
          <span 
            v-for="tag in displayTags.slice(0, 3)" 
            :key="tag" 
            class="media-tag"
          >{{ tag }}</span>
          <span v-if="displayTags.length > 3" class="media-tag-more">+{{ displayTags.length - 3 }}</span>
        </div>
        <div class="media-actors" v-if="item.actors && item.actors.length > 0 && scale >= 50">
          <span class="actors-label">演员:</span>
          <span class="actors-list">{{ item.actors.slice(0, 2).join(', ') }}</span>
          <span v-if="item.actors.length > 2" class="actors-more">等{{ item.actors.length }}人</span>
        </div>
        <div class="media-stats" v-if="scale >= 40">
          <div class="stats-row">
            <span class="stat-item">{{ item.videoCount || 0 }} 个视频</span>
            <span class="stat-item">{{ formatAddedDate(item.addedDate) }}</span>
          </div>
        </div>
      </template>
    </div>
  </fun-card>
</template>

<script>
import { formatPlayTime, formatLastPlayed, formatDuration, formatVideoDuration } from '../utils/formatters'
import { useGameRunningStore } from '../stores/game-running'
import disguiseManager from '../utils/DisguiseManager'
import { isDisguiseModeEnabled } from '../utils/disguiseMode'
import { getGameScreenshotFolderPath } from '../composables/game/useGameScreenshot'
import { ResourceField } from '../class/base/ResourceField.ts'

/**
 * 安全获取资源属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 * @param {any} field - 可能是 ResourceField 或普通值
 * @returns {any} 字段的实际值
 */
function getFieldValue(field) {
  if (field instanceof ResourceField) {
    return field.value
  }
  return field
}

export default {
  name: 'MediaCard',
  props: {
    item: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: value => ['game', 'image', 'novel', 'video', 'audio', 'folder'].includes(value)
    },
    isRunning: {
      type: Boolean,
      default: false
    },
    isElectronEnvironment: {
      type: Boolean,
      default: false
    },
    fileExists: {
      type: Boolean,
      default: true
    },
    scale: {
      type: Number,
      default: 100
    }
  },
  emits: ['click', 'contextmenu', 'action'],
  data() {
    return {
      imageCache: {},
      disguiseImageCache: {}, // 伪装图片缓存
      disguiseTextCache: {}, // 伪装文字缓存
      disguiseTagCache: {}, // 伪装标签缓存
      disguiseModeState: false, // 伪装模式状态，用于触发响应式更新
      exeIconCache: {}, // exe 图标缓存
      exeIconLoaded: false, // 图标加载状态，用于触发响应式更新
      exeIconLoading: false, // 图标加载中标志，避免重复加载
      gameRunningStore: null, // 游戏运行状态 store
      sessionUpdateTimer: null, // 会话时长更新定时器
      updateTrigger: 0, // 用于触发响应式更新的时间戳
      screenshotCoverPath: null // 从截图文件夹读取的第一张图片路径（仅用于游戏类型）
    }
  },
  computed: {
    actionIcon() {
      if (this.type === 'game') {
        // 如果游戏正在运行，显示停止图标
        return this.isRunning ? '⏹️' : '▶️'
      }
      if (this.type === 'novel') return '📖'
      if (this.type === 'video') return '▶️'
      if (this.type === 'audio') return '▶️'
      if (this.type === 'folder') return '📁'
      return '📖' // image 类型也使用阅读图标
    },
    showActionButton() {
      // 对于压缩包类型的游戏，不显示 action 按钮
      if (this.type === 'game') {
        return !this.isArchive
      }
      return true
    },
    
    // 获取显示的名称（支持伪装模式）
    displayName() {
      // 依赖 disguiseModeState 以确保响应式更新
      const disguiseModeEnabled = this.disguiseModeState
      
      if (disguiseModeEnabled) {
        // 检查伪装文字缓存
        const itemId = getFieldValue(this.item.id)
        if (this.disguiseTextCache[itemId]) {
          return this.disguiseTextCache[itemId]
        }
        
        // 异步获取伪装文字
        this.loadDisguiseText(itemId)
        return getFieldValue(this.item.name) // 先返回原始名称，等异步加载完成
      }
      return getFieldValue(this.item.name)
    },
    
    // 获取显示的标签（支持伪装模式）
    displayTags() {
      const tags = getFieldValue(this.item.tags)
      if (!tags || tags.length === 0) {
        return []
      }
      
      // 依赖 disguiseModeState 以确保响应式更新
      const disguiseModeEnabled = this.disguiseModeState
      //console.log(`[displayTags] 伪装模式状态: ${disguiseModeEnabled}, 项目ID: ${getFieldValue(this.item.id)}, 原始标签:`, tags)
      
      if (disguiseModeEnabled) {
        // 为每个标签使用全局伪装方法（确保在所有地方显示一致）
        // 使用缓存，如果缓存中没有则异步加载
        const disguisedTags = tags.map(tag => {
          // 检查标签缓存
          if (this.disguiseTagCache[tag]) {
            return this.disguiseTagCache[tag]
          }
          
          // 异步加载标签伪装（不阻塞渲染）
          this.loadDisguiseTag(tag)
          return tag // 先返回原始标签，等异步加载完成后再更新
        })
        
        // console.log(`[displayTags] 最终伪装标签:`, disguisedTags)
        return disguisedTags
      }
      
      // console.log(`[displayTags] 伪装模式未启用，返回原始标签:`, tags)
      return tags
    },
    badgeText() {
      if (this.type === 'game') {
        return this.formatFolderSize(getFieldValue(this.item.folderSize))
      } else if (this.type === 'image') {
        return `${getFieldValue(this.item.pagesCount) || 0} 页`
      } else if (this.type === 'novel') {
        return this.formatWordCount(getFieldValue(this.item.totalWords))
      } else if (this.type === 'video') {
        return this.formatDuration(getFieldValue(this.item.duration))
      } else if (this.type === 'audio') {
        return this.formatAudioDuration(getFieldValue(this.item.duration))
      } else if (this.type === 'folder') {
        return `${getFieldValue(this.item.videoCount) || 0} 个视频`
      }
      return ''
    },
    showFileError() {
      // 优先使用 item.fileExists（如果存在），否则使用 prop 的 fileExists
      // 这样可以避免 prop 默认值导致的误判
      const itemFileExists = getFieldValue(this.item?.fileExists)
      const fileExistsValue = itemFileExists !== undefined ? itemFileExists : this.fileExists
      const shouldShow = ['game', 'audio', 'image', 'novel', 'video', 'folder'].includes(this.type) && fileExistsValue === false
      if (this.type === 'image' && fileExistsValue === false) {
        console.log('🔍 MediaCard showFileError:', {
          type: this.type,
          fileExists: this.fileExists,
          itemFileExists: itemFileExists,
          fileExistsValue: fileExistsValue,
          shouldShow: shouldShow,
          itemName: getFieldValue(this.item?.name)
        })
      }
      return shouldShow
    },
    isArchive() {
      if (this.type === 'game') {
        const isArchive = getFieldValue(this.item?.isArchive)
        const executablePath = getFieldValue(this.item?.executablePath)
        return isArchive || (executablePath && this.isArchiveFile(executablePath))
      } else if (this.type === 'image') {
        const isArchive = getFieldValue(this.item?.isArchive)
        const folderPath = getFieldValue(this.item?.folderPath)
        return isArchive || (folderPath && this.isArchiveFile(folderPath))
      }
      return false
    },
    showArchiveIcon() {
      return (this.type === 'game' || this.type === 'image') && this.isArchive
    },
    // 获取 exe 图标
    exeIcon() {
      const executablePath = getFieldValue(this.item?.executablePath)
      if (this.type !== 'game' || !executablePath) {
        return null
      }
      
      // 检查是否为 exe 文件
      const ext = executablePath.toLowerCase().split('.').pop()
      if (ext !== 'exe') {
        return null
      }
      
      // 检查缓存
      const cacheKey = executablePath
      if (this.exeIconCache[cacheKey]) {
        return this.exeIconCache[cacheKey]
      }
      
      // 不在 computed 中触发加载，避免重复调用
      // 加载逻辑移到 mounted 和 watch 中
      return null
    },
    // 获取本次游玩时间（仅在游戏运行时）
    sessionDuration() {
      // 依赖 updateTrigger 确保响应式更新
      void this.updateTrigger
      
      if (this.type !== 'game' || !this.isRunning || !this.item?.id || !this.gameRunningStore) {
        return 0
      }
      
      return this.gameRunningStore.getSessionDuration(getFieldValue(this.item.id))
    },
    // 根据评分获取边框类名
    ratingBorderClass() {
      const rating = getFieldValue(this.item?.rating)
      if (!rating || rating < 1 || rating > 5) {
        return '' // 没有评分或评分无效时返回空，保持原样
      }
      return `rating-border-${rating}`
    },
    // 获取封面图片路径
    // 优先使用 coverPath，如果没有则从截图文件夹读取第一张图片，最后使用默认图片
    coverImagePath() {
      // 优先使用 coverPath
      const coverPath = getFieldValue(this.item.coverPath)
      if (coverPath) {
        return coverPath
      }
      
      // 如果是游戏类型且没有封面，尝试使用从截图文件夹读取的图片
      if (this.type === 'game' && this.screenshotCoverPath) {
        return this.screenshotCoverPath
      }
      
      // 其他类型的资源使用各自的字段
      if (this.type !== 'game') {
        const cover = getFieldValue(this.item.cover)
        const thumbnail = getFieldValue(this.item.thumbnail)
        const thumbnailPath = getFieldValue(this.item.thumbnailPath)
        return cover || thumbnail || thumbnailPath || ''
      }
      
      // 游戏类型且没有封面和截图，返回空字符串（会在 resolveImage 中处理为默认图片）
      return ''
    },
    // 用于模板中访问 item 字段的辅助 computed 属性
    itemName() {
      return getFieldValue(this.item.name)
    },
    itemIsFavorite() {
      return getFieldValue(this.item.isFavorite)
    },
    itemDeveloper() {
      return getFieldValue(this.item.developer)
    },
    itemPublisher() {
      return getFieldValue(this.item.publisher)
    },
    itemDescription() {
      return getFieldValue(this.item.description)
    },
    itemAuthor() {
      return getFieldValue(this.item.author)
    },
    itemGenre() {
      return getFieldValue(this.item.genre)
    },
    itemSeries() {
      return getFieldValue(this.item.series)
    }
  },
  methods: {
    formatPlayTime,
    formatLastPlayed,
    formatReadTime(minutes) {
      if (!minutes) return '未阅读'
      if (minutes < 60) {
        return `${minutes} 分钟`
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours} 小时 ${mins} 分钟`
      } else {
        const days = Math.floor(minutes / 1440)
        const hours = Math.floor((minutes % 1440) / 60)
        return `${days} 天 ${hours} 小时`
      }
    },
    formatLastRead(dateString) {
      if (!dateString) return '从未阅读'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      
      if (diffDays === 0) {
        if (diffMinutes < 1) return '刚刚'
        if (diffMinutes < 60) return `${diffMinutes}分钟前`
        if (diffHours < 24) return `${diffHours}小时前`
      }
      
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      return this.formatDateTime(date)
    },
    formatLastViewed(dateString) {
      if (!dateString) return '从未查看'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      
      if (diffDays === 0) {
        if (diffMinutes < 1) return '刚刚查看'
        if (diffMinutes < 60) return `${diffMinutes}分钟前查看`
        if (diffHours < 24) return `${diffHours}小时前查看`
      }
      
      if (diffDays === 1) return '昨天查看'
      if (diffDays < 7) return `${diffDays}天前查看`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前查看`
      return this.formatDateTime(date)
    },
    formatLastWatched(dateString) {
      if (!dateString) return '从未观看'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      
      if (diffDays === 0) {
        if (diffMinutes < 1) return '刚刚观看'
        if (diffMinutes < 60) return `${diffMinutes}分钟前观看`
        if (diffHours < 24) return `${diffHours}小时前观看`
      }
      
      if (diffDays === 1) return '昨天观看'
      if (diffDays < 7) return `${diffDays}天前观看`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前观看`
      return this.formatDateTime(date)
    },
    formatAddedDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
      return `${Math.ceil(diffDays / 365)}年前`
    },
    formatDuration(minutes) {
      return formatVideoDuration(minutes, '未知时长')
    },
    formatAudioDuration(seconds) {
      return formatDuration(seconds, '未知时长')
    },
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    formatWordCount(wordCount) {
      if (!wordCount || wordCount === 0) return '未知字数'
      
      if (wordCount < 1000) {
        return `${wordCount} 字`
      } else if (wordCount < 10000) {
        return `${(wordCount / 1000).toFixed(1)} 千字`
      } else if (wordCount < 100000) {
        return `${(wordCount / 10000).toFixed(1)} 万字`
      } else {
        return `${(wordCount / 10000).toFixed(0)} 万字`
      }
    },
    formatFolderSize(sizeInBytes) {
      if (!sizeInBytes || sizeInBytes === 0) return '未知大小'
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = sizeInBytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      // 保留1位小数，但如果是整数则不显示小数
      const formattedSize = size % 1 === 0 ? size.toString() : size.toFixed(1)
      return `${formattedSize} ${units[unitIndex]}`
    },
    // 加载 exe 图标（使用全局缓存避免重复加载）
    async loadExeIcon() {
      const executablePath = getFieldValue(this.item?.executablePath)
      if (this.type !== 'game' || !executablePath) {
        return
      }
      
      // 检查是否为 exe 文件
      const ext = executablePath.toLowerCase().split('.').pop()
      if (ext !== 'exe') {
        return
      }
      
      const cacheKey = executablePath
      
      // 检查全局缓存（如果存在）
      if (window.__exeIconCache && window.__exeIconCache[cacheKey]) {
        this.exeIconCache[cacheKey] = window.__exeIconCache[cacheKey]
        this.exeIconLoaded = !this.exeIconLoaded
        return
      }
      
      // 如果已经在本地缓存中，直接返回
      if (this.exeIconCache[cacheKey]) {
        return
      }
      
      // 如果正在加载中，避免重复加载
      if (this.exeIconLoading) {
        return
      }
      
      // 如果不在 Electron 环境中，无法获取图标
      if (!this.isElectronEnvironment || !window.electronAPI || !window.electronAPI.getFileIcon) {
        return
      }
      
      // 检查全局加载队列，避免同时加载太多图标
      if (!window.__exeIconLoadingQueue) {
        window.__exeIconLoadingQueue = new Set()
      }
      
      // 如果该图标正在全局加载队列中，等待
      if (window.__exeIconLoadingQueue.has(cacheKey)) {
        // 等待最多 5 秒
        let waitCount = 0
        while (window.__exeIconLoadingQueue.has(cacheKey) && waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          waitCount++
          // 检查是否已经加载完成
          if (window.__exeIconCache && window.__exeIconCache[cacheKey]) {
            this.exeIconCache[cacheKey] = window.__exeIconCache[cacheKey]
            this.exeIconLoaded = !this.exeIconLoaded
            return
          }
        }
        return
      }
      
      // 添加到全局加载队列
      window.__exeIconLoadingQueue.add(cacheKey)
      this.exeIconLoading = true
      
      try {
        const result = await window.electronAPI.getFileIcon(executablePath, 32)
        if (result.success && result.icon) {
          // 初始化全局缓存
          if (!window.__exeIconCache) {
            window.__exeIconCache = {}
          }
          
          // 保存到全局缓存
          window.__exeIconCache[cacheKey] = result.icon
          
          // 保存到本地缓存
          if (this.$set) {
            this.$set(this.exeIconCache, cacheKey, result.icon)
          } else {
            this.exeIconCache[cacheKey] = result.icon
          }
          
          // 更新加载状态以触发 computed 重新计算
          this.exeIconLoaded = !this.exeIconLoaded
        }
      } catch (error) {
        console.warn('加载 exe 图标失败:', error)
      } finally {
        // 从全局加载队列中移除
        window.__exeIconLoadingQueue.delete(cacheKey)
        this.exeIconLoading = false
      }
    },
    resolveImage(imagePath) {
      // 如果传入的是 ResourceField 对象，提取其 value
      if (imagePath instanceof ResourceField) {
        imagePath = imagePath.value
      }
      
      // 空值返回默认
      if (!imagePath || (typeof imagePath === 'string' && imagePath.trim() === '')) {
        return this.getDefaultImage()
      }
      
      // 对于图片类型，如果文件不存在，直接返回默认图片（感叹号会通过 showFileError 显示）
      if (this.type === 'image' && this.fileExists === false) {
        return this.getDefaultImage()
      }
      
      // 检查是否启用伪装模式（对所有类型有效）
      // 依赖 disguiseModeState 以确保响应式更新
      if (this.disguiseModeState) {
        // console.log('MediaCard: 伪装模式已启用，处理图片:', imagePath)
        // 检查伪装图片缓存
        if (this.disguiseImageCache[imagePath]) {
          // console.log('MediaCard: 使用缓存的伪装图片:', this.disguiseImageCache[imagePath])
          return this.disguiseImageCache[imagePath]
        }
        
        // console.log('MediaCard: 开始异步加载伪装图片')
        // 异步获取伪装图片
        this.loadDisguiseImage(imagePath)
        return this.getDefaultImage() // 先返回默认图片，等异步加载完成
      }
      
      // 网络资源直接返回
      if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
        return imagePath
      }
      // 已是 data: 或 file: 直接返回
      if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('file:'))) {
        return imagePath
      }
      // 命中缓存
      if (this.imageCache[imagePath]) return this.imageCache[imagePath]
      
      // 对于视频和音频，使用专门的缩略图处理方法
      if (this.type === 'video' || this.type === 'audio') {
        // 使用 Electron API 处理缩略图
        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.readFileAsDataUrl) {
          window.electronAPI.readFileAsDataUrl(imagePath).then((dataUrl) => {
            if (dataUrl) {
              this.$set ? this.$set(this.imageCache, imagePath, dataUrl) : (this.imageCache[imagePath] = dataUrl)
            } else {
              const defaultImage = this.getDefaultImage()
              this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
            }
          }).catch(() => {
            const defaultImage = this.getDefaultImage()
            this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
          })
        } else if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFileUrl) {
          // 使用 getFileUrl API
          window.electronAPI.getFileUrl(imagePath).then((result) => {
            if (result && result.success) {
              this.$set ? this.$set(this.imageCache, imagePath, result.url) : (this.imageCache[imagePath] = result.url)
            } else {
              const defaultImage = this.getDefaultImage()
              this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
            }
          }).catch(() => {
            const defaultImage = this.getDefaultImage()
            this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
          })
        } else {
          // 降级处理：构建 file:// URL
          const normalizedPath = String(imagePath).replace(/\\/g, '/')
          const fileUrl = `file:///${normalizedPath}`
          this.$set ? this.$set(this.imageCache, imagePath, fileUrl) : (this.imageCache[imagePath] = fileUrl)
        }
      } else {
        // 其他类型的媒体使用原有逻辑
        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.readFileAsDataUrl) {
          window.electronAPI.readFileAsDataUrl(imagePath).then((dataUrl) => {
            if (dataUrl) {
              this.$set ? this.$set(this.imageCache, imagePath, dataUrl) : (this.imageCache[imagePath] = dataUrl)
            } else {
              const defaultImage = this.getDefaultImage()
              this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
            }
          }).catch(() => {
            const defaultImage = this.getDefaultImage()
            this.$set ? this.$set(this.imageCache, imagePath, defaultImage) : (this.imageCache[imagePath] = defaultImage)
          })
        } else {
          // 回退：尝试 file://
          const normalizedPath = String(imagePath).replace(/\\/g, '/')
          const fileUrl = `file:///${normalizedPath}`
          this.$set ? this.$set(this.imageCache, imagePath, fileUrl) : (this.imageCache[imagePath] = fileUrl)
        }
      }
      
      // 初次返回默认图，待异步完成后会自动刷新
      return this.imageCache[imagePath] || this.getDefaultImage()
    },
    getDefaultImage() {
      if (this.type === 'game') return './default-game.png'
      if (this.type === 'novel') return './default-novel.png'
      if (this.type === 'video') return './default-video.png' // 视频使用视频默认图标
      if (this.type === 'audio') return './default-audio.png' // 音频使用音频默认图标
      if (this.type === 'image') return './default-image.png' // 图片使用图片默认图标
      if (this.type === 'folder') return './default-video.png' // 文件夹使用视频默认图标
      return './icon.svg' // 默认使用小说图标
    },
    handleImageError(event) {
      const defaultImage = this.getDefaultImage()
      event.target.src = defaultImage
    },
    
    /**
     * 异步加载伪装图片
     * @param {string} imagePath - 原始图片路径
     */
    async loadDisguiseImage(imagePath) {
      console.log('MediaCard: 开始加载伪装图片，原始路径:', imagePath)
      try {
        const disguiseImage = await disguiseManager.getRandomDisguiseImage(imagePath)
        console.log('MediaCard: 获取到伪装图片路径:', disguiseImage)
        // 使用Vue的响应式更新
        this.$set ? this.$set(this.disguiseImageCache, imagePath, disguiseImage) : (this.disguiseImageCache[imagePath] = disguiseImage)
        // 强制更新组件
        this.$forceUpdate()
        console.log('MediaCard: 伪装图片已更新到缓存')
      } catch (error) {
        console.error('MediaCard: 加载伪装图片失败:', error)
      }
    },
    
    /**
     * 异步加载伪装文字
     * @param {string} itemId - 项目ID
     */
    async loadDisguiseText(itemId) {
      // console.log('MediaCard: 开始加载伪装文字，项目ID:', itemId)
      try {
        const disguiseText = await disguiseManager.getRandomDisguiseText()
        // console.log('MediaCard: 获取到伪装文字:', disguiseText)
        // 使用Vue的响应式更新
        this.$set ? this.$set(this.disguiseTextCache, itemId, disguiseText) : (this.disguiseTextCache[itemId] = disguiseText)
        // 强制更新组件
        this.$forceUpdate()
        // console.log('MediaCard: 伪装文字已更新到缓存')
      } catch (error) {
        console.error('MediaCard: 加载伪装文字失败:', error)
      }
    },
    
    /**
     * 异步加载标签伪装
     * @param {string} tagName - 标签名称
     */
    async loadDisguiseTag(tagName) {
      // console.log('MediaCard: 开始加载标签伪装，标签:', tagName)
      try {
        const disguiseTag = await disguiseManager.getDisguiseTag(tagName)
        // console.log('MediaCard: 获取到标签伪装:', disguiseTag)
        // 使用Vue的响应式更新
        this.$set ? this.$set(this.disguiseTagCache, tagName, disguiseTag) : (this.disguiseTagCache[tagName] = disguiseTag)
        // 强制更新组件
        this.$forceUpdate()
        // console.log('MediaCard: 标签伪装已更新到缓存')
      } catch (error) {
        console.error('MediaCard: 加载标签伪装失败:', error)
      }
    },
    
    /**
     * 更新伪装模式状态
     */
    updateDisguiseModeState() {
      const newState = isDisguiseModeEnabled()
      if (this.disguiseModeState !== newState) {
        //console.log('MediaCard: 伪装模式状态变化:', this.disguiseModeState, '->', newState)
        this.disguiseModeState = newState
        
        // 清除所有伪装缓存
        this.clearDisguiseCaches()
      }
    },
    
    /**
     * 清除所有伪装相关的缓存
     */
    clearDisguiseCaches() {
      console.log('MediaCard: 清除所有伪装缓存')
      this.disguiseImageCache = {}
      this.disguiseTextCache = {}
      this.disguiseTagCache = {}
      // 强制组件重新渲染
      this.$forceUpdate()
    },
    
    /**
     * 监听 localStorage 变化
     */
    handleStorageChange(event) {
      if (event.key === 'butter-manager-settings') {
        //console.log('MediaCard: 检测到设置变化，更新伪装模式状态')
        this.updateDisguiseModeState()
      }
    },
    
    /**
     * 检查文件是否为压缩包
     */
    isArchiveFile(filePath) {
      if (!filePath) return false
      const fileName = filePath.toLowerCase()
      const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz', '.bz2', '.tar.bz2', '.xz', '.tar.xz']
      return archiveExtensions.some(ext => fileName.endsWith(ext))
    },
    
    /**
     * 从截图文件夹读取第一张图片作为封面
     * 仅用于游戏类型，且没有 coverPath 时
     */
    async loadScreenshotAsCover() {
      // 只处理游戏类型
      if (this.type !== 'game') {
        return
      }
      
      // 如果已有封面，不需要读取截图
      const coverPath = getFieldValue(this.item.coverPath)
      if (coverPath) {
        return
      }
      
      // 需要 Electron 环境
      if (!this.isElectronEnvironment || !window.electronAPI || !window.electronAPI.listImageFiles) {
        return
      }
      
      try {
        // 获取游戏截图文件夹路径
        const itemId = getFieldValue(this.item.id)
        const itemName = getFieldValue(this.item.name)
        const screenshotFolderPath = await getGameScreenshotFolderPath(
          itemId,
          itemName,
          this.isElectronEnvironment
        )
        
        // 列出截图文件夹中的图片文件
        const result = await window.electronAPI.listImageFiles(screenshotFolderPath)
        
        if (result.success && result.files && result.files.length > 0) {
          // 使用第一张图片作为封面
          const firstImage = result.files[0]
          this.screenshotCoverPath = firstImage
          console.log(`[MediaCard] 从截图文件夹读取封面: ${firstImage}`)
        } else {
          // 截图文件夹不存在或为空，使用默认图片（screenshotCoverPath 保持为 null）
          this.screenshotCoverPath = null
        }
      } catch (error) {
        console.warn('[MediaCard] 读取截图文件夹失败:', error)
        this.screenshotCoverPath = null
      }
    }
    
  },
  mounted() {
    // 初始化游戏运行状态 store
    this.gameRunningStore = useGameRunningStore()
    
    // 初始化伪装模式状态
    this.disguiseModeState = isDisguiseModeEnabled()
    //console.log('MediaCard mounted: 初始伪装模式状态:', this.disguiseModeState)
    
    // 监听 storage 事件以响应设置变化
    window.addEventListener('storage', this.handleStorageChange)
    
    // 由于 storage 事件不会在同一标签页触发，我们需要使用自定义事件
    window.addEventListener('disguise-mode-changed', this.updateDisguiseModeState)
    
    // 延迟加载 exe 图标，避免同时加载太多图标导致卡顿
    // 使用 setTimeout 分批加载，减少并发压力
    const executablePath = getFieldValue(this.item?.executablePath)
    if (this.type === 'game' && executablePath) {
      const ext = executablePath.toLowerCase().split('.').pop()
      if (ext === 'exe') {
        // 随机延迟 0-500ms，分散加载时间
        const delay = Math.random() * 500
        setTimeout(() => {
          this.loadExeIcon()
        }, delay)
      }
    }
    
    // 如果游戏正在运行，启动定时器实时更新会话时长显示
    if (this.type === 'game' && this.isRunning) {
      this.sessionUpdateTimer = setInterval(() => {
        this.updateTrigger = Date.now()
      }, 1000) // 每秒更新一次
    }
    
    // 如果游戏没有封面，尝试从截图文件夹读取第一张图片
    if (this.type === 'game' && !getFieldValue(this.item.coverPath)) {
      // 延迟加载，避免阻塞渲染
      setTimeout(() => {
        this.loadScreenshotAsCover()
      }, 100)
    }
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('disguise-mode-changed', this.updateDisguiseModeState)
    
    // 清理会话时长更新定时器
    if (this.sessionUpdateTimer) {
      clearInterval(this.sessionUpdateTimer)
      this.sessionUpdateTimer = null
    }
  },
  watch: {
    // 监听 isRunning 变化，动态启动/停止定时器
    isRunning(newVal) {
      if (this.type === 'game') {
        if (newVal && !this.sessionUpdateTimer) {
          // 游戏开始运行，启动定时器
          this.sessionUpdateTimer = setInterval(() => {
            this.updateTrigger = Date.now()
          }, 1000)
        } else if (!newVal && this.sessionUpdateTimer) {
          // 游戏停止运行，清理定时器
          clearInterval(this.sessionUpdateTimer)
          this.sessionUpdateTimer = null
        }
      }
    },
    // 监听 item 变化，重新加载截图封面
    item: {
      handler(newItem) {
        if (this.type === 'game' && newItem && !newItem.coverPath) {
          // 重置截图封面路径
          this.screenshotCoverPath = null
          // 延迟加载，避免阻塞
          setTimeout(() => {
            this.loadScreenshotAsCover()
          }, 100)
        } else if (this.type === 'game' && newItem && newItem.coverPath) {
          // 如果有封面了，清除截图封面
          this.screenshotCoverPath = null
        }
      },
      immediate: false
    }
  }
}
</script>

<style lang="scss" scoped>
// 卡片背景透明度变量
$card-bg-opacity: 0.3;
$card-bg-light: rgba(255, 255, 255, $card-bg-opacity);
$card-bg-dark: rgba(30, 30, 30, $card-bg-opacity);

// 毛玻璃效果变量
$backdrop-blur: 5px;
$backdrop-blur-small: 4px;

// 其他透明度变量
$overlay-opacity: 0.5;
$badge-bg-opacity: 0.8;
$indicator-bg-opacity: 0.9;
$shadow-opacity: 0.2;

// 颜色变量
$error-color: rgba(239, 68, 68, $indicator-bg-opacity);
$info-color: rgba(59, 130, 246, $indicator-bg-opacity);
$running-color-light: #059669;
$running-color-dark: #10b981;

.media-card {
  background-color: $card-bg-light;
  backdrop-filter: blur($backdrop-blur);
  -webkit-backdrop-filter: blur($backdrop-blur);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  padding: 0 !important; /* 覆盖 fun-card 的默认 padding */
}

[data-theme="dark"] .media-card {
  background-color: $card-bg-dark;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-medium);
  border-color: var(--accent-color);
}

/* 评分边框样式 */
.media-card.rating-border-5 {
  border: 2px solid #FFD700; /* 金色 - 5星 */
  background-color: rgba(255, 215, 0, 0.08); /* 淡金色背景 */
}

.media-card.rating-border-4 {
  border: 2px solid #9D4EDD; /* 紫色 - 4星 */
  background-color: rgba(157, 78, 221, 0.08); /* 淡紫色背景 */
}

.media-card.rating-border-3 {
  border: 2px solid #EF4444; /* 红色 - 3星 */
  background-color: rgba(239, 68, 68, 0.08); /* 淡红色背景 */
}

.media-card.rating-border-2 {
  border: 2px solid #10B981; /* 绿色 - 2星 */
  background-color: rgba(16, 185, 129, 0.08); /* 淡绿色背景 */
}

.media-card.rating-border-1 {
  border: 2px solid #3B82F6; /* 蓝色 - 1星 */
  background-color: rgba(59, 130, 246, 0.08); /* 淡蓝色背景 */
}

/* 深色主题下的评分背景色调整 */
[data-theme="dark"] .media-card.rating-border-5 {
  background-color: rgba(255, 215, 0, 0.12); /* 深色主题下稍微明显一点 */
}

[data-theme="dark"] .media-card.rating-border-4 {
  background-color: rgba(157, 78, 221, 0.12);
}

[data-theme="dark"] .media-card.rating-border-3 {
  background-color: rgba(239, 68, 68, 0.12);
}

[data-theme="dark"] .media-card.rating-border-2 {
  background-color: rgba(16, 185, 129, 0.12);
}

[data-theme="dark"] .media-card.rating-border-1 {
  background-color: rgba(59, 130, 246, 0.12);
}

/* hover 时保持评分边框颜色，但可以使用更亮的颜色 */
.media-card.rating-border-5:hover {
  border-color: #FFED4E;
  background-color: rgba(255, 215, 0, 0.15); /* hover 时背景色稍微增强 */
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.media-card.rating-border-4:hover {
  border-color: #C77DFF;
  background-color: rgba(157, 78, 221, 0.15);
  box-shadow: 0 8px 25px rgba(157, 78, 221, 0.3);
}

.media-card.rating-border-3:hover {
  border-color: #F87171;
  background-color: rgba(239, 68, 68, 0.15);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.media-card.rating-border-2:hover {
  border-color: #34D399;
  background-color: rgba(16, 185, 129, 0.15);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.media-card.rating-border-1:hover {
  border-color: #60A5FA;
  background-color: rgba(59, 130, 246, 0.15);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* 深色主题下的 hover 背景色 */
[data-theme="dark"] .media-card.rating-border-5:hover {
  background-color: rgba(255, 215, 0, 0.18);
}

[data-theme="dark"] .media-card.rating-border-4:hover {
  background-color: rgba(157, 78, 221, 0.18);
}

[data-theme="dark"] .media-card.rating-border-3:hover {
  background-color: rgba(239, 68, 68, 0.18);
}

[data-theme="dark"] .media-card.rating-border-2:hover {
  background-color: rgba(16, 185, 129, 0.18);
}

[data-theme="dark"] .media-card.rating-border-1:hover {
  background-color: rgba(59, 130, 246, 0.18);
}

.media-image {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  overflow: hidden;
}

/* 图片类型使用更适合竖向图片的宽高比 */
.media-card[data-type="image"] .media-image {
  aspect-ratio: 3/4;
}

.media-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.media-badge {
  position: absolute;
  bottom: calc(8px * var(--card-scale, 1));
  right: calc(8px * var(--card-scale, 1));
  background: rgba(0, 0, 0, $badge-bg-opacity);
  color: white;
  padding: calc(4px * var(--card-scale, 1)) calc(8px * var(--card-scale, 1));
  border-radius: calc(4px * var(--card-scale, 1));
  font-size: calc(12px * var(--card-scale, 1));
  font-weight: 500;
  font-family: 'Courier New', monospace;
  z-index: 10;
  backdrop-filter: blur($backdrop-blur-small);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.media-card:hover .media-image img {
  transform: scale(1.05);
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, $overlay-opacity);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.action-button {
  background: var(--accent-color);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: var(--accent-hover);
  transform: scale(1.1);
}

.media-info {
  padding: calc(15px * var(--card-scale, 1));
}

.media-title {
  color: var(--text-primary);
  font-size: calc(1.1rem * var(--card-scale, 1));
  font-weight: 600;
  margin-bottom: calc(5px * var(--card-scale, 1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: calc(8px * var(--card-scale, 1));
}

.exe-icon {
  width: calc(20px * var(--card-scale, 1));
  height: calc(20px * var(--card-scale, 1));
  flex-shrink: 0;
  object-fit: contain;
  display: var(--show-icon, block);
}

.media-subtitle {
  color: var(--text-secondary);
  font-size: calc(0.9rem * var(--card-scale, 1));
  margin-bottom: calc(6px * var(--card-scale, 1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.media-tertiary {
  color: var(--text-tertiary);
  font-size: calc(0.85rem * var(--card-scale, 1));
  margin-bottom: calc(8px * var(--card-scale, 1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  font-style: italic;
}

.media-description {
  color: var(--text-tertiary);
  font-size: calc(0.8rem * var(--card-scale, 1));
  margin-bottom: calc(8px * var(--card-scale, 1));
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.media-tags {
  display: var(--show-stats, flex);
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}


.media-tag-more {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: calc(2px * var(--card-scale, 1)) calc(6px * var(--card-scale, 1));
  border-radius: calc(8px * var(--card-scale, 1));
  font-size: calc(0.7rem * var(--card-scale, 1));
  font-weight: 500;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.media-stats {
  display: var(--show-stats, flex);
  flex-direction: column;
  gap: calc(3px * var(--card-scale, 1));
}

.media-meta {
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--card-scale, 1));
}

.stat-item, .meta-item {
  color: var(--text-tertiary);
  font-size: calc(0.8rem * var(--card-scale, 1));
  transition: color 0.3s ease;
}

.play-time-label {
  font-weight: 500;
  margin-right: 4px;
}

.running-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 小说进度条样式 */
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.last-read {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

/* 游戏运行状态指示器 */
.running-status {
  color: $running-color-light !important;
  font-weight: 600;
}

/* 左上角标识容器 */
.top-left-indicators {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
  align-items: center;
}

/* 文件错误图标样式 */
.file-error-icon {
  background: $error-color;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, $shadow-opacity);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

/* 压缩包图标样式 */
.archive-icon {
  background: $info-color;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, $shadow-opacity);
  flex-shrink: 0;
}

.folder-indicator {
  position: absolute;
  bottom: calc(8px * var(--card-scale, 1));
  left: calc(8px * var(--card-scale, 1));
  background: $info-color;
  color: white;
  border-radius: calc(6px * var(--card-scale, 1));
  padding: calc(4px * var(--card-scale, 1)) calc(8px * var(--card-scale, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(14px * var(--card-scale, 1));
  font-weight: bold;
  z-index: 10;
  backdrop-filter: blur($backdrop-blur-small);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, $shadow-opacity);
}

.favorite-indicator {
  position: absolute;
  top: calc(8px * var(--card-scale, 1));
  right: calc(8px * var(--card-scale, 1));
  background: rgba(251, 191, 36, $indicator-bg-opacity);
  color: white;
  border-radius: 50%;
  width: calc(28px * var(--card-scale, 1));
  height: calc(28px * var(--card-scale, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(16px * var(--card-scale, 1));
  z-index: 10;
  backdrop-filter: blur($backdrop-blur-small);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, $shadow-opacity);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

[data-theme="dark"] .running-status {
  color: $running-color-dark !important;
}

.running-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  animation: pulse 2s infinite;
}

.running-icon {
  font-size: 0.8rem;
  animation: bounce 1s infinite;
}

.running-text {
  letter-spacing: 0.5px;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-1px);
  }
  60% {
    transform: translateY(-0.5px);
  }
}

/* 视频和音频特有样式 */
.media-actors {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.actors-label {
  font-weight: 500;
  margin-right: 4px;
}

.actors-list {
  color: var(--text-primary);
}

.actors-more {
  color: var(--text-tertiary);
  font-style: italic;
}

.watch-count, .play-count {
  font-weight: 500;
  color: var(--text-primary);
}

.last-watched, .last-played {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .media-image {
    height: 200px;
  }
}
</style>
