<template>
  <div v-if="visible" class="modal-overlay" @mousedown="handleOverlayMouseDown">
    <div class="modal-wrapper">
      <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h3>{{ isEditMode ? '编辑游戏' : '添加游戏' }}</h3>
        <button class="btn-close" @click="handleClose">✕</button>
      </div>
      <div class="modal-body">
        <FormField 
          :label="isEditMode ? '游戏名称' : '游戏名称 (可选)'" 
          type="text" 
          v-model="formData.name" 
          :placeholder="isEditMode ? '输入游戏名称' : '留空将自动从文件名提取'" 
        />
        <FormField 
          :label="isEditMode ? '开发商' : '开发商 (可选)'" 
          type="text" 
          v-model="formData.developer" 
          placeholder="输入开发商名称" 
        />
        <FormField 
          :label="isEditMode ? '发行商' : '发行商 (可选)'" 
          type="text" 
          v-model="formData.publisher" 
          placeholder="输入发行商名称" 
        />
        <FormField 
          :label="isEditMode ? '游戏引擎' : '游戏引擎 (可选)'" 
          type="select" 
          v-model="formData.engine" 
          :options="engineOptions"
          placeholder="请选择游戏引擎" 
        />
        <div class="engine-auto-detect">
          <button 
            type="button" 
            class="btn-auto-detect" 
            @click="handleAutoDetectEngine"
            :disabled="!formData.executablePath || !isElectronEnvironment"
            :title="!formData.executablePath ? '请先选择游戏文件' : ''"
          >
            <span class="btn-icon">🔍</span>
            自动识别引擎
          </button>
        </div>
        <FormField 
          :label="isEditMode ? '游戏简介' : '游戏简介 (可选)'" 
          type="textarea" 
          v-model="formData.description" 
          placeholder="输入游戏简介或描述..."
          :rows="3" 
        />
        <FormField 
          :label="isEditMode ? '游戏标签' : '游戏标签 (可选)'" 
          type="tags" 
          v-model="formData.tags" 
          v-model:tagInput="tagInput"
          @add-tag="handleAddTag" 
          @remove-tag="handleRemoveTag"
        />
        <FormField 
          :label="isEditMode ? '游戏可执行文件' : '游戏文件'" 
          type="file" 
          v-model="formData.executablePath" 
          :placeholder="isEditMode ? '选择游戏可执行文件' : '选择游戏可执行文件或压缩包'"
          @browse="handleBrowseExecutable" 
        />
        <!-- 封面图片选择区域 -->
        <div class="form-group">
          <label class="form-label">{{ isEditMode ? '游戏封面' : '游戏封面 (可选)' }}</label>
          <div class="cover-selection-container">
            <div class="cover-preview" v-if="formData.imagePath">
              <img :src="resolveImage(formData.imagePath)" :alt="'封面预览'" @error="handleImageError">
              <div class="cover-preview-info">
                <span class="cover-filename">{{ getImageFileName(formData.imagePath) }}</span>
              </div>
            </div>
            <div class="cover-actions">
              <button 
                type="button" 
                class="btn-cover-action" 
                @click="handleUseScreenshotAsCover"
                :disabled="isEditMode ? false : !formData.executablePath"
              >
                <span class="btn-icon">📸</span>
                使用截图作为封面
              </button>
              <button type="button" class="btn-cover-action" @click="handleBrowseImage">
                <span class="btn-icon">📁</span>
                选择自定义封面
              </button>
              <button 
                type="button" 
                class="btn-cover-action btn-clear" 
                @click="handleClearCover"
                v-if="formData.imagePath"
              >
                <span class="btn-icon">🗑️</span>
                清除封面
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" @click="handleConfirm" :disabled="!canConfirm">
          {{ isEditMode ? '保存修改' : '添加游戏' }}
        </button>
      </div>
      </div>
      <!-- Tag 选择面板 -->
      <TagSelectionPanel
        :visible="visible"
        :current-tags="formData.tags"
        :available-tags="availableTags"
        @select-tag="handleSelectTag"
      />
    </div>
  </div>
</template>

<script lang="ts">
import FormField from '../FormField.vue'
import TagSelectionPanel from '../TagSelectionPanel.vue'
import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import { detectGameEngine } from '../../utils/GameEngineDetector.ts'

