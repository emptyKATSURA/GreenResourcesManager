<template>
  <div v-if="visible" class="modal-overlay" @mousedown="handleOverlayMouseDown">
    <div class="modal-wrapper">
      <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h3>{{ isEditMode ? '编辑游戏' : '添加游戏' }}</h3>
        <button class="btn-close" @click="handleClose">✕</button>
      </div>
      <div class="modal-body">
        <!-- 根据 Game 类自动生成表单字段 -->
        <div 
          v-for="(field, key) in formFields" 
          :key="key" 
          class="form-field-wrapper"
        >
          <label :for="key" class="form-label">
            {{ getFieldLabel(key, field) }}
          </label>
          
          <!-- 文本字段 -->
          <fun-input
            v-if="field.fieldType === FormFieldType.TEXT"
            :id="key"
            v-model="formData[key]"
            type="text"
            :placeholder="getFieldPlaceholder(key, field)"
          />
          
          <!-- 文本域字段 -->
          <fun-textarea
            v-else-if="field.fieldType === FormFieldType.TEXTAREA || field instanceof FormField_Textarea"
            :id="key"
            v-model="formData[key]"
            :placeholder="getFieldPlaceholder(key, field)"
            :rows="3"
          />
          
          <!-- 选择字段（引擎类型，需要特殊处理） -->
          <template v-else-if="field instanceof FormField_SelectEngine">
            <fun-select
              :id="key"
              v-model="formData[key]"
              :options="getSelectOptions(key, field)"
              :placeholder="getFieldPlaceholder(key, field)"
            />
            <div class="engine-auto-detect">
              <button 
                type="button" 
                class="btn-auto-detect" 
                @click="handleAutoDetectEngine"
                :disabled="!getExecutablePathValue() || !isElectronEnvironment"
                :title="!getExecutablePathValue() ? '请先选择游戏文件' : ''"
              >
                <span class="btn-icon">🔍</span>
                自动识别引擎
              </button>
            </div>
          </template>
          
          <!-- 普通选择字段 -->
          <fun-select
            v-else-if="field.fieldType === FormFieldType.SELECT"
            :id="key"
            v-model="formData[key]"
            :options="getSelectOptions(key, field)"
            :placeholder="getFieldPlaceholder(key, field)"
          />
          
          <!-- 标签字段 -->
          <fun-tag-input
            v-else-if="field.fieldType === FormFieldType.TAGS"
            :id="key"
            v-model="formData[key]"
            :placeholder="getFieldPlaceholder(key, field)"
            :allowDuplicate="false"
          />
          
          <!-- 文件选择字段（封面类型，需要特殊处理） -->
          <template v-else-if="field instanceof FormField_SelectCover || isImageFileField(field)">
            <div class="cover-selection-container">
              <div class="cover-preview" v-if="formData[key]">
                <img :src="getImageUrl(formData[key])" :alt="'封面预览'" @error="handleImageError">
                <div class="cover-preview-info">
                  <span class="cover-filename">{{ getImageFileName(formData[key]) }}</span>
                </div>
              </div>
              <div class="cover-actions">
                <button 
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleUseScreenshotAsCover(key)"
                  :disabled="isEditMode ? false : !getExecutablePathValue()"
                >
                  <span class="btn-icon">📸</span>
                  使用截图作为封面
                </button>
                <button type="button" class="btn-cover-action" @click="() => handleBrowseImage(key)">
                  <span class="btn-icon">📁</span>
                  选择自定义封面
                </button>
                <button 
                  type="button" 
                  class="btn-cover-action btn-clear" 
                  @click="() => handleClearCover(key)"
                  v-if="formData[key]"
                >
                  <span class="btn-icon">🗑️</span>
                  清除封面
                </button>
              </div>
            </div>
          </template>
          
          <!-- 文件选择字段（普通文件） -->
          <div v-else-if="field.fieldType === FormFieldType.SELECT_FILE" class="file-input-group">
            <fun-input
              :id="key"
              type="text"
              v-model="formData[key]"
              :placeholder="getFieldPlaceholder(key, field)"
              :readonly="true"
            />
            <button 
              type="button" 
              class="btn-browse" 
              @click="() => handleBrowseFile(key, field)"
              :disabled="!isElectronEnvironment"
            >
              浏览
            </button>
            <!-- 图片预览 -->
            <div v-if="isImageFile(formData[key]) && formData[key]" class="image-preview">
              <img :src="getImageUrl(formData[key])" :alt="field.fieldName" @error="handleImageError" />
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
        :current-tags="getTagsFieldValue()"
        :available-tags="availableTags"
        @select-tag="handleSelectTag"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import TagSelectionPanel from '../TagSelectionPanel.vue'
