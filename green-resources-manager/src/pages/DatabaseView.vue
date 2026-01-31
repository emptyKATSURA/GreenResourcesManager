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
          <label class="edit-mode-toggle">
            <FunSwitch v-model="editMode" />
            <span class="edit-mode-label">启用编辑模式</span>
          </label>
        </div>
        <nav class="table-nav">
          <button
            v-for="(table, index) in tables"
            :key="table.tableName"
            type="button"
            class="table-nav-item"
            :class="{ active: activeTable === table.tableName }"
            :data-table-index="index"
            @click="activeTable = table.tableName"
          >
            {{ table.tableName }}
          </button>
        </nav>
        <div v-if="currentTable" class="database-section">
          <h3>表: {{ currentTable.tableName }}</h3>
          <div v-if="currentTable.rows && currentTable.rows.length && Object.keys(currentTable.rows[0] || {}).length > 0" class="table-wrap">
            <!-- 编辑模式提示 -->
            <div v-if="editMode" class="edit-mode-hint">
              💡 双击单元格进行编辑，建议没事不要编辑！很容易坏档！！！编辑前记得备份存档！！
            </div>
            <!-- 分页组件 -->
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
              :show-actions="true"
              :show-delete="true"
              :editable="editMode"
              delete-title="删除此记录"
              :default-formatter="formatCellValue"
              @delete="handleDeleteRow"
              @cell-edit="handleCellEdit"
            />
          </div>
          <div v-else class="empty">暂无数据</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import alertService from '../utils/AlertService.ts'
import confirmService from '../utils/ConfirmService.ts'
import { usePagination } from '../composables/usePagination'
import FunPagination from '../fun-ui/navigation/Pagination/FunPagination.vue'
import FunDataTable from '../fun-ui/basic/DataTable/FunDataTable.vue'
import FunSwitch from '../fun-ui/basic/Switch/FunSwitch.vue'

const loading = ref(true)
const error = ref('')
const tables = ref<Array<{ tableName: string, rows: Array<any> }>>([])
const activeTable = ref<string>('')
const converting = ref(false)
const editMode = ref(false)

// 当前选中的表数据
const currentTable = computed(() =>
  tables.value.find(t => t.tableName === activeTable.value) ?? null
)

// 当前表的行数据（用于分页）
const currentTableRows = computed(() => {
  return currentTable.value?.rows || []
})

// 使用分页 composable
const paginationComposable = usePagination(
  currentTableRows,
  50, // 默认每页显示50条记录
  '条记录'
)

// 分页后的行数据
const paginatedRows = computed(() => {
  return paginationComposable.paginatedItems.value
})

// 分页配置
const paginationConfig = computed(() => {
  return paginationComposable.paginationConfig.value
})

// 处理分页变化
const handlePageChange = (pageNum: number) => {
  paginationComposable.handlePageChange(pageNum)
}

// 监听当前表变化，重置到第一页
watch(activeTable, () => {
  paginationComposable.resetToFirstPage()
})

// 格式化单元格值（完全展示原始数据，不做格式化）
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return ''
  }
  // 如果是数组或对象，转为格式化的 JSON 字符串
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch (e) {
      return String(value)
    }
  }
  // 如果是字符串，尝试检测是否为 JSON 并格式化
  if (typeof value === 'string') {
    // 尝试解析 JSON
    try {
      const parsed = JSON.parse(value)
      // 如果解析成功且是对象或数组，格式化返回
      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(parsed, null, 2)
      }
    } catch (e) {
      // 不是有效的 JSON，返回原字符串
    }
    return value
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