export default {
  name: 'GameDialog',
  components: {
    FormField,
    TagSelectionPanel
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String as () => 'add' | 'edit',
      default: 'add',
      validator: (value: string) => ['add', 'edit'].includes(value)
    },
    game: {
      type: Object,
      default: null
    },
    isElectronEnvironment: {
      type: Boolean,
      default: false
    },
    availableTags: {
      type: Array as () => (string | { name: string; count?: number })[],
      default: () => []
    }
  },
  emits: ['close', 'confirm'],
  data() {
    return {
      formData: {
        id: '',
        name: '',
        developer: '',
        publisher: '',
        engine: '',
        description: '',
        tags: [],
        executablePath: '',
        imagePath: ''
      },
      tagInput: '',
      engineOptions: [
        { value: 'Unity', label: 'Unity' },
        { value: 'Unreal Engine', label: 'Unreal Engine' },
        { value: 'Godot', label: 'Godot' },
        { value: 'GameMaker Studio', label: 'GameMaker Studio' },
        { value: 'RPG Maker VX Ace', label: 'RPG Maker VX Ace' },
        { value: 'RPG Maker MV', label: 'RPG Maker MV' },
        { value: 'RPG Maker MZ', label: 'RPG Maker MZ' },
        { value: 'CryEngine', label: 'CryEngine' },
        { value: 'Source Engine', label: 'Source Engine' },
        { value: 'Construct', label: 'Construct' },
        { value: 'Clickteam Fusion', label: 'Clickteam Fusion' },
        { value: "Ren'Py", label: "Ren'Py" },
        { value: 'TyranoBuilder', label: 'TyranoBuilder' },
        { value: 'Twine', label: 'Twine' },
        { value: 'Scratch', label: 'Scratch' },
        { value: 'Cocos2d', label: 'Cocos2d' },
        { value: 'Defold', label: 'Defold' },
        { value: 'Phaser', label: 'Phaser' },
        { value: 'Love2D', label: 'Love2D' },
        { value: 'MonoGame', label: 'MonoGame' },
        { value: 'XNA', label: 'XNA' },
        { value: 'Flash/ActionScript', label: 'Flash/ActionScript' },
        { value: 'Java', label: 'Java' },
        { value: 'Python/Pygame', label: 'Python/Pygame' },
        { value: '其他', label: '其他' }
      ]
    }
  },
  computed: {
    isEditMode() {
      return this.mode === 'edit'
    },
    canConfirm() {
      // 编辑模式只需要有游戏ID即可，添加模式需要可执行文件路径
      if (this.isEditMode) {
        return true
      }
      return this.formData.executablePath && this.formData.executablePath.trim()
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        if (this.isEditMode && this.game) {
          this.loadGameData()
        } else {
          this.resetForm()
        }
      }
    },
    game: {
      handler(newVal) {
        if (newVal && this.visible && this.isEditMode) {
          this.loadGameData()
        }
      },
      immediate: true
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        id: '',
        name: '',
        developer: '',
        publisher: '',
        engine: '',
        description: '',
        tags: [],
        executablePath: '',
        imagePath: ''
      }
      this.tagInput = ''
    },
    loadGameData() {
      if (!this.game) return
      this.formData = {
        id: this.game.id || '',
        name: this.game.name || '',
        developer: this.game.developer || '',
        publisher: this.game.publisher || '',
        engine: this.game.engine || '',
        description: this.game.description || '',
        tags: Array.isArray(this.game.tags) ? [...this.game.tags] : [],
        executablePath: this.game.executablePath || '',
        imagePath: this.game.image || ''
      }
      this.tagInput = ''
    },
    handleClose() {
      this.$emit('close')
    },
    /**
     * 处理 overlay 区域的 mousedown 事件
     * 使用 mousedown 而不是 click，避免在复制文字时（鼠标在外部区域释放）误关闭
     * 这样只有在外部区域按下鼠标时才会关闭，符合常见软件的交互习惯
     */
    handleOverlayMouseDown(event) {
      // 只在 overlay 背景上按下鼠标时才关闭（不是 content 区域）
      // event.target 是 overlay 本身，而不是 content
      if (event.target === event.currentTarget) {
        this.handleClose()
      }
    },
    handleAddTag() {
      const tag = this.tagInput.trim()
      if (tag && !this.formData.tags.includes(tag)) {
        this.formData.tags.push(tag)
        this.tagInput = ''
      }
    },
    handleRemoveTag(index) {
      this.formData.tags.splice(index, 1)
    },
    async handleBrowseExecutable() {
      try {
        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.selectExecutableFile) {
          console.log('使用Electron API选择可执行文件')
          const filePath = await window.electronAPI.selectExecutableFile()
          if (filePath) {
            this.formData.executablePath = filePath
            console.log('选择的文件路径:', filePath)

            // 自动提取游戏名称（如果名称字段为空）
            if (!this.formData.name.trim()) {
              this.formData.name = this.extractGameNameFromPath(filePath)
            }
          }
        } else {
          console.log('Electron API不可用，使用HTML5文件选择器')
          this.showFileInput('executable')
        }
      } catch (error) {
        console.error('选择可执行文件失败:', error)
        await alertService.error(`选择文件失败: ${error.message}`)
      }
    },
    async handleBrowseImage() {
      try {
        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('使用Electron API选择图片文件')
          const filePath = await window.electronAPI.selectImageFile()
          if (filePath) {
            this.formData.imagePath = filePath
            console.log('选择的图片路径:', filePath)
          }
        } else {
          console.log('Electron API不可用，使用HTML5文件选择器')
          this.showFileInput('image')
        }
      } catch (error) {
        console.error('选择图片文件失败:', error)
        await alertService.error(`选择文件失败: ${error.message}`)
      }
    },
    showFileInput(type) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = type === 'executable' ? '.exe,.swf,.bat,.zip,.rar,.7z,.tar,.gz,.tar.gz,.bz2,.tar.bz2,.xz,.tar.xz' : 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          if (type === 'executable') {
            this.formData.executablePath = (file as any).path || file.name
            if (!this.formData.name.trim()) {
              this.formData.name = this.extractGameNameFromPath((file as any).path || file.name)
            }
          } else {
            this.formData.imagePath = (file as any).path || file.name
          }
        }
      }
      input.click()
    },
    extractGameNameFromPath(filePath) {
      const fileName = filePath.split(/[\\/]/).pop() || ''
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

      let cleanName = nameWithoutExt
        .replace(/\.exe$/i, '')
        .replace(/\.swf$/i, '')
        .replace(/\.bat$/i, '')
        .replace(/\.zip$/i, '')
        .replace(/\.rar$/i, '')
        .replace(/\.7z$/i, '')
        .replace(/\.tar$/i, '')
        .replace(/\.gz$/i, '')
        .replace(/\.bz2$/i, '')
        .replace(/\.xz$/i, '')
        .replace(/^game[-_\s]*/i, '')
        .replace(/[-_\s]+/g, ' ')
        .trim()

      if (!cleanName) {
        cleanName = nameWithoutExt
      }

      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    },
    async handleUseScreenshotAsCover() {
      try {
        if (this.isEditMode) {
          // 编辑模式：使用游戏ID和名称
          if (!this.formData.name) {
            await alertService.warning('请先输入游戏名称', '提示')
            return
          }

          if (!this.formData.id) {
            await alertService.warning('游戏ID不存在，无法打开截图文件夹', '提示')
            return
          }

          // 使用公共函数获取截图文件夹路径
          const { getGameScreenshotFolderPath } = await import('../../composables/game/useGameScreenshot')
          const gameScreenshotPath = await getGameScreenshotFolderPath(
            this.formData.id,
            this.formData.name,
            this.isElectronEnvironment
          )

          if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.ensureDirectory) {
            try {
              const ensureResult = await window.electronAPI.ensureDirectory(gameScreenshotPath)
              if (ensureResult.success) {
                console.log('截图文件夹已确保存在:', gameScreenshotPath)
              }
            } catch (error) {
              console.warn('确保截图文件夹存在时出错:', error)
            }
          }

          if (this.isElectronEnvironment && window.electronAPI) {
            if (window.electronAPI.selectScreenshotImage) {
              const filePath = await window.electronAPI.selectScreenshotImage(gameScreenshotPath)
              if (filePath) {
                this.formData.imagePath = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            } else if (window.electronAPI.selectImageFile) {
              const filePath = await window.electronAPI.selectImageFile(gameScreenshotPath)
              if (filePath) {
                this.formData.imagePath = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            }
          } else {
            await alertService.warning('当前环境不支持选择图片功能', '提示')
          }
        } else {
          // 添加模式：使用游戏名称或文件路径
          if (!this.formData.name && !this.formData.executablePath) {
            await alertService.warning('请先输入游戏名称或选择可执行文件')
            return
          }

          let gameName = this.formData.name.trim()
          if (!gameName && this.formData.executablePath) {
            gameName = this.extractGameNameFromPath(this.formData.executablePath)
          }

          if (!gameName) {
            await alertService.error('无法确定游戏名称')
            return
          }

          const settings = await saveManager.loadSettings()

          let baseScreenshotsPath = ''
          if (settings.screenshotLocation === 'default') {
            baseScreenshotsPath = `${saveManager.dataDirectory}/Game/Screenshots`
          } else if (settings.screenshotLocation === 'custom') {
            baseScreenshotsPath = settings.screenshotsPath || ''
          } else {
            baseScreenshotsPath = settings.screenshotsPath || `${saveManager.dataDirectory}/Game/Screenshots`
          }

          if (!baseScreenshotsPath || baseScreenshotsPath.trim() === '') {
            baseScreenshotsPath = `${saveManager.dataDirectory}/Game/Screenshots`
          }

          let gameFolderName = 'Screenshots'
          if (gameName && gameName !== 'Screenshot') {
            gameFolderName = gameName.replace(/[<>:"/\\|?*]/g, '_').trim()
            if (!gameFolderName) {
              gameFolderName = 'Screenshots'
            }
          }

          const gameScreenshotPath = `${baseScreenshotsPath}/${gameFolderName}`.replace(/\\/g, '/')

          if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.ensureDirectory) {
            try {
              const ensureResult = await window.electronAPI.ensureDirectory(gameScreenshotPath)
              if (ensureResult.success) {
                console.log('截图文件夹已确保存在:', gameScreenshotPath)
              }
            } catch (error) {
              console.warn('确保截图文件夹存在时出错:', error)
            }
          }

          if (this.isElectronEnvironment && window.electronAPI) {
            if (window.electronAPI.selectScreenshotImage) {
              const filePath = await window.electronAPI.selectScreenshotImage(gameScreenshotPath)
              if (filePath) {
                this.formData.imagePath = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            } else if (window.electronAPI.selectImageFile) {
              const filePath = await window.electronAPI.selectImageFile(gameScreenshotPath)
              if (filePath) {
                this.formData.imagePath = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            }
          } else {
            await alertService.warning('当前环境不支持选择图片功能')
          }
        }
      } catch (error) {
        console.error('选择截图作为封面失败:', error)
        await alertService.error(`选择截图失败: ${error.message}`)
      }
    },
    handleClearCover() {
      this.formData.imagePath = ''
    },
    async handleAutoDetectEngine() {
      if (!this.formData.executablePath) {
        notify.toast('warning', '无法识别', '请先选择游戏文件')
        return
      }

      if (!this.isElectronEnvironment || !window.electronAPI || !window.electronAPI.listFiles) {
        notify.toast('warning', '无法识别', '当前环境不支持自动识别功能')
        return
      }

      try {
        notify.toast('info', '正在识别', '正在分析游戏目录结构...')
        
        const gamePath = this.formData.executablePath.trim()
        const detectedEngine = await detectGameEngine(gamePath)
        
        if (detectedEngine) {
          this.formData.engine = detectedEngine
          notify.toast('success', '识别成功', `已识别为 ${detectedEngine}`)
        } else {
          notify.toast('warning', '识别失败', '无法自动识别游戏引擎，请手动选择')
        }
      } catch (error) {
        console.error('自动识别引擎失败:', error)
        notify.toast('error', '识别失败', `识别过程中发生错误: ${error.message}`)
      }
    },
    async handleConfirm() {
      if (!this.canConfirm) return

      if (this.isEditMode) {
        // 编辑模式：返回更新的游戏对象
        const updatedGame = {
          id: this.formData.id,
          name: this.formData.name.trim() || this.game.name,
          developer: (this.formData.developer || '').trim(),
          publisher: (this.formData.publisher || '').trim(),
          engine: (this.formData.engine || '').trim(),
          description: (this.formData.description || '').trim(),
          tags: [...this.formData.tags],
          executablePath: this.formData.executablePath.trim() || this.game.executablePath,
          image: (this.formData.imagePath || '').trim()
        }

        this.$emit('confirm', updatedGame)
      } else {
        // 添加模式：创建新的游戏对象
        let gameName = this.formData.name.trim()
        if (!gameName) {
          gameName = this.extractGameNameFromPath(this.formData.executablePath)
        }

        let folderSize = 0
        const filePath = this.formData.executablePath.trim()
        const isArchive = this.isArchiveFile(filePath)
        
        // 只有非压缩包文件才尝试获取文件夹大小（压缩包本身就是文件）
        if (!isArchive && this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFolderSize) {
          try {
            const result = await window.electronAPI.getFolderSize(filePath)
            if (result.success) {
              folderSize = result.size
            }
          } catch (error) {
            console.error('获取文件夹大小失败:', error)
          }
        } else if (isArchive) {
          // 对于压缩包，尝试获取文件大小
          if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFileStats) {
            try {
              const result = await window.electronAPI.getFileStats(filePath)
              if (result.success && result.size) {
                folderSize = result.size
              }
            } catch (error) {
              console.error('获取压缩包文件大小失败:', error)
            }
          }
        }

        const game = {
          id: Date.now().toString(),
          name: gameName,
          developer: (this.formData.developer || '').trim(),
          publisher: (this.formData.publisher || '').trim(),
          engine: (this.formData.engine || '').trim(),
          description: (this.formData.description || '').trim(),
          tags: [...this.formData.tags],
          executablePath: filePath,
          image: this.formData.imagePath.trim(),
          folderSize: folderSize,
          playTime: 0,
          playCount: 0,
          lastPlayed: null,
          firstPlayed: null,
          addedDate: new Date().toISOString(),
          fileExists: true,
          isArchive: isArchive
        }

        this.$emit('confirm', game)
      }
    },
    resolveImage(imagePath) {
      if (!imagePath || (typeof imagePath === 'string' && imagePath.trim() === '')) {
        return '/default-game.png'
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
        return imagePath
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('file:'))) {
        return imagePath
      }
      const normalizedPath = String(imagePath).replace(/\\/g, '/')
      const fileUrl = `file:///${normalizedPath}`
      return fileUrl
    },
    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwSDgwVjE2MEgxMjBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODAgMTIwTDEwMCAxMDBMMTIwIDEyMEwxMDAgMTQwTDgwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
    },
    getImageFileName(imagePath) {
      if (!imagePath) return ''
      const fileName = imagePath.split(/[\\/]/).pop()
      return fileName || imagePath
    },
    isArchiveFile(filePath) {
      const fileName = filePath.toLowerCase()
      const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz', '.bz2', '.tar.bz2', '.xz', '.tar.xz']
      return archiveExtensions.some(ext => fileName.endsWith(ext))
    },
    handleSelectTag(tag: string) {
      if (!tag) return
      
      const index = this.formData.tags.indexOf(tag)
      if (index > -1) {
        // 如果标签已存在，则移除
        this.formData.tags.splice(index, 1)
      } else {
        // 如果标签不存在，则添加
        this.formData.tags.push(tag)
      }
    }
  }
}
</script>

