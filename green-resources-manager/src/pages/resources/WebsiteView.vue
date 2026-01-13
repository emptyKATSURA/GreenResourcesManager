<template>
  <BaseView
    ref="baseView"
    :items="websites"
    :filtered-items="filteredWebsites"
    :empty-state-config="websiteEmptyStateConfig"
    :toolbar-config="websiteToolbarConfig"
    :context-menu-items="websiteContextMenuItems"
    :pagination-config="websitePaginationConfig"
    :sort-by="sortBy"
    :search-query="searchQuery"
    @empty-state-action="handleEmptyStateAction"
    @add-item="showAddDialog = true"
    @import-bookmark="handleImportBookmark"
    @sort-changed="handleSortChanged"
    @search-query-changed="handleSearchQueryChanged"
    @sort-by-changed="handleSortByChanged"
    @context-menu-click="handleContextMenuClick"
    @page-change="handleWebsitePageChange"
    :scale="scale"
    :show-layout-control="true"
    @update:scale="updateScale"
  >
    <!-- 主内容区域 -->
    <div 
      class="website-content" 
      :class="{ 'drag-over': isDragOver, 'importing': isImporting }"
      :data-progress="importProgress"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">🔄</div>
        <p>正在加载网站数据...</p>
      </div>

      <!-- 网站列表 -->
      <div class="websites-grid" v-else-if="paginatedWebsites.length > 0" :style="layoutStyles">
        <MediaCard 
          v-for="website in paginatedWebsites" 
          :key="website.id"
          :item="formatWebsiteForMediaCard(website)"
          type="image"
          :is-electron-environment="isElectronEnvironment"
          :scale="scale"
          @click="showWebsiteDetail"
          @contextmenu="(event) => ($refs.baseView as any).showContextMenuHandler(event, website)"
          @action="(item) => visitWebsite(item)"
        />
      </div>
    </div>

    <!-- 网站对话框（添加/编辑） -->
    <ResourcesEditDialog 
      :visible="showAddDialog" 
      mode="add"
      :resource-class="Website"
      add-title="添加网站收藏"
      edit-title="编辑网站信息"
      add-button-text="添加"
      edit-button-text="保存"
      :custom-validation="validateWebsiteForm"
      @close="closeAddDialog"
      @confirm="handleAddWebsiteConfirm"
    />

    <!-- 网站详情对话框 -->
    <DetailPanel
      :visible="!!selectedWebsite"
      :item="selectedWebsite"
      type="website"
      :stats="websiteStats"
      :actions="websiteActions"
      :on-update-resource="updateWebsiteResource"
      @close="closeWebsiteDetail"
      @action="handleDetailAction"
    />

    <ResourcesEditDialog 
      :visible="showEditDialog" 
      mode="edit"
      :resource-class="Website"
      :resource-data="editWebsiteData"
      :available-tags="allTags"
      add-title="添加网站收藏"
      edit-title="编辑网站信息"
      add-button-text="添加"
      edit-button-text="保存"
      :custom-validation="validateWebsiteForm"
      @close="closeEditDialog"
      @confirm="handleEditWebsiteConfirm"
    />

  </BaseView>
</template>

<script lang="ts">
import BaseView from '../../components/BaseView.vue'
import FormField from '../../components/FormField.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { Website } from '../../class/website.ts'
import MediaCard from '../../components/MediaCard.vue'
import DetailPanel from '../../components/DetailPanel.vue'

import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import confirmService from '../../utils/ConfirmService.ts'
import { useWebsiteManagement } from '../../composables/website/useWebsiteManagement'
import { useWebsiteFilter } from '../../composables/website/useWebsiteFilter'
import { usePagination } from '../../composables/usePagination'
import { PropType, ref, toRefs } from 'vue'
import { PageConfig } from '../../types/page'
import { parseBookmarkFromFile, deduplicateBookmarks, type ParsedBookmark } from '../../utils/BookmarkParser'
import { useDisplayLayout } from '../../composables/useDisplayLayout'

