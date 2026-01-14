<template>
        <BaseView
          ref="baseView"
          :items="albums"
          :filtered-items="filteredAlbums"
          :empty-state-config="albumEmptyStateConfig"
          :toolbar-config="albumToolbarConfig"
          :context-menu-items="albumContextMenuItems"
          :pagination-config="albumPaginationConfig"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @empty-state-action="handleEmptyStateAction"
          @add-item="showAddAlbumDialog"
          @sort-changed="handleSortChanged"
          @search-query-changed="handleSearchQueryChanged"
          @sort-by-changed="handleSortByChanged"
          @context-menu-click="handleContextMenuClick"
          @page-change="handleAlbumPageChange"
          :scale="scale"
          :show-layout-control="true"
          @update:scale="updateScale"
        >
    <!-- 主内容区域 -->
    <div 
      class="image-content"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragOver || false }"
    >


    <!-- 专辑网格 -->
    <div class="albums-grid" v-if="paginatedAlbums.length > 0" :style="layoutStyles">
      <MediaCard
        v-for="album in paginatedAlbums" 
        :key="album.id"
        :item="album"
        type="image"
        :isElectronEnvironment="true"
        :file-exists="album.fileExists !== undefined ? album.fileExists : false"
        :scale="scale"
        @click="showAlbumDetail"
        @contextmenu="(event) => ($refs.baseView as any).showContextMenuHandler(event, album)"
        @action="openAlbum"
      />
    </div>


    <!-- 添加图片对话框 -->
    <ResourcesEditDialog
      :visible="showAddDialog"
      mode="add"
      :resource-class="SingleImage"
      :is-electron-environment="true"
      :available-tags="allTags"
      add-title="添加图片"
      edit-title="编辑图片"
      add-button-text="添加"
      edit-button-text="保存修改"
      :custom-validation="(formData, isEditMode) => {
        return formData.folderPath && formData.folderPath.trim() !== ''
      }"
      :custom-confirm-handler="handleAddImageCustomConfirm"
      @close="closeAddAlbumDialog"
      @confirm="handleAddAlbumConfirm"
    />

    <!-- 图片详情 -->
    <DetailPanel
      :visible="showDetailModal"
      :item="currentAlbum"
      type="album"
      :stats="albumStats"
      :actions="albumActions"
      :on-update-resource="updateAlbumResource"
      @close="closeAlbumDetail"
      @action="handleDetailAction"
    >
      <template #extra>
        <AlbumPagesGrid
          :pages="pages"
          :currentPage="detailCurrentPage"
          :pageSize="detailPageSize"
          :totalPages="detailTotalPages"
          :resolveImage="resolveImage"
          :handleImageError="handleImageError"
          @page-click="handlePageClick"
          @page-change="jumpToPageGroup"
        />
      </template>
    </DetailPanel>

    <!-- 编辑图片对话框 -->
    <ResourcesEditDialog
      :key="'edit-dialog-' + (editAlbumForm.id || 'new')"
      :visible="showEditDialog"
      mode="edit"
      :resource-class="SingleImage"
      :resource-data="editAlbumForm"
      :is-electron-environment="true"
      :available-tags="allTags"
      add-title="添加图片"
      edit-title="编辑图片"
      add-button-text="添加"
      edit-button-text="保存修改"
      @close="closeEditAlbumDialog"
      @confirm="handleEditAlbumConfirm"
    />

    <!-- 图片查看器 -->
    <ComicViewer
      :visible="showComicViewer"
      :album="currentAlbum"
      :pages="pages"
      :initial-page-index="currentPageIndex"
      @close="closeComicViewer"
      @page-change="onPageChange"
      @view-count-update="onViewCountUpdate"
    />


    <!-- 路径更新确认对话框 -->
    <PathUpdateDialog
      :visible="showPathUpdateDialog"
      title="更新图片路径"
      description="发现同名但路径不同的图片文件："
      item-name-label="图片名称"
      :item-name="pathUpdateInfo.existingAlbum?.name || ''"
      :old-path="pathUpdateInfo.existingAlbum?.folderPath || ''"
      :new-path="pathUpdateInfo.newPath || ''"
      missing-label="文件丢失"
      found-label="文件存在"
      question="是否要更新图片路径？"
      @confirm="confirmPathUpdate"
      @cancel="closePathUpdateDialog"
    />
    </div>
  </BaseView>
  
</template>

<script lang="ts">
import saveManager from '../../utils/SaveManager.ts'
import BaseView from '../../components/BaseView.vue'
import FormField from '../../components/FormField.vue'
import MediaCard from '../../components/MediaCard.vue'
import DetailPanel from '../../components/DetailPanel.vue'
import ComicViewer from '../../components/ComicViewer.vue'
import PathUpdateDialog from '../../components/PathUpdateDialog.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { SingleImage } from '@resources/singleImage.ts'
import AlbumPagesGrid from '../../components/image/AlbumPagesGrid.vue'

import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import confirmService from '../../utils/ConfirmService.ts'
import { unlockAchievement } from '../user/AchievementView.vue'
import { ref, computed, toRefs, watch, PropType } from 'vue'
import { PageConfig } from '../../types/page.ts'
import { usePagination } from '../../composables/usePagination.ts'
import { useImageDragDrop, isArchiveFile } from '../../composables/image/useImageDragDrop.ts'
import { useImageFilter } from '../../composables/image/useImageFilter.ts'
import { useImageAlbum } from '../../composables/image/useImageAlbum.ts'
import { useImageCache } from '../../composables/image/useImageCache.ts'
import { useImagePages } from '../../composables/image/useImagePages.ts'
import { useImageCover } from '../../composables/image/useImageCover.ts'
import { useResourceRating } from '../../composables/useResourceRating.ts'
import { useDisplayLayout } from '../../composables/useDisplayLayout.ts'

const IMAGE_COLLECTION_ACHIEVEMENTS = [
  { threshold: 50, id: 'image_collector_50' },
  { threshold: 100, id: 'image_collector_100' },
  { threshold: 500, id: 'image_collector_500' },
  { threshold: 1000, id: 'image_collector_1000' }
]

