<template>
  <div class="generic-resource-view">
    <BaseView 
      ref="baseView" 
      :items="items" 
      :filtered-items="filteredItems" 
      :empty-state-config="emptyStateConfig"
      :toolbar-config="toolbarConfig" 
      :context-menu-items="contextMenuItems"
      :pagination-config="paginationConfig" 
      :sort-by="sortBy" 
      :search-query="searchQuery"
      :scale="scale" 
      :show-layout-control="true" 
      @update:scale="updateScale"
      @empty-state-action="handleEmptyStateAction" 
      @add-item="showAddDialogHandler" 
      @sort-changed="handleSortChanged"
      @search-query-changed="handleSearchQueryChanged" 
      @sort-by-changed="handleSortByChanged"
      @context-menu-click="handleContextMenuClick" 
      @page-change="handlePageChange">
      
      <!-- 主内容区域 -->
      <div class="resource-content">
        <!-- 这里可以根据资源类型动态加载不同的网格组件 -->
        <div class="resources-grid">
          <div 
            v-for="item in paginatedItems" 
            :key="item.id?.value || item.id"
            class="resource-card"
            @click="() => (this as any).showDetail(item)"
            @contextmenu.prevent="handleContextMenu($event, item)">
            <MediaCard
              :item="item"
              :type="(resourceType || 'game').toLowerCase()"
              :is-electron-environment="isElectronEnvironment"
              :file-exists="item.fileExists?.value !== false"
              :scale="scale"
            />
          </div>
        </div>
      </div>
    </BaseView>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import BaseView from './BaseView.vue'
import MediaCard from './MediaCard.vue'
import { createResourcePage } from '../composables/createResourcePage'
import { Game } from '@resources/game.ts'
import { GamePage } from '../configs/pages/GamePage.ts'
import { TestGamePage } from '../configs/pages/TestGamePage.ts'

// 资源类型到资源类和页面配置的映射
const resourceClassMap: Record<string, { resourceClass: any; pageClass: any; testPageClass?: any }> = {
  Game: {
    resourceClass: Game,
    pageClass: GamePage,
    testPageClass: TestGamePage // 测试页面配置（包含模拟数据）
  }
  // 未来可以添加其他资源类型
}

