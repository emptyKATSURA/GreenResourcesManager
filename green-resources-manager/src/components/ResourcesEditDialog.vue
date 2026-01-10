<template>
  <div v-if="visible" class="modal-overlay" @mousedown="handleOverlayMouseDown">
    <div class="modal-wrapper">
      <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h3>{{ getTitle() }}</h3>
        <button class="btn-close" @click="handleClose">✕</button>
      </div>
      <div class="modal-body">
        <!-- 根据资源类自动生成表单字段 -->
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
            v-if="field instanceof FormField_Text"
            :id="key"
            v-model="formData[key]"
            type="text"
            :placeholder="getFieldPlaceholder(key, field)"
          />
          
          <!-- 文本域字段 -->
          <fun-textarea
            v-else-if="field instanceof FormField_Textarea"
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
            <div class="engine-auto-detect" v-if="enableEngineAutoDetect">
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
            v-else-if="field instanceof FormField_Select"
            :id="key"
            v-model="formData[key]"
            :options="getSelectOptions(key, field)"
            :placeholder="getFieldPlaceholder(key, field)"
          />

          <!-- 标签字段 -->
          <fun-tag-input
            v-else-if="field instanceof FormField_Tags"
            :id="key"
            v-model="formData[key]"
            :placeholder="getFieldPlaceholder(key, field)"
            :allowDuplicate="false"
          />
          
          <!-- 文件选择字段（封面类型，需要特殊处理） -->
          <template v-else-if="isCoverField(field)">
            <div class="cover-selection-container">
              <div class="cover-preview" v-if="formData[key]">
                <img :src="getImageUrl(formData[key])" :alt="'封面预览'" @error="handleImageError">
                <div class="cover-preview-info">
                  <span class="cover-filename">{{ getImageFileName(formData[key]) }}</span>
                </div>
              </div>
              <div class="cover-actions">
                <!-- 游戏封面：使用截图作为封面 -->
                <button 
                  v-if="field instanceof FormField_SelectGameCover && enableScreenshotCover"
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleUseScreenshotAsCover(key)"
                  :disabled="isEditMode ? false : !getExecutablePathValue()"
                >
                  <span class="btn-icon">📸</span>
                  使用截图作为封面
                </button>
                <!-- 漫画封面：使用第一张图片 -->
                <button 
                  v-if="field instanceof FormField_SelectMangaCover && enableFirstImageCover"
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleUseFirstImageAsCover(key)"
                  :disabled="!getFolderPathValue()"
                >
                  <span class="btn-icon">🖼️</span>
                  使用第一张图片
                </button>
                <!-- 漫画封面：从文件夹选择 -->
                <button 
                  v-if="field instanceof FormField_SelectMangaCover && enableSelectFromFolder"
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleSelectFromFolder(key)"
                  :disabled="!getFolderPathValue()"
                >
                  <span class="btn-icon">📂</span>
                  从文件夹选择
                </button>
                <!-- 视频缩略图：随机封面 -->
                <button 
                  v-if="field instanceof FormField_SelectVideoThumbnail && enableRandomizeThumbnail"
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleRandomizeThumbnail(key)"
                  :disabled="!getFilePathValue()"
                >
                  <span class="btn-icon">🎲</span>
                  随机封面
                </button>
                <!-- 视频缩略图：从封面文件夹选择（用于文件夹） -->
                <button 
                  v-if="field instanceof FormField_SelectVideoThumbnail && enableSelectFromFolderCovers"
                  type="button" 
                  class="btn-cover-action" 
                  @click="() => handleSelectFromFolderCovers(key)"
                  :disabled="!getFolderPathValue()"
                >
                  <span class="btn-icon">📂</span>
                  从封面文件夹选择
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
          
          <!-- 文件夹选择字段 -->
          <div v-else-if="field instanceof FormField_SelectFolder" class="file-input-group">
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
              @click="() => handleBrowseFolder(key, field)"
              :disabled="!isElectronEnvironment"
            >
              浏览
            </button>
          </div>
          
          <!-- 文件选择字段（普通文件） -->
          <div v-else-if="field instanceof FormField_SelectFile && !isCoverField(field)" class="file-input-group">
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
        
        <!-- 自定义插槽，用于添加额外的表单字段 -->
        <slot name="extra-fields" :formData="formData" :isEditMode="isEditMode"></slot>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" @click="() => { console.log('[ResourcesEditDialog] 确认按钮被点击，canConfirm:', canConfirm); handleConfirm() }" :disabled="!canConfirm">
          {{ getConfirmButtonText() }}
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
import { computed, PropType } from 'vue'
import TagSelectionPanel from './TagSelectionPanel.vue'
import saveManager from '../utils/SaveManager.ts'
import notify from '../utils/NotificationService.ts'
import alertService from '../utils/AlertService.ts'
import { detectGameEngine } from '../utils/GameEngineDetector.ts'
import {
  FormField as FormFieldType,
  FormField_Text,
  FormField_Textarea,
  FormField_Select,
  FormField_Tags,
  FormField_SelectEngine,
  FormField_SelectFile,
  FormField_SelectFolder,
  FormField_SelectGameCover,
  FormField_SelectMangaCover,
  FormField_SelectVideoThumbnail
} from '../types/class/FormField.ts'

