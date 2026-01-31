<template>
  <div class="scraper-library-view">
    <div class="scraper-library-content">
      <div class="action-bar">
        <button
          type="button"
          class="btn-import"
          :disabled="importing"
          @click="handleImportFromArchive"
        >
          {{ importing ? '导入中...' : '从存档导入刮削库' }}
        </button>
        <span v-if="importedItems.length > 0" class="import-summary">
          已导入 {{ importedItems.length }} 条固有数据（无 id）
        </span>
      </div>

      <div v-if="importedItems.length === 0" class="scraper-library-empty">
        <p class="empty-hint">点击「从存档导入刮削库」将各资源表的固有数据导入到此页展示（不包含 id）</p>
      </div>

      <template v-else>
        <div class="library-section">
          <h3>刮削库数据</h3>
          <div class="table-wrap">
            <FunPagination
              v-if="paginationConfig.totalPages > 1"
              :currentPage="paginationConfig.currentPage"
              :totalPages="paginationConfig.totalPages"
              :pageSize="paginationConfig.pageSize"
              :totalItems="paginationConfig.totalItems"
              itemType="条记录"
              @page-change="handlePageChange"
            />
            <FunDataTable
              :data="paginatedRows"
              :columns="displayColumns"
              :show-actions="false"
              :row-key="(row, idx) => idx"
              :default-formatter="formatCellValue"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import alertService from '../utils/AlertService.ts'
import { usePagination } from '../composables/usePagination'
import FunPagination from '../fun-ui/navigation/Pagination/FunPagination.vue'
import FunDataTable from '../fun-ui/basic/DataTable/FunDataTable.vue'

// 资源表名（只从这些表导入固有数据）
const RESOURCE_TABLE_NAMES = [
  'games',
  'manga',
  'audio',
  'novel',
  'video',
  'software',
  'website',
  'singleImage',
  'other',
  'videoFolder'
]

const importing = ref(false)
const importedItems = ref<Array<Record<string, any>>>([])

// 列标题中文映射
const COLUMN_LABELS: Record<string, string> = {
  _sourceTable: '来源表',
  name: '名称',
  resourcePath: '资源路径',
  description: '描述',
  tags: '标签',
  coverPath: '封面路径',
  thumbnail: '缩略图',
  author: '作者',
  series: '系列',
  developers: '开发者',
  developer: '开发者',
  actors: '演员',
  voiceActors: '声优',
  productionTeam: '制作组',
  addedDate: '添加时间',
  rating: '评分',
  comment: '备注',
  isFavorite: '收藏',
  genre: '类型',
  artist: '艺术家',
  publisher: '发行商',
  category: '分类',
  publishYear: '出版年',
  duration: '时长',
  pagesCount: '页数',
  viewCount: '浏览数',
  lastViewed: '最后查看'
}

// 从导入数据中收集所有列并生成带中文标题的列配置
const displayColumns = computed(() => {
  if (importedItems.value.length === 0) return []
  const allKeys = new Set<string>()
  importedItems.value.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)))
  const keys = Array.from(allKeys).sort((a, b) => {
    if (a === '_sourceTable') return -1
    if (b === '_sourceTable') return 1
    if (a === 'name') return -1
    if (b === 'name') return 1
    if (a === 'resourcePath') return -1
    if (b === 'resourcePath') return 1
    return a.localeCompare(b)
  })
  return keys.map(key => ({
    key,
    label: COLUMN_LABELS[key] ?? key
  }))
})

const paginationComposable = usePagination(importedItems, 50, '条记录')
const paginatedRows = computed(() => paginationComposable.paginatedItems.value)
const paginationConfig = computed(() => paginationComposable.paginationConfig.value)

const handlePageChange = (pageNum: number) => {
  paginationComposable.handlePageChange(pageNum)
}

// 格式化单元格（与 DatabaseView 一致：对象/数组转 JSON）
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch (e) {
      return String(value)
    }
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(parsed, null, 2)
      }
    } catch (_) {}
    return value
  }
  return String(value)
}

// 从存档导入：读取各资源表，去掉 id，保存到独立的刮削库数据库
const handleImportFromArchive = async () => {
  const api = (window as any).electronAPI
  if (!api?.scraperDbImport) {
    await alertService.error('当前环境无法访问刮削库 API（请使用 Electron 运行）')
    return
  }

  importing.value = true
  try {
    // 调用 Electron 端导入逻辑：从主存档读取 → 去 id → 写入 scraper-library.db
    const importRes = await api.scraperDbImport()
    if (!importRes?.ok) {
      await alertService.error(importRes?.message || '导入失败')
      return
    }

    // 导入成功后，从刮削库数据库读取数据并展示
    await loadScraperData()
    
    await alertService.success(`导入完成，共 ${importRes.count || 0} 条固有数据已保存到刮削库数据库`)
  } catch (e: any) {
    await alertService.error(`导入失败: ${e?.message || '未知错误'}`)
  } finally {
    importing.value = false
  }
}

// 从刮削库数据库加载数据
const loadScraperData = async () => {
  const api = (window as any).electronAPI
  if (!api?.scraperDbGetAll) {
    console.warn('[ScraperLibrary] scraperDbGetAll API 不可用')
    return
  }

  try {
    const res = await api.scraperDbGetAll()
    if (res?.ok && Array.isArray(res.data)) {
      importedItems.value = res.data
      paginationComposable.resetToFirstPage()
    } else {
      console.error('[ScraperLibrary] 加载刮削库数据失败:', res?.message)
    }
  } catch (e: any) {
    console.error('[ScraperLibrary] 加载刮削库数据异常:', e)
  }
}

// 页面挂载时加载已有数据
onMounted(() => {
  loadScraperData()
})
</script>

<style scoped>
.scraper-library-view {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.scraper-library-content {
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow: hidden;
}

.action-bar {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  padding-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.btn-import {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent-color, #4a90e2);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.2s;
}

.btn-import:hover:not(:disabled) {
  background: var(--accent-hover, #3a7bc8);
  transform: translateY(-1px);
}

.btn-import:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.import-summary {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.scraper-library-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
}

.empty-hint {
  margin: 0;
  font-size: 14px;
  max-width: 480px;
  text-align: center;
}

.library-section {
  flex: 1;
  min-height: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.library-section h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
}
</style>