export default defineComponent({
  name: 'GenericResourceView',
  components: {
    BaseView,
    MediaCard
  },
  emits: ['filter-data-updated'],
  props: {
    pageConfig: {
      type: Object,
      required: false,
      default: null
    },
    resourceType: {
      type: String,
      required: false,
      default: null
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 从 pageConfig 或 resourceType prop 获取资源类型
    const resourceType = computed(() => {
      return props.pageConfig?.type || props.resourceType || 'Game'
    })
    
    // 获取资源类和页面配置类
    const resourceConfig = resourceClassMap[resourceType.value]
    if (!resourceConfig) {
      console.error(`未找到资源类型 ${resourceType.value} 的配置`)
      return {
        items: ref([]),
        filteredItems: ref([]),
        searchQuery: ref(''),
        sortBy: ref('name-asc'),
        scale: ref(100),
        paginatedItems: ref([]),
        emptyStateConfig: {},
        toolbarConfig: {},
        contextMenuItems: [],
        paginationConfig: {},
        isElectronEnvironment: ref(false)
      }
    }

    const ResourceClass = resourceConfig.resourceClass
    const PageClass = resourceConfig.pageClass
    
    // 优先使用测试页面配置（如果存在且需要测试数据）
    // 如果传入了 items，使用普通页面配置；如果没有 items，使用测试页面配置获取模拟数据
    const useTestPage = !props.items || props.items.length === 0
    const ActualPageClass = useTestPage && resourceConfig.testPageClass 
      ? resourceConfig.testPageClass 
      : PageClass
    const pageConfig = new ActualPageClass()

    // 响应式数据
    // 优先使用传入的 items，如果没有则从测试页面配置获取模拟数据
    const items = ref(props.items && props.items.length > 0 
      ? props.items 
      : (pageConfig.getMockData ? pageConfig.getMockData() : []))
    const isElectronEnvironment = ref(false)
    const searchQuery = ref('')
    const sortBy = ref('name-asc')

    // 检查 Electron 环境
    isElectronEnvironment.value = !!(window as any).electronAPI

    // 获取排序选项
    const sortOptions = pageConfig.getSortOptions()

    // 简单的筛选逻辑（简化版，实际应该使用对应的 filter composable）
    const filteredItems = computed(() => {
      let result = [...items.value]
      
      // 搜索筛选
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter((item: any) => {
          const name = item.name?.value || item.name || ''
          return name.toLowerCase().includes(query)
        })
      }
      
      // 排序（简化版，实际应该使用 pageConfig.getSortConfig）
      result.sort((a: any, b: any) => {
        const nameA = (a.name?.value || a.name || '').toLowerCase()
        const nameB = (b.name?.value || b.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      return result
    })

    // 创建右键菜单处理器（简化版）
    const contextMenuHandlers = {
      detail: (item: any) => {
        console.log('查看详情:', item)
        // 这里应该调用 showDetail
      },
      edit: (item: any) => {
        console.log('编辑:', item)
      },
      remove: (item: any) => {
        console.log('删除:', item)
        const index = items.value.findIndex((i: any) => (i.id?.value || i.id) === (item.id?.value || item.id))
        if (index > -1) {
          items.value.splice(index, 1)
        }
      }
    }

    // 使用工厂函数创建资源页面（简化版）
    const resourcePage = createResourcePage({
      pageConfig: {
        pageType: props.resourceType.toLowerCase() + 's',
        itemType: pageConfig.name || '资源',
        defaultPageSize: 20,
        defaultSortBy: 'name-asc'
      },
      items: items,
      filteredItems: filteredItems,
      searchQuery: searchQuery,
      sortBy: sortBy,
      crudConfig: {
        items: items,
        onAdd: async (data: any) => {
          const newItem = new ResourceClass()
          Object.assign(newItem, data)
          items.value.push(newItem)
          return newItem
        },
        onUpdate: async (id: string, updates: any) => {
          const item = items.value.find((i: any) => (i.id?.value || i.id) === id)
          if (item) {
            Object.assign(item, updates)
          }
        },
        onDelete: async (id: string) => {
          const index = items.value.findIndex((i: any) => (i.id?.value || i.id) === id)
          if (index > -1) {
            items.value.splice(index, 1)
          }
        },
        onLoad: async () => {
          // 模拟加载，实际应该从存储加载
          console.log('加载数据')
        },
        onSave: async () => {
          // 模拟保存，实际应该保存到存储
          console.log('保存数据')
        },
        getItemName: (item: any) => item.name?.value || item.name,
        itemType: pageConfig.name || '资源'
      },
      contextMenuItems: ResourceClass.contextMenuItems || [],
      contextMenuHandlers: contextMenuHandlers,
      emptyState: ResourceClass.emptyStateConfig || {
        icon: '📄',
        title: '暂无数据',
        description: '点击"添加"按钮添加新项目',
        buttonText: '添加',
        buttonAction: 'showAddDialog'
      },
      toolbar: {
        ...ResourceClass.toolbarConfig,
        sortOptions: sortOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      },
      displayLayout: pageConfig.displayLayoutConfig,
      getStats: (item: any) => {
        // 简化版统计信息
        return [
          { label: '名称', value: item.name?.value || item.name || '未知' }
        ]
      },
      getActions: (item: any) => {
        return [
          { key: 'edit', icon: '✏️', label: '编辑', class: 'btn-edit' },
          { key: 'remove', icon: '🗑️', label: '删除', class: 'btn-remove' }
        ]
      }
    })

    return {
      resourceType: resourceType.value,
      isElectronEnvironment,
      ...resourcePage // 展开所有方法和属性，使模板可以直接访问
    }
  },
  methods: {
    handleContextMenu(event: MouseEvent, item: any) {
      (this.$refs.baseView as any)?.showContextMenuHandler(event, item)
    }
  }
})
</script>

<style scoped>
.generic-resource-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-xl);
}

.resource-card {
  cursor: pointer;
  transition: transform var(--transition-base);
}

.resource-card:hover {
  transform: translateY(-4px);
}
</style>