<style scoped>
/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-medium);
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}


.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label,
.form-label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

/* 封面选择区域样式 */
.cover-selection-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cover-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.cover-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.cover-preview-info {
  flex: 1;
}

.cover-filename {
  color: var(--text-secondary);
  font-size: 0.9rem;
  word-break: break-all;
  line-height: 1.4;
}

.cover-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-cover-action {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s ease;
  font-size: 0.9rem;
}

.btn-cover-action:hover {
  background: var(--accent-hover);
}

.btn-cover-action.btn-clear {
  background: #ef4444;
}

.btn-cover-action.btn-clear:hover {
  background: #dc2626;
}

.btn-cover-action .btn-icon {
  font-size: 1rem;
}

.btn-cover-action:disabled {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-cover-action:disabled:hover {
  background: var(--bg-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--bg-secondary);
}

.btn-confirm {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.engine-auto-detect {
  margin-bottom: 1rem;
}

.btn-auto-detect {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  width: 100%;
  justify-content: center;
}

.btn-auto-detect:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
}

.btn-auto-detect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-auto-detect .btn-icon {
  font-size: 1rem;
}

/* Tag 选择面板样式 */
.tag-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-medium);
  transition: all 0.3s ease;
  flex-shrink: 0;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tag-panel-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.tag-panel-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.tag-panel-body {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-wrapper {
    flex-direction: column;
    width: 95vw;
    max-width: 95vw;
  }

  .modal-content {
    width: 100%;
    margin: 20px;
  }

  .tag-panel {
    width: 100%;
    margin: 0 20px 20px 20px;
  }
}
</style>