// 转换资源字段名（手动转存档时，将旧格式转为新格式）
const convertResourceFields = (resource: any, pageId: string): any => {
  const mapping = fieldMapping[pageId]
  const converted = { ...resource }

  // 应用字段映射
  if (mapping) {
    for (const [oldField, newField] of Object.entries(mapping)) {
      if (oldField in converted && converted[oldField] !== undefined && converted[oldField] !== null) {
        if (!(newField in converted) || !converted[newField]) {
          converted[newField] = converted[oldField]
        }
        if (newField in converted && converted[newField] !== converted[oldField]) {
          delete converted[oldField]
        } else if (newField in converted) {
          delete converted[oldField]
        }
      }
    }
  }

  // games：旧格式 lastPlayed/firstPlayed 转为 visitedSessions
  if (pageId === 'games') {
    const hasVisitedSessions = Array.isArray(converted.visitedSessions) && converted.visitedSessions.length > 0
    if (!hasVisitedSessions && (converted.lastPlayed || converted.firstPlayed)) {
      const arr: string[] = []
      if (converted.firstPlayed) arr.push(converted.firstPlayed)
      if (converted.lastPlayed && converted.lastPlayed !== converted.firstPlayed) arr.push(converted.lastPlayed)
      converted.visitedSessions = arr
      delete converted.lastPlayed
      delete converted.firstPlayed
    }
  }

  // 旧格式访问记录转为 visitedSessions（通用）
  const hasVisitedSessions = Array.isArray(converted.visitedSessions) && converted.visitedSessions.length > 0
  if (!hasVisitedSessions) {
    const arr: string[] = []
    const last = converted.lastViewed || converted.lastPlayed || converted.lastVisited || converted.lastWatched || converted.lastRead
    if (last) arr.push(last)
    if (arr.length > 0) {
      converted.visitedSessions = arr
      delete converted.lastViewed
      delete converted.viewCount
      delete converted.lastPlayed
      delete converted.firstPlayed
      delete converted.lastVisited
      delete converted.visitCount
      delete converted.lastWatched
      delete converted.watchCount
      delete converted.lastRead
      delete converted.playCount
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

    // 5. 自动迁移成就数据
    if (api.sqliteMigrateAchievements) {
      try {
        const achievementsResult = await api.sqliteMigrateAchievements(saveDataPath)
        if (achievementsResult?.ok) {
          const count = achievementsResult.migratedCount || 0
          console.log(`✅ 成功迁移成就数据: ${count} 个成就`)
        } else {
          console.warn(`⚠️ 迁移成就数据失败或已存在: ${achievementsResult?.message || '未知错误'}`)
        }
      } catch (error: any) {
        console.warn('迁移成就数据时出错:', error)
      }
    }

    // 6. 自动迁移设置数据
    if (api.sqliteMigrateSettings) {
      try {
        const settingsResult = await api.sqliteMigrateSettings(saveDataPath)
        if (settingsResult?.ok) {
          console.log('✅ 成功迁移设置数据')
        } else {
          console.warn(`⚠️ 迁移设置数据失败或已存在: ${settingsResult?.message || '未知错误'}`)
        }
      } catch (error: any) {
        console.warn('迁移设置数据时出错:', error)
      }
    }

    // 7. 自动迁移用户数据
    if (api.sqliteMigrateUser) {
      try {
        const userResult = await api.sqliteMigrateUser(saveDataPath)
        if (userResult?.ok) {
          console.log('✅ 成功迁移用户数据')
        } else {
          console.warn(`⚠️ 迁移用户数据失败或已存在: ${userResult?.message || '未知错误'}`)
        }
      } catch (error: any) {
        console.warn('迁移用户数据时出错:', error)
      }
    }

    converting.value = false

    // 8. 显示转换结果
    let message = `转换完成！\n\n成功转换: ${totalConverted} 条记录`
    if (totalFailed > 0) {
      message += `\n失败: ${totalFailed} 个文件`
      if (failedFiles.length > 0) {
        message += `\n\n失败的文件:\n${failedFiles.join('\n')}`
      }
    }
    message += `\n\n已自动迁移成就、设置和用户数据（如果存在）`

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

// 处理单元格编辑
const handleCellEdit = async (row: any, column: string, newValue: any, oldValue: any, index: number) => {
  // 如果值没有变化，不提示保存
  const formattedNewValue = formatCellValue(newValue)
  const formattedOldValue = formatCellValue(oldValue)
  if (formattedNewValue === formattedOldValue) {
    return
  }

  const confirmed = await confirmService.confirm(
    `确定要保存修改吗？\n\n字段: ${column}\n原值: ${formattedOldValue}\n新值: ${formattedNewValue}`,
    '确认保存',
    true
  )

  if (!confirmed) {
    // 用户取消，刷新数据恢复原值
    await loadData()
    return
  }

  const api = (window as any).electronAPI
  if (!api?.sqliteSaveResource) {
    await alertService.error('当前环境无法访问 SQLite 保存功能（请使用 Electron 运行）')
    // 刷新数据恢复原值
    await loadData()
    return
  }

  try {
    // 尝试保持原始值的类型
    let convertedValue: any = newValue
    
    // 如果原值是对象或数组，尝试解析 JSON
    if (typeof oldValue === 'object' && oldValue !== null) {
      try {
        convertedValue = JSON.parse(newValue)
      } catch (e) {
        await alertService.error('格式错误', 'JSON 格式不正确，请检查输入')
        await loadData()
        return
      }
    } else if (typeof oldValue === 'number') {
      convertedValue = Number(newValue)
      if (isNaN(convertedValue)) {
        await alertService.error('格式错误', '请输入有效的数字')
        await loadData()
        return
      }
    } else if (typeof oldValue === 'boolean') {
      convertedValue = newValue === 'true' || newValue === true
    } else if (oldValue === null) {
      convertedValue = newValue === '' || newValue === 'null' ? null : newValue
    }
    
    // 构建更新后的行对象
    const updatedRow: Record<string, any> = {}
    for (const key in row) {
      const value = row[key]
      if (value !== undefined && typeof value !== 'function' && typeof value !== 'symbol') {
        updatedRow[key] = value
      }
    }
    updatedRow[column] = convertedValue

    // 通过 JSON 序列化/反序列化得到纯对象，避免 Vue 代理等导致 IPC "could not be cloned"
    let plainRow: Record<string, any>
    try {
      plainRow = JSON.parse(JSON.stringify(updatedRow))
    } catch (e) {
      console.error('序列化行数据失败:', e)
      await alertService.error('数据格式错误', '无法序列化数据，请检查是否包含非法内容')
      await loadData()
      return
    }

    const tableName = currentTable.value?.tableName
    if (!tableName) {
      await alertService.error('无法确定表名')
      await loadData()
      return
    }

    const result = await api.sqliteSaveResource(tableName, plainRow)
    
    if (result?.ok) {
      await alertService.success('保存成功', `已成功更新字段 "${column}"`)
      // 刷新数据
      await loadData()
    } else {
      await alertService.error('保存失败', result?.message || '未知错误')
      // 刷新数据恢复原值
      await loadData()
    }
  } catch (error: any) {
    console.error('保存单元格编辑失败:', error)
    await alertService.error('保存失败', error?.message || '未知错误')
    // 刷新数据恢复原值
    await loadData()
  }
}

// 删除记录
const handleDeleteRow = async (row: any, index?: number) => {
  if (!row.id) {
    await alertService.error('无法删除：记录缺少 ID')
    return
  }

  const rowName = row.name || row.id || '此记录'
  const confirmed = await confirmService.confirm(
    `确定要删除记录 "${rowName}" 吗？\n\n此操作不可恢复。`,
    '确认删除',
    true
  )

  if (!confirmed) {
    return
  }

  const api = (window as any).electronAPI
  if (!api?.sqliteDeleteResource) {
    await alertService.error('当前环境无法访问 SQLite 删除功能（请使用 Electron 运行）')
    return
  }

  try {
    const result = await api.sqliteDeleteResource(currentTable.value?.tableName, row.id)
    
    if (result?.ok) {
      await alertService.success('删除成功', `已成功删除记录 "${rowName}"`)
      // 刷新数据
      await loadData()
    } else {
      await alertService.error('删除失败', result?.message || '未知错误')
    }
  } catch (error: any) {
    console.error('删除记录失败:', error)
    await alertService.error('删除失败', error?.message || '未知错误')
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
  gap: var(--spacing-md);
  align-items: center;
  padding-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.edit-mode-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
}

.edit-mode-label {
  color: var(--text-primary);
  font-size: 0.95rem;
}

.btn-convert,
.btn-migrate {
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

.btn-convert:hover:not(:disabled),
.btn-migrate:hover:not(:disabled) {
  background: var(--accent-hover, #3a7bc8);
  transform: translateY(-1px);
}

.btn-convert:disabled,
.btn-migrate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
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

.edit-mode-hint {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
  background: color-mix(in srgb, var(--accent-color, #4a90e2) 15%, var(--bg-secondary));
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  border-left: 3px solid var(--accent-color, #4a90e2);
  flex-shrink: 0;
}
</style>