export default {
  name: 'SingleImageView',
  components: {
    BaseView,
    FormField,
    MediaCard,
    DetailPanel,
    ComicViewer,
    PathUpdateDialog,
    ResourcesEditDialog,
    AlbumPagesGrid
  },
  emits: ['filter-data-updated'],
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({ id: 'single-image', type: 'SingleImage' })
    }
  },
  setup(props) {
    // 使用专辑管理 composable
    const imageAlbumComposable = useImageAlbum(props.pageConfig.id)
    
    // 使用筛选 composable（基于 albums）
    const imageFilterComposable = useImageFilter(imageAlbumComposable.albums)
    
    // 创建一个 ref 用于存储筛选后的专辑列表（用于分页）
    const filteredAlbumsRef = ref([])
    
    // 监听筛选结果变化，更新 filteredAlbumsRef
    watch(imageFilterComposable.filteredAlbums, (newValue) => {
      filteredAlbumsRef.value = newValue
    }, { immediate: true })

    // 使用分页 composable（专辑列表分页）
    const albumPaginationComposable = usePagination(
      filteredAlbumsRef,
      20,
      '图片'
    )

    // 路径更新对话框状态（需要在 setup 中定义，以便传递给 composable）
    const showPathUpdateDialog = ref(false)
    const pathUpdateInfo = ref({
      existingAlbum: null,
      newPath: '',
      newFolderName: ''
    })

    // 使用图片拖拽 composable（单图模式：只接受图片文件）
    const imageDragDropComposable = useImageDragDrop({
      albums: imageAlbumComposable.albums,
      singleImageOnly: true, // 只接受单个图片文件
      onAddAlbum: async (albumData) => {
        // 调用 composable 的 addAlbum 方法
        return await imageAlbumComposable.addAlbum(albumData)
      },
      onShowPathUpdateDialog: (info) => {
        pathUpdateInfo.value = info
        showPathUpdateDialog.value = true
      },
      onExtractAllTags: () => {
        // extractAllTags 在 ImageView.vue 的 methods 中，通过 this 访问
        // 这里先留空，在 methods 中会调用
      },
      onCheckAchievements: async () => {
        // 调用 composable 的 checkImageCollectionAchievements 方法
        await imageAlbumComposable.checkImageCollectionAchievements()
      },
      onSaveAlbums: async () => {
        // 调用 composable 的 saveAlbums 方法
        await imageAlbumComposable.saveAlbums()
      }
    })

    // 图片缓存相关状态（需要在 setup 中定义，以便传递给 composable）
    const showComicViewer = ref(false)
    const showDetailModal = ref(false)
    const pages = ref<string[]>([])

    // 使用图片缓存 composable
    // 注意：onForceUpdate 回调在 Options API 中无法直接访问 this.$forceUpdate
    // 如果需要强制更新，可以在 methods 中手动调用 $forceUpdate
    const imageCacheComposable = useImageCache({
      enableThumbnails: true,
      jpegQuality: 80,
      thumbnailSize: 200,
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      preloadCount: 3,
      isComicViewer: showComicViewer,
      isDetailModal: showDetailModal,
      pages: pages
    })

    // 使用详情页图片分页 composable
    const imagePagesComposable = useImagePages({
      pages: pages,
      defaultPageSize: 50
    })

    // 封面管理 composables（新专辑和编辑专辑各一个）
    const newAlbumCover = ref('')
    const newAlbumFolderPath = ref('')
    const imageCoverNewComposable = useImageCover({
      coverRef: newAlbumCover,
      folderPathRef: newAlbumFolderPath
    })

    const editAlbumCover = ref('')
    const editAlbumFolderPath = ref('')
    const imageCoverEditComposable = useImageCover({
      coverRef: editAlbumCover,
      folderPathRef: editAlbumFolderPath
    })
    // 使用显示布局 composable
    const displayLayoutComposable = useDisplayLayout(80, 200)

    // 
    // 解构 composable，排除 removeAlbum 避免与 methods 冲突
    const { removeAlbum, ...restAlbumComposable } = imageAlbumComposable
    
    // 解构拖拽 composable，重命名 handleDrop 避免与 methods 冲突
    const { handleDrop: dragDropHandleDrop, ...restDragDropComposable } = imageDragDropComposable

    // 创建统一的资源更新函数（用于 DetailPanel）
    const updateAlbumResource = async (id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) => {
      await imageAlbumComposable.updateAlbum(id, updates)
    }

    return {
      filteredAlbumsRef,
      showPathUpdateDialog,
      pathUpdateInfo,
      showComicViewer,
      showDetailModal,
      pages,
      newAlbumCover,
      newAlbumFolderPath,
      editAlbumCover,
      editAlbumFolderPath,
      // 专辑管理相关（排除 removeAlbum，使用重命名版本）
      ...restAlbumComposable,
      removeAlbumById: removeAlbum,
      // 筛选相关
      ...imageFilterComposable,
      allTags: imageFilterComposable.allTags,
      // 分页相关
      ...albumPaginationComposable,
      // 拖拽相关（排除 handleDrop，使用重命名版本）
      ...restDragDropComposable,
      dragDropHandleDrop: dragDropHandleDrop,
      // 图片缓存相关
      ...imageCacheComposable,
      // 显示布局相关
      ...displayLayoutComposable,
      // 详情页图片分页相关
      ...imagePagesComposable,
      // 封面管理相关（新专辑）
      ...imageCoverNewComposable,
      // 封面管理相关（编辑专辑）- 需要重命名避免冲突
      browseForImageEdit: imageCoverEditComposable.browseForImage,
      useFirstImageAsCoverEdit: imageCoverEditComposable.useFirstImageAsCover,
      selectImageFromFolderEdit: imageCoverEditComposable.selectImageFromFolder,
      clearCoverEdit: imageCoverEditComposable.clearCover,
      // 统一的资源更新函数
      updateAlbumResource
    }
  },
  data() {
    return {
      // albums, searchQuery, sortBy 已移至 setup()
      showAddDialog: false,
      // isDragOver 已移至 useImageDragDrop composable
      // showPathUpdateDialog 和 pathUpdateInfo 已移至 setup()
      newAlbum: {
        name: '',
        author: '',
        description: '',
        tags: [],
        folderPath: '',
        cover: '',
        viewCount: 0
      },
      tagInput: '',
      // showDetailModal, pages 已移至 setup()
      // currentAlbum 已移至 useImageAlbum composable
      selectedAlbum: null,
      // 图片缓存系统已移至 useImageCache composable
      // 图片质量设置已移至 useImageCache composable
      imageQuality: 'high', // 'high', 'medium', 'low' (保留用于其他用途)
      hardwareAcceleration: true, // 硬件加速
      renderQuality: 'high', // 渲染质量
      // 编辑相关
      showEditDialog: false,
      // SingleImage 类用于 ResourcesEditDialog
      SingleImage: SingleImage,
      editAlbumForm: {
        id: '',
        name: '',
        author: '',
        description: '',
        tags: [],
        folderPath: '',
        cover: '',
        viewCount: 0
      },
      editTagInput: '',
      // 排序选项
      imageSortOptions: [
        { value: 'name', label: '按名称排序' },
        { value: 'count', label: '按页数' },
        { value: 'added', label: '按添加时间' },
        { value: 'lastViewed', label: '按最后查看' }
      ],
      // 右键菜单配置
      albumContextMenuItems: SingleImage.contextMenuItems,
      // 图片查看器相关（showComicViewer 已在 setup() 中定义）
      currentPageIndex: 0,
      // 分页相关（详情页内图片分页，避免与 composable 的变量名冲突）
      detailCurrentPage: 1,
      detailPageSize: 50, // 默认值，将从设置中加载
      detailTotalPages: 0,
      jumpToPageInput: 1,
      // 图片列表分页相关已移至 usePagination composable
      // 空状态配置
      albumEmptyStateConfig: {
        ...SingleImage.emptyStateConfig,
        noResultsIcon: '🔍',
        noResultsTitle: '没有找到匹配的图片',
        noResultsDescription: '尝试使用不同的搜索词',
        noPageDataIcon: '📄',
        noPageDataTitle: '当前页没有图片',
        noPageDataDescription: '请尝试切换到其他页面'
      },
      // 工具栏配置
      albumToolbarConfig: {
        ...SingleImage.toolbarConfig,
        pageType: 'images'
      },
    }
  },
  computed: {
    // filteredAlbums 已移至 useImageFilter composable
    filteredAlbums() {
      return this.filteredAlbumsRef || []
    },
    canAddAlbum() {
      return this.newAlbum.folderPath && this.newAlbum.folderPath.trim()
    },
    // 动态更新分页配置（使用 composable 的 paginationConfig）
    albumPaginationConfig() {
      // 使用 composable 的 paginationConfig，但需要更新 totalItems
      // 确保 paginationConfig 始终存在
      const config = this.paginationConfig || {
        currentPage: 1,
        totalPages: 0,
        pageSize: 20,
        totalItems: 0,
        itemType: '图片'
      }
      
      return {
        ...config,
        totalItems: this.filteredAlbums.length,
        // 确保 totalPages 正确计算
        totalPages: config.totalPages || Math.ceil(this.filteredAlbums.length / (config.pageSize || 20))
      }
    },
    albumStats() {
      if (!this.currentAlbum) return []
      
      return [
        { label: '总页数', value: this.pages.length },
        { label: '浏览次数', value: this.currentAlbum.viewCount || 0 },
        { label: '添加时间', value: this.formatDate(this.currentAlbum.addedDate) },
        { label: '最后查看', value: this.formatDate(this.currentAlbum.lastViewed) }
      ]
    },
    // 分页显示的图片（详情页内图片分页）
    paginatedPages() {
      if (!this.pages || this.pages.length === 0) return []
      const start = (this.detailCurrentPage - 1) * this.detailPageSize
      const end = start + this.detailPageSize
      return this.pages.slice(start, end)
    },
    // 当前页的起始索引（详情页内图片分页）
    detailCurrentPageStartIndex() {
      return (this.detailCurrentPage - 1) * this.detailPageSize
    },
    // 分页显示的图片列表（使用 composable 的 paginatedItems）
    paginatedAlbums() {
      // 使用 composable 的 paginatedItems，它基于 filteredAlbumsRef
      return this.paginatedItems || []
    },
    // 当前图片页的起始索引（使用 composable 的 currentPageStartIndex）
    currentAlbumPageStartIndex() {
      return this.currentPageStartIndex || 0
    },
    // 专辑详情页操作按钮
    albumActions() {
      const actions = [
        { key: 'open', icon: '📖', label: '查看图片', class: 'btn-play' },
        { key: 'folder', icon: '📁', label: '打开文件位置', class: 'btn-open-folder' },
        { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
        { key: 'remove', icon: '🗑️', label: '删除图片', class: 'btn-remove' }
      ]
      return actions
    }
  },
  watch: {
    // 监听筛选结果变化，更新分页信息（使用 composable 的 updatePagination）
    filteredAlbums: {
      handler(newValue) {
        // 手动触发分页更新
        if (this.updatePagination) {
          this.updatePagination()
        }
      },
      immediate: true
    },
    // 监听搜索查询变化，重置到第一页（使用 composable 的 resetToFirstPage）
    searchQuery() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    },
    // 监听排序变化，重置到第一页（使用 composable 的 resetToFirstPage）
    sortBy() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    },
    // 同步 newAlbum 的 cover 和 folderPath 到 composable ref
    'newAlbum.cover'(newVal) {
      this.newAlbumCover = newVal
    },
    'newAlbum.folderPath'(newVal) {
      this.newAlbumFolderPath = newVal
    },
    // 同步 newAlbumCover 和 newAlbumFolderPath 到 newAlbum
    newAlbumCover(newVal) {
      this.newAlbum.cover = newVal
    },
    newAlbumFolderPath(newVal) {
      this.newAlbum.folderPath = newVal
    },
    // 同步 editAlbumForm 的 cover 和 folderPath 到 composable ref
    'editAlbumForm.cover'(newVal) {
      this.editAlbumCover = newVal
    },
    'editAlbumForm.folderPath'(newVal) {
      this.editAlbumFolderPath = newVal
    },
    // 同步 editAlbumCover 和 editAlbumFolderPath 到 editAlbumForm
    editAlbumCover(newVal) {
      this.editAlbumForm.cover = newVal
    },
    editAlbumFolderPath(newVal) {
      this.editAlbumForm.folderPath = newVal
    },
    // 监听 showEditDialog 变化
    showEditDialog() {
      // showEditDialog 变化时的处理逻辑
    }
  },
  methods: {
    // checkImageCollectionAchievements 已移至 useImageAlbum composable
    // loadAlbums 已移至 useImageAlbum composable
    // 此方法保留作为包装，调用 composable 的方法并执行额外逻辑
    async loadAlbums() {
      // 调用 composable 的 loadAlbums
      const loadFn = (this as any).loadAlbums
      if (loadFn && typeof loadFn === 'function') {
        await loadFn.call(this)
      }
      
      this.extractAllTags()

      this.updateFilterData()
      
      // 检测文件存在性（单图模式：检测单个图片文件）
      const checkFn = (this as any).checkFileExistence
      console.log('[SingleImageView] [单图模式] 检查 checkFileExistence 方法是否存在:', !!checkFn, typeof checkFn)
      if (checkFn && typeof checkFn === 'function') {
        console.log('[SingleImageView] [单图模式] ✅ checkFileExistence 方法存在，准备调用（将触发 checkFileExists API 检查单个图片文件）')
        // 如果 shouldCheckFileLoss 存在且返回 true，标记为已检测（全局只检测一次）
        if (this.$root.shouldCheckFileLoss && this.$root.shouldCheckFileLoss()) {
          this.$root.markFileLossChecked()
        }
        // 始终执行文件存在性检测（用于显示警告图标）
        Promise.resolve()
          .then(() => {
            console.log('[SingleImageView] [单图模式] 🚀 开始调用 checkFileExistence（将调用 window.electronAPI.checkFileExists 检查图片文件）')
            return checkFn.call(this)
          })
          .then(() => {
            console.log('[SingleImageView] [单图模式] ✅ checkFileExistence 调用完成（已检查所有图片文件）')
          })
          .catch((e) => {
            console.error('[SingleImageView] [单图模式] ❌ checkFileExistence 调用失败（可能 checkFileExists API 出错）:', e)
          })
          .finally(() => {
            this.updateFilterData()
          })
      } else {
        console.warn('[SingleImageView] [单图模式] ❌ checkFileExistence 方法不存在或不是函数，无法调用 checkFileExists API')
      }
      
      // 计算图片列表总页数（使用 composable 的 updatePagination）
      this.updateAlbumPagination()
      
      const checkAchievementsFn = (this as any).checkImageCollectionAchievements
      if (checkAchievementsFn && typeof checkAchievementsFn === 'function') {
        Promise.resolve()
          .then(() => checkAchievementsFn.call(this))
          .catch((e) => {
            console.warn('[ImageView] 后台成就检测失败:', e)
          })
      }
    },

    // checkFileExistence 已移至 useImageAlbum composable
    
    // 拖拽处理方法（使用 composable 的方法）
    handleDragOver(event: DragEvent) {
      if (this.handleDragOver) {
        this.handleDragOver(event)
      }
    },
    
    handleDragEnter(event: DragEvent) {
      if (this.handleDragEnter) {
        this.handleDragEnter(event)
      }
    },
    
    handleDragLeave(event: DragEvent) {
      if (this.handleDragLeave) {
        this.handleDragLeave(event)
      }
    },
    
    async handleDrop(event: DragEvent) {
      event.preventDefault()
      // 调用 composable 的 handleDrop 方法（已重命名为 dragDropHandleDrop）
      if (this.dragDropHandleDrop && typeof this.dragDropHandleDrop === 'function') {
        await this.dragDropHandleDrop(event)
      }
    },
    
    // detectMultipleFolders 已移至 useImageDragDrop composable
    // processMultipleFolders 已移至 useImageDragDrop composable
    
    // 获取文件路径的公共目录
    getCommonDirectory(filePaths) {
      if (filePaths.length === 0) return null
      
      // 获取第一个文件的目录
      let commonDir = filePaths[0].substring(0, filePaths[0].lastIndexOf('/'))
      
      // 检查其他文件是否都在这个目录或其子目录中
      for (let i = 1; i < filePaths.length; i++) {
        const currentDir = filePaths[i].substring(0, filePaths[i].lastIndexOf('/'))
        
        // 如果当前文件的目录不是公共目录的子目录，则缩小公共目录
        while (!currentDir.startsWith(commonDir) && commonDir !== '') {
          const lastSlash = commonDir.lastIndexOf('/')
          if (lastSlash === -1) {
            commonDir = ''
            break
          }
          commonDir = commonDir.substring(0, lastSlash)
        }
        
        if (commonDir === '') break
      }
      
      return commonDir || null
    },
    
    // saveAlbums 已移至 useImageAlbum composable
    // 处理空状态按钮点击事件
    handleEmptyStateAction(actionName) {
      if (actionName === 'showAddAlbumDialog') {
        this.showAddAlbumDialog()
      }
    },
    
    // 处理搜索查询变化
    handleSearchQueryChanged(newValue) {
      this.searchQuery = newValue
    },
    
    // 处理排序变化
    handleSortByChanged(newValue) {
      this.sortBy = newValue
      console.log('✅ ImageView 排序方式已更新:', newValue)
    },
    
    showAddAlbumDialog() {
      this.showAddDialog = true
      this.newAlbum = {
        name: '',
        author: '',
        description: '',
        tags: [],
        folderPath: '',
        cover: '',
        viewCount: 0
      }
      // 同步到 composable 的 ref
      this.newAlbumFolderPath = ''
      this.newAlbumCover = ''
      this.tagInput = ''
    },
    closeAddAlbumDialog() {
      this.showAddDialog = false
      this.newAlbum = {
        name: '',
        author: '',
        description: '',
        tags: [],
        folderPath: '',
        cover: '',
        viewCount: 0
      }
      // 同步到 composable 的 ref
      this.newAlbumFolderPath = ''
      this.newAlbumCover = ''
      this.tagInput = ''
    },
    async browseForImageFile() {
      try {
        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('开始选择图片文件...')
          const filePath = await window.electronAPI.selectImageFile()
          console.log('选择图片文件结果:', filePath)
          if (filePath) {
            this.newAlbum.folderPath = filePath
            this.newAlbumFolderPath = filePath // 同步到 composable
            if (!this.newAlbum.name.trim()) {
              // 提取文件名（不含扩展名）作为名称
              const parts = filePath.replace(/\\/g, '/').split('/')
              const fileName = parts[parts.length - 1]
              this.newAlbum.name = fileName.replace(/\.[^/.]+$/, '')
            }
            // 单个图片文件，直接使用该文件作为封面
            this.newAlbumCover = filePath
            this.newAlbum.cover = filePath
            console.log('图片文件选择成功:', filePath)
          } else {
            console.log('用户取消选择图片文件')
          }
        } else {
          console.error('Electron API 不可用')
          alertService.warning('当前环境不支持图片文件选择功能')
        }
      } catch (e) {
        console.error('选择图片文件失败:', e)
        alertService.error('选择图片文件失败: ' + e.message)
      }
    },
    // 添加图片时的自定义确认处理（单图片模式：封面就是文件本身）
    async handleAddImageCustomConfirm(formData, isEditMode) {
      if (isEditMode) return // 编辑模式不需要特殊处理
      
      // 单图片模式：封面就是图片文件本身
      if (formData.folderPath && !formData.cover) {
        formData.cover = formData.folderPath
      }
      
      // 如果名称为空，从文件名提取
      if (!formData.name && formData.folderPath) {
        const parts = formData.folderPath.replace(/\\/g, '/').split('/')
        const fileName = parts[parts.length - 1]
        formData.name = fileName.replace(/\.[^/.]+$/, '')
      }
    },
    handleAddAlbumConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      this.addAlbumInternal(resourceData)
    },
    
    async addAlbumInternal(formData) {
      if (!formData || !formData.folderPath || !formData.folderPath.trim()) return
      try {
        console.log('开始添加图片，文件路径:', formData.folderPath)

        // 单图模式：封面就是图片文件本身（已在 handleAddImageCustomConfirm 中处理）
        const cover = formData.cover || formData.folderPath
        
        const album = await this.addAlbum({
          name: formData.name || '',
          author: formData.author || '',
          description: formData.description || '',
          tags: formData.tags || [],
          folderPath: formData.folderPath,
          cover: cover
        })
        
        await this.checkImageCollectionAchievements()
        
        // 重新提取标签和作者信息，更新筛选器
        this.extractAllTags()
        
        console.log('图片添加成功')
        // 显示成功通知
        notify.toast('success', '添加成功', `已成功添加图片 "${album.name}"`)
        this.closeAddAlbumDialog()
      } catch (e) {
        console.error('添加图片失败:', e)
        // 显示失败通知，包含图片名称和错误信息
        notify.toast('error', '添加失败', `无法添加图片 "${this.newAlbum.name}": ${e.message}`)
      }
    },
    // extractFolderName 已移至 useImageAlbum composable
    addTag() {
      const tag = this.tagInput.trim()
      if (tag && !this.newAlbum.tags.includes(tag)) {
        this.newAlbum.tags.push(tag)
        this.tagInput = ''
      }
    },
    removeTag(index) {
      this.newAlbum.tags.splice(index, 1)
    },
    addEditTag() {
      const tag = this.editTagInput.trim()
      if (tag && !this.editAlbumForm.tags.includes(tag)) {
        this.editAlbumForm.tags.push(tag)
        this.editTagInput = ''
      }
    },
     removeEditTag(index) {
       this.editAlbumForm.tags.splice(index, 1)
     },
    async openAlbum(album) {
      try {
        console.log('开始打开图片:', album.name)
        // 直接打开图片查看器，从第一页开始
        this.currentAlbum = album
        this.currentPageIndex = 0
        
        // 清空之前的页面数据，确保重新加载
        this.pages = []
        
        // 增加浏览次数（使用 composable 的方法）
        try {
          await this.updateViewInfo(album)
        } catch (error) {
          console.warn('更新浏览信息失败:', error)
          // 不阻止打开查看器，继续执行
        }
        
        // 先加载当前图片的文件，再显示查看器
        await this.loadAlbumPages()
        
        // 确保pages数组已加载完成后再显示查看器
        console.log('页面加载完成，显示图片查看器')
        this.showComicViewer = true
      } catch (error) {
        console.error('打开图片失败:', error)
        notify.toast('error', '打开失败', `无法打开图片 "${album.name}": ${error.message || '未知错误'}`)
      }
    },
    async showAlbumDetail(album) {
      try {
        // 设置当前专辑（在 Options API 中，setup 返回的 ref 会自动解包）
        this.currentAlbum = album
        this.showDetailModal = true
        this.pages = []
        // 重置分页状态
        this.resetPagination()
        this.detailCurrentPage = 1
        
        // 确保pageSize已从设置中加载
        await this.loadImageSettings()
        
        // 单个图片文件，直接使用该文件
        const files = [album.folderPath]
        this.pages = files
        this.updateTotalPages()
        album.pagesCount = files.length
        
        // 注意：这里不再增加浏览次数，只有真正开始查看时才增加
        // 浏览次数将在 openAlbum() 或 viewPage() 方法中增加
        
        const saveFn = (this as any).saveAlbums
        if (saveFn && typeof saveFn === 'function') {
          await saveFn.call(this)
        }
      } catch (e) {
        console.error('加载图片详情失败:', e)
      }
    },
    closeAlbumDetail() {
      this.showDetailModal = false
      this.currentAlbum = null
      this.pages = []
      this.resetPagination()
    },
    handleDetailAction(actionKey, album) {
      switch (actionKey) {
        case 'open':
          this.openAlbum(album)
          break
        case 'folder':
          this.openAlbumFolder(album)
          break
        case 'edit':
          this.editAlbum(album)
          break
        case 'remove':
          this.removeAlbum(album)
          break
        default:
          // 未知的 actionKey
      }
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
          this.showAlbumDetail(selectedItem)
          break
        case 'open':
          this.openAlbum(selectedItem)
          break
        case 'folder':
          this.openAlbumFolder(selectedItem)
          break
        case 'edit':
          this.editAlbum(selectedItem)
          break
        case 'remove':
          this.removeAlbum(selectedItem)
          break
      }
    },
    async openAlbumFolder(album) {
      try {
        // 单个图片文件：打开文件所在的文件夹
        const pathParts = album.folderPath.replace(/\\/g, '/').split('/')
        pathParts.pop() // 移除文件名，保留文件夹路径
        const folderPath = pathParts.join('/')
        
        if (window.electronAPI && window.electronAPI.openFolder) {
          const result = await window.electronAPI.openFolder(folderPath)
          if (!result.success) alertService.error('打开文件夹失败: ' + (result.error || '未知错误'))
        }
      } catch (e) {
        console.error('打开文件夹失败:', e)
        alertService.error('打开文件夹失败: ' + e.message)
      }
    },
    async removeAlbum(album) {
      if (!(await confirmService.confirm(`确定要删除图片 "${album.name}" 吗？`))) return
      
      try {
        await this.removeAlbumById(album.id)
          
        // 重新提取标签和作者信息，更新筛选器
        this.extractAllTags()
          
        this.closeAlbumDetail()
      } catch (error) {
        // 显示删除失败通知（composable 内部已显示成功通知）
        notify.toast('error', '删除失败', `无法删除图片 "${album.name}": ${error.message}`)
        console.error('删除图片失败:', error)
      }
    },
    editAlbum(album) {
      if (!album) {
        return
      }
      
      this.showDetailModal = false
      this.editAlbumForm = {
        id: album.id,
        name: album.name || '',
        author: album.author || '',
        description: album.description || '',
        tags: Array.isArray(album.tags) ? [...album.tags] : [],
        folderPath: album.folderPath || '',
        cover: album.cover || '',
        viewCount: album.viewCount || 0
      }
      // 同步到 composable 的 ref
      this.editAlbumFolderPath = album.folderPath || ''
      this.editAlbumCover = album.cover || ''
      this.editTagInput = ''
      
      this.showEditDialog = true
    },
    closeEditAlbumDialog() {
      this.showEditDialog = false
    },
    async browseForImageFileEdit() {
      try {
        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('开始选择图片文件（编辑模式）...')
          const filePath = await window.electronAPI.selectImageFile()
          console.log('选择图片文件结果:', filePath)
          if (filePath) {
            this.editAlbumForm.folderPath = filePath
            this.editAlbumFolderPath = filePath // 同步到 composable
            // 单个图片文件，直接使用该文件作为封面
            this.editAlbumCover = filePath
            this.editAlbumForm.cover = filePath
            console.log('图片文件选择成功:', filePath)
          } else {
            console.log('用户取消选择图片文件')
          }
        } else {
          console.error('Electron API 不可用')
          alertService.warning('当前环境不支持图片文件选择功能')
        }
      } catch (e) {
        console.error('选择图片文件失败:', e)
        alertService.error('选择图片文件失败: ' + e.message)
      }
    },
    // 封面管理方法已移至 useImageCover composable
    // browseForImageEdit, useFirstImageAsCover, selectImageFromFolder, clearCover (编辑)
    // browseForImageNew, useFirstImageAsCoverNew, selectImageFromFolderNew, clearCoverNew (新建)
    handleEditAlbumConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      // 单图片模式：封面就是图片文件本身
      if (resourceData.folderPath && !resourceData.cover) {
        resourceData.cover = resourceData.folderPath
      }
      this.saveEditedAlbum(resourceData)
    },
    
    // handleUpdateRating, handleUpdateComment, handleToggleFavorite 已移至 DetailPanel 内部统一处理
    // 保留这些方法作为向后兼容（如果 DetailPanel 没有提供 onUpdateResource prop）
    async handleUpdateRating(rating, album) {
      // 检查 album 是否存在，避免在面板关闭时触发更新
      if (!album || !album.id) {
        return
      }
      try {
        await this.updateAlbum(album.id, { rating })
        // 更新当前专辑对象，以便详情面板立即显示新星级
        if (this.currentAlbum && this.currentAlbum.id === album.id) {
          this.currentAlbum.rating = rating
        }
      } catch (error: any) {
        console.error('更新星级失败:', error)
        alertService.error('更新星级失败: ' + error.message)
      }
    },
    async handleUpdateComment(comment, album) {
      // 检查 album 是否存在，避免在面板关闭时触发更新
      if (!album || !album.id) {
        return
      }
      try {
        await this.updateAlbum(album.id, { comment })
        // 更新当前专辑对象，以便详情面板立即显示新评论
        if (this.currentAlbum && this.currentAlbum.id === album.id) {
          this.currentAlbum.comment = comment
        }
      } catch (error: any) {
        console.error('更新评论失败:', error)
        alertService.error('更新评论失败: ' + error.message)
      }
    },
    async handleToggleFavorite(album) {
      // 检查 album 是否存在，避免在面板关闭时触发更新
      if (!album || !album.id) {
        return
      }
      try {
        const newFavoriteStatus = !album.isFavorite
        await this.updateAlbum(album.id, { isFavorite: newFavoriteStatus })
        // 更新当前专辑对象，以便详情面板立即显示新状态
        if (this.currentAlbum && this.currentAlbum.id === album.id) {
          this.currentAlbum.isFavorite = newFavoriteStatus
        }
      } catch (error: any) {
        console.error('切换收藏状态失败:', error)
        alertService.error('切换收藏状态失败: ' + error.message)
      }
    },
    async saveEditedAlbum(formData) {
      try {
        // 单图模式：封面就是图片文件本身
        const cover = formData.cover || formData.folderPath
        
        await this.updateAlbum(this.editAlbumForm.id, {
          name: formData.name,
          author: formData.author,
          description: formData.description,
          tags: formData.tags,
          folderPath: formData.folderPath,
          cover: cover
        })
        
        // 重新提取标签和作者信息，更新筛选器
        this.extractAllTags()
        
        this.showEditDialog = false
        notify.toast('success', '保存成功', '图片信息已更新')
      } catch (e) {
        console.error('保存编辑失败:', e)
        notify.toast('error', '保存失败', `保存编辑失败: ${e.message}`)
      }
    },
    handlePageClick(index) {
      // 计算实际索引（考虑分页）
      const actualIndex = this.detailCurrentPageStartIndex + index
      this.viewPage(actualIndex)
    },
    
    async viewPage(index) {
      // 打开图片查看器，index是当前分页中的相对索引
      const actualIndex = this.detailCurrentPageStartIndex + index
      this.currentPageIndex = actualIndex
      
      // 增加浏览次数（使用 composable 的方法）
      if (this.currentAlbum) {
        await this.updateViewInfo(this.currentAlbum)
      }
      
      // 确保pages数组已加载完成后再显示查看器
      this.showComicViewer = true
    },

    // 处理页面变化事件
    onPageChange(pageIndex) {
      this.currentPageIndex = pageIndex
    },

    // 处理浏览次数更新事件
    async onViewCountUpdate() {
      if (this.currentAlbum) {
        await this.updateViewInfo(this.currentAlbum)
      }
    },
    // 图片缓存相关方法已移至 useImageCache composable
    // resolveImage, resolveThumbnailImage, generateThumbnail, createCanvasThumbnail,
    // resolveFullImage, resolveCoverImage, resolveImageAsync, addToCache, evictOldestCache,
    // preloadImages, preloadImage, handleImageError, getImageFileName 已移至 composable
    
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    
    // 获取文件大小（异步）
    async getFileSize(filePath) {
      try {
        console.log('尝试获取文件大小:', filePath)
        if (window.electronAPI && window.electronAPI.getFileStats) {
          const result = await window.electronAPI.getFileStats(filePath)
          console.log('文件统计信息:', result)
          if (result && result.success) {
            return result.size || 0
          } else {
            console.error('获取文件统计信息失败:', result?.error || '未知错误')
            return 0
          }
        } else {
          console.log('Electron API 不可用，尝试使用 fetch 获取文件大小')
          // 降级方案：尝试通过 fetch 获取文件大小
          try {
            const response = await fetch(filePath, { method: 'HEAD' })
            const contentLength = response.headers.get('content-length')
            return contentLength ? parseInt(contentLength) : 0
          } catch (fetchError) {
            console.log('fetch 方法也失败:', fetchError)
            return 0
          }
        }
      } catch (error) {
        console.error('获取文件大小失败:', error)
        return 0
      }
    },
    formatDate(dateString) {
      if (!dateString) return '未知'
      const d = new Date(dateString)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
    },
    
     // 检查路径是否为单个图片文件
     isImageFile(path) {
       if (!path) return false
       const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
       const lowerPath = path.toLowerCase()
       return imageExtensions.some(ext => lowerPath.endsWith(ext))
     },
     
     async loadAlbumPages() {
       console.log('=== 开始加载图片页面 ===')
       console.log('当前图片信息:', {
         id: this.currentAlbum?.id,
         name: this.currentAlbum?.name,
         folderPath: this.currentAlbum?.folderPath
       })
       
       try {
         // 确保pageSize已从设置中加载
         await this.loadImageSettings()
         
         // 单个图片文件，直接使用该文件
         console.log('使用单个图片文件:', this.currentAlbum.folderPath)
         const files = [this.currentAlbum.folderPath]
         
         this.pages = files
        this.detailTotalPages = Math.ceil(files.length / this.detailPageSize)
         
         console.log('页面信息更新:', {
           pagesCount: this.pages.length,
          totalPages: this.detailTotalPages,
          pageSize: this.detailPageSize
         })
         
        // 更新图片的页数信息
        this.currentAlbum.pagesCount = files.length
        // 注意：这里不设置lastViewed和viewCount，这些应该在真正开始查看时设置
         
         console.log('图片信息更新:', {
           pagesCount: this.currentAlbum.pagesCount,
           lastViewed: this.currentAlbum.lastViewed,
           viewCount: this.currentAlbum.viewCount
         })
         
         // 加载当前页（确保索引在有效范围内）
         if (files.length > 0) {
           const targetIndex = Math.max(0, Math.min(this.currentPageIndex, files.length - 1))
           this.currentPageIndex = targetIndex
           
           console.log('加载当前页:', {
             targetIndex,
             currentPageIndex: this.currentPageIndex,
             totalPages: files.length
           })
           
           console.log('页面数据加载完成，等待ComicViewer组件加载图片')
         } else {
           console.log('没有图片文件，跳过当前页加载')
         }
         
         console.log('=== 图片页面加载完成 ===')
         
       } catch (e) {
         console.error('加载图片页面失败:', e)
         console.error('错误堆栈:', e.stack)
         throw e // 重新抛出错误，让调用方处理
      }
    },
    
     closeComicViewer() {
       this.showComicViewer = false
       this.currentPageIndex = 0
       
       // 只清空阅读器相关的状态，保留currentAlbum用于详情页显示
       // 如果是从详情页打开的，保持详情页状态
       // 如果是从卡片直接打开的，清空详情页状态
       if (!this.showDetailModal) {
         this.currentAlbum = null
         this.pages = []
       }
    },
     
    
    
    // 分页导航方法已移至 useImagePages composable
    
    // 处理分页组件的事件（使用 composable 的 handlePageChange）
    handleAlbumPageChange(pageNum) {
      if (this.handlePageChange) {
        this.handlePageChange(pageNum)
      }
    },
    
    // 更新图片列表分页信息（composable 会自动更新，这里只需要同步 filteredAlbumsRef）
    updateAlbumPagination() {
      // 同步 filteredAlbums 到 filteredAlbumsRef，composable 会自动更新分页
      if (this.filteredAlbumsRef && this.filteredAlbums) {
        this.filteredAlbumsRef = this.filteredAlbums
      }
    },
    
    
    
    // 提取标签和作者信息（已移至 useImageFilter composable，此方法保留用于兼容）
    extractAllTags() {
      // 标签和作者信息已由 useImageFilter composable 自动提取
      // 只需要更新筛选器数据
      this.updateFilterData()
    },
    
    // 更新筛选器数据到 App.vue
    updateFilterData() {
      // composable 的 getFilterData 方法已通过 setup 返回并可直接使用
      if (this.getFilterData) {
        this.$emit('filter-data-updated', this.getFilterData())
      }
    },

    // 从设置中加载图片配置
    async loadImageSettings() {
      try {
        // 动态导入SaveManager以避免循环依赖

        const settings = await saveManager.loadSettings()
        
        // 使用 composable 的方法加载图片分页设置
        if (this.loadImageSettings) {
          await this.loadImageSettings()
        }
        
        if (settings && settings.image) {
          const newAlbumPageSize = parseInt(settings.image.listPageSize) || 20
          
          // 更新图片列表分页大小（使用 composable 的 pageSize）
          // 注意：composable 的 pageSize 是通过 this.pageSize 访问的
          if (this.pageSize && typeof this.pageSize === 'object' && 'value' in this.pageSize) {
            if (this.pageSize.value !== newAlbumPageSize) {
              this.pageSize.value = newAlbumPageSize
            // 重新计算图片列表分页
            this.updateAlbumPagination()
            
            console.log('图片列表分页设置已更新:', {
                listPageSize: this.pageSize.value,
                totalPages: this.paginationConfig?.totalPages,
                currentPage: this.paginationConfig?.currentPage
            })
            }
          }
        }
      } catch (error) {
        console.error('加载图片设置失败:', error)
        // 使用默认值
        this.detailPageSize = 50
        // albumPageSize 已移至 composable，通过 loadPaginationSettings 加载
      }
    },
    
    // 路径更新相关方法
    closePathUpdateDialog() {
      this.showPathUpdateDialog = false
      this.pathUpdateInfo = {
        existingAlbum: null,
        newPath: '',
        newFolderName: ''
      }
    },
    
    async confirmPathUpdate() {
      try {
        const { existingAlbum, newPath } = this.pathUpdateInfo
        
        if (!existingAlbum || !newPath) {
          console.error('路径更新信息不完整')
          return
        }
        
        console.log(`更新图片 "${existingAlbum.name}" 的路径:`)
        console.log(`旧路径: ${existingAlbum.folderPath}`)
        console.log(`新路径: ${newPath}`)
        
        // 更新图片路径
        existingAlbum.folderPath = newPath
        existingAlbum.fileExists = true
        
        // 更新封面为新的文件路径
        existingAlbum.pagesCount = 1
        existingAlbum.cover = newPath
        
        // 保存更新后的数据
        await this.saveAlbums()
        
        // 关闭对话框
        this.closePathUpdateDialog()
        
        // 显示成功通知
        notify.toast(
          'success',
          '路径更新成功', 
          `图片 "${existingAlbum.name}" 的路径已更新`
        )
        
        console.log(`图片 "${existingAlbum.name}" 路径更新完成`)
        
      } catch (error) {
        console.error('更新图片路径失败:', error)
        notify.toast('error', '更新失败', `更新图片路径失败: ${error.message}`)
      }
    },
    async handleSortChanged({ pageType, sortBy }) {
      console.log('🚀 handleSortChanged 方法开始执行')
      try {

        await saveManager.saveSortSetting(pageType, sortBy)
        console.log(`✅ 已保存${pageType}页面排序方式:`, sortBy)
      } catch (error) {
        console.warn('保存排序方式失败:', error)
      }
    },
    async loadSortSetting() {
      console.log('🚀 loadSortSetting 方法开始执行')
      try {
  
        const savedSortBy = await saveManager.getSortSetting('images')
        console.log('🔍 从存档加载的排序方式:', savedSortBy)
        console.log('🔍 当前组件的sortBy:', this.sortBy)
        
        if (savedSortBy && savedSortBy !== this.sortBy) {
          this.sortBy = savedSortBy
          console.log('✅ 已加载图片页面排序方式:', savedSortBy)
        } else {
          console.log('ℹ️ 排序方式无需更新，当前值:', this.sortBy)
        }
      } catch (error) {
        console.warn('加载排序方式失败:', error)
      }
    }
  },
  async mounted() {
    console.log('🚀 ImageView mounted 方法开始执行')
    
    // 移除 ImageView 等资源视图中的等待逻辑：这些视图现在统一通过 ResourceView 加载，
    // 而 ResourceView 仅在 App.vue 初始化完成后才会渲染，因此此处可以直接加载数据
    console.log('✅ 存档系统已初始化，开始加载图片数据')
    
    await this.loadAlbums()
    
    // 加载图片设置
    await this.loadImageSettings()
    
    // 加载分页设置（使用 composable 的方法）
    if (this.loadPaginationSettings) {
      await this.loadPaginationSettings('image')
    }
    
    // 加载排序设置
    await this.loadSortSetting()
    
    // 初始化筛选器数据
    this.updateFilterData()
    
    console.log('✅ ImageView mounted 方法执行完成')
  }
}
</script>