import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import { detectGameEngine } from '../../utils/GameEngineDetector.ts'
import { 
  Game, 
  FormField as FormFieldType, 
  FormFieldType as FormFieldTypeEnum,
  FormField_SelectEngine,
  FormField_SelectFile,
  FormField_SelectCover,
  FormField_Textarea
} from '../../types/class/game.ts'

export default {
  name: 'GameDialog',
  components: {
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
  setup() {
    // 创建 Game 实例用于提取字段定义
    const gameInstance = new Game()
    
    // 提取所有 FormField 类型的字段，保持类中定义的顺序
    const formFields = computed(() => {
      const fields: Record<string, FormFieldType> = {}
      // 遍历 Game 实例的所有属性，保持定义顺序
      for (const key in gameInstance) {
        const value = (gameInstance as any)[key]
        if (value instanceof FormFieldType) {
          fields[key] = value
        }
      }
      return fields
    })
    
    return {
      formFields,
      FormFieldType: FormFieldTypeEnum,
      FormField_SelectEngine,
      FormField_SelectFile,
      FormField_SelectCover,
      FormField_Textarea
    }
  },
  data() {
    // 初始化表单数据的函数（根据字段类型自动生成）
    const initFormData = () => {
      const gameInstance = new Game()
      const data: Record<string, any> = { id: '' }
      
      // 遍历 Game 实例的所有属性
      for (const key in gameInstance) {
        const value = (gameInstance as any)[key]
        if (value instanceof FormFieldType) {
          // 根据字段类型初始化默认值
          switch (value.fieldType) {
            case FormFieldTypeEnum.CHECKBOX:
              data[key] = false
              break
            case FormFieldTypeEnum.NUMBER:
              data[key] = 0
              break
            case FormFieldTypeEnum.TAGS:
              data[key] = []
              break
            default:
              data[key] = ''
          }
        }
      }
      return data
    }
    
      return {
        formData: initFormData(),
        initFormData
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
      const executablePath = this.getExecutablePathValue()
      return executablePath && executablePath.trim() !== ''
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
    // 判断是否是图片文件字段（封面字段）
    isImageFileField(field: FormFieldType): boolean {
      return field instanceof FormField_SelectCover || 
             (field instanceof FormField_SelectFile && 
              'filters' in field && 
              Array.isArray(field.filters) &&
              field.filters.some((f: any) => 
                f.extensions && f.extensions.some((ext: string) => 
                  ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())
                )
              ))
    },
    // 判断是否是可执行文件字段
    isExecutableFileField(field: FormFieldType): boolean {
      return field instanceof FormField_SelectFile && 
             'filters' in field && 
             Array.isArray(field.filters) &&
             field.filters.some((f: any) => 
               f.extensions && f.extensions.some((ext: string) => 
                 ['exe', 'dll', '*'].includes(ext.toLowerCase())
               )
             )
    },
    // 获取可执行文件路径的值（用于引擎自动识别等功能）
    getExecutablePathValue(): string {
      const gameInstance = new Game()
      for (const key in gameInstance) {
        const value = (gameInstance as any)[key]
        if (value instanceof FormField_SelectFile && this.isExecutableFileField(value)) {
          return this.formData[key] || ''
        }
      }
      return ''
    },
    // 获取标签字段的值（用于 TagSelectionPanel）
    getTagsFieldValue(): string[] {
      const gameInstance = new Game()
      for (const key in gameInstance) {
        const field = (gameInstance as any)[key]
        if (field instanceof FormFieldType && field.fieldType === FormFieldTypeEnum.TAGS) {
          return Array.isArray(this.formData[key]) ? this.formData[key] : []
        }
      }
      return []
    },
    // 获取字段标签（必填字段加 *，非必填字段不加标识）
    getFieldLabel(key: string, field: FormFieldType): string {
      const fieldName = field.fieldName
      // 根据字段的 required 属性判断是否必填
      const isRequired = field.required === true
      
      // 特殊字段的标签处理（可执行文件字段）
      if (this.isExecutableFileField(field)) {
        const label = this.isEditMode ? '游戏可执行文件' : '游戏文件'
        return isRequired ? `${label} *` : label
      }
      
      // 其他字段：必填字段加 *，非必填字段不加标识
      return isRequired ? `${fieldName} *` : fieldName
    },
    // 获取字段占位符
    getFieldPlaceholder(key: string, field: FormFieldType): string {
      // 根据字段类型返回占位符
      if (field.fieldType === FormFieldTypeEnum.SELECT) {
        return `请选择${field.fieldName}`
      }
      if (field.fieldType === FormFieldTypeEnum.TEXTAREA || field instanceof FormField_Textarea) {
        return '输入游戏简介或描述...'
      }
      if (field instanceof FormField_SelectFile) {
        if (this.isExecutableFileField(field)) {
          return this.isEditMode ? '选择游戏可执行文件' : '选择游戏可执行文件或压缩包'
        }
      }
      // 默认占位符
      return `请输入${field.fieldName}`
    },
    // 获取选择字段的选项（用于 SELECT 类型）
    getSelectOptions(key: string, field: FormFieldType): Array<{ value: string; label: string }> {
      // 检查字段是否有 options 属性
      if ('options' in field && Array.isArray((field as any).options)) {
        return (field as any).options.map((option: string) => ({
          value: option,
          label: option
        }))
      }
      return []
    },
    resetForm() {
      const initData = this.initFormData()
      // 保留 id 字段（如果有）
      initData.id = this.formData.id || ''
      this.formData = initData
    },
    loadGameData() {
      if (!this.game) return
      
      // 先初始化表单数据
      const initData = this.initFormData()
      initData.id = this.game.id || ''
      
      // 从 game 对象中加载数据
      const gameInstance = new Game()
      for (const key in gameInstance) {
        const value = (gameInstance as any)[key]
        if (value instanceof FormFieldType) {
          // 从 game 对象中获取对应的值
          const gameValue = (this.game as any)[key]
          if (gameValue !== undefined && gameValue !== null) {
            if (value.fieldType === FormFieldTypeEnum.TAGS && Array.isArray(gameValue)) {
              initData[key] = [...gameValue]
            } else if (typeof gameValue === 'string' || typeof gameValue === 'number' || typeof gameValue === 'boolean') {
              initData[key] = gameValue
            }
          }
        }
      }
      
      this.formData = initData
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
    async handleBrowseFile(key: string, field: FormFieldType) {
      try {
        if (!(field instanceof FormField_SelectFile)) return
        
        if (!this.isElectronEnvironment || !window.electronAPI) {
          await alertService.warning('当前环境不支持文件选择功能，请在 Electron 环境中使用')
          return
        }

        const electronAPI = window.electronAPI
        const filters = field.filters || []

        // 使用统一的 API，直接传递过滤器数组
        if (!electronAPI.selectFileWithExtensions) {
          await alertService.error('当前环境不支持根据扩展名选择文件功能')
          return
        }

        const filePath = await electronAPI.selectFileWithExtensions(filters, null, `选择${field.fieldName}`)

        if (filePath) {
          // 验证文件扩展名
          if (filters && filters.length > 0) {
            const fileExt = this.getFileExtension(filePath).toLowerCase()
            const allAllowedExtensions: string[] = []
            let hasWildcard = false
            
            filters.forEach((filter: any) => {
              if (filter.extensions) {
                filter.extensions.forEach((ext: string) => {
                  const normalized = ext.startsWith('.') ? ext.substring(1).toLowerCase() : ext.toLowerCase()
                  if (normalized === '*' || normalized === '其他') {
                    hasWildcard = true
                  } else {
                    allAllowedExtensions.push(normalized)
                  }
                })
              }
            })
            
            if (!hasWildcard && !allAllowedExtensions.includes(fileExt)) {
              await alertService.warning(`文件扩展名 .${fileExt} 不在允许的列表中。允许的扩展名: ${allAllowedExtensions.map(e => `.${e}`).join(', ')}`)
              return
            }
          }

          this.formData[key] = filePath
          console.log(`已选择文件 (${key}):`, filePath)
          
          // 如果是可执行文件字段，自动提取游戏名称（如果名称字段为空）
          if (this.isExecutableFileField(field)) {
            const gameInstance = new Game()
            for (const nameKey in gameInstance) {
              const value = (gameInstance as any)[nameKey]
              if (value instanceof FormFieldType && value.fieldType === FormFieldTypeEnum.TEXT && 
                  (this.formData[nameKey] || '').trim() === '') {
                this.formData[nameKey] = this.extractGameNameFromPath(filePath)
                break
              }
            }
          }
        }
      } catch (error: any) {
        console.error('选择文件失败:', error)
        await alertService.error(`选择文件失败: ${error.message || '未知错误'}`)
      }
    },
    getFileExtension(filePath: string): string {
      const lastDot = filePath.lastIndexOf('.')
      if (lastDot === -1 || lastDot === filePath.length - 1) {
        return ''
      }
      return filePath.substring(lastDot + 1)
    },
    isImageFile(filePath: string): boolean {
      if (!filePath) return false
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      const fileExt = this.getFileExtension(filePath).toLowerCase()
      return imageExtensions.includes(fileExt) || imageExtensions.includes(`.${fileExt}`)
    },
    getImageUrl(filePath: string): string {
      if (!filePath || (typeof filePath === 'string' && filePath.trim() === '')) {
        return '/default-game.png'
      }
      // 如果是 HTTP/HTTPS URL，直接返回
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath
      }
      // 如果是 data URL，直接返回
      if (filePath.startsWith('data:') || filePath.startsWith('file:')) {
        return filePath
      }
      // 对于本地文件路径，转换为 file:// URL
      const normalizedPath = String(filePath).replace(/\\/g, '/')
      return `file:///${normalizedPath}`
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
    async handleBrowseImage(key: string) {
      const gameInstance = new Game()
      for (const fieldKey in gameInstance) {
        const field = (gameInstance as any)[fieldKey]
        if (fieldKey === key && field instanceof FormField_SelectFile) {
          await this.handleBrowseFile(key, field)
          break
        }
      }
    },
    async handleUseScreenshotAsCover(key: string) {
      try {
        // 获取游戏名称字段的值
        const gameInstance = new Game()
        let gameNameKey = ''
        for (const nameKey in gameInstance) {
          const field = (gameInstance as any)[nameKey]
          if (field instanceof FormFieldType && field.fieldType === FormFieldTypeEnum.TEXT) {
            gameNameKey = nameKey
            break
          }
        }
        const gameName = gameNameKey ? (this.formData[gameNameKey] || '').trim() : ''

        if (this.isEditMode) {
          // 编辑模式：使用游戏ID和名称
          if (!gameName) {
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
            gameName,
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
                this.formData[key] = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            } else if (window.electronAPI.selectImageFile) {
              const filePath = await window.electronAPI.selectImageFile(gameScreenshotPath)
              if (filePath) {
                this.formData[key] = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            }
          } else {
            await alertService.warning('当前环境不支持选择图片功能', '提示')
          }
        } else {
          // 添加模式：使用游戏名称或文件路径
          const executablePath = this.getExecutablePathValue()
          if (!gameName && !executablePath) {
            await alertService.warning('请先输入游戏名称或选择可执行文件')
            return
          }

          let finalGameName = gameName
          if (!finalGameName && executablePath) {
            finalGameName = this.extractGameNameFromPath(executablePath)
          }

          if (!finalGameName) {
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
          if (finalGameName && finalGameName !== 'Screenshot') {
            gameFolderName = finalGameName.replace(/[<>:"/\\|?*]/g, '_').trim()
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
                this.formData[key] = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            } else if (window.electronAPI.selectImageFile) {
              const filePath = await window.electronAPI.selectImageFile(gameScreenshotPath)
              if (filePath) {
                this.formData[key] = filePath
                notify.native('设置成功', '已选择截图作为封面')
              }
            }
          } else {
            await alertService.warning('当前环境不支持选择图片功能')
          }
        }
      } catch (error: any) {
        console.error('选择截图作为封面失败:', error)
        await alertService.error(`选择截图失败: ${error.message}`)
      }
    },
    handleClearCover(key: string) {
      this.formData[key] = ''
    },
    async handleAutoDetectEngine() {
      const executablePath = this.getExecutablePathValue()
      if (!executablePath) {
        notify.toast('warning', '无法识别', '请先选择游戏文件')
        return
      }

      if (!this.isElectronEnvironment || !window.electronAPI || !window.electronAPI.listFiles) {
        notify.toast('warning', '无法识别', '当前环境不支持自动识别功能')
        return
      }

      try {
        notify.toast('info', '正在识别', '正在分析游戏目录结构...')
        
        const gamePath = executablePath.trim()
        const detectedEngine = await detectGameEngine(gamePath)
        
        if (detectedEngine) {
          // 找到引擎字段并设置值
          const gameInstance = new Game()
          for (const key in gameInstance) {
            const field = (gameInstance as any)[key]
            if (field instanceof FormField_SelectEngine) {
              this.formData[key] = detectedEngine
              notify.toast('success', '识别成功', `已识别为 ${detectedEngine}`)
              break
            }
          }
        } else {
          notify.toast('warning', '识别失败', '无法自动识别游戏引擎，请手动选择')
        }
      } catch (error: any) {
        console.error('自动识别引擎失败:', error)
        notify.toast('error', '识别失败', `识别过程中发生错误: ${error.message}`)
      }
    },
    async handleConfirm() {
      if (!this.canConfirm) return

      const gameInstance = new Game()
      const game: Record<string, any> = {
        id: this.formData.id || (this.isEditMode ? this.game.id : Date.now().toString()),
        fileExists: true
      }

      // 遍历 Game 类的字段定义，从 formData 中提取对应的值
      for (const key in gameInstance) {
        const field = (gameInstance as any)[key]
        if (field instanceof FormFieldType) {
          let value = this.formData[key]
          
          // 根据字段类型处理值
          if (field.fieldType === FormFieldTypeEnum.TAGS) {
            game[key] = Array.isArray(value) ? [...value] : []
          } else if (typeof value === 'string') {
            game[key] = value.trim()
          } else {
            game[key] = value
          }

          // 编辑模式的特殊处理：如果值为空，保留原有值
          if (this.isEditMode && this.game) {
            if (typeof game[key] === 'string' && game[key] === '') {
              game[key] = (this.game as any)[key] || ''
            }
          }
        }
      }

      if (this.isEditMode) {
        // 编辑模式：返回更新的游戏对象
        this.$emit('confirm', game)
      } else {
        // 添加模式：特殊处理
        // 1. 如果名称为空，从可执行文件路径提取
        const executablePathValue = this.getExecutablePathValue()
        if (!game.name && executablePathValue) {
          game.name = this.extractGameNameFromPath(executablePathValue)
        }

        // 2. 获取文件夹大小
        let folderSize = 0
        const filePath = executablePathValue.trim()
        const isArchive = this.isArchiveFile(filePath)
        
        if (!isArchive && this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFolderSize) {
          try {
            const result = await window.electronAPI.getFolderSize(filePath)
            if (result.success) {
              folderSize = result.size
            }
          } catch (error) {
            console.error('获取文件夹大小失败:', error)
          }
        } else if (isArchive && this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFileStats) {
          try {
            const result = await window.electronAPI.getFileStats(filePath)
            if (result.success && result.size) {
              folderSize = result.size
            }
          } catch (error) {
            console.error('获取压缩包文件大小失败:', error)
          }
        }

        game.folderSize = folderSize
        game.playTime = 0
        game.playCount = 0
        game.lastPlayed = null
        game.firstPlayed = null
        game.addedDate = new Date().toISOString()
        game.isArchive = isArchive

        this.$emit('confirm', game)
      }
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
      
      // 动态查找 tags 字段
      const gameInstance = new Game()
      let tagsKey = ''
      for (const key in gameInstance) {
        const field = (gameInstance as any)[key]
        if (field instanceof FormFieldType && field.fieldType === FormFieldTypeEnum.TAGS) {
          tagsKey = key
          break
        }
      }
      
      if (tagsKey && Array.isArray(this.formData[tagsKey])) {
        const index = this.formData[tagsKey].indexOf(tag)
        if (index > -1) {
          // 如果标签已存在，则移除
          this.formData[tagsKey].splice(index, 1)
        } else {
          // 如果标签不存在，则添加
          this.formData[tagsKey].push(tag)
        }
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

.form-field-wrapper {
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

/* 文件输入组样式 */
.file-input-group {
  display: flex;
  gap: var(--spacing-md, 12px);
  align-items: flex-start;
  flex-wrap: wrap;
}

.file-input-group .fun-input {
  flex: 1;
  min-width: 200px;
}

.btn-browse {
  padding: var(--spacing-md, 12px) var(--spacing-xl, 20px);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base, 0.3s ease);
  white-space: nowrap;
}

.btn-browse:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-browse:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.image-preview {
  width: 100%;
  margin-top: var(--spacing-md, 12px);
  padding: var(--spacing-md, 12px);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--border-color);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-sm, 4px);
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