export default {
  name: 'WebsiteView',
  components: {
    BaseView,
    FormField,
    MediaCard,
    DetailPanel,
    ResourcesEditDialog
  },
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({ id: 'websites', type: 'Website' })
    }
  },
  setup(props) {
    // 响应式数据
    const searchQuery = ref('')
    const sortBy = ref<'name' | 'visitCount' | 'addedDate' | 'lastVisited'>('name')

    // 使用网站管理 composable
    const websiteManagement = useWebsiteManagement(props.pageConfig.id)

    // 使用显示布局 composable
    const displayLayoutComposable = useDisplayLayout(80, 300)

    // 使用筛选 composable
    const filterComposable = useWebsiteFilter(
      websiteManagement.websites,
      searchQuery,
      sortBy
    )

    // 使用分页 composable
    const paginationComposable = usePagination(
      filterComposable.filteredWebsites,
      20
    )

    // 创建统一的资源更新函数（用于 DetailPanel）
    const updateWebsiteResource = async (id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) => {
      await websiteManagement.updateWebsite(id, updates)
    }
    
    return {
      // 数据
      websites: websiteManagement.websites,
      isLoading: websiteManagement.isLoading,
      searchQuery,
      sortBy,
      
      // 管理相关
      loadWebsitesFromComposable: websiteManagement.loadWebsites,
      saveWebsites: websiteManagement.saveWebsites,
      addWebsiteToManager: websiteManagement.addWebsite,
      updateWebsiteInManager: websiteManagement.updateWebsite,
      deleteWebsiteFromManager: websiteManagement.deleteWebsite,
      incrementVisitCount: websiteManagement.incrementVisitCount,
      searchWebsites: websiteManagement.searchWebsites,
      getBestFaviconUrl: websiteManagement.getBestFaviconUrl,
      checkWebsiteStatus: websiteManagement.checkWebsiteStatus,
      websiteManager: websiteManagement.websiteManager,
      
      // 筛选相关
      ...toRefs(filterComposable),
      ...filterComposable,
      
      // 分页相关
      ...toRefs(paginationComposable),
      ...paginationComposable,
      
      // 统一的资源更新函数
      updateWebsiteResource,
      ...displayLayoutComposable
    }
  },
  emits: ['filter-data-updated'],
  data() {
    return {
      showAddDialog: false,
      showEditDialog: false,
      selectedWebsite: null,
      editWebsiteData: null,  // ResourcesEditDialog 会自动处理数据加载
      isElectronEnvironment: false,
      // Website 类用于 ResourcesEditDialog
      Website: Website.EditableWebsiteProperties,
      // 拖拽相关
      isDragOver: false,
      isImporting: false,
      importProgress: '',
      // 空状态配置
      websiteEmptyStateConfig: {
        emptyIcon: '🌐',
        emptyTitle: '你的网站收藏是空的',
        emptyDescription: '点击"添加网站"按钮来添加你的第一个网站收藏',
        emptyButtonText: '添加第一个网站',
        emptyButtonAction: 'showAddDialog',
        noResultsIcon: '🔍',
        noResultsTitle: '没有找到匹配的网站',
        noResultsDescription: '尝试使用不同的搜索词',
        noPageDataIcon: '📄',
        noPageDataTitle: '当前页没有网站',
        noPageDataDescription: '请切换到其他页面查看网站'
      },
      // 工具栏配置
      websiteToolbarConfig: {
        addButtonText: '添加网站',
        importBookmarkButtonText: '从书签导入',
        searchPlaceholder: '搜索网站...',
        sortOptions: [
          { value: 'name', label: '按名称' },
          { value: 'visitCount', label: '按访问次数' },
          { value: 'addedDate', label: '按添加时间' },
          { value: 'lastVisited', label: '按最后访问' }
        ],
        pageType: 'websites'
      },
      // 右键菜单配置
      websiteContextMenuItems: [
        { key: 'detail', icon: '👁️', label: '查看详情' },
        { key: 'visit', icon: '🔗', label: '访问网站' },
        { key: 'refresh-favicon', icon: '🔄', label: '刷新图标' },
        { key: 'edit', icon: '✏️', label: '编辑信息' },
        { key: 'delete', icon: '🗑️', label: '删除网站' }
      ]
    }
  },
  computed: {
    // filteredWebsites 现在通过 filterComposable.filteredWebsites 访问
    // paginatedWebsites 现在通过 paginationComposable.paginatedItems 访问
    // websitePaginationConfig 现在通过 paginationComposable.paginationConfig 访问
    paginatedWebsites() {
      return this.paginatedItems || []
    },
    websitePaginationConfig() {
      return this.paginationConfig || {
        currentPage: 1,
        totalPages: 0,
        pageSize: 20,
        totalItems: 0,
        itemType: '网站'
      }
    },
    websiteStats() {
      if (!this.selectedWebsite) return []
      
      // 只显示时间相关的内容
      return [
        { label: '访问次数', value: `${this.selectedWebsite.visitCount || 0} 次` },
        { label: '最后访问', value: this.formatDate(this.selectedWebsite.lastVisited) },
        { label: '添加时间', value: this.formatDate(this.selectedWebsite.addedDate) }
      ]
    },
    websiteActions() {
      const actions = [
        { key: 'visit', icon: '🔗', label: '访问网站', class: 'btn-visit' },
        { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
        { key: 'remove', icon: '🗑️', label: '删除网站', class: 'btn-remove' }
      ]
      
      return actions
    }
  },
  watch: {
    // 监听搜索查询变化，重置到第一页
    searchQuery() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    },
    // 监听排序变化，重置到第一页
    sortBy() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    },
    // URL 验证现在由 ResourcesEditDialog 的 customValidation 处理
  },
  methods: {
    async loadWebsites() {
      try {
        this.isLoading = true
        console.log('🔄 开始加载网站数据...')
        // this.websites = await websiteManager.loadWebsites() // Old
        await this.loadWebsitesFromComposable() // New
        console.log('✅ 网站数据加载完成:', this.websites.length, '个网站')
        this.extractAllTagsAndCategories()
        this.updateFilterData()
      } catch (error) {
        console.error('❌ 加载网站数据失败:', error)
        alertService.error('加载网站数据失败: ' + error.message)
      } finally {
        this.isLoading = false
      }
    },
    
    // extractAllTagsAndCategories 现在通过 filterComposable.extractAllTagsAndCategories 访问
    
    // 筛选方法现在通过 filterComposable 访问
    // 处理来自 App.vue 的筛选器事件
    handleFilterEvent(event, data) {
      switch (event) {
        case 'filter-select':
          if (data.filterKey === 'tags') {
            this.filterByTag(data.itemName)
          }
          break
        case 'filter-exclude':
          if (data.filterKey === 'tags') {
            this.excludeByTag(data.itemName)
          }
          break
        case 'filter-clear':
          if (data === 'tags') {
            this.clearTagFilter()
          }
          break
      }
      this.updateFilterData()
    },
    
    // 更新筛选器数据到 App.vue
    updateFilterData() {
      const filterData = this.getFilterData()
      this.$emit('filter-data-updated', filterData)
    },
    
    // URL 验证函数（用于 ResourcesEditDialog 的 customValidation）
    validateWebsiteForm(formData, isEditMode) {
      const url = formData.url || ''
      if (!url || !url.trim()) {
        return false
      }
      // 验证 URL 格式
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },
    async handleAddWebsiteConfirm(websiteData) {
      try {
        // ResourcesEditDialog 已经通过 customValidation 验证了 URL，这里只需要处理数据
        const finalWebsiteData = {
          ...websiteData,
          // 如果没有填写名称，从URL中提取域名作为名称
          name: (websiteData.name || '').trim() || this.websiteManager.getDomain(websiteData.url),
          url: (websiteData.url || '').trim(),
          description: (websiteData.description || '').trim() || '',
          tags: Array.isArray(websiteData.tags) ? websiteData.tags : [],
          // isFavorite 可以通过详情页的收藏按钮操作，不需要在表单中编辑
          favicon: await this.websiteManager.getBestFaviconUrl(websiteData.url)
        }
        
        const website = await this.addWebsiteToManager(finalWebsiteData)
        // 重新加载网站列表以确保数据同步
        await this.loadWebsites()
        this.closeAddDialog()
        notify.native('网站添加成功', `已添加网站: ${website.name}`)
      } catch (error) {
        console.error('添加网站失败:', error)
        alertService.error('添加网站失败: ' + error.message)
      }
    },
    
    async visitWebsite(website) {
      try {
        // 如果传入的是格式化后的数据，需要找到原始网站对象
        let originalWebsite = website
        if (website.image && website.image !== website.favicon) {
          // 这是格式化后的数据，需要找到原始网站
          originalWebsite = this.websites.find(w => w.id === website.id)
          if (!originalWebsite) {
            console.error('找不到原始网站数据:', website.id)
            return
          }
        }
        
        // 增加访问次数
        await this.incrementVisitCount(originalWebsite.id)
        
        // 更新本地数据
        const index = this.websites.findIndex(w => w.id === originalWebsite.id)
        if (index !== -1) {
          this.websites[index] = await this.websiteManager.websites.find(w => w.id === originalWebsite.id)
        }
        
        // 打开网站
        if (window.electronAPI && window.electronAPI.openExternal) {
          const result = await window.electronAPI.openExternal(originalWebsite.url)
          if (result.success) {
            console.log('网站访问成功:', originalWebsite.name)
            notify.native('网站已打开', `正在访问: ${originalWebsite.name}`)
          } else {
            alertService.error(`访问失败: ${result.error}`)
          }
        } else {
          // 降级处理：在浏览器中打开
          window.open(originalWebsite.url, '_blank')
        }
      } catch (error) {
        console.error('访问网站失败:', error)
        alertService.error('访问网站失败: ' + error.message)
      }
    },
    
    async deleteWebsite(website) {
      const confirmed = await confirmService.confirm(`确定要删除网站 "${website.name}" 吗？`, '确认删除')
      if (!confirmed) return
      
      try {
        await this.deleteWebsiteFromManager(website.id)
        // 重新加载网站列表以确保数据同步
        await this.loadWebsites()
        
        // 显示删除成功通知
        notify.toast('success', '删除成功', `已成功删除网站 "${website.name}"`)
        console.log('网站删除成功:', website.name)
        
        this.closeWebsiteDetail()
      } catch (error) {
        console.error('删除网站失败:', error)
        // 显示删除失败通知
        notify.toast('error', '删除失败', `无法删除网站 "${website.name}": ${error.message}`)
      }
    },
    
    showWebsiteDetail(website) {
      // 如果传入的是格式化后的数据，需要找到原始网站对象
      let originalWebsite = website
      if (website.image && website.image !== website.favicon) {
        // 这是格式化后的数据，需要找到原始网站
        originalWebsite = this.websites.find(w => w.id === website.id)
        if (!originalWebsite) {
          console.error('找不到原始网站数据:', website.id)
          return
        }
      }
      
      this.selectedWebsite = originalWebsite
      // 关闭上下文菜单（如果存在）
      if (this.$refs.baseView) {
        (this.$refs.baseView as any).showContextMenu = false
      }
    },
    
    closeWebsiteDetail() {
      this.selectedWebsite = null
    },
    handleDetailAction(actionKey, website) {
      switch (actionKey) {
        case 'visit':
          this.visitWebsite(website)
          break
        case 'edit':
          this.editWebsite(website)
          break
        case 'remove':
          this.deleteWebsite(website)
          break
      }
    },
    
    closeAddDialog() {
      this.showAddDialog = false
    },
    
    /**
     * 右键菜单点击事件处理
     * @param {*} data - 包含 item 和 selectedItem
     */
    handleContextMenuClick(data) {
      const { item, selectedItem } = data
      if (!selectedItem) return
      
      switch (item.key) {
        case 'detail':
          this.showWebsiteDetail(selectedItem)
          break
        case 'visit':
          this.visitWebsite(selectedItem)
          break
        case 'refresh-favicon':
          this.refreshWebsiteFavicon(selectedItem)
          break
        case 'edit':
          this.editWebsite(selectedItem)
          break
        case 'delete':
          this.deleteWebsite(selectedItem)
          break
      }
    },
    
    // 处理空状态按钮点击事件
    handleEmptyStateAction(actionName) {
      if (actionName === 'showAddDialog') {
        this.showAddDialog = true
      }
    },
    
    // 处理搜索查询变化
    handleSearchQueryChanged(newValue) {
      this.searchQuery = newValue
    },
    
    // 处理排序变化
    handleSortByChanged(newValue) {
      this.sortBy = newValue
      console.log('✅ WebsiteView 排序方式已更新:', newValue)
    },
    
    // 处理排序变化
    async handleSortChanged({ pageType, sortBy }) {
      console.log('🚀 WebsiteView handleSortChanged 方法开始执行')
      try {
        await saveManager.saveSortSetting(pageType, sortBy)
        console.log(`✅ 已保存${pageType}页面排序方式:`, sortBy)
      } catch (error) {
        console.warn('保存排序方式失败:', error)
      }
    },

    async loadSortSetting() {
      try {
        const savedSortBy = await saveManager.getSortSetting('websites')
        if (savedSortBy && savedSortBy !== this.sortBy) {
          this.sortBy = savedSortBy
          console.log('✅ 已加载网站页面排序方式:', savedSortBy)
        }
      } catch (error) {
        console.warn('加载排序方式失败:', error)
      }
    },
    
    // 处理分页组件的事件
    handleWebsitePageChange(pageNum) {
      if (this.handlePageChange) {
        this.handlePageChange(pageNum)
      }
    },
    
    editWebsite(website) {
      // 如果传入的是格式化后的数据，需要找到原始网站对象
      let originalWebsite = website
      if (website.image && website.image !== website.favicon) {
        // 这是格式化后的数据，需要找到原始网站
        originalWebsite = this.websites.find(w => w.id === website.id)
        if (!originalWebsite) {
          console.error('找不到原始网站数据:', website.id)
          return
        }
      }
      
      // 关闭详情面板
      this.closeWebsiteDetail()
      
      // ResourcesEditDialog 会自动从 resourceData 加载数据
      this.editWebsiteData = originalWebsite
      this.showEditDialog = true
    },
    
    // 关闭编辑对话框
    closeEditDialog() {
      this.showEditDialog = false
      this.editWebsiteData = null
    },
    
    // 保存网站编辑
    async handleEditWebsiteConfirm(updatedWebsite) {
      try {
        // ResourcesEditDialog 已经通过 customValidation 验证了 URL，这里只需要处理数据
        const updateData = {
          name: (updatedWebsite.name || '').trim() || this.websiteManager.getDomain(updatedWebsite.url),
          url: (updatedWebsite.url || '').trim(),
          description: (updatedWebsite.description || '').trim() || '',
          tags: Array.isArray(updatedWebsite.tags) ? updatedWebsite.tags : [],
          // isFavorite 可以通过详情页的收藏按钮操作，不需要在表单中编辑（已在 ResourcesDataBase 中定义）
        }
        
        await this.updateWebsiteInManager(updatedWebsite.id, updateData)
        
        // 重新加载网站列表以确保数据同步
        await this.loadWebsites()
        
        // 如果当前显示的是这个网站的详情，也要更新
        if (this.selectedWebsite && this.selectedWebsite.id === updatedWebsite.id) {
          this.selectedWebsite = this.websites.find(w => w.id === updatedWebsite.id)
        }
        
        this.closeEditDialog()
        notify.toast('success', '编辑成功', `已更新网站: ${updateData.name}`)
      } catch (error) {
        console.error('编辑网站失败:', error)
        notify.toast('error', '编辑失败', `无法更新网站: ${error.message}`)
      }
    },
    async handleToggleFavorite(website) {
      // 检查 website 是否存在，避免在面板关闭时触发更新
      if (!website || !website.id) {
        return
      }
      try {
        const newFavoriteStatus = !website.isFavorite
        await this.updateWebsiteInManager(website.id, { isFavorite: newFavoriteStatus })
        // 更新当前网站对象，以便详情面板立即显示新状态
        if (this.selectedWebsite && this.selectedWebsite.id === website.id) {
          this.selectedWebsite.isFavorite = newFavoriteStatus
        }
      } catch (error: any) {
        console.error('切换收藏状态失败:', error)
        alertService.error('切换收藏状态失败: ' + error.message)
      }
    },
    
    
    getDomain(url) {
      return this.websiteManager.getDomain(url)
    },
    
    formatDate(dateString) {
      if (!dateString) return '从未'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },
    
    async handleFaviconError(event) {
      console.warn('Favicon 加载失败:', event.target.src)
      
      // 隐藏失败的图片
      event.target.style.display = 'none'
      
      // 尝试使用备用 favicon 服务
      const website = this.websites.find(w => w.favicon === event.target.src) || 
                     (this.selectedWebsite && this.selectedWebsite.favicon === event.target.src ? this.selectedWebsite : null)
      
      if (website) {
        try {
          // 尝试使用 Google 服务作为备用
          const domain = this.websiteManager.getDomain(website.url)
          if (domain) {
            const backupFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
            
            // 验证备用 favicon 是否可用
            const isValid = await this.websiteManager.validateFaviconUrl(backupFavicon)
            if (isValid) {
              // 更新网站数据中的 favicon
              website.favicon = backupFavicon
              event.target.src = backupFavicon
              event.target.style.display = 'block'
              console.log('使用备用 favicon:', backupFavicon)
              return
            }
          }
        } catch (error) {
          console.warn('备用 favicon 获取失败:', error)
        }
      }
      
      // 如果备用方案也失败，显示默认图标
      const fallbackIcon = event.target.nextElementSibling
      if (fallbackIcon) {
        fallbackIcon.style.display = 'block'
      }
    },

    handleFaviconLoad(event) {
      // favicon 加载成功，隐藏备用图标
      const fallbackIcon = event.target.nextElementSibling
      if (fallbackIcon) {
        fallbackIcon.style.display = 'none'
      }
      console.log('Favicon 加载成功:', event.target.src)
    },
    
    // 格式化网站数据以适配 MediaCard
    formatWebsiteForMediaCard(website) {
      return {
        ...website,
        // 将 favicon 映射为 image 字段，MediaCard 会使用这个字段
        image: website.favicon,
        // 图片类型需要的字段
        author: '', // 不再使用分类
        description: website.description,
        // 访问次数相关
        viewCount: website.visitCount || 0,
        lastViewed: website.lastVisited,
        // 标签
        tags: website.tags || [],
        // 其他信息
        pagesCount: 1, // 网站算作1页
        // 清理不需要的字段
        artist: undefined,
        series: undefined,
        notes: undefined,
        playCount: undefined,
        lastPlayed: undefined,
        actors: undefined,
        duration: undefined,
        totalWords: undefined,
        folderSize: undefined,
        readProgress: undefined,
        readTime: undefined,
        playTime: undefined,
        watchCount: undefined,
        lastWatched: undefined
      }
    },

    // 刷新网站 favicon
    async refreshWebsiteFavicon(website) {
      try {
        console.log('正在刷新 favicon:', website.name)
        
        // 获取新的 favicon URL
        const newFavicon = await this.websiteManager.getBestFaviconUrl(website.url)
        
        if (newFavicon && newFavicon !== website.favicon) {
          // 更新网站数据
          await this.updateWebsiteInManager(website.id, { favicon: newFavicon })
          
          // 更新本地数据
          const index = this.websites.findIndex(w => w.id === website.id)
          if (index !== -1) {
            this.websites[index].favicon = newFavicon
          }
          
          // 如果当前显示的是这个网站的详情，也要更新
          if (this.selectedWebsite && this.selectedWebsite.id === website.id) {
            this.selectedWebsite.favicon = newFavicon
          }
          
          notify.toast('success', 'Favicon 更新成功', `已为 "${website.name}" 更新图标`)
          console.log('Favicon 更新成功:', newFavicon)
        } else {
          notify.toast('error', 'Favicon 更新失败', `无法为 "${website.name}" 获取新图标`)
        }
      } catch (error) {
        console.error('刷新 favicon 失败:', error)
        notify.toast('error', 'Favicon 更新失败', `刷新 "${website.name}" 图标时出错: ${error.message}`)
      }
    },

    // 拖拽事件处理
    handleDragOver(event) {
      event.preventDefault()
      if (!this.isDragOver) {
        this.isDragOver = true
      }
    },

    handleDragEnter(event) {
      event.preventDefault()
      this.isDragOver = true
    },

    handleDragLeave(event) {
      event.preventDefault()
      // 只有当离开整个拖拽区域时才取消高亮
      const relatedTarget = event.relatedTarget as Node
      if (!event.currentTarget.contains(relatedTarget)) {
        this.isDragOver = false
      }
    },

    async handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false

      try {
        const files = Array.from(event.dataTransfer?.files || []) as File[]
        
        if (files.length === 0) {
          notify.toast('error', '拖拽失败', '请拖拽书签文件到此处')
          return
        }

        // 查找HTML文件（书签文件通常是HTML格式）
        const htmlFiles = files.filter(file => {
          const fileName = file.name.toLowerCase()
          return fileName.endsWith('.html') || 
                 fileName.endsWith('.htm') || 
                 file.type === 'text/html'
        })

        if (htmlFiles.length === 0) {
          notify.toast('error', '文件类型不支持', '请拖拽HTML格式的书签文件（.html 或 .htm）')
          return
        }

        // 处理第一个HTML文件（通常只有一个书签文件）
        const bookmarkFile = htmlFiles[0]
        await this.importBookmarksFromFile(bookmarkFile)
      } catch (error) {
        console.error('处理拖拽文件失败:', error)
        notify.toast('error', '导入失败', error.message || '无法导入书签文件')
      }
    },

    // 处理导入书签按钮点击
    handleImportBookmark() {
      try {
        // 创建文件输入元素
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.html,.htm'
        input.style.display = 'none'
        
        // 清理函数
        const cleanup = () => {
          if (input.parentNode) {
            input.parentNode.removeChild(input)
          }
        }
        
        // 监听文件选择
        input.onchange = async (event) => {
          const target = event.target as HTMLInputElement
          const files = target.files
          
          if (files && files.length > 0) {
            const file = files[0]
            
            // 验证文件类型
            const fileName = file.name.toLowerCase()
            if (!fileName.endsWith('.html') && !fileName.endsWith('.htm')) {
              notify.toast('error', '文件类型错误', '请选择HTML格式的书签文件')
              cleanup()
              return
            }
            
            // 导入书签
            await this.importBookmarksFromFile(file)
          }
          
          // 清理
          cleanup()
        }
        
        // 监听取消操作（通过点击事件）
        input.oncancel = () => {
          cleanup()
        }
        
        // 添加到DOM并触发点击
        document.body.appendChild(input)
        input.click()
      } catch (error) {
        console.error('打开文件选择对话框失败:', error)
        notify.toast('error', '操作失败', '无法打开文件选择对话框')
      }
    },

    // 从文件导入书签
    async importBookmarksFromFile(file: File) {
      this.isImporting = true
      this.importProgress = '正在解析书签文件...'

      try {
        // 解析书签文件
        const parsedBookmarks = await parseBookmarkFromFile(file)
        
        if (parsedBookmarks.length === 0) {
          notify.toast('warning', '导入失败', '书签文件中没有找到有效的网站链接')
          this.isImporting = false
          return
        }

        // 去重
        const uniqueBookmarks = deduplicateBookmarks(parsedBookmarks)
        console.log(`解析到 ${parsedBookmarks.length} 个书签，去重后 ${uniqueBookmarks.length} 个`)

        // 检查已存在的网站（基于URL）
        const existingUrls = new Set(
          this.websites.map(w => this.normalizeUrlForCompare(w.url))
        )

        // 过滤出需要导入的书签（排除已存在的）
        const bookmarksToImport = uniqueBookmarks.filter(bookmark => {
          const normalizedUrl = this.normalizeUrlForCompare(bookmark.url)
          return !existingUrls.has(normalizedUrl)
        })

        if (bookmarksToImport.length === 0) {
          notify.toast('info', '导入完成', '所有书签都已存在，无需重复导入')
          this.isImporting = false
          return
        }

        console.log(`需要导入 ${bookmarksToImport.length} 个新书签`)

        // 批量导入
        let successCount = 0
        let failCount = 0
        const total = bookmarksToImport.length

        for (let i = 0; i < bookmarksToImport.length; i++) {
          const bookmark = bookmarksToImport[i]
          this.importProgress = `正在导入 ${i + 1}/${total}: ${bookmark.name}`

          try {
            // 获取favicon
            const favicon = await this.websiteManager.getBestFaviconUrl(bookmark.url)
            
            const websiteData = {
              name: bookmark.name,
              url: bookmark.url,
              description: '',
              tags: bookmark.tags || [], // 使用解析出的标签（父级文件夹）
              favicon: favicon || ''
            }

            await this.addWebsiteToManager(websiteData)
            successCount++
          } catch (error) {
            console.error(`导入书签失败 "${bookmark.name}":`, error)
            failCount++
          }

          // 每导入10个网站，更新一次列表（避免界面卡顿）
          if ((i + 1) % 10 === 0) {
            await this.loadWebsites()
          }
        }

        // 重新加载网站列表
        await this.loadWebsites()
        
        // 更新筛选器数据
        this.updateFilterData()

        // 显示导入结果
        const message = `成功导入 ${successCount} 个网站${failCount > 0 ? `，失败 ${failCount} 个` : ''}`
        notify.toast(
          failCount === 0 ? 'success' : 'warning',
          '导入完成',
          message
        )

        console.log(`✅ 书签导入完成: 成功 ${successCount}，失败 ${failCount}`)
      } catch (error) {
        console.error('导入书签失败:', error)
        notify.toast('error', '导入失败', error.message || '无法解析书签文件')
      } finally {
        this.isImporting = false
        this.importProgress = ''
      }
    },

    // 标准化URL用于比较（与BookmarkParser中的逻辑一致）
    normalizeUrlForCompare(url: string): string {
      try {
        const urlObj = new URL(url)
        let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`
        normalized = normalized.toLowerCase()
        if (normalized.endsWith('/')) {
          normalized = normalized.slice(0, -1)
        }
        return normalized
      } catch {
        return url.toLowerCase()
      }
    }
  },
  async mounted() {
    // 检测 Electron 环境
    this.isElectronEnvironment = !!(window.electronAPI && window.electronAPI.openExternal)
    
    await this.loadWebsites()
    
    // 加载分页设置（使用 composable 的方法）
    if (this.loadPaginationSettings) {
      await this.loadPaginationSettings('websites')
    }
    
    // 加载排序设置（后台执行）
    Promise.resolve()
      .then(() => this.loadSortSetting())
      .catch((e) => {
        console.warn('[WebsiteView] 后台加载排序设置失败:', e)
      })
    
    // 初始化筛选器数据
    this.updateFilterData()
  }
}
</script>

<style scoped>
/* 网站主内容区域 */
.website-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 工具栏样式 */

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 10px 40px 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 300px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.sort-select, .filter-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus, .filter-select:focus {
  outline: none;
  border-color: var(--accent-color);
}


/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* 网站网格样式 */
.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

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
  z-index: 3000; /* 高于 DetailPanel 的 z-index: 2000 */
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
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
}


.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 5px;
}

.form-checkboxes {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-text {
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* 按钮样式 */
.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--bg-tertiary);
}

.btn-confirm {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-confirm:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* 网站详情样式 */
.website-detail-modal {
  max-width: 800px;
}

.website-detail-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
}

.website-detail-thumbnail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  height: 200px;
  position: relative;
}

.website-detail-icon {
  font-size: 4rem;
  color: white;
}

.detail-favicon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  pointer-events: none; /* 确保图片不会阻止点击事件传播 */
}

.website-detail-badges {
  position: absolute;
  bottom: 10px;
  display: flex;
  gap: 8px;
}

.website-detail-info {
  flex: 1;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-size: 1rem;
}

.website-link, .login-link {
  color: var(--accent-color);
  text-decoration: none;
  word-break: break-all;
}

.website-link:hover, .login-link:hover {
  text-decoration: underline;
}

.description-text {
  color: var(--text-primary);
  line-height: 1.5;
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: 8px;
  margin: 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.login-info {
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: 8px;
}

.login-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.login-item:last-child {
  margin-bottom: 0;
}

.login-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.login-value {
  color: var(--text-primary);
}

.notes-text {
  color: var(--text-primary);
  line-height: 1.5;
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: 8px;
  margin: 0;
}

/* 详情按钮样式 */
.btn-visit {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-visit:hover {
  background: var(--accent-hover);
}



.btn-refresh-favicon {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-refresh-favicon:hover {
  background: #7c3aed;
}

/* 错误消息样式 */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
  font-weight: 500;
}


/* 拖拽样式 */
.website-content {
  position: relative;
  transition: all var(--transition-base);
}

.website-content.drag-over {
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--accent-color);
  border-radius: var(--radius-xl);

  &::before {
    content: '拖拽书签文件到这里导入（支持浏览器导出的HTML格式书签文件）';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--accent-color);
    color: white;
    padding: var(--spacing-xl) calc(var(--spacing-xl) * 2);
    border-radius: var(--radius-xl);
    font-size: 18px;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    white-space: nowrap;
  }
}

.website-content.importing {
  pointer-events: none;
  
  &::before {
    content: '正在导入书签...';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--accent-color);
    color: white;
    padding: var(--spacing-xl) calc(var(--spacing-xl) * 2);
    border-radius: var(--radius-xl);
    font-size: 18px;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    white-space: nowrap;
  }
  
  &::after {
    content: attr(data-progress);
    position: absolute;
    top: calc(50% + 50px);
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--accent-color);
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    pointer-events: none;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .websites-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  
  .website-detail-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .website-content.drag-over::before,
  .website-content.importing::before {
    font-size: 16px;
    padding: var(--spacing-lg) var(--spacing-xl);
    white-space: normal;
    max-width: 90%;
    text-align: center;
  }
}
</style>