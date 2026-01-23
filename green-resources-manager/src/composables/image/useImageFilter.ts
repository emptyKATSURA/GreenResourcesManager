/**
 * 图片专辑筛选 Composable
 * 负责搜索、排序、标签和作者筛选逻辑
 */
import { ref, computed, type Ref } from 'vue'
import { Manga } from '@resources/manga.ts'
import { BaseResources } from '@resources/base/ResourcesDataBase.ts'

export type AlbumSortBy = 'name' | 'count' | 'added' | 'lastViewed' | 'author' | 'viewCount'

export interface FilterItem {
  name: string
  count: number
}

/**
 * 图片专辑筛选 Composable
 * @param albums - 专辑列表的响应式引用
 */
export function useImageFilter(albums: Ref<Manga[]>) {
  // 筛选状态
  const searchQuery = ref('')
  const sortBy = ref<AlbumSortBy>('name')
  const selectedTags = ref<string[]>([])
  const excludedTags = ref<string[]>([])
  const selectedAuthors = ref<string[]>([])
  const excludedAuthors = ref<string[]>([])
  const selectedOthers = ref<string[]>([])
  const excludedOthers = ref<string[]>([])

  /**
   * 提取所有标签（带统计）
   */
  const allTags = computed<FilterItem[]>(() => {
    const tagCount: Record<string, number> = {}
    
    albums.value.forEach(album => {
      const tags = BaseResources.extractPrimitiveValue(album.tags?.value || album.tags)
      if (tags && Array.isArray(tags)) {
        tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })
    
    return Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  /**
   * 提取所有作者（带统计）
   */
  const allAuthors = computed<FilterItem[]>(() => {
    const authorCount: Record<string, number> = {}
    
    albums.value.forEach(album => {
      const author = BaseResources.extractPrimitiveValue(album.author?.value || album.author)
      if (author) {
        authorCount[author] = (authorCount[author] || 0) + 1
      }
    })
    
    return Object.entries(authorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  /**
   * 提取其他筛选选项（带统计）
   */
  const allOthers = computed<FilterItem[]>(() => {
    let missingResourcesCount = 0
    
    albums.value.forEach(album => {
      // 统计丢失的资源
      const fileExists = BaseResources.extractPrimitiveValue(album.fileExists?.value ?? album.fileExists)
      if (fileExists === false) {
        missingResourcesCount++
      }
    })
    
    const result: FilterItem[] = []
    if (missingResourcesCount > 0) {
      result.push({
        name: '丢失的资源',
        count: missingResourcesCount
      })
    }
    
    return result
  })

  /**
   * 筛选后的专辑列表
   */
  const filteredAlbums = computed<Manga[]>(() => {
    let filtered = albums.value.filter(album => {
      const name = BaseResources.extractPrimitiveValue(album.name?.value || album.name) || ''
      const author = BaseResources.extractPrimitiveValue(album.author?.value || album.author) || ''
      const resourcePath = BaseResources.extractPrimitiveValue(album.resourcePath?.value || album.resourcePath) || ''
      
      // 搜索筛选 - 搜索名称、作者、路径
      const matchesSearch = searchQuery.value === '' || 
        name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        resourcePath.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      // 标签筛选 - 必须包含所有选中的标签（AND逻辑）
      const tags = BaseResources.extractPrimitiveValue(album.tags?.value || album.tags)
      const tagsArray = Array.isArray(tags) ? tags : []
      const matchesTag = selectedTags.value.length === 0 || 
        (tagsArray.length > 0 && selectedTags.value.every(tag => tagsArray.includes(tag)))
      
      // 排除标签
      const notExcludedTag = excludedTags.value.length === 0 || 
        !(tagsArray.length > 0 && excludedTags.value.some(tag => tagsArray.includes(tag)))
      
      // 作者筛选 - 作者是"或"逻辑（一个相册只能有一个作者）
      // 注意：author 变量已在上面定义，这里直接使用
      const matchesAuthor = selectedAuthors.value.length === 0 || 
        selectedAuthors.value.includes(author)
      
      // 排除作者
      const notExcludedAuthor = excludedAuthors.value.length === 0 || 
        !excludedAuthors.value.includes(author)
      
      // 其他筛选
      let matchesOther = true
      if (selectedOthers.value.length > 0) {
        matchesOther = selectedOthers.value.some(other => {
          if (other === '丢失的资源') {
            const fileExists = BaseResources.extractPrimitiveValue(album.fileExists?.value ?? album.fileExists)
            return fileExists === false
          }
          return false
        })
      }
      const notExcludedOther = excludedOthers.value.length === 0 || 
        !excludedOthers.value.some(other => {
          if (other === '丢失的资源') {
            const fileExists = BaseResources.extractPrimitiveValue(album.fileExists?.value ?? album.fileExists)
            return fileExists === false
          }
          return false
        })
      
      return matchesSearch && matchesTag && notExcludedTag && matchesAuthor && notExcludedAuthor && matchesOther && notExcludedOther
    })
    
    // 排序
    filtered.sort((a, b) => {
      const aName = BaseResources.extractPrimitiveValue(a.name?.value || a.name) || ''
      const bName = BaseResources.extractPrimitiveValue(b.name?.value || b.name) || ''
      const aAuthor = BaseResources.extractPrimitiveValue(a.author?.value || a.author) || ''
      const bAuthor = BaseResources.extractPrimitiveValue(b.author?.value || b.author) || ''
      const aPagesCount = BaseResources.extractPrimitiveValue(a.pagesCount?.value ?? a.pagesCount) || 0
      const bPagesCount = BaseResources.extractPrimitiveValue(b.pagesCount?.value ?? b.pagesCount) || 0
      const aAddedDate = BaseResources.extractPrimitiveValue(a.addedDate?.value || a.addedDate) || ''
      const bAddedDate = BaseResources.extractPrimitiveValue(b.addedDate?.value || b.addedDate) || ''
      const aLastViewed = BaseResources.extractPrimitiveValue(a.lastViewed?.value || a.lastViewed) || ''
      const bLastViewed = BaseResources.extractPrimitiveValue(b.lastViewed?.value || b.lastViewed) || ''
      const aViewCount = BaseResources.extractPrimitiveValue(a.viewCount?.value ?? a.viewCount) || 0
      const bViewCount = BaseResources.extractPrimitiveValue(b.viewCount?.value ?? b.viewCount) || 0
      
      switch (sortBy.value) {
        case 'name':
          return aName.localeCompare(bName)
        case 'count':
          return bPagesCount - aPagesCount
        case 'added':
          return new Date(bAddedDate || 0).getTime() - new Date(aAddedDate || 0).getTime()
        case 'lastViewed':
          return new Date(bLastViewed || 0).getTime() - new Date(aLastViewed || 0).getTime()
        case 'author':
          return aAuthor.localeCompare(bAuthor)
        case 'viewCount':
          return bViewCount - aViewCount
        default:
          return 0
      }
    })
    
    return filtered
  })

  /**
   * 标签筛选方法
   * 支持三种状态切换：未选中 -> 选中 -> 排除 -> 未选中
   */
  function filterByTag(tagName: string) {
    if (selectedTags.value.includes(tagName)) {
      // 如果当前是选中状态，则取消选择
      selectedTags.value = selectedTags.value.filter(tag => tag !== tagName)
    } else if (excludedTags.value.includes(tagName)) {
      // 如果当前是排除状态，则切换为选中状态
      excludedTags.value = excludedTags.value.filter(tag => tag !== tagName)
      selectedTags.value = [...selectedTags.value, tagName]
    } else {
      // 否则直接设置为选中状态
      selectedTags.value = [...selectedTags.value, tagName]
    }
  }

  /**
   * 排除标签
   * 支持三种状态切换：未选中 -> 排除 -> 选中 -> 未选中
   */
  function excludeByTag(tagName: string) {
    if (excludedTags.value.includes(tagName)) {
      // 如果已经是排除状态，则取消排除
      excludedTags.value = excludedTags.value.filter(tag => tag !== tagName)
    } else if (selectedTags.value.includes(tagName)) {
      // 如果当前是选中状态，则切换为排除状态
      selectedTags.value = selectedTags.value.filter(tag => tag !== tagName)
      excludedTags.value = [...excludedTags.value, tagName]
    } else {
      // 否则直接设置为排除状态
      excludedTags.value = [...excludedTags.value, tagName]
    }
  }

  /**
   * 清除标签筛选
   */
  function clearTagFilter() {
    selectedTags.value = []
    excludedTags.value = []
  }

  /**
   * 作者筛选方法
   * 支持三种状态切换：未选中 -> 选中 -> 排除 -> 未选中
   */
  function filterByAuthor(authorName: string) {
    if (selectedAuthors.value.includes(authorName)) {
      // 如果当前是选中状态，则取消选择
      selectedAuthors.value = selectedAuthors.value.filter(author => author !== authorName)
    } else if (excludedAuthors.value.includes(authorName)) {
      // 如果当前是排除状态，则切换为选中状态
      excludedAuthors.value = excludedAuthors.value.filter(author => author !== authorName)
      selectedAuthors.value = [...selectedAuthors.value, authorName]
    } else {
      // 否则直接设置为选中状态
      selectedAuthors.value = [...selectedAuthors.value, authorName]
    }
  }

  /**
   * 排除作者
   * 支持三种状态切换：未选中 -> 排除 -> 选中 -> 未选中
   */
  function excludeByAuthor(authorName: string) {
    if (excludedAuthors.value.includes(authorName)) {
      // 如果已经是排除状态，则取消排除
      excludedAuthors.value = excludedAuthors.value.filter(author => author !== authorName)
    } else if (selectedAuthors.value.includes(authorName)) {
      // 如果当前是选中状态，则切换为排除状态
      selectedAuthors.value = selectedAuthors.value.filter(author => author !== authorName)
      excludedAuthors.value = [...excludedAuthors.value, authorName]
    } else {
      // 否则直接设置为排除状态
      excludedAuthors.value = [...excludedAuthors.value, authorName]
    }
  }

  /**
   * 清除作者筛选
   */
  function clearAuthorFilter() {
    selectedAuthors.value = []
    excludedAuthors.value = []
  }

  /**
   * 其他筛选方法
   */
  function filterByOther(otherName: string) {
    if (selectedOthers.value.includes(otherName)) {
      // 如果当前是选中状态，则取消选择
      selectedOthers.value = selectedOthers.value.filter(other => other !== otherName)
    } else if (excludedOthers.value.includes(otherName)) {
      // 如果当前是排除状态，则切换为选中状态
      excludedOthers.value = excludedOthers.value.filter(other => other !== otherName)
      selectedOthers.value = [...selectedOthers.value, otherName]
    } else {
      // 否则直接设置为选中状态
      selectedOthers.value = [...selectedOthers.value, otherName]
    }
  }

  /**
   * 排除其他筛选
   */
  function excludeByOther(otherName: string) {
    if (excludedOthers.value.includes(otherName)) {
      // 如果已经是排除状态，则取消排除
      excludedOthers.value = excludedOthers.value.filter(other => other !== otherName)
    } else if (selectedOthers.value.includes(otherName)) {
      // 如果当前是选中状态，则切换为排除状态
      selectedOthers.value = selectedOthers.value.filter(other => other !== otherName)
      excludedOthers.value = [...excludedOthers.value, otherName]
    } else {
      // 否则直接设置为排除状态
      excludedOthers.value = [...excludedOthers.value, otherName]
    }
  }

  /**
   * 清除其他筛选
   */
  function clearOtherFilter() {
    selectedOthers.value = []
    excludedOthers.value = []
  }

  /**
   * 处理来自 App.vue 的筛选器事件
   * @param event - 事件类型：'filter-select' | 'filter-exclude' | 'filter-clear'
   * @param data - 事件数据
   */
  function handleFilterEvent(
    event: 'filter-select' | 'filter-exclude' | 'filter-clear',
    data: { filterKey?: string; itemName?: string } | string
  ) {
    switch (event) {
      case 'filter-select':
        if (typeof data === 'object' && data.filterKey) {
          if (data.filterKey === 'tags' && data.itemName) {
            filterByTag(data.itemName)
          } else if (data.filterKey === 'authors' && data.itemName) {
            filterByAuthor(data.itemName)
          } else if (data.filterKey === 'others' && data.itemName) {
            filterByOther(data.itemName)
          }
        }
        break
      case 'filter-exclude':
        if (typeof data === 'object' && data.filterKey) {
          if (data.filterKey === 'tags' && data.itemName) {
            excludeByTag(data.itemName)
          } else if (data.filterKey === 'authors' && data.itemName) {
            excludeByAuthor(data.itemName)
          } else if (data.filterKey === 'others' && data.itemName) {
            excludeByOther(data.itemName)
          }
        }
        break
      case 'filter-clear':
        if (data === 'tags') {
          clearTagFilter()
        } else if (data === 'authors') {
          clearAuthorFilter()
        } else if (data === 'others') {
          clearOtherFilter()
        }
        break
    }
  }

  /**
   * 获取筛选器数据（用于传递给父组件/FilterSidebar）
   */
  function getFilterData() {
    return {
      filters: [
        {
          key: 'tags',
          title: '标签筛选',
          items: allTags.value,
          selected: selectedTags.value,
          excluded: excludedTags.value
        },
        {
          key: 'authors',
          title: '作者筛选',
          items: allAuthors.value,
          selected: selectedAuthors.value,
          excluded: excludedAuthors.value
        },
        {
          key: 'others',
          title: '其他筛选',
          items: allOthers.value,
          selected: selectedOthers.value,
          excluded: excludedOthers.value
        }
      ]
    }
  }

  return {
    // 状态
    searchQuery,
    sortBy,
    selectedTags,
    excludedTags,
    selectedAuthors,
    excludedAuthors,
    selectedOthers,
    excludedOthers,

    // 计算属性
    allTags,
    allAuthors,
    allOthers,
    filteredAlbums,

    // 方法
    filterByTag,
    excludeByTag,
    clearTagFilter,
    filterByAuthor,
    excludeByAuthor,
    clearAuthorFilter,
    filterByOther,
    excludeByOther,
    clearOtherFilter,
    handleFilterEvent,
    getFilterData
  }
}