<style lang="scss" scoped>
// 图片主内容区域
.image-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--spacing-xl);
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  transition: all var(--transition-base);

  // 拖拽样式
  &.drag-over {
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed var(--accent-color);
    border-radius: var(--radius-xl);

    &::before {
      content: '拖拽图片文件到这里添加（支持多选）';
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
      z-index: var(--z-modal);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      pointer-events: none;
    }
  }
}

// 网格
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
}

.album-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--border-color);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px var(--shadow-medium);
    border-color: var(--accent-color);

    .album-image img {
      transform: scale(1.05);
    }

    .album-overlay {
      opacity: 1;
    }
  }
}

.album-image {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-base);
  }
}

.pages-badge {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  font-family: 'Courier New', monospace;
  z-index: 10;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.open-button {
  background: var(--accent-color);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-hover);
    transform: scale(1.1);
  }
}

.album-info {
  padding: var(--spacing-lg);
}

.album-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}

.album-author {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}

.album-description {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}

.album-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--spacing-md);
}

.album-tag {
  background: var(--accent-color);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-lg);
  font-size: 0.7rem;
  font-weight: 500;
  transition: background var(--transition-base);
}

.album-tag-more {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-lg);
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pages-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color var(--transition-base);
}

.album-folder {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}


// 模态框
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
  z-index: var(--z-modal-backdrop);
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-medium);
  transition: background-color var(--transition-base);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);

  h3 {
    color: var(--text-primary);
    margin: 0;
    transition: color var(--transition-base);
  }
}


