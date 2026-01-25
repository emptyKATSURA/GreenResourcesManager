<template>
  <div class="database-view">
    <div class="database-content">
      <div v-if="loading" class="loading">加载中…</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <div class="action-bar">
          <button
            type="button"
            class="btn-convert"
            :disabled="converting"
            @click="handleConvertToNewArchive"
          >
            {{ converting ? '转换中...' : '转换旧存档为新存档' }}
          </button>
        </div>
        <nav class="table-nav">
          <button
            v-for="table in tables"
            :key="table.tableName"
            type="button"
            class="table-nav-item"
            :class="{ active: activeTable === table.tableName }"
            @click="activeTable = table.tableName"
          >
            {{ table.tableName }}
          </button>
        </nav>
        <div v-if="currentTable" class="database-section">
          <h3>表: {{ currentTable.tableName }}</h3>
          <div v-if="currentTable.rows && currentTable.rows.length && getColumns(currentTable.rows).length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="col in getColumns(currentTable.rows)" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in currentTable.rows" :key="row.id || idx">
                  <td v-for="col in getColumns(currentTable.rows)" :key="col" class="data-cell">
                    {{ formatCellValue(row[col]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty">暂无数据</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import alertService from '../utils/AlertService.ts'

const loading = ref(true)
const error = ref('')
const tables = ref<Array<{ tableName: string, rows: Array<any> }>>([])
const activeTable = ref<string>('')
const converting = ref(false)

// 当前选中的表数据
const currentTable = computed(() =>
  tables.value.find(t => t.tableName === activeTable.value) ?? null
)

// 从数据中提取所有列名（动态生成表头）
const getColumns = (rows: Array<any>) => {
  if (!rows || rows.length === 0) return []
  const firstRow = rows[0]
  return Object.keys(firstRow)
}

// 格式化单元格值（完全展示原始数据，不做格式化）
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return ''
  }
  // 如果是数组或对象，转为 JSON 字符串
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  // 其他类型直接转为字符串
  return String(value)
}

// 字段映射配置：将旧存档的字段名映射到新存档的字段名
const fieldMapping: Record<string, Record<string, string>> = {
  'games': {
    'executablePath': 'resourcePath'
  },
  'software': {
    'executablePath': 'resourcePath'
  },
  'images': {
    'folderPath': 'resourcePath',
    'cover': 'coverPath'
  },
  'single-image': {
    'folderPath': 'resourcePath',
    'cover': 'coverPath'
  },
  'videos': {
    'filePath': 'resourcePath'
    // video 表的 thumbnail 字段保持不变，不需要映射
  },
  'anime-series': {
    'folderPath': 'resourcePath'
    // videoFolder 表的 thumbnail 字段保持不变，不需要映射
  },
  'audio': {
    'filePath': 'resourcePath',
    'thumbnail': 'coverPath'  // audio 表使用 coverPath
  },
  'websites': {
    'url': 'resourcePath'
  },
  'novels': {
    'filePath': 'resourcePath'
  }
}

// 旧存档文件映射配置
const archiveFileMapping = [
  { folder: 'Game', fileName: 'games.json', pageId: 'games' },
  { folder: 'Software', fileName: 'software.json', pageId: 'software' },
  { folder: 'Image', fileName: 'images.json', pageId: 'images' },
  { folder: 'SingleImage', fileName: 'singleImage.json', pageId: 'single-image' },
  { folder: 'Video', fileName: 'videos.json', pageId: 'videos' },
  { folder: 'AnimeSeries', fileName: 'folders.json', pageId: 'anime-series' }, // AnimeSeries 使用 folders.json
  { folder: 'Audio', fileName: 'audios.json', pageId: 'audio' },
  { folder: 'Website', fileName: 'websites.json', pageId: 'websites' },
  { folder: 'Novel', fileName: 'novels.json', pageId: 'novels' }
]

// 转换资源字段名
const convertResourceFields = (resource: any, pageId: string): any => {
  const mapping = fieldMapping[pageId]
  if (!mapping) {
    return resource
  }

  const converted = { ...resource }
  
  // 应用字段映射
  for (const [oldField, newField] of Object.entries(mapping)) {
    if (oldField in converted && converted[oldField] !== undefined && converted[oldField] !== null) {
      // 如果新字段已存在，保留新字段的值（优先使用新字段）
      if (!(newField in converted) || !converted[newField]) {
        converted[newField] = converted[oldField]
      }
      // 删除旧字段（如果新字段已存在且不同）
      if (newField in converted && converted[newField] !== converted[oldField]) {
        delete converted[oldField]
      } else if (newField in converted) {
        // 如果新字段已存在且值相同，删除旧字段
        delete converted[oldField]
      }
    }
  }

  return converted
}

// 转换为新存档
const handleConvertToNewArchive = async () => {
  const api = (window as any).electronAPI
  if (!api) {
    await alertService.error('当前环境无法访问 Electron API（请使用 Electron 运行）')
    return
  }

  if (!api.selectFolder) {
    await alertService.error('当前环境不支持文件夹选择功能')
    return
  }

  if (!api.readJsonFile) {
    await alertService.error('当前环境不支持文件读取功能')
    return
  }

  if (!api.sqliteSavePageResources) {
    await alertService.error('当前环境不支持 SQLite 保存功能')
    return
  }

  try {
    // 1. 选择文件夹
    const folderResult = await api.selectFolder()
    if (!folderResult || !folderResult.success || !folderResult.path) {
      if (folderResult && !folderResult.success) {
        await alertService.warning(folderResult.error || '未选择文件夹')
      }
      return
    }

    const saveDataPath = folderResult.path
    converting.value = true

    let totalConverted = 0
    let totalFailed = 0
    const failedFiles: string[] = []

    // 2. 遍历所有需要转换的文件
    for (const mapping of archiveFileMapping) {
      const filePath = `${saveDataPath}/${mapping.folder}/${mapping.fileName}`
      
      try {
        // 读取JSON文件
        const readResult = await api.readJsonFile(filePath)
        if (!readResult || !readResult.success) {
          console.warn(`文件不存在或读取失败: ${filePath}`)
          continue
        }

        let resources = readResult.data

        // 处理不同的数据格式
        // 有些文件可能是 { games: [...] } 格式，有些直接是数组
        // AnimeSeries 使用 { folders: [...] } 格式
        if (resources && typeof resources === 'object' && !Array.isArray(resources)) {
          // 尝试从对象中提取数组
          const keys = Object.keys(resources)
          for (const key of keys) {
            if (Array.isArray(resources[key])) {
              resources = resources[key]
              break
            }
          }
        }

        // 确保是数组格式
        if (!Array.isArray(resources)) {
          console.warn(`文件格式不正确，期望数组: ${filePath}`)
          failedFiles.push(`${mapping.folder}/${mapping.fileName} (格式错误)`)
          totalFailed++
          continue
        }

        if (resources.length === 0) {
          console.log(`文件为空，跳过: ${filePath}`)
          continue
        }

        // 3. 转换字段名（将旧存档字段映射到新存档字段）
        const convertedResources = resources.map((resource: any) => 
          convertResourceFields(resource, mapping.pageId)
        )

        // 4. 保存到SQLite（会自动处理资源表和页面索引表）
        const saveResult = await api.sqliteSavePageResources(mapping.pageId, convertedResources)
        
        if (saveResult && saveResult.ok) {
          console.log(`✅ 成功转换 ${mapping.folder}/${mapping.fileName}: ${convertedResources.length} 条记录`)
          totalConverted += convertedResources.length
        } else {
          console.error(`❌ 转换失败 ${mapping.folder}/${mapping.fileName}:`, saveResult?.message)
          failedFiles.push(`${mapping.folder}/${mapping.fileName} (${saveResult?.message || '未知错误'})`)
          totalFailed++
        }
      } catch (error: any) {
        console.error(`转换 ${mapping.folder}/${mapping.fileName} 时出错:`, error)
        failedFiles.push(`${mapping.folder}/${mapping.fileName} (${error.message || '未知错误'})`)
        totalFailed++
      }
    }

    converting.value = false

    // 4. 显示转换结果
    let message = `转换完成！\n\n成功转换: ${totalConverted} 条记录`
    if (totalFailed > 0) {
      message += `\n失败: ${totalFailed} 个文件`
      if (failedFiles.length > 0) {
        message += `\n\n失败的文件:\n${failedFiles.join('\n')}`
      }
    }

    if (totalConverted > 0) {
      await alertService.success(message)
      // 刷新数据
      await loadData()
    } else if (totalFailed > 0) {
      await alertService.error(message)
    } else {
      await alertService.info('未找到需要转换的数据')
    }
  } catch (error: any) {
    converting.value = false
    console.error('转换过程出错:', error)
    await alertService.error(`转换失败: ${error.message || '未知错误'}`)
  }
}

// 加载数据
const loadData = async () => {
  const api = (window as any).electronAPI
  if (!api?.sqliteDemoGetData) {
    error.value = '当前环境无法访问 SQLite（请使用 Electron 运行）'
    loading.value = false
    return
  }
  try {
    const res = await api.sqliteDemoGetData()
    if (res?.ok) {
      // 支持新的多表格式：{ tables: [{ tableName, rows }, ...] }
      if (Array.isArray(res.tables)) {
        tables.value = res.tables
        if (res.tables.length > 0 && !activeTable.value) {
          activeTable.value = res.tables[0].tableName
        }
      }
      // 兼容旧的单表格式：{ tableName, rows }
      else if (res.tableName && Array.isArray(res.rows)) {
        tables.value = [{ tableName: res.tableName, rows: res.rows }]
        activeTable.value = res.tableName
      }
      else {
        error.value = res?.message || '获取数据失败'
      }
    } else {
      error.value = res?.message || '获取数据失败'
    }
  } catch (e: any) {
    error.value = e?.message || '请求异常'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.database-view {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.database-content {
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
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.btn-convert {
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

.btn-convert:hover:not(:disabled) {
  background: var(--accent-hover, #3a7bc8);
  transform: translateY(-1px);
}

.btn-convert:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-nav {
  display: flex;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
  overflow-x: auto;
}

.table-nav-item {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.table-nav-item:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.table-nav-item.active {
  background: var(--accent-color, #4a90e2);
  color: #fff;
}

.database-section {
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

.database-section h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
}

.loading,
.error,
.empty {
  color: var(--text-secondary);
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  color: var(--error-color, #e74c3c);
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th,
.data-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
}

.data-table td {
  color: var(--text-primary);
}

.data-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.data-cell {
  max-width: 300px;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}
</style>
