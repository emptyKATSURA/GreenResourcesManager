<template>
  <div class="database-view">
    <div class="database-content">
      <div v-if="loading" class="loading">加载中…</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
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

const loading = ref(true)
const error = ref('')
const tables = ref<Array<{ tableName: string, rows: Array<any> }>>([])
const activeTable = ref<string>('')

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

onMounted(async () => {
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