.modal-body {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);

  label,
  &.form-label {
    display: block;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    transition: color var(--transition-base);
  }
}

// 封面选择区域样式
.cover-selection-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.cover-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-base);

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }
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
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.btn-cover-action {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--transition-base);
  font-size: 0.9rem;

  &:hover {
    background: var(--accent-hover);
  }

  &.btn-clear {
    background: #ef4444;

    &:hover {
      background: #dc2626;
    }
  }

  .btn-icon {
    font-size: 1rem;
  }

  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: var(--bg-secondary);
    }
  }
}

.required {
  color: #ef4444;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.form-textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all var(--transition-base);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

// 标签输入样式
.tags-input-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  padding: var(--spacing-sm);
  transition: all var(--transition-base);

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-sm);
  min-height: 20px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background: var(--accent-color);
  color: white;
  padding: 4px var(--spacing-sm);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  gap: 4px;
  transition: background var(--transition-base);

  &:hover {
    background: var(--accent-hover);
  }
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 4px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.tag-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  padding: 4px 0;
  outline: none;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.tag-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 6px;
  line-height: 1.4;
}

.file-input-group {
  display: flex;
  gap: var(--spacing-md);

  .form-input {
    flex: 1;
  }
}

.btn-browse {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background var(--transition-base);

  &:hover {
    background: var(--accent-hover);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: var(--bg-secondary);
  }
}

