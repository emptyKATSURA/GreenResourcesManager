<template>
  <div class="debug-view">
    <div class="debug-content">
      <div class="debug-header">
        <h2>🐛 Debug 页面</h2>
        <p>用于各种调试和测试</p>
      </div>

      <div class="debug-section">
        <h3>快速测试</h3>
        <div class="test-actions">
          <button @click="testNotification" class="btn btn-primary">测试通知</button>
          <button @click="testAlert" class="btn btn-primary">测试弹窗</button>
          <button @click="testConfirm" class="btn btn-primary">测试确认</button>
        </div>
      </div>

      <div class="debug-section">
        <h3>表单测试</h3>
        <form @submit.prevent="handleFormSubmit" class="form-test">
          <div 
            v-for="(field, key) in formFields" 
            :key="key" 
            class="form-field"
          >
            <label :for="key" class="form-label">
              {{ field.fieldName }}
            </label>
            <fun-input
              v-if="field instanceof FormField_Text"
              :id="key"
              v-model="formData[key]"
              type="text"
              :placeholder="`请输入${field.fieldName}`"
            />
            <fun-input
              v-else-if="field instanceof FormField_Number"
              :id="key"
              :modelValue="String(formData[key] || '')"
              type="number"
              :placeholder="`请输入${field.fieldName}`"
              @update:modelValue="formData[key] = Number($event) || 0"
            />
            <input
              v-else-if="field instanceof FormField_Date"
              :id="key"
              v-model="formData[key]"
              type="date"
              class="form-input"
            />
            <textarea
              v-else-if="field instanceof FormField_Textarea"
              :id="key"
              v-model="formData[key]"
              class="form-textarea"
              :placeholder="`请输入${field.fieldName}`"
              rows="4"
            ></textarea>
            <div v-else-if="field instanceof FormField_Radio" class="form-radio-group">
              <label v-for="(option, index) in getRadioOptions(key, field)" :key="index" class="form-radio-label">
                <input
                  :id="`${key}-${index}`"
                  v-model="formData[key]"
                  type="radio"
                  :value="option"
                  class="form-radio"
                />
                {{ option }}
              </label>
            </div>
            <select
              v-else-if="field instanceof FormField_Select"
              :id="key"
              v-model="formData[key]"
              class="form-select"
            >
              <option value="">请选择{{ field.fieldName }}</option>
              <option v-for="(option, index) in getSelectOptions(key, field)" :key="index" :value="option">
                {{ option }}
              </option>
            </select>
            <!-- 文件选择 -->
            <div v-else-if="field instanceof FormField_SelectFile" class="file-input-group">
              <fun-input
                :id="key"
                type="text"
                v-model="formData[key]"
                :placeholder="`请选择${field.fieldName}`"
                :readonly="true"
              />
              <button 
                type="button" 
                class="btn-browse" 
                @click="handleBrowseFile(key, field)"
                :disabled="!isElectronEnvironment"
              >
                浏览
              </button>
              <!-- 图片预览 -->
              <div v-if="isImageFile(formData[key]) && formData[key]" class="image-preview">
                <img :src="getImageUrl(formData[key])" :alt="field.fieldName" @error="handleImageError" />
              </div>
            </div>
            <!-- 文件夹选择 -->
            <div v-else-if="field instanceof FormField_SelectFolder" class="file-input-group">
              <fun-input
                :id="key"
                type="text"
                v-model="formData[key]"
                :placeholder="`请选择${field.fieldName}`"
                :readonly="true"
              />
              <button 
                type="button" 
                class="btn-browse" 
                @click="handleBrowseFolder(key)"
                :disabled="!isElectronEnvironment"
              >
                浏览
              </button>
            </div>
            <!-- 标签输入 -->
            <fun-tag-input
              v-else-if="field instanceof FormField_Tags"
              :id="key"
              v-model="formData[key]"
              :placeholder="`输入${field.fieldName}后按回车或逗号添加`"
              :allowDuplicate="false"
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">提交表单</button>
            <button type="button" @click="resetForm" class="btn btn-secondary">重置</button>
          </div>
        </form>
        <div v-if="formResult" class="form-result">
          <h4>表单提交结果：</h4>
          <pre>{{ JSON.stringify(formResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import notificationService from '../utils/NotificationService.ts'
import alertService from '../utils/AlertService.ts'
import confirmService from '../utils/ConfirmService.ts'
import { Game } from '../class/game.ts'
import {
  FormField,
  FormField_Text,
  FormField_Textarea,
  FormField_Number,
  FormField_Date,
  FormField_Select,
  FormField_Radio,
  FormField_Tags,
  FormField_SelectFile,
  FormField_SelectFolder
} from '../class/FormField.ts'

export default defineComponent({
  name: 'DebugView',
  setup() {
    // 创建 Game 实例
    const game = new Game()
    
    // 检查是否是 Electron 环境
    const isElectronEnvironment = computed(() => {
      return !!(window as any).electronAPI
    })
    
    // 提取所有 FormField 类型的字段
    const formFields = computed(() => {
      const fields: Record<string, FormField> = {}
      for (const key in game) {
        const value = (game as any)[key]
        if (value instanceof FormField) {
          fields[key] = value
        }
      }
      return fields
    })
    
    // 初始化表单数据的函数
    const initFormData = () => {
      const data: Record<string, any> = {}
      for (const key in formFields.value) {
        const field = formFields.value[key]
        if (field instanceof FormField_Number) {
          data[key] = 0
        } else if (field instanceof FormField_Tags) {
          data[key] = []
        } else {
          data[key] = ''
        }
      }
      return data
    }
    
    const formData = reactive(initFormData())
    const formResult = reactive<Record<string, any> | null>(null)
    
    return {
      formFields,
      formData,
      formResult,
      FormField_Text,
      FormField_Textarea,
      FormField_Number,
      FormField_Date,
      FormField_Select,
      FormField_Radio,
      FormField_Tags,
      FormField_SelectFile,
      FormField_SelectFolder,
      initFormData,
      isElectronEnvironment
    }
  },
  methods: {
    testNotification() {
      notificationService.success('测试通知', '这是一条成功通知')
    },
    async testAlert() {
      await alertService.show({ title: '测试弹窗', message: '这是一个测试弹窗' })
    },
    async testConfirm() {
      const result = await confirmService.show({ title: '测试确认', message: '这是一个测试确认对话框' })
      console.log('确认结果:', result ? '确认' : '取消')
    },
    handleFormSubmit() {
      // 将表单数据转换为普通对象
      const result: Record<string, any> = {}
      for (const key in this.formData) {
        result[key] = this.formData[key]
      }
      this.formResult = result
      console.log('表单提交数据:', result)
      notificationService.success('表单提交成功', '表单数据已提交，请查看控制台和下方结果')
    },
    resetForm() {
      const initData = this.initFormData()
      for (const key in initData) {
        this.formData[key] = initData[key]
      }
      this.formResult = null
    },
    getRadioOptions(key: string, field: FormField): string[] {
      // 必须配置 options 属性（FormField_Radio）
      if ('options' in field && Array.isArray((field as any).options)) {
        return (field as any).options
      }
      // 如果没有配置，返回空数组
      console.warn(`字段 ${key} (${field.fieldName}) 没有配置选项列表`)
      return []
    },
    getSelectOptions(key: string, field: FormField): string[] {
      // 必须配置 options 属性（FormField_Select）
      if ('options' in field && Array.isArray((field as any).options)) {
        return (field as any).options
      }
      // 如果没有配置，返回空数组
      console.warn(`字段 ${key} (${field.fieldName}) 没有配置选项列表`)
      return []
    },
    async handleBrowseFile(key: string, field: FormField) {
      try {
        if (!this.isElectronEnvironment || !(window as any).electronAPI) {
          await alertService.show({ 
            title: '提示', 
            message: '当前环境不支持文件选择功能，请在 Electron 环境中使用' 
          })
          return
        }

        const electronAPI = (window as any).electronAPI

        // 获取过滤器数组（如果 field 是 FormField_SelectFile）
        const filters = ('filters' in field && Array.isArray((field as any).filters)) 
          ? (field as any).filters 
          : []

        // 使用统一的 API，直接传递过滤器数组
        if (!electronAPI.selectFileWithExtensions) {
          await alertService.show({ 
            title: '错误', 
            message: '当前环境不支持根据扩展名选择文件功能' 
          })
          return
        }

        const filePath = await electronAPI.selectFileWithExtensions(filters, null, `选择${field.fieldName}`)

        if (filePath) {
          // 如果配置了过滤器，验证文件扩展名（双重验证，确保符合要求）
          if (filters && filters.length > 0) {
            const fileExt = this.getFileExtension(filePath).toLowerCase()
            
            // 收集所有允许的扩展名（从所有过滤器中）
            const allAllowedExtensions: string[] = []
            let hasWildcard = false
            
            filters.forEach((filter: { name: string; extensions: string[] }) => {
              if (filter.extensions) {
                filter.extensions.forEach(ext => {
                  const normalized = ext.startsWith('.') ? ext.substring(1).toLowerCase() : ext.toLowerCase()
                  if (normalized === '*' || normalized === '其他') {
                    hasWildcard = true
                  } else {
                    allAllowedExtensions.push(normalized)
                  }
                })
              }
            })
            
            // 检查扩展名是否在允许列表中（支持 '其他' 和 '*' 作为通配符）
            if (!hasWildcard && !allAllowedExtensions.includes(fileExt)) {
              await alertService.show({ 
                title: '文件类型错误', 
                message: `文件扩展名 .${fileExt} 不在允许的列表中。允许的扩展名: ${allAllowedExtensions.map(e => `.${e}`).join(', ')}` 
              })
              return
            }
          }

          this.formData[key] = filePath
          console.log(`已选择文件 (${key}):`, filePath)
          if (filters && filters.length > 0) {
            console.log(`过滤器配置:`, filters)
          }
        }
      } catch (error: any) {
        console.error('选择文件失败:', error)
        await alertService.show({ 
          title: '错误', 
          message: `选择文件失败: ${error.message || '未知错误'}` 
        })
      }
    },
    getFileExtension(filePath: string): string {
      const lastDot = filePath.lastIndexOf('.')
      if (lastDot === -1 || lastDot === filePath.length - 1) {
        return ''
      }
      return filePath.substring(lastDot + 1)
    },
    async handleBrowseFolder(key: string) {
      try {
        if (!this.isElectronEnvironment || !(window as any).electronAPI) {
          await alertService.show({ 
            title: '提示', 
            message: '当前环境不支持文件夹选择功能，请在 Electron 环境中使用' 
          })
          return
        }

        const electronAPI = (window as any).electronAPI
        if (!electronAPI.selectFolder) {
          await alertService.show({ 
            title: '错误', 
            message: '当前环境不支持文件夹选择功能' 
          })
          return
        }
        
        const result = await electronAPI.selectFolder()
        if (result && result.success && result.path) {
          this.formData[key] = result.path
          console.log(`已选择文件夹 (${key}):`, result.path)
        } else if (result && !result.success) {
          await alertService.show({ 
            title: '错误', 
            message: result.error || '未选择文件夹' 
          })
        }
      } catch (error: any) {
        console.error('选择文件夹失败:', error)
        await alertService.show({ 
          title: '错误', 
          message: `选择文件夹失败: ${error.message || '未知错误'}` 
        })
      }
    },
    isImageFile(filePath: string): boolean {
      if (!filePath) return false
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      const fileExt = this.getFileExtension(filePath).toLowerCase()
      return imageExtensions.includes(fileExt) || imageExtensions.includes(`.${fileExt}`)
    },
    getImageUrl(filePath: string): string {
      if (!filePath) return ''
      // 如果是 HTTP/HTTPS URL，直接返回
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath
      }
      // 如果是 data URL，直接返回
      if (filePath.startsWith('data:')) {
        return filePath
      }
      // 对于本地文件路径，转换为 file:// URL
      const normalizedPath = filePath.replace(/\\/g, '/')
      return `file:///${normalizedPath}`
    },
    handleImageError(event: Event) {
      console.warn('图片加载失败:', event)
      // 可以在这里添加错误处理逻辑
    }
  }
})
</script>

<style scoped>
.debug-view {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.debug-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-3xl);
}

.debug-header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.debug-header h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.debug-header p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.debug-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--border-color);
}

.debug-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xl) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.test-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--accent-color);
}

.form-test {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-textarea,
.form-select {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-checkbox-group,
.form-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-checkbox-label,
.form-radio-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-weight: normal;
}

.form-checkbox,
.form-radio {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.form-result {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.form-result h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.form-result pre {
  margin: 0;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.file-input-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  flex-wrap: wrap;
}

.file-input-group .form-input {
  flex: 1;
  min-width: 200px;
}

.btn-browse {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
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
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

</style>