export default {
  name: 'ResourcesEditDialog',
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
    // 资源类构造函数
    resourceClass: {
      type: Object,
      required: true
    } as any,
    // 资源数据（编辑模式）
    resourceData: {
      type: Object,
      default: null
    },
    // 标题配置
    title: {
      type: String,
      default: ''
    },
    addTitle: {
      type: String,
      default: ''
    },
    editTitle: {
      type: String,
      default: ''
    },
    // 确认按钮文本配置
    confirmButtonText: {
      type: String,
      default: ''
    },
    addButtonText: {
      type: String,
      default: '添加'
    },
    editButtonText: {
      type: String,
      default: '保存修改'
    },
    // 功能开关
    isElectronEnvironment: {
      type: Boolean,
      default: false
    },
    enableEngineAutoDetect: {
      type: Boolean,
      default: false
    },
    enableScreenshotCover: {
      type: Boolean,
      default: false
    },
    enableFirstImageCover: {
      type: Boolean,
      default: false
    },
    enableSelectFromFolder: {
      type: Boolean,
      default: false
    },
    enableSelectFromFolderCovers: {
      type: Boolean,
      default: false
    },
    enableRandomizeThumbnail: {
      type: Boolean,
      default: false
    },
    availableTags: {
      type: Array as PropType<(string | { name: string; count?: number })[]>,
      default: () => []
    },
    // 自定义验证函数
    customValidation: {
      type: Function as PropType<(formData: Record<string, any>, isEditMode: boolean) => boolean>,
      default: null
    },
    // 自定义确认处理函数（返回 false 可以阻止默认行为）
    customConfirmHandler: {
      type: Function as PropType<(formData: Record<string, any>, isEditMode: boolean) => Promise<boolean | void>>,
      default: null
    }
  },
  emits: ['close', 'confirm', 'use-first-image-cover', 'select-from-folder-cover', 'select-from-folder-covers', 'randomize-thumbnail', 'video-file-selected'],
  setup(props) {
    // 创建资源实例用于提取字段定义
    const resourceInstance = new props.resourceClass()
    
    // 提取所有 FormField 类型的字段，保持类中定义的顺序
    const formFields = computed(() => {
      const fields: Record<string, FormFieldType> = {}
      // 遍历资源实例的所有属性，保持定义顺序
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormFieldType) {
          fields[key] = value
        }
      }
      return fields
    })
    
    return {
      formFields,
      FormField_Text,
      FormField_Textarea,
      FormField_Select,
      FormField_Tags,
      FormField_SelectEngine,
      FormField_SelectFile,
      FormField_SelectFolder,
      FormField_SelectGameCover,
      FormField_SelectMangaCover,
      FormField_SelectVideoThumbnail
    }
  },
  data() {
    // 初始化表单数据的函数（根据字段类型自动生成）
    const initFormData = () => {
      const resourceInstance = new this.resourceClass()
      const data: Record<string, any> = { id: '' }
      
      // 遍历资源实例的所有属性
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormFieldType) {
          // 根据字段类型初始化默认值
          if (value instanceof FormField_Tags) {
            data[key] = []
          } else {
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
      // 如果有自定义验证函数，使用自定义验证
      if (this.customValidation) {
        const result = this.customValidation(this.formData, this.isEditMode)
        console.log('[ResourcesEditDialog] canConfirm (customValidation):', result, 'formData:', this.formData)
        return result
      }
      
      // 默认验证：编辑模式只需要有ID即可，添加模式需要必填字段
      if (this.isEditMode) {
        return true
      }
      
      // 检查必填字段
      const resourceInstance = new this.resourceClass()
      for (const key in resourceInstance) {
        const field = (resourceInstance as any)[key]
        if (field instanceof FormFieldType && field.required) {
          const value = this.formData[key]
          if (!value || (typeof value === 'string' && value.trim() === '') || 
              (Array.isArray(value) && value.length === 0)) {
            console.log('[ResourcesEditDialog] canConfirm (required field missing):', key, value)
            return false
          }
        }
      }
      return true
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        if (this.isEditMode && this.resourceData) {
          this.loadResourceData()
        } else {
          this.resetForm()
        }
      }
    },
    resourceData: {
      handler(newVal) {
        if (newVal && this.visible && this.isEditMode) {
          this.loadResourceData()
        }
      },
      immediate: true
    },
    resourceClass: {
      handler() {
        // 资源类变化时重新初始化表单
        this.formData = this.initFormData()
      }
    }
  },
  methods: {
    getTitle() {
      if (this.title) return this.title
      if (this.isEditMode) {
        return this.editTitle || '编辑资源'
      }
      return this.addTitle || '添加资源'
    },
    getConfirmButtonText() {
      if (this.confirmButtonText) return this.confirmButtonText
      return this.isEditMode ? this.editButtonText : this.addButtonText
    },
    // 判断是否是封面字段
    isCoverField(field: FormFieldType): boolean {
      return field instanceof FormField_SelectGameCover || 
             field instanceof FormField_SelectMangaCover ||
             field instanceof FormField_SelectVideoThumbnail ||
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
      const resourceInstance = new this.resourceClass()
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormField_SelectFile && this.isExecutableFileField(value)) {
          return this.formData[key] || ''
        }
      }
      return ''
    },
    // 获取文件夹路径的值（用于漫画封面选择等功能）
    getFolderPathValue(): string {
      const resourceInstance = new this.resourceClass()
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormField_SelectFolder || 
            (value instanceof FormField_SelectFile && key === 'folderPath')) {
          return this.formData[key] || ''
        }
      }
      return ''
    },
    // 获取文件路径的值（用于视频缩略图等功能）
    getFilePathValue(): string {
      const resourceInstance = new this.resourceClass()
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormField_SelectFile && key === 'filePath') {
          return this.formData[key] || ''
        }
      }
      return ''
    },
    // 获取标签字段的值（用于 TagSelectionPanel）
    getTagsFieldValue(): string[] {
      const resourceInstance = new this.resourceClass()
      for (const key in resourceInstance) {
        const field = (resourceInstance as any)[key]
        if (field instanceof FormField_Tags) {
          return Array.isArray(this.formData[key]) ? this.formData[key] : []
        }
      }
      return []
    },
    // 获取字段标签（必填字段加 *，非必填字段不加标识）
    getFieldLabel(key: string, field: FormFieldType): string {
      const fieldName = field.fieldName
      const isRequired = field.required === true
      
      // 特殊字段的标签处理
      if (this.isExecutableFileField(field)) {
        const label = this.isEditMode ? '游戏可执行文件' : '游戏文件'
        return isRequired ? `${label} *` : label
      }
      
      return isRequired ? `${fieldName} *` : fieldName
    },
    // 获取字段占位符
    getFieldPlaceholder(key: string, field: FormFieldType): string {
      if (field instanceof FormField_Select) {
        return `请选择${field.fieldName}`
      }
      if (field instanceof FormField_Textarea) {
        return '输入简介或描述...'
      }
      if (field instanceof FormField_SelectFile) {
        if (this.isExecutableFileField(field)) {
          return this.isEditMode ? '选择游戏可执行文件' : '选择游戏可执行文件或压缩包'
        }
      }
      if (field instanceof FormField_SelectFolder) {
        return `选择${field.fieldName}`
      }
      return `请输入${field.fieldName}`
    },
    // 获取选择字段的选项（用于 SELECT 类型）
    getSelectOptions(key: string, field: FormFieldType): Array<{ value: string; label: string }> {
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
      initData.id = this.formData.id || ''
      this.formData = initData
    },
    loadResourceData() {
      if (!this.resourceData) return
      
      const initData = this.initFormData()
      initData.id = this.resourceData.id || ''
      
      const resourceInstance = new this.resourceClass()
      // 首先加载类中定义的字段
      for (const key in resourceInstance) {
        const value = (resourceInstance as any)[key]
        if (value instanceof FormFieldType) {
          const resourceValue = (this.resourceData as any)[key]
          if (resourceValue !== undefined && resourceValue !== null) {
            if (value instanceof FormField_Tags && Array.isArray(resourceValue)) {
              initData[key] = [...resourceValue]
            } else if (typeof resourceValue === 'string' || typeof resourceValue === 'number' || typeof resourceValue === 'boolean') {
              initData[key] = resourceValue
            }
          }
        }
      }
      
      // 然后保留其他不在类中定义但在 resourceData 中的字段（如 duration）
      // 这些字段不会显示在表单中，但会在确认时保留
      for (const key in this.resourceData) {
        if (!(key in initData) && key !== 'id' && key !== 'fileExists') {
          initData[key] = (this.resourceData as any)[key]
        }
      }
      
      this.formData = initData
    },
    handleClose() {
      this.$emit('close')
    },
    handleOverlayMouseDown(event: MouseEvent) {
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

        if (!electronAPI.selectFileWithExtensions) {
          await alertService.error('当前环境不支持根据扩展名选择文件功能')
          return
        }

        const filePath = await electronAPI.selectFileWithExtensions(filters, null, `选择${field.fieldName}`)

        if (filePath) {
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
          
          // 如果是可执行文件字段，自动提取游戏名称（如果名称字段为空）
          if (this.isExecutableFileField(field)) {
            const resourceInstance = new this.resourceClass()
            for (const nameKey in resourceInstance) {
              const value = (resourceInstance as any)[nameKey]
              if (value instanceof FormField_Text && 
                  (this.formData[nameKey] || '').trim() === '') {
                this.formData[nameKey] = this.extractGameNameFromPath(filePath)
                break
              }
            }
          }
          
          // 如果是图片文件字段（单图片模式），自动提取图片名称（如果名称字段为空）
          if (this.isImageFile(filePath) && key === 'folderPath') {
            const resourceInstance = new this.resourceClass()
            for (const nameKey in resourceInstance) {
              const value = (resourceInstance as any)[nameKey]
              if (value instanceof FormField_Text && 
                  (this.formData[nameKey] || '').trim() === '') {
                // 从文件名提取名称（不含扩展名）
                const fileName = filePath.split(/[\\/]/).pop() || ''
                this.formData[nameKey] = fileName.replace(/\.[^/.]+$/, '')
                break
              }
            }
          }
          
          // 如果是视频文件字段，触发事件让父组件处理（提取名称、获取时长、生成缩略图等）
          if (key === 'filePath' && this.isVideoFile(filePath)) {
            this.$emit('video-file-selected', key, filePath, this.formData)
          }
        }
      } catch (error: any) {
        console.error('选择文件失败:', error)
        await alertService.error(`选择文件失败: ${error.message || '未知错误'}`)
      }
    },
    async handleBrowseFolder(key: string, field: FormFieldType) {
      try {
        if (!(field instanceof FormField_SelectFolder)) return
        
        if (!this.isElectronEnvironment || !window.electronAPI) {
          await alertService.warning('当前环境不支持文件夹选择功能，请在 Electron 环境中使用')
          return
        }

        const electronAPI = window.electronAPI
        if (!electronAPI.selectFolder) {
          await alertService.error('当前环境不支持文件夹选择功能')
          return
        }

        const result = await electronAPI.selectFolder()

        if (result && result.success && result.path) {
          this.formData[key] = result.path
        } else if (result && !result.success) {
          await alertService.warning(result.error || '未选择文件夹')
        }
      } catch (error: any) {
        console.error('选择文件夹失败:', error)
        await alertService.error(`选择文件夹失败: ${error.message || '未知错误'}`)
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
    isVideoFile(filePath: string): boolean {
      if (!filePath) return false
      const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', 'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v']
      const fileExt = this.getFileExtension(filePath).toLowerCase()
      return videoExtensions.includes(fileExt) || videoExtensions.includes(`.${fileExt}`)
    },
    getImageUrl(filePath: string): string {
      if (!filePath || (typeof filePath === 'string' && filePath.trim() === '')) {
        return '/default-game.png'
      }
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath
      }
      if (filePath.startsWith('data:') || filePath.startsWith('file:')) {
        return filePath
      }
      const normalizedPath = String(filePath).replace(/\\/g, '/')
      return `file:///${normalizedPath}`
    },
    extractGameNameFromPath(filePath: string) {
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
      const resourceInstance = new this.resourceClass()
      for (const fieldKey in resourceInstance) {
        const field = (resourceInstance as any)[fieldKey]
        if (fieldKey === key && (field instanceof FormField_SelectFile || this.isCoverField(field))) {
          if (field instanceof FormField_SelectFile) {
            await this.handleBrowseFile(key, field)
          } else {
            // 封面字段使用图片文件选择
            const coverField = new FormField_SelectFile('封面', [
              { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] }
            ])
            await this.handleBrowseFile(key, coverField)
          }
          break
        }
      }
    },
    async handleUseScreenshotAsCover(key: string) {
      try {
        const resourceInstance = new this.resourceClass()
        let nameKey = ''
        for (const fieldKey in resourceInstance) {
          const field = (resourceInstance as any)[fieldKey]
          if (field instanceof FormField_Text) {
            nameKey = fieldKey
            break
          }
        }
        const resourceName = nameKey ? (this.formData[nameKey] || '').trim() : ''

        if (this.isEditMode) {
          if (!resourceName) {
            await alertService.warning('请先输入游戏名称', '提示')
            return
          }

          if (!this.formData.id) {
            await alertService.warning('游戏ID不存在，无法打开截图文件夹', '提示')
            return
          }

          const { getGameScreenshotFolderPath } = await import('../composables/game/useGameScreenshot')
          const gameScreenshotPath = await getGameScreenshotFolderPath(
            this.formData.id,
            resourceName,
            this.isElectronEnvironment
          )

          if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.ensureDirectory) {
            try {
              await window.electronAPI.ensureDirectory(gameScreenshotPath)
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
          const executablePath = this.getExecutablePathValue()
          if (!resourceName && !executablePath) {
            await alertService.warning('请先输入游戏名称或选择可执行文件')
            return
          }

          let finalName = resourceName
          if (!finalName && executablePath) {
            finalName = this.extractGameNameFromPath(executablePath)
          }

          if (!finalName) {
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

          let folderName = 'Screenshots'
          if (finalName && finalName !== 'Screenshot') {
            folderName = finalName.replace(/[<>:"/\\|?*]/g, '_').trim()
            if (!folderName) {
              folderName = 'Screenshots'
            }
          }

          const gameScreenshotPath = `${baseScreenshotsPath}/${folderName}`.replace(/\\/g, '/')

          if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.ensureDirectory) {
            try {
              await window.electronAPI.ensureDirectory(gameScreenshotPath)
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
    async handleUseFirstImageAsCover(key: string) {
      // 这个功能需要在父组件中实现，通过事件或插槽
      // 父组件应该通过回调或事件更新封面
      this.$emit('use-first-image-cover', key, this.formData, (coverPath: string) => {
        if (coverPath) {
          this.formData[key] = coverPath
        }
      })
    },
    async handleSelectFromFolder(key: string) {
      // 这个功能需要在父组件中实现，通过事件或插槽
      // 父组件应该通过回调或事件更新封面
      this.$emit('select-from-folder-cover', key, this.formData, (coverPath: string) => {
        if (coverPath) {
          this.formData[key] = coverPath
        }
      })
    },
    async handleSelectFromFolderCovers(key: string) {
      // 这个功能需要在父组件中实现，通过事件或插槽
      // 父组件应该通过回调或事件更新缩略图（从文件夹的 Covers 子目录选择）
      this.$emit('select-from-folder-covers', key, this.formData, (thumbnailPath: string) => {
        if (thumbnailPath) {
          this.formData[key] = thumbnailPath
        }
      })
    },
    async handleRandomizeThumbnail(key: string) {
      // 这个功能需要在父组件中实现，通过事件或插槽
      // 父组件应该通过回调或事件更新缩略图
      this.$emit('randomize-thumbnail', key, this.formData, (thumbnailPath: string) => {
        if (thumbnailPath) {
          this.formData[key] = thumbnailPath
        }
      })
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
          const resourceInstance = new this.resourceClass()
          for (const key in resourceInstance) {
            const field = (resourceInstance as any)[key]
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
      if (!this.canConfirm) {
        console.warn('[ResourcesEditDialog] 确认按钮被禁用，canConfirm:', this.canConfirm)
        return
      }

      try {
        // 如果有自定义确认处理函数，先执行它
        if (this.customConfirmHandler) {
          const result = await this.customConfirmHandler(this.formData, this.isEditMode)
          if (result === false) {
            // 返回 false 表示阻止默认行为
            console.log('[ResourcesEditDialog] customConfirmHandler 返回 false，阻止默认行为')
            return
          }
        }

        const resourceInstance = new this.resourceClass()
        const resource: Record<string, any> = {
          id: this.formData.id || (this.isEditMode ? this.resourceData?.id : Date.now().toString()),
          fileExists: true
        }

        // 遍历资源类的字段定义，从 formData 中提取对应的值
        for (const key in resourceInstance) {
          const field = (resourceInstance as any)[key]
          if (field instanceof FormFieldType) {
            let value = this.formData[key]
            
            if (field instanceof FormField_Tags) {
              resource[key] = Array.isArray(value) ? [...value] : []
            } else if (typeof value === 'string') {
              resource[key] = value.trim()
            } else {
              resource[key] = value
            }

            // 编辑模式的特殊处理：如果值为空，保留原有值
            if (this.isEditMode && this.resourceData) {
              if (typeof resource[key] === 'string' && resource[key] === '') {
                resource[key] = (this.resourceData as any)[key] || ''
              }
            }
          }
        }
        
        // 保留不在类中定义但在 formData 中的字段（如 duration 等）
        for (const key in this.formData) {
          if (!(key in resource) && key !== 'id' && key !== 'fileExists') {
            const value = this.formData[key]
            if (value !== undefined && value !== null) {
              resource[key] = value
            }
          }
        }

        console.log('[ResourcesEditDialog] 准备触发 confirm 事件，resource:', resource)
        this.$emit('confirm', resource)
      } catch (error) {
        console.error('[ResourcesEditDialog] handleConfirm 执行出错:', error)
        throw error
      }
    },
    handleImageError(event: Event) {
      const target = event.target as HTMLImageElement
      if (target) {
        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwSDgwVjE2MEgxMjBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODAgMTIwTDEwMCAxMDBMMTIwIDEyMEwxMDAgMTQwTDgwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
      }
    },
    getImageFileName(imagePath: string) {
      if (!imagePath) return ''
      const fileName = imagePath.split(/[\\/]/).pop()
      return fileName || imagePath
    },
    handleSelectTag(tag: string) {
      if (!tag) return
      
      const resourceInstance = new this.resourceClass()
      let tagsKey = ''
      for (const key in resourceInstance) {
        const field = (resourceInstance as any)[key]
        if (field instanceof FormField_Tags) {
          tagsKey = key
          break
        }
      }
      
      if (tagsKey && Array.isArray(this.formData[tagsKey])) {
        const index = this.formData[tagsKey].indexOf(tag)
        if (index > -1) {
          this.formData[tagsKey].splice(index, 1)
        } else {
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

.form-field-wrapper {
  margin-bottom: 20px;
}

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