.btn-confirm {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}


.pages-section {
  padding: 0 var(--spacing-3xl) var(--spacing-3xl) var(--spacing-3xl);
}

// 分页导航样式
.pagination-nav {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.page-range {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
}

.btn-pagination {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: background var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
}

.page-jump-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.page-input-group {
  width: 80px;
  padding: 6px var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-align: center;
  font-size: 0.9rem;
}

.btn-jump-group {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 6px var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.page-item {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    cursor: pointer;
    // 缩略图优化
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    // GPU加速
    will-change: transform;
    transform: translateZ(0);
    // 减少重绘
    contain: layout style paint;
  }
}

// 预览图特殊优化
.preview-thumbnail {
  // 强制使用GPU渲染
  transform: translateZ(0);
  backface-visibility: hidden;
  // 优化图片渲染
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  // 减少内存占用
  contain: layout style paint;
  // 懒加载优化
  opacity: 0;
  transition: opacity var(--transition-base);

  &[src] {
    opacity: 1;
  }
}

.page-index {
  position: absolute;
  bottom: 6px;
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

// 响应式
@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-lg);
  }

  .album-image {
    height: 200px;
  }

  .detail-body {
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .detail-cover {
    width: 100%;
    height: 250px;
  }

  .detail-stats {
    grid-template-columns: 1fr;
  }

  // 分页导航响应式
  .pagination-info {
    flex-direction: column;
    gap: 5px;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .page-jump-group {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}
</style>
