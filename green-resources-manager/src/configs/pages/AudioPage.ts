import { BasePage } from './base/BasePage'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'

/**
 * 音频页面配置
 */
export class AudioPage extends BasePage {
  readonly id = 'audio'
  readonly name = '声音'
  readonly icon = '🎵'
  readonly description = '可以管理mp3、wav等常见音频文件'
  
  resourceTypes = ['Audio']
  
  displayLayoutConfig = {
    minWidth: 150,
    maxWidth: 400
  }
  
  getEmptyStateConfig() {
    return {
      icon: '🎵',
      title: '你的音频库是空的',
      description: '点击"添加音频"按钮来添加你的第一个音频文件',
      buttonText: '添加第一个音频',
      buttonAction: 'showAddGameDialog'
    }
  }
  
  getToolbarConfig() {
    return {
      addButtonText: '添加音频',
      searchPlaceholder: '搜索音频...'
    }
  }
  
  getSortOptions(): SortOption[] {
    return [
      { value: 'name-asc', label: '按名称排序' },
      { value: 'name-desc', label: '按名称排序（降序）' },
      { value: 'added-asc', label: '按添加时间' },
      { value: 'added-desc', label: '按添加时间（降序）' }
    ]
  }
  
  getSortConfig(sortValue: string): SortConfig<any> | null {
    const getFieldValue = (field: any) => {
      if (field && typeof field === 'object' && 'value' in field) {
        return field.value
      }
      return field
    }
    
    const configs: Record<string, SortConfig<any>> = {
      'name-asc': {
        fieldAccessor: (item: any) => getFieldValue(item.name) || null,
        order: 'asc'
      },
      'name-desc': {
        fieldAccessor: (item: any) => getFieldValue(item.name) || null,
        order: 'desc'
      },
      'added-asc': {
        fieldAccessor: (item: any) => {
          const date = getFieldValue(item.addedDate)
          return date ? new Date(date).getTime() : null
        },
        order: 'asc'
      },
      'added-desc': {
        fieldAccessor: (item: any) => {
          const date = getFieldValue(item.addedDate)
          return date ? new Date(date).getTime() : null
        },
        order: 'desc'
      }
    }
    
    return configs[sortValue] || null
  }
}
