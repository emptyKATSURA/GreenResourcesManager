<template>
        <BaseView
          ref="baseView"
          :items="allItemsForEmptyState"
          :filtered-items="filteredVideos"
          :empty-state-config="videoEmptyStateConfig"
          :toolbar-config="videoToolbarConfig"
          :context-menu-items="videoContextMenuItems"
          :pagination-config="videoPaginationConfig"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @empty-state-action="handleEmptyStateAction"
          @add-item="showAddVideoDialog"
          @add-folder="showAddFolderDialog"
          @sort-changed="handleSortChanged"
          @search-query-changed="handleSearchQueryChanged"
          @sort-by-changed="handleSortByChanged"
          @context-menu-click="handleContextMenuClick"
          @page-change="handleVideoPageChange"
          :scale="scale"
          :show-layout-control="true"
          @update:scale="updateScale"
        >
    <!-- 主内容区域 -->
    <div 
      class="video-content"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragOver }"
    >

      <!-- 视频和文件夹网格 -->
      <div class="videos-grid" v-if="paginatedItems.length > 0" :style="layoutStyles">
        <MediaCard
          v-for="item in paginatedItems" 
          :key="item.id"
          :item="item"
          :type="item.type || 'video'"
          :isElectronEnvironment="true"
          :file-exists="item.fileExists"
          :scale="scale"
          @click="item.type === 'folder' ? showFolderDetail(item) : showVideoDetail(item)"
          @contextmenu="(event) => ($refs.baseView as any).showContextMenuHandler(event, item)"
          @action="item.type === 'folder' ? openFolder(item) : playVideo(item)"
        />
      </div>
    </div>

    <!-- 添加/编辑视频对话框 -->
    <ResourcesEditDialog
      :visible="showAddDialog || showEditDialog"
      :mode="showAddDialog ? 'add' : 'edit'"
      :resource-class="Video"
      :resource-data="showEditDialog ? editVideoForm : null"
      :is-electron-environment="true"
      :available-tags="allTags"
      :enable-randomize-thumbnail="true"
      add-title="添加视频"
      edit-title="编辑视频"
      add-button-text="添加视频"
      edit-button-text="保存"
      :custom-validation="(formData, isEditMode) => {
        if (isEditMode) return true
        return formData.filePath && formData.filePath.trim() !== ''
      }"
      :custom-confirm-handler="handleVideoCustomConfirm"
      @close="showAddDialog ? closeAddVideoDialog() : closeEditDialog()"
      @confirm="(resourceData) => showAddDialog ? handleAddVideoConfirm(resourceData) : handleEditVideoConfirm(resourceData)"
      @randomize-thumbnail="handleRandomizeThumbnail"
      @video-file-selected="handleVideoFileSelected"
    />

    <!-- 添加/编辑文件夹对话框 -->
    <ResourcesEditDialog
      :visible="showFolderDialog || showEditFolderDialog"
      :mode="showFolderDialog ? 'add' : 'edit'"
      :resource-class="VideoFolder"
      :resource-data="showEditFolderDialog ? editFolderForm : null"
      :is-electron-environment="true"
      :available-tags="allTags"
      :enable-select-from-folder-covers="true"
      add-title="添加文件夹"
      edit-title="编辑文件夹"
      add-button-text="添加文件夹"
      edit-button-text="保存"
      :custom-validation="(formData, isEditMode) => {
        if (isEditMode) return true
        return formData.folderPath && formData.folderPath.trim() !== ''
      }"
      @close="showFolderDialog ? closeAddFolderDialog() : closeEditFolderDialog()"
      @confirm="(resourceData) => showFolderDialog ? handleAddFolderConfirm(resourceData) : handleEditFolderConfirm(resourceData)"
      @select-from-folder-covers="showFolderDialog ? handleSelectFromNewFolderCovers : handleSelectFromFolderCovers"
    />

    <!-- 视频详情对话框 -->
    <DetailPanel
      :visible="showDetailDialog && !!selectedVideo"
      :item="selectedVideo"
      type="video"
      :stats="videoStats"
      :actions="videoActions"
      :on-update-resource="updateVideoResource"
      @close="closeVideoDetail"
      @action="handleDetailAction"
    >
      <!-- 文件夹视频列表 -->
      <template #extra v-if="selectedVideo && selectedVideo.type === 'folder' && selectedVideo.folderVideos">
        <FolderVideosGrid
          :videos="selectedVideo.folderVideos"
          :get-thumbnail-url="getThumbnailUrl"
          :handle-thumbnail-error="handleFolderVideoThumbnailError"
          @play-video="playFolderVideo"
          @generate-thumbnail="generateFolderVideoThumbnail"
        />
      </template>
    </DetailPanel>


    <!-- 路径更新确认对话框 -->
    <PathUpdateDialog
      :visible="showPathUpdateDialog"
      title="更新视频路径"
      description="发现同名但路径不同的视频文件："
      item-name-label="视频名称"
      :item-name="pathUpdateInfo.existingVideo?.name || ''"
      :old-path="pathUpdateInfo.existingVideo?.filePath || ''"
      :new-path="pathUpdateInfo.newPath || ''"
      missing-label="文件丢失"
      found-label="文件存在"
      question="是否要更新视频路径？"
      @confirm="confirmPathUpdate"
      @cancel="closePathUpdateDialog"
    />
  </BaseView>
</template>

<script lang="ts">
import VideoManager from '../../utils/VideoManager.ts'
import FolderManager from '../../utils/FolderManager.ts'
import BaseView from '../../components/BaseView.vue'
import FormField from '../../components/FormField.vue'
import MediaCard from '../../components/MediaCard.vue'
import DetailPanel from '../../components/DetailPanel.vue'
import PathUpdateDialog from '../../components/PathUpdateDialog.vue'
import VideoSelector from '../video/VideoSelector.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { Video } from '../../class/video.ts'
import { VideoFolder } from '../../class/videoFolder.ts'
import FolderVideosGrid from '../../components/video/FolderVideosGrid.vue'

import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import confirmService from '../../utils/ConfirmService.ts'
import alertService from '../../utils/AlertService.ts'
import { unlockAchievement } from '../user/AchievementView.vue'
import { ref, watch, PropType } from 'vue'
import { PageConfig } from '../../types/page'
import { usePagination } from '../../composables/usePagination'
import { useVideoFilter } from '../../composables/video/useVideoFilter'
import { useVideoManagement } from '../../composables/video/useVideoManagement'
import { useVideoFolder } from '../../composables/video/useVideoFolder'
import { useVideoDragDrop } from '../../composables/video/useVideoDragDrop'
import { useVideoThumbnail } from '../../composables/video/useVideoThumbnail'
import { useVideoDuration } from '../../composables/video/useVideoDuration'
import { useVideoPlayback } from '../../composables/video/useVideoPlayback'
import { useDisplayLayout } from '../../composables/useDisplayLayout'
// 通过 preload 暴露的 electronAPI 进行调用

export default {
  name: 'VideoView',
  components: {
    BaseView,
    FormField,
    MediaCard,
    DetailPanel,
    PathUpdateDialog,
    VideoSelector,
    ResourcesEditDialog,
    FolderVideosGrid,
  },
  emits: ['filter-data-updated'],
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({ id: 'videos', type: 'Video' })
    }
  },
  setup(props) {
    // 使用视频管理 composable
    const videoManagementComposable = useVideoManagement(props.pageConfig.id)

    // 使用显示布局 composable
    const displayLayoutComposable = useDisplayLayout(80, 350)
    
    // 使用文件夹管理 composable（传入页面ID以隔离数据）
    const videoFolderComposable = useVideoFolder(props.pageConfig.id)
    
    // 使用筛选 composable（基于 videos 和 folders）
    const videoFilterComposable = useVideoFilter(
      videoManagementComposable.videos,
      videoFolderComposable.folders
    )
    
    // 创建一个 ref 用于存储筛选后的视频列表（用于分页）
    const filteredVideosRef = ref([])
    
    // 监听筛选结果变化，更新 filteredVideosRef
    watch(videoFilterComposable.filteredVideos, (newValue) => {
      filteredVideosRef.value = newValue
    }, { immediate: true })

    // 使用分页 composable（视频列表分页）
    const videoPaginationComposable = usePagination(
      filteredVideosRef,
      20,
      '视频'
    )

    // 路径更新对话框状态（需要在 setup 中定义，以便传递给 composable）
    const showPathUpdateDialog = ref(false)
    const pathUpdateInfo = ref({
      existingVideo: null,
      newPath: '',
      newFileName: ''
    })

    // 使用视频拖拽 composable
    const videoDragDropComposable = useVideoDragDrop({
      videos: videoManagementComposable.videos,
      folders: videoFolderComposable.folders,
      onAddVideo: async (videoData) => {
        return await videoManagementComposable.addVideo(videoData as any)
      },
      onAddFolder: async (folderData) => {
        return await videoFolderComposable.addFolder(folderData as any)
      },
      onShowPathUpdateDialog: (info) => {
        pathUpdateInfo.value = info
        showPathUpdateDialog.value = true
      },
      onReloadData: async () => {
        await videoManagementComposable.loadVideos()
        await videoFolderComposable.loadFolders()
      }
    })

    // 使用视频缩略图 composable
    const videoThumbnailComposable = useVideoThumbnail()

    // 使用视频时长 composable
    const videoDurationComposable = useVideoDuration()

    // 使用视频播放 composable
    const videoPlaybackComposable = useVideoPlayback({
      onIncrementWatchCount: async (videoId) => {
        await videoManagementComposable.incrementWatchCount(videoId)
      },
      onReloadVideos: async () => {
        await videoManagementComposable.loadVideos()
      }
    })

    // 当前选中的资源引用（用于统一评分和收藏功能）
    const selectedVideoRef = ref(null)

    // 创建统一的资源更新函数（用于 DetailPanel）
    // 根据资源类型自动选择更新方法
    const updateVideoResource = async (id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) => {
      // 检查是视频还是文件夹
      const video = videoManagementComposable.videos.value.find(v => v.id === id)
      const folder = videoFolderComposable.folders.value.find(f => f.id === id)
      
      if (folder) {
        // 是文件夹
        await videoFolderComposable.updateFolder(id, updates)
      } else if (video) {
        // 是视频
        await videoManagementComposable.updateVideo(id, updates)
      } else {
        throw new Error('未找到要更新的资源')
      }
    }

    // 解构 composable，重命名 deleteVideo 避免与 methods 冲突
    const { deleteVideo: deleteVideoFromManager, ...restVideoManagement } = videoManagementComposable
    const { deleteFolder: deleteFolderFromManager, ...restVideoFolder } = videoFolderComposable

    return {
      filteredVideosRef,
      showPathUpdateDialog,
      pathUpdateInfo,
      // 视频管理相关（排除 deleteVideo，使用重命名版本）
      ...restVideoManagement,
      deleteVideoFromManager,
      // 文件夹管理相关（排除 deleteFolder，使用重命名版本）
      ...restVideoFolder,
      deleteFolderFromManager,
      // 筛选相关
      ...videoFilterComposable,
      allTags: videoFilterComposable.allTags,
      // 分页相关
      ...videoPaginationComposable,
      // 拖拽相关
      ...videoDragDropComposable,
      // 缩略图相关
      ...videoThumbnailComposable,
      // 时长相关
      ...videoDurationComposable,
      // 播放相关
      ...videoPlaybackComposable,
      // 统一的资源更新函数
      updateVideoResource,
      selectedVideoRef,
      // 显示布局相关
      ...displayLayoutComposable
    }
  },
  data() {
    return {
      // videos, folders, searchQuery, sortBy 已移至 setup()
      // videoManager, folderManager 已移至 useVideoManagement 和 useVideoFolder
      // isUpdatingDurations 已移至 useVideoManagement
      showAddDialog: false,
      showFolderDialog: false,
      // isDragOver 已移至 useVideoDragDrop composable
      // showPathUpdateDialog, pathUpdateInfo 已移至 setup()
      showDetailDialog: false,
      selectedVideo: null,
      // 添加视频表单
      newVideoForm: {
        name: '',
        description: '',
        tags: [],
        actors: [],
        series: '',
        duration: 0,
        filePath: '',
        thumbnail: ''
      },
      videoActorsInput: '',
      videoTagsInput: '',
      newFolder: {
        name: '',
        description: '',
        tags: [],
        actors: [],
        voiceActors: [],
        productionTeam: [],
        series: '',
        folderPath: '',
        thumbnail: ''
      },
      // 编辑相关
      showEditDialog: false,
      // 资源类用于 ResourcesEditDialog
      Video: Video,
      VideoFolder: VideoFolder,
      editVideoForm: {
        id: '',
        name: '',
        description: '',
        tags: [],
        actors: [],
        series: '',
        duration: 0,
        filePath: '',
        thumbnail: ''
      },
      editActorsInput: '',
      editTagsInput: '',
      // 编辑文件夹相关
      showEditFolderDialog: false,
      editFolderForm: {
        id: '',
        name: '',
        description: '',
        tags: [],
        actors: [],
        voiceActors: [],
        productionTeam: [],
        series: '',
        folderPath: '',
        thumbnail: ''
      },
      // thumbnailUrlCache 已移至 useVideoThumbnail composable
      // 排序选项
      videoSortOptions: [
        { value: 'name', label: '按名称排序' },
        { value: 'lastWatched', label: '按最后观看时间' },
        { value: 'watchCount', label: '按观看次数' },
        { value: 'added', label: '按添加时间' }
      ],
      // 右键菜单配置
      videoContextMenuItems: [
        { key: 'detail', icon: '👁️', label: '查看详情' },
        { key: 'play', icon: '▶️', label: '播放视频' },
        { key: 'folder', icon: '📁', label: '打开文件夹' },
        { key: 'edit', icon: '✏️', label: '编辑信息' },
        { key: 'remove', icon: '🗑️', label: '删除视频' }
      ],
      // 标签、演员、系列筛选相关已移至 useVideoFilter composable
      // 视频列表分页相关已移至 usePagination composable
      // 空状态配置
      videoEmptyStateConfig: {
        emptyIcon: '🎬',
        emptyTitle: '你的视频库是空的',
        emptyDescription: '点击"添加视频"或"添加文件夹"按钮来添加内容，或直接拖拽视频文件/文件夹到此处（支持多选）',
        emptyButtonText: '添加第一个视频',
        emptyButtonAction: 'showAddVideoDialog',
        noResultsIcon: '🔍',
        noResultsTitle: '没有找到匹配的内容',
        noResultsDescription: '尝试使用不同的搜索词',
        noPageDataIcon: '📄',
        noPageDataTitle: '当前页没有内容',
        noPageDataDescription: '请尝试切换到其他页面'
      },
      // 工具栏配置
      videoToolbarConfig: {
        addButtonText: '添加视频',
        addFolderButtonText: '添加文件夹',
        searchPlaceholder: '搜索视频...',
        sortOptions: [
          { value: 'name', label: '按名称排序' },
          { value: 'lastWatched', label: '按最后观看时间' },
          { value: 'watchCount', label: '按观看次数' },
          { value: 'added', label: '按添加时间' }
        ],
        pageType: 'videos'
      },
    }
  },
  computed: {
    // 合并视频和文件夹，用于空状态判断
    // allItems 从 useVideoFilter composable 中获取（通过 setup 暴露），已经合并了 videos 和 folders
    // 这样 BaseView 在判断空状态时会同时考虑视频和文件夹
    allItemsForEmptyState() {
      // 使用 composable 返回的 allItems（从 setup 中通过 ...videoFilterComposable 暴露）
      // allItems 已经合并了 videos 和 folders，所以空状态判断会正确工作
      return (this as any).allItems || []
    },
    // allItems, filteredVideos 已移至 useVideoFilter composable
    // 使用 composable 的 filteredVideos
    filteredVideos() {
      return this.filteredVideosRef || []
    },
    // 分页显示的项目列表（视频和文件夹）- 使用 composable 的 paginatedItems
    paginatedItems() {
      return this.paginatedItems || []
    },
    // 分页显示的视频和文件夹列表（兼容性）
    paginatedVideos() {
      return this.paginatedItems || []
    },
    // 当前视频页的起始索引 - 使用 composable 的 currentPageStartIndex
    currentVideoPageStartIndex() {
      return this.currentPageStartIndex || 0
    },
    videoStats() {
      if (!this.selectedVideo) return []
      
      if (this.selectedVideo.type === 'folder') {
        const videoCount = this.selectedVideo.folderVideos ? this.selectedVideo.folderVideos.length : 0
        return [
          { label: '系列', value: this.selectedVideo.series || '未知' },
          { label: '视频数量', value: `${videoCount} 个` },
          { label: '文件夹路径', value: this.getFolderPath(this.selectedVideo) },
          { label: '添加时间', value: this.formatAddedDate(this.selectedVideo.addedDate) }
        ]
      } else {
        return [
          { label: '系列', value: this.selectedVideo.series || '未知' },
          { label: '时长', value: this.formatDuration(this.selectedVideo.duration) },
          { label: '观看次数', value: `${this.selectedVideo.watchCount || 0} 次` },
          { label: '观看进度', value: `${this.selectedVideo.watchProgress || 0}%` },
          { label: '添加时间', value: this.formatAddedDate(this.selectedVideo.addedDate) },
          { label: '首次观看', value: this.formatFirstWatched(this.selectedVideo.firstWatched) },
          { label: '最后观看', value: this.formatLastWatched(this.selectedVideo.lastWatched) }
        ]
      }
    },
    videoActions() {
      if (this.selectedVideo?.type === 'folder') {
        return [
          { key: 'folder', icon: '📁', label: '打开文件夹', class: 'btn-open-folder' },
          { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
          { key: 'remove', icon: '🗑️', label: '删除文件夹', class: 'btn-remove' }
        ]
      } else {
        const actions = [
          { key: 'play', icon: '▶️', label: '播放', class: 'btn-play' },
          { key: 'folder', icon: '📁', label: '打开文件夹', class: 'btn-open-folder' },
          { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
          { key: 'remove', icon: '🗑️', label: '删除视频', class: 'btn-remove' }
        ]
        
        // 如果没有时长，添加更新时长按钮
        if (!this.selectedVideo?.duration || this.selectedVideo.duration === 0) {
          actions.splice(1, 0, { key: 'updateDuration', icon: '⏱️', label: '更新时长', class: 'btn-update-duration' })
        }
        
        return actions
      }
    },
    // 动态更新分页配置（使用 composable 的 paginationConfig）
    videoPaginationConfig() {
      const config = this.paginationConfig || {
        currentPage: 1,
        totalPages: 0,
        pageSize: 20,
        totalItems: 0,
        itemType: '视频'
      }
      
      return {
        ...config,
        totalItems: this.filteredVideos.length,
        totalPages: config.totalPages || Math.ceil(this.filteredVideos.length / (config.pageSize || 20))
      }
    }
  },
  async mounted() {
    // 初始化管理器（在 composables 中已处理）
    if (this.initVideoManager) {
      await this.initVideoManager()
    }
    if (this.initFolderManager) {
      await this.initFolderManager()
    }
    
    // 加载视频和文件夹（使用 composable 的方法）
    const loadVideosFn = (this as any).loadVideos
    if (loadVideosFn && typeof loadVideosFn === 'function') {
      await loadVideosFn.call(this)
    }
    
    const loadFoldersFn = (this as any).loadFolders
    if (loadFoldersFn && typeof loadFoldersFn === 'function') {
      await loadFoldersFn.call(this)
    }
    
    // 预加载所有文件夹的视频列表
    const preloadFn = (this as any).preloadAllFolderVideos
    if (preloadFn && typeof preloadFn === 'function') {
      await preloadFn.call(this)
    }
    
    // 加载视频分页设置
    await this.loadVideoPaginationSettings()
    
    // 加载排序设置（使用 composable 的方法）
    await this.loadSortSetting()
    
    // 初始化筛选器数据
    this.updateFilterData()
  },
  watch: {
    // 监听筛选结果变化，更新分页信息（使用 composable 的 updatePagination）
    filteredVideos: {
      handler() {
        if (this.updatePagination) {
          this.updatePagination()
        }
      },
      immediate: false
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
    }
  },
  methods: {
    // checkVideoCollectionAchievements 已移至 useVideoManagement composable
    // loadVideos 已移至 useVideoManagement composable
    // 此方法保留作为包装，调用 composable 的方法并执行额外逻辑
    async loadVideos() {
      // 调用 composable 的 loadVideos（通过 this 访问）
      const loadFn = (this as any).loadVideos
      if (loadFn && typeof loadFn === 'function') {
        await loadFn.call(this)
      }

      this.updateFilterData()
      
      // 检测文件存在性（仅在应用启动时检测一次）
      if (this.$root.shouldCheckFileLoss && this.$root.shouldCheckFileLoss()) {
        ;(this.$root as any).markFileLossChecked()
        const checkFn = (this as any).checkFileExistence
        if (checkFn && typeof checkFn === 'function') {
          Promise.resolve()
            .then(() => checkFn.call(this))
            .catch((e) => {
              console.warn('[VideoView] 后台检测文件存在性失败:', e)
            })
            .finally(() => {
              this.updateFilterData()
            })
        }
      }
      
      // 自动更新未知时长的视频（后台执行，不阻塞筛选器显示）
      Promise.resolve()
        .then(() => this.autoUpdateUnknownDurations())
        .catch((e) => {
          console.warn('[VideoView] 后台更新视频时长失败:', e)
        })
      
      // 计算视频列表总页数（使用 composable 的 updatePagination）
      if (this.updatePagination) {
        this.updatePagination()
      }
      
      const checkAchievementsFn = (this as any).checkVideoCollectionAchievements
      if (checkAchievementsFn && typeof checkAchievementsFn === 'function') {
        Promise.resolve()
          .then(() => checkAchievementsFn.call(this))
          .catch((e) => {
            console.warn('[VideoView] 后台成就检测失败:', e)
          })
      }
    },

    // loadFolders 已移至 useVideoFolder composable
    // 此方法保留作为包装
    async loadFolders() {
      const loadFn = (this as any).loadFolders
      if (loadFn && typeof loadFn === 'function') {
        await loadFn.call(this)
      }
      
      // 预加载所有文件夹的视频列表
      const preloadFn = (this as any).preloadAllFolderVideos
      if (preloadFn && typeof preloadFn === 'function') {
        await preloadFn.call(this)
      }
    },

    // checkFileExistence 已移至 useVideoManagement composable
    // showMissingFilesAlert 已移至 useVideoManagement composable（在 checkFileExistence 内部处理）
    // 拖拽处理方法已移至 useVideoDragDrop composable
    // handleDrop, handleDragOver, handleDragEnter, handleDragLeave, detectFoldersFromFiles,
    // processMultipleVideoFiles, processMultipleFolders, extractVideoName 已移至 composable

    // 自动更新未知时长的视频
    async autoUpdateUnknownDurations() {
      // 防止重复执行
      if (this.isUpdatingDurations) {
        console.log('⏭️ 视频时长更新正在进行中，跳过重复执行')
        return
      }
      
      this.isUpdatingDurations = true
      console.log('🔄 开始自动更新未知时长的视频...')
      
      try {
        // 检查设置，看是否启用自动更新
        try {
          const settings = await this.loadSettings()
          if (settings.autoUpdateVideoDuration === false) {
            console.log('⏭️ 自动更新视频时长已禁用，跳过')
            return
          }
        } catch (error) {
          console.warn('⚠️ 无法加载设置，继续执行自动更新:', error)
        }
      
      // 筛选出需要更新时长的视频
      const videosToUpdate = this.videos.filter(video => {
        return video.filePath && 
               video.fileExists !== false && 
               (!video.duration || video.duration === 0)
      })
      
      if (videosToUpdate.length === 0) {
        console.log('✅ 所有视频都有时长信息，无需更新')
        return
      }
      
      console.log(`📊 发现 ${videosToUpdate.length} 个视频需要更新时长`)
      
      // 如果视频数量较多，询问用户是否要批量更新
      if (videosToUpdate.length > 10) {
        const shouldUpdate = await confirmService.confirm(
          `发现 ${videosToUpdate.length} 个视频需要更新时长。\n\n` +
          `这可能需要一些时间，是否要现在更新？\n\n` +
          `点击"确定"开始更新，点击"取消"稍后手动更新。`,
          '确认更新'
        )
        
        if (!shouldUpdate) {
          console.log('⏭️ 用户取消了批量更新')
          notify.toast(
            'info',
            '已取消更新', 
            `发现 ${videosToUpdate.length} 个视频需要更新时长，您可以稍后手动更新`
          )
          return
        }
      }
      
      let updatedCount = 0
      let failedCount = 0
      

      
      // 批量更新视频时长
      for (const video of videosToUpdate) {
        try {
          console.log(`🔄 正在更新视频时长: ${video.name}`)
          
          const duration = await this.getVideoDuration(video.filePath)
          if (duration > 0) {
            // 更新视频数据
            await this.videoManager.updateVideo(video.id, {
              ...video,
              duration: duration
            })
            
            // 更新本地数据
            video.duration = duration
            updatedCount++
            
            console.log(`✅ 视频时长更新成功: ${video.name} - ${duration} 分钟`)
          } else {
            console.warn(`⚠️ 无法获取视频时长: ${video.name}`)
            failedCount++
          }
        } catch (error) {
          console.error(`❌ 更新视频时长失败: ${video.name}`, error)
          failedCount++
        }
        
        // 添加小延迟，避免过于频繁的操作
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 使用 composable 的 saveVideos 方法保存视频数据
      await this.saveVideos()
      
      // 显示更新结果
      if (updatedCount > 0) {
        notify.toast(
          'success',
          '时长更新完成', 
          `成功更新 ${updatedCount} 个视频的时长${failedCount > 0 ? `，${failedCount} 个视频更新失败` : ''}`
        )
      } else if (failedCount > 0) {
        notify.toast(
          'error',
          '时长更新失败', 
          `所有 ${failedCount} 个视频的时长更新失败，请检查视频文件是否有效`
        )
      }
        
        console.log(`📊 视频时长更新完成: 成功 ${updatedCount} 个，失败 ${failedCount} 个`)
      } finally {
        // 重置标志
        this.isUpdatingDurations = false
      }
    },

    // 拖拽处理方法已移至 useVideoDragDrop composable
    // detectFoldersFromFiles, processMultipleVideoFiles, processMultipleFolders, extractVideoName 已移至 composable

    showAddVideoDialog() {
      this.resetNewVideoForm()
      this.showAddDialog = true
    },

    closeAddVideoDialog() {
      this.showAddDialog = false
      this.resetNewVideoForm()
    },

    resetNewVideoForm() {
      this.newVideoForm = {
        name: '',
        description: '',
        tags: [],
        actors: [],
        series: '',
        duration: 0,
        filePath: '',
        thumbnail: ''
      }
      this.videoActorsInput = ''
      this.videoTagsInput = ''
    },

    async selectVideoFile() {
      try {
        const filePath = await window.electronAPI.selectVideoFile()
        if (filePath) {
          this.newVideoForm.filePath = filePath
          if (!this.newVideoForm.name || !this.newVideoForm.name.trim()) {
            this.newVideoForm.name = this.extractVideoName(filePath)
          }
          
          // 自动获取视频时长
          try {
            const duration = await this.getVideoDuration(filePath)
            if (duration > 0) {
              this.newVideoForm.duration = duration
            }
          } catch (e) {
            console.warn('获取视频时长失败:', e)
          }
          
          // 自动生成缩略图（若未手动设置）
          if (!this.newVideoForm.thumbnail || !this.newVideoForm.thumbnail.trim()) {
            try {
              const thumb = await this.generateThumbnail(filePath, this.newVideoForm.name)
              if (thumb) {
                this.newVideoForm.thumbnail = thumb
              }
            } catch (e) {
              console.warn('自动生成缩略图失败:', e)
            }
          }
        }
      } catch (error) {
        console.error('选择视频文件失败:', error)
      }
    },

    async selectThumbnailFile() {
      try {
        const filePath = await window.electronAPI.selectImageFile()
        if (filePath) {
          this.newVideoForm.thumbnail = filePath
        }
      } catch (error) {
        console.error('选择缩略图失败:', error)
      }
    },

    parseVideoActors() {
      if (this.videoActorsInput && this.videoActorsInput.trim()) {
        this.newVideoForm.actors = this.videoActorsInput.split(',').map(actor => actor.trim()).filter(actor => actor)
      } else {
        this.newVideoForm.actors = []
      }
    },

    addVideoTag() {
      const tag = this.videoTagsInput.trim()
      if (tag && !this.newVideoForm.tags.includes(tag)) {
        this.newVideoForm.tags.push(tag)
        this.videoTagsInput = ''
      }
    },

    removeVideoTag(index) {
      this.newVideoForm.tags.splice(index, 1)
    },

    showAddFolderDialog() {
      console.log('showAddFolderDialog 被调用')
      console.log('当前 showFolderDialog 值:', this.showFolderDialog)
      this.resetNewFolder()
      this.showFolderDialog = true
      console.log('showFolderDialog 设置为:', this.showFolderDialog)
      console.log('newFolder 数据:', this.newFolder)
    },

    closeAddFolderDialog() {
      this.showFolderDialog = false
      this.resetNewFolder()
    },

    resetNewFolder() {
      // ResourcesEditDialog 会自动重置表单，这里保留方法以保持兼容性
      this.newFolder = {
        name: '',
        description: '',
        tags: [],
        actors: [],
        voiceActors: [],
        productionTeam: [],
        series: '',
        folderPath: '',
        thumbnail: ''
      }
    },

    parseFolderActors() {
      if (this.folderActorsInput.trim()) {
        this.newFolder.actors = this.folderActorsInput.split(',').map(actor => actor.trim()).filter(actor => actor)
      }
    },

    addFolderTag() {
      const tag = this.folderTagsInput.trim()
      if (tag && !this.newFolder.tags.includes(tag)) {
        this.newFolder.tags.push(tag)
        this.folderTagsInput = ''
      }
    },
    removeFolderTag(index) {
      this.newFolder.tags.splice(index, 1)
    },

    async selectNewFolderPath() {
      try {
        if (window.electronAPI && window.electronAPI.selectFolder) {
          const result = await window.electronAPI.selectFolder()
          if (result && result.success && result.path) {
            this.newFolder.folderPath = result.path
            if (!this.newFolder.name || !this.newFolder.name.trim()) {
              const parts = result.path.replace(/\\/g, '/').split('/')
              this.newFolder.name = parts[parts.length - 1]
            }
          }
        }
      } catch (e) {
        console.error('选择文件夹失败:', e)
      }
    },

    // 获取文件夹路径显示
    getFolderPath(folder) {
      return folder.folderPath || '未设置路径'
    },

    // getFolderVideos 已移至 useVideoFolder composable



    async selectFolderThumbnailFile() {
      try {
        const filePath = await window.electronAPI.selectImageFile()
        if (filePath) {
          this.newFolder.thumbnail = filePath
        }
      } catch (error) {
        console.error('选择文件夹缩略图失败:', error)
      }
    },

    // 提取视频名称（从文件路径）
    extractVideoName(filePath: string): string {
      if (!filePath) return ''
      const fileName = filePath.split(/[\\/]/).pop() || ''
      const lastDotIndex = fileName.lastIndexOf('.')
      return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
    },
    // 添加视频时的自定义确认处理（提取名称、获取时长、生成缩略图等）
    async handleVideoCustomConfirm(formData, isEditMode) {
      if (isEditMode) return // 编辑模式不需要特殊处理
      
      // 1. 如果没有名称，从文件路径提取
      if (!formData.name && formData.filePath) {
        formData.name = this.extractVideoName(formData.filePath)
      }
      
      // 2. 自动获取视频时长（duration 不需要编辑，但可以获取用于存储）
      if (formData.filePath && this.getVideoDuration) {
        try {
          const duration = await this.getVideoDuration(formData.filePath)
          if (duration > 0) {
            formData.duration = duration
          }
        } catch (e) {
          console.warn('获取视频时长失败:', e)
        }
      }
      
      // 3. 若未设置缩略图且存在视频文件，尝试生成一张
      if ((!formData.thumbnail || !formData.thumbnail.trim()) && formData.filePath && this.generateThumbnail) {
        try {
          const thumb = await this.generateThumbnail(formData.filePath, formData.name || '')
          if (thumb) {
            formData.thumbnail = thumb
          }
        } catch (e) {
          console.warn('生成缩略图失败，跳过:', e)
        }
      }
    },
    async handleAddVideoConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      console.log('[VideoView] handleAddVideoConfirm 被调用，resourceData:', resourceData)
      try {
        // 如果没有名称，从文件路径提取
        if (!resourceData.name || !resourceData.name.trim()) {
          if (resourceData.filePath) {
            resourceData.name = this.extractVideoName(resourceData.filePath)
          }
        }
        if (!resourceData.name || !resourceData.name.trim()) {
          await alertService.warning('请至少选择一个视频文件或填写名称', '提示')
          return
        }

        console.log('[VideoView] 准备添加视频，resourceData:', resourceData)
        // 使用 composable 的 addVideo 方法
        await this.addVideo(resourceData)
        
        // 更新筛选器数据
        this.updateFilterData()
        
        // 重置表单
        this.resetNewVideoForm()
        this.closeAddVideoDialog()
        
        // 成功时使用 toast 通知
        notify.toast('success', '添加成功', `视频 "${resourceData.name}" 已成功添加`)
        console.log('[VideoView] 视频添加成功')
      } catch (error) {
        console.error('[VideoView] 添加视频失败:', error)
        notify.toast('error', '添加失败', `添加视频失败: ${error.message}`)
      }
    },

    async handleAddFolderConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      try {
        if (!resourceData.name || !resourceData.name.trim()) {
          await alertService.warning('请填写文件夹名称', '提示')
          return
        }
        if (!resourceData.folderPath || !resourceData.folderPath.trim()) {
          await alertService.warning('请先选择文件夹路径', '提示')
          return
        }

        const folder = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: (resourceData.name || '').trim(),
          description: (resourceData.description || '').trim(),
          tags: Array.isArray(resourceData.tags) ? resourceData.tags : [],
          actors: Array.isArray(resourceData.actors) ? resourceData.actors : [],
          voiceActors: Array.isArray(resourceData.voiceActors) ? resourceData.voiceActors : [],
          productionTeam: Array.isArray(resourceData.productionTeam) ? resourceData.productionTeam : [],
          series: (resourceData.series || '').trim(),
          folderPath: (resourceData.folderPath || '').trim(),
          thumbnail: (resourceData.thumbnail || '').trim(),
          addedDate: new Date().toISOString()
        }

        // 使用 composable 的 addFolder 方法
        const success = await this.addFolder(folder)
        if (success) {
          // 更新筛选器数据
          this.updateFilterData()
          
          this.closeAddFolderDialog()
          
          // 成功时使用 toast 通知
          notify.toast('success', '添加成功', `文件夹 "${folder.name}" 已成功添加`)
        } else {
          notify.toast('error', '添加失败', '文件夹添加失败，请重试')
        }
      } catch (error) {
        console.error('添加文件夹失败:', error)
        notify.toast('error', '添加失败', `添加文件夹失败: ${error.message}`)
      }
    },

    showVideoDetail(video) {
      // 确保设置 type 字段
      this.selectedVideo = { ...video, type: 'video' }
      // 同步到 ref（用于统一评分和收藏功能）
      if (this.selectedVideoRef) {
        this.selectedVideoRef = this.selectedVideo
      }
      this.showDetailDialog = true
    },

    closeVideoDetail() {
      this.showDetailDialog = false
      this.selectedVideo = null
      // 同步到 ref
      if (this.selectedVideoRef) {
        this.selectedVideoRef = null
      }
    },

    async showFolderDetail(folder) {
      // 确保设置 type 字段
      this.selectedVideo = { ...folder, type: 'folder' }
      // 同步到 ref（用于统一评分和收藏功能）
      if (this.selectedVideoRef) {
        this.selectedVideoRef = this.selectedVideo
      }
      this.showDetailDialog = true
      
      // 如果还没有加载过视频列表，则加载（使用 composable 的方法）
      if (folder && folder.folderPath && !folder.folderVideos) {
        try {
          const folderVideos = await this.getFolderVideos(folder)
          this.selectedVideo.folderVideos = folderVideos
          // 同时更新原始文件夹对象，避免重复扫描
          const originalFolder = this.folders.find(f => f.id === folder.id)
          if (originalFolder) {
            originalFolder.folderVideos = folderVideos
          }
          console.log('文件夹视频列表加载完成:', folderVideos.length, '个视频')
        } catch (error) {
          console.error('加载文件夹视频列表失败:', error)
          this.selectedVideo.folderVideos = []
        }
      }
    },

    async openFolder(folder) {
      if (folder && folder.folderPath && window.electronAPI && window.electronAPI.openFolder) {
        try {
          const result = await window.electronAPI.openFolder(folder.folderPath)
          if (!result.success) {
            console.warn('打开文件夹失败:', result.error)
          }
          return
        } catch (e) {
          console.error('打开文件夹异常:', e)
        }
      }
      // 回退：显示文件夹路径
      await alertService.info(`文件夹路径: ${folder.folderPath || '未设置'}`, '文件夹路径')
    },

    // 播放文件夹中的视频
    async playFolderVideo(video: any) {
      try {
        console.log('开始播放文件夹视频:', {
          name: video.name,
          path: video.path
        })

        // 检查视频文件是否存在
        if (window.electronAPI && window.electronAPI.checkFileExists) {
          console.log('检查文件存在性:', video.path)
          const result = await window.electronAPI.checkFileExists(video.path)
          console.log('文件存在性检查结果:', result)
          
          if (!result.exists) {
            console.error('文件不存在:', video.path)
            notify.toast('error', '播放失败', `视频文件不存在: ${video.name}\n路径: ${video.path}`)
            return
          }
        } else {
          console.warn('Electron API 不可用，跳过文件存在性检查')
        }

        // 获取当前设置
        const settings = await this.loadSettings()
        console.log('播放设置:', settings.videoPlayMode)
        
        if (settings.videoPlayMode === 'internal') {
          // 使用内部播放器
          console.log('使用内部播放器播放')
          await this.playVideoInternal({
            name: video.name,
            filePath: video.path
          })
        } else {
          // 使用外部播放器
          console.log('使用外部播放器播放')
          await this.playVideoExternal({
            name: video.name,
            filePath: video.path
          })
        }
        
        notify.toast('success', '播放成功', `正在播放: ${video.name}`)
      } catch (error) {
        console.error('播放文件夹视频失败:', error)
        notify.toast('error', '播放失败', `播放视频失败: ${error.message}`)
      }
    },

    // 为文件夹中的视频生成缩略图
    async generateFolderVideoThumbnail(video, index) {
      try {
        console.log('开始为文件夹视频生成缩略图:', {
          name: video.name,
          path: video.path,
          currentThumbnail: video.thumbnail
        })

        // 设置生成状态
        video.isGeneratingThumbnail = true

        // 生成缩略图文件名：使用文件夹名作为子目录
        const folderName = this.selectedVideo.name
        const cleanFolderName = folderName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        const videoFileName = this.extractVideoName(video.path.split('/').pop() || video.path.split('\\').pop() || '')
        const cleanVideoName = videoFileName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        
        // 使用 composable 的方法获取当前最大序号
        const maxNumber = await this.getMaxFolderVideoThumbnailNumber(cleanFolderName, cleanVideoName)
        const nextNumber = maxNumber + 1
        
        const thumbnailFilename = `${cleanFolderName}/${cleanVideoName}_cover_${nextNumber}.jpg`

        console.log('缩略图文件名:', thumbnailFilename)
        console.log('当前最大序号:', maxNumber, '新序号:', nextNumber)

        // 删除旧的缩略图文件
        if (video.thumbnail && video.thumbnail.trim()) {
          await this.deleteOldThumbnail(video.thumbnail)
        }

        // 使用 composable 的方法生成缩略图
        const thumbnailPath = await this.generateThumbnailForFolderVideo(video.path, thumbnailFilename)

        if (thumbnailPath) {
          console.log('✅ 缩略图生成成功:', thumbnailPath)
          
          // 更新视频对象的缩略图路径
          video.thumbnail = thumbnailPath
          
          // 更新到原始文件夹对象中
          if (this.selectedVideo && this.selectedVideo.folderVideos) {
            const videoInList = this.selectedVideo.folderVideos[index]
            if (videoInList) {
              videoInList.thumbnail = thumbnailPath
            }
          }

          // 同时更新到 folders 数组中
          const originalFolder = this.folders.find(f => f.id === this.selectedVideo.id)
          if (originalFolder) {
            if (!originalFolder.folderVideos) {
              originalFolder.folderVideos = []
            }
            if (originalFolder.folderVideos[index]) {
              originalFolder.folderVideos[index].thumbnail = thumbnailPath
            }
            
            // 使用 composable 的 updateFolder 方法保存文件夹数据（包含 folderVideos）
            await this.updateFolder(originalFolder.id, originalFolder)
          }

          // 强制更新视图
          this.$forceUpdate()

          notify.toast('success', '生成成功', `缩略图已生成: ${video.name}`)
        } else {
          console.warn('⚠️ 缩略图生成失败')
          notify.toast('error', '生成失败', '无法生成缩略图，请检查视频文件是否有效')
        }
      } catch (error) {
        console.error('生成文件夹视频缩略图失败:', error)
        notify.toast('error', '生成失败', `生成缩略图失败: ${error.message}`)
      } finally {
        // 清除生成状态
        video.isGeneratingThumbnail = false
        // 强制更新视图
        this.$forceUpdate()
      }
    },
    // generateThumbnailForFolderVideo 已移至 useVideoThumbnail composable

    // 处理文件夹视频缩略图加载错误（使用 composable 的方法）
    handleFolderVideoThumbnailError(event) {
      // 使用 composable 的 handleThumbnailError 方法
      this.handleThumbnailError(event)
    },

    handleDetailAction(actionKey, item) {
      if (item.type === 'folder') {
        switch (actionKey) {
          case 'folder':
            this.openFolder(item)
            break
          case 'edit':
            this.editFolder(item)
            break
          case 'remove':
            this.deleteFolder(item)
            break
        }
      } else {
        switch (actionKey) {
          case 'play':
            this.playVideo(item)
            break
          case 'updateDuration':
            this.updateVideoDuration(item)
            break
          case 'folder':
            this.openVideoFolder(item)
            break
          case 'edit':
            this.editVideo(item)
            break
          case 'remove':
            this.deleteVideo(item)
            break
        }
      }
    },

    // playVideo, playVideoInternal, playVideoExternal 已移至 useVideoPlayback composable

    editVideo(video) {
      if (!video) return
      this.showDetailDialog = false
      // ResourcesEditDialog 会通过 resourceData prop 自动加载数据
      this.editVideoForm = {
        id: video.id,
        name: video.name || '',
        description: video.description || '',
        tags: Array.isArray(video.tags) ? [...video.tags] : [],
        actors: Array.isArray(video.actors) ? [...video.actors] : [],
        series: video.series || '',
        duration: Number(video.duration) || 0, // duration 保留用于显示，但不编辑
        filePath: video.filePath || '',
        thumbnail: video.thumbnail || ''
      }
      // 先设置数据，再显示对话框，确保数据已准备好
      this.$nextTick(() => {
        this.showEditDialog = true
      })
    },
    closeEditDialog() {
      this.showEditDialog = false
    },
    parseEditActors() {
      if (this.editActorsInput && this.editActorsInput.trim()) {
        this.editVideoForm.actors = this.editActorsInput.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        this.editVideoForm.actors = []
      }
    },
    addEditTag() {
      const tag = this.editTagsInput.trim()
      if (tag && !this.editVideoForm.tags.includes(tag)) {
        this.editVideoForm.tags.push(tag)
        this.editTagsInput = ''
      }
    },
    removeEditTag(index) {
      this.editVideoForm.tags.splice(index, 1)
    },
    async browseEditVideoFile() {
      try {
        const filePath = await window.electronAPI.selectVideoFile()
        if (filePath) {
          this.editVideoForm.filePath = filePath
        }
      } catch (e) {
        console.error('选择视频文件失败:', e)
      }
    },
    async browseEditThumbnailFile() {
      try {
        const filePath = await window.electronAPI.selectImageFile()
        if (filePath) {
          this.editVideoForm.thumbnail = filePath
        }
      } catch (e) {
        console.error('选择缩略图失败:', e)
      }
    },
     async randomizeThumbnail() {
       try {
         if (!this.editVideoForm.filePath) {
           await alertService.warning('请先选择视频文件', '提示')
           return
         }
         
         console.log('=== 开始生成随机封面 ===')
         console.log('视频文件路径:', this.editVideoForm.filePath)
         console.log('视频名称:', this.editVideoForm.name)
         console.log('当前缩略图:', this.editVideoForm.thumbnail)
         
         // 使用 composable 的 generateThumbnail 方法
         const thumb = await this.generateThumbnail(
           this.editVideoForm.filePath, 
           this.editVideoForm.name, 
           this.editVideoForm.thumbnail
         )
         console.log('🔄 随机封面生成结果:', thumb)
         if (thumb) {
           console.log('✅ 缩略图生成成功，路径:', thumb)
           this.editVideoForm.thumbnail = thumb
           
           // 强制清除缓存，确保新生成的缩略图能正确显示
           const cache = 'value' in this.thumbnailUrlCache ? this.thumbnailUrlCache.value : this.thumbnailUrlCache
           cache.delete(thumb)
           
           // 强制更新视图
           this.$nextTick(() => {
             this.$forceUpdate()
           })
           
           console.log('缩略图生成成功，已更新预览')
         } else {
           console.warn('⚠️ 缩略图生成失败')
           // 检查文件扩展名，给出更友好的提示
           const extension = this.editVideoForm.filePath.toLowerCase().split('.').pop()
           const supportedFormats = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv']
           
           let errorMessage = ''
           if (!supportedFormats.includes(extension)) {
             errorMessage = `不支持的视频格式 "${extension}"。支持的格式：${supportedFormats.join(', ')}`
           } else {
             errorMessage = '可能的原因：视频编码格式不被浏览器支持、视频文件损坏或无法访问、文件路径包含特殊字符。建议尝试使用其他视频文件或手动选择缩略图图片。'
           }
           
           notify.toast('error', '缩略图生成失败', errorMessage)
         }
       } catch (e) {
         console.error('❌ 随机封面失败:', e)
         notify.toast('error', '缩略图生成失败', `生成过程中发生错误: ${e.message}`)
       }
     },
    async handleEditVideoConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      try {
        if (!resourceData) {
          notify.toast('error', '保存失败', '没有接收到视频数据')
          return
        }

        // actors 现在已经是数组（tags 类型）
        const actors = Array.isArray(resourceData.actors) ? resourceData.actors : []

        const payload = {
          name: (resourceData.name || '').trim(),
          description: (resourceData.description || '').trim(),
          tags: Array.isArray(resourceData.tags) ? resourceData.tags : [],
          actors: actors,
          series: (resourceData.series || '').trim(),
          // duration 不编辑，保留原有值
          duration: this.editVideoForm.duration || 0,
          filePath: (resourceData.filePath || '').trim(),
          thumbnail: (resourceData.thumbnail || '').trim()
        }
        
        // 使用 composable 的 updateVideo 方法
        await this.updateVideo(this.editVideoForm.id, payload)
        
        // 更新筛选器数据
        this.updateFilterData()
        
        this.showEditDialog = false
        notify.toast('success', '保存成功', '视频信息已更新')
      } catch (e) {
        console.error('保存编辑失败:', e)
        notify.toast('error', '保存失败', `保存编辑失败: ${e.message}`)
      }
    },
    // 处理视频文件选择后的自动处理（提取名称、获取时长、生成缩略图）
    async handleVideoFileSelected(key: string, filePath: string, formData: any) {
      try {
        // 1. 如果没有名称，从文件路径提取
        if (!formData.name && filePath) {
          formData.name = this.extractVideoName(filePath)
        }
        
        // 2. 自动获取视频时长
        if (filePath && this.getVideoDuration) {
          try {
            const duration = await this.getVideoDuration(filePath)
            if (duration > 0) {
              formData.duration = duration
            }
          } catch (e) {
            console.warn('获取视频时长失败:', e)
          }
        }
        
        // 3. 自动生成缩略图（若未手动设置）
        if ((!formData.thumbnail || !formData.thumbnail.trim()) && filePath && this.generateThumbnail) {
          try {
            const thumb = await this.generateThumbnail(filePath, formData.name || '')
            if (thumb) {
              formData.thumbnail = thumb
            }
          } catch (e) {
            console.warn('自动生成缩略图失败:', e)
          }
        }
      } catch (error: any) {
        console.error('处理视频文件选择失败:', error)
      }
    },
    // 处理随机生成缩略图
    async handleRandomizeThumbnail(key: string, formData: any, updateThumbnail: (path: string) => void) {
      try {
        const filePath = formData?.filePath
        if (!filePath) {
          await alertService.warning('请先选择视频文件', '提示')
          return
        }
        
        const videoName = formData?.name || ''
        const currentThumbnail = formData?.thumbnail || ''
        
        console.log('=== 开始生成随机封面 ===')
        console.log('视频文件路径:', filePath)
        console.log('视频名称:', videoName)
        console.log('当前缩略图:', currentThumbnail)
        
        // 使用 composable 的 generateThumbnail 方法
        if (!this.generateThumbnail) {
          await alertService.warning('生成缩略图功能不可用', '提示')
          return
        }
        
        const thumb = await this.generateThumbnail(filePath, videoName, currentThumbnail)
        console.log('🔄 随机封面生成结果:', thumb)
        
        if (thumb) {
          console.log('✅ 缩略图生成成功，路径:', thumb)
          // 通过回调更新 ResourcesEditDialog 的 formData
          if (updateThumbnail) {
            updateThumbnail(thumb)
          }
          notify.native('设置成功', '已生成随机封面')
        } else {
          console.log('❌ 缩略图生成失败')
          await alertService.warning('生成缩略图失败', '提示')
        }
      } catch (error: any) {
        console.error('生成随机缩略图失败:', error)
        await alertService.error(`生成缩略图失败: ${error.message || '未知错误'}`)
      }
    },
    // handleUpdateRating, handleUpdateComment, handleToggleFavorite 已移至 DetailPanel 内部统一处理
    // 保留这些方法作为向后兼容（如果 DetailPanel 没有提供 onUpdateResource prop）
    async handleUpdateRating(rating, video) {
      // 检查 video 是否存在，避免在面板关闭时触发更新
      if (!video || !video.id) {
        return
      }
      try {
        // 根据类型选择更新方法
        if (video.type === 'folder') {
          await this.updateFolder(video.id, { rating })
          // 更新当前文件夹对象，以便详情面板立即显示新星级
          if (this.selectedVideo && this.selectedVideo.id === video.id) {
            this.selectedVideo.rating = rating
          }
        } else {
          await this.updateVideo(video.id, { rating })
          // 更新当前视频对象，以便详情面板立即显示新星级
          if (this.selectedVideo && this.selectedVideo.id === video.id) {
            this.selectedVideo.rating = rating
          }
        }
      } catch (error: any) {
        console.error('更新星级失败:', error)
        await alertService.error('更新星级失败: ' + error.message, '错误')
      }
    },
    async handleUpdateComment(comment, video) {
      // 检查 video 是否存在，避免在面板关闭时触发更新
      if (!video || !video.id) {
        return
      }
      try {
        // 根据类型选择更新方法
        if (video.type === 'folder') {
          await this.updateFolder(video.id, { comment })
          // 更新当前文件夹对象，以便详情面板立即显示新评论
          if (this.selectedVideo && this.selectedVideo.id === video.id) {
            this.selectedVideo.comment = comment
          }
        } else {
          await this.updateVideo(video.id, { comment })
          // 更新当前视频对象，以便详情面板立即显示新评论
          if (this.selectedVideo && this.selectedVideo.id === video.id) {
            this.selectedVideo.comment = comment
          }
        }
      } catch (error: any) {
        console.error('更新评论失败:', error)
        await alertService.error('更新评论失败: ' + error.message, '错误')
      }
    },
    async handleToggleFavorite(video) {
      // 检查 video 是否存在，避免在面板关闭时触发更新
      if (!video || !video.id) {
        return
      }
      try {
        const newFavoriteStatus = !video.isFavorite
        // 根据类型选择更新方法（优先使用 type 字段，如果没有则通过其他属性判断）
        const isFolder = video.type === 'folder' || (video.folderPath && !video.filePath && video.folderVideos !== undefined)
        
        if (isFolder) {
          await this.updateFolder(video.id, { isFavorite: newFavoriteStatus })
        } else {
          await this.updateVideo(video.id, { isFavorite: newFavoriteStatus })
        }
        // 更新当前视频对象，以便详情面板立即显示新状态
        if (this.selectedVideo && this.selectedVideo.id === video.id) {
          this.selectedVideo.isFavorite = newFavoriteStatus
        }
      } catch (error: any) {
        console.error('切换收藏状态失败:', error)
        await alertService.error('切换收藏状态失败: ' + error.message, '错误')
      }
    },

    async deleteVideo(video) {
      const confirmed = await confirmService.confirm(`确定要删除视频 "${video.name}" 吗？`, '确认删除')
      if (!confirmed) return
      
      try {
        // 使用 composable 的 deleteVideoFromManager 方法（重命名以避免递归调用）
        await this.deleteVideoFromManager(video.id)
        
        // 从所有文件夹中移除该视频的引用（使用 composable 的方法）
        await this.removeVideoFromFolders(video.id)
        
        // 更新筛选器数据
        this.updateFilterData()
        
        // 显示删除成功通知
        notify.toast('success', '删除成功', `已成功删除视频 "${video.name}"`)
        console.log('视频删除成功:', video.name)
        
        this.closeVideoDetail()
      } catch (error) {
        console.error('删除视频失败:', error)
        // 显示删除失败通知
        notify.toast('error', '删除失败', `无法删除视频 "${video.name}": ${error.message}`)
      }
    },

    editFolder(folder) {
      if (!folder) return
      this.showDetailDialog = false
      // ResourcesEditDialog 会通过 resourceData prop 自动加载数据
      this.editFolderForm = {
        id: folder.id,
        name: folder.name || '',
        description: folder.description || '',
        tags: Array.isArray(folder.tags) ? [...folder.tags] : [],
        actors: Array.isArray(folder.actors) ? [...folder.actors] : [],
        voiceActors: Array.isArray(folder.voiceActors) ? [...folder.voiceActors] : [],
        productionTeam: Array.isArray(folder.productionTeam) ? [...folder.productionTeam] : [],
        series: folder.series || '',
        folderPath: folder.folderPath || '',
        thumbnail: folder.thumbnail || ''
      }
      // 先设置数据，再显示对话框，确保数据已准备好
      this.$nextTick(() => {
        this.showEditFolderDialog = true
      })
    },

    closeEditFolderDialog() {
      this.showEditFolderDialog = false
    },

    parseEditFolderActors() {
      if (this.editFolderActorsInput && this.editFolderActorsInput.trim()) {
        this.editFolderForm.actors = this.editFolderActorsInput.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        this.editFolderForm.actors = []
      }
    },

    addEditFolderTag() {
      const tag = this.editFolderTagsInput.trim()
      if (tag && !this.editFolderForm.tags.includes(tag)) {
        this.editFolderForm.tags.push(tag)
        this.editFolderTagsInput = ''
      }
    },

    removeEditFolderTag(index) {
      this.editFolderForm.tags.splice(index, 1)
    },

    async selectEditFolderPath() {
      try {
        if (window.electronAPI && window.electronAPI.selectFolder) {
          const result = await window.electronAPI.selectFolder()
          if (result && result.success && result.path) {
            this.editFolderForm.folderPath = result.path
          }
        }
      } catch (e) {
        console.error('选择编辑文件夹路径失败:', e)
      }
    },

    async selectEditFolderThumbnailFile() {
      try {
        const filePath = await window.electronAPI.selectImageFile()
        if (filePath) {
          this.editFolderForm.thumbnail = filePath
        }
      } catch (error) {
        console.error('选择编辑文件夹缩略图失败:', error)
      }
    },

    // 从文件夹的 Covers 子目录选择图片作为封面（编辑文件夹时）
    async selectFromFolderCovers() {
      try {
        if (!this.editFolderForm.folderPath) {
          await alertService.warning('请先选择文件夹路径', '提示')
          return
        }

        const folderName = this.editFolderForm.name || '未命名文件夹'
        const cleanFolderName = folderName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        
        // 构建文件夹的 Covers 子目录的绝对路径
        const baseCoversPath = saveManager.thumbnailDirectories?.videos || 'SaveData/Video/Covers'
        const coversPath = `${baseCoversPath}/${cleanFolderName}`
        
        console.log('=== 从文件夹 Covers 目录选择封面 ===')
        console.log('文件夹名称:', folderName)
        console.log('清理后的文件夹名:', cleanFolderName)
        console.log('基础 Covers 路径:', baseCoversPath)
        console.log('目标 Covers 路径:', coversPath)

        // 先确保目录存在，然后等待确认
        let directoryReady = false
        if (window.electronAPI && window.electronAPI.ensureDirectory) {
          try {
            const ensureResult = await window.electronAPI.ensureDirectory(coversPath)
            if (ensureResult.success) {
              console.log('✅ Covers 目录已确保存在:', coversPath)
              directoryReady = true
            } else {
              console.warn('⚠️ 创建 Covers 目录失败:', ensureResult.error)
            }
          } catch (error) {
            console.warn('⚠️ 确保 Covers 目录存在时出错:', error)
          }
        }

        // 添加短暂延迟，确保目录创建完成
        if (directoryReady) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('📂 调用 selectImageFile，初始路径:', coversPath)
          const filePath = await window.electronAPI.selectImageFile(coversPath)
          console.log('📂 selectImageFile 返回:', filePath)
          
          if (filePath) {
            this.editFolderForm.thumbnail = filePath
            console.log('✅ 已设置文件夹封面:', filePath)
            notify.toast('success', '设置成功', '已选择文件夹封面')
          } else {
            console.log('⚠️ 用户取消了选择')
          }
        } else {
          await alertService.warning('当前环境不支持选择图片功能', '提示')
        }
      } catch (error) {
        console.error('❌ 从文件夹选择封面失败:', error)
        notify.toast('error', '选择失败', `选择封面失败: ${error.message}`)
      }
    },

    // 处理从封面文件夹选择（用于 ResourcesEditDialog）
    async handleSelectFromNewFolderCovers(key: string, formData: any, updateThumbnail: (path: string) => void) {
      try {
        if (!formData.folderPath) {
          await alertService.warning('请先选择文件夹路径', '提示')
          return
        }

        const folderName = formData.name || '未命名文件夹'
        const cleanFolderName = folderName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        
        // 构建文件夹的 Covers 子目录的绝对路径
        const baseCoversPath = saveManager.thumbnailDirectories?.videos || 'SaveData/Video/Covers'
        const coversPath = `${baseCoversPath}/${cleanFolderName}`
        
        console.log('=== 从文件夹 Covers 目录选择封面（新建）===')
        console.log('文件夹名称:', folderName)
        console.log('清理后的文件夹名:', cleanFolderName)
        console.log('基础 Covers 路径:', baseCoversPath)
        console.log('目标 Covers 路径:', coversPath)

        // 先确保目录存在
        let directoryReady = false
        if (window.electronAPI && window.electronAPI.ensureDirectory) {
          try {
            const ensureResult = await window.electronAPI.ensureDirectory(coversPath)
            if (ensureResult.success) {
              console.log('✅ Covers 目录已确保存在:', coversPath)
              directoryReady = true
            } else {
              console.warn('⚠️ 创建 Covers 目录失败:', ensureResult.error)
            }
          } catch (error) {
            console.warn('⚠️ 确保 Covers 目录存在时出错:', error)
          }
        }

        // 添加短暂延迟，确保目录创建完成
        if (directoryReady) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('📂 调用 selectImageFile，初始路径:', coversPath)
          const filePath = await window.electronAPI.selectImageFile(coversPath)
          console.log('📂 selectImageFile 返回:', filePath)
          
          if (filePath && updateThumbnail) {
            updateThumbnail(filePath)
            console.log('✅ 已设置文件夹封面:', filePath)
            notify.toast('success', '设置成功', '已选择文件夹封面')
          } else {
            console.log('⚠️ 用户取消了选择')
          }
        } else {
          await alertService.warning('当前环境不支持选择图片功能', '提示')
        }
      } catch (error) {
        console.error('❌ 从文件夹选择封面失败:', error)
        notify.toast('error', '选择失败', `选择封面失败: ${error.message}`)
      }
    },

    async handleSelectFromFolderCovers(key: string, formData: any, updateThumbnail: (path: string) => void) {
      try {
        if (!formData.folderPath) {
          await alertService.warning('请先选择文件夹路径', '提示')
          return
        }

        const folderName = formData.name || '未命名文件夹'
        const cleanFolderName = folderName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        
        // 构建文件夹的 Covers 子目录的绝对路径
        const baseCoversPath = saveManager.thumbnailDirectories?.videos || 'SaveData/Video/Covers'
        const coversPath = `${baseCoversPath}/${cleanFolderName}`
        
        console.log('=== 从文件夹 Covers 目录选择封面 ===')
        console.log('文件夹名称:', folderName)
        console.log('清理后的文件夹名:', cleanFolderName)
        console.log('基础 Covers 路径:', baseCoversPath)
        console.log('目标 Covers 路径:', coversPath)

        // 先确保目录存在
        let directoryReady = false
        if (window.electronAPI && window.electronAPI.ensureDirectory) {
          try {
            const ensureResult = await window.electronAPI.ensureDirectory(coversPath)
            if (ensureResult.success) {
              console.log('✅ Covers 目录已确保存在:', coversPath)
              directoryReady = true
            } else {
              console.warn('⚠️ 创建 Covers 目录失败:', ensureResult.error)
            }
          } catch (error) {
            console.warn('⚠️ 确保 Covers 目录存在时出错:', error)
          }
        }

        // 添加短暂延迟，确保目录创建完成
        if (directoryReady) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('📂 调用 selectImageFile，初始路径:', coversPath)
          const filePath = await window.electronAPI.selectImageFile(coversPath)
          console.log('📂 selectImageFile 返回:', filePath)
          
          if (filePath && updateThumbnail) {
            updateThumbnail(filePath)
            console.log('✅ 已设置文件夹封面:', filePath)
            notify.toast('success', '设置成功', '已选择文件夹封面')
          } else {
            console.log('⚠️ 用户取消了选择')
          }
        } else {
          await alertService.warning('当前环境不支持选择图片功能', '提示')
        }
      } catch (error) {
        console.error('❌ 从文件夹选择封面失败:', error)
        notify.toast('error', '选择失败', `选择封面失败: ${error.message}`)
      }
    },

    // 从文件夹的 Covers 子目录选择图片作为封面（添加文件夹时）- 保留作为向后兼容
    async selectFromNewFolderCovers() {
      try {
        if (!this.newFolder.folderPath) {
          await alertService.warning('请先选择文件夹路径', '提示')
          return
        }

        const folderName = this.newFolder.name || '未命名文件夹'
        const cleanFolderName = folderName.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
        
        // 构建文件夹的 Covers 子目录的绝对路径
        const baseCoversPath = saveManager.thumbnailDirectories?.videos || 'SaveData/Video/Covers'
        const coversPath = `${baseCoversPath}/${cleanFolderName}`
        
        console.log('=== 从文件夹 Covers 目录选择封面（新建）===')
        console.log('文件夹名称:', folderName)
        console.log('清理后的文件夹名:', cleanFolderName)
        console.log('基础 Covers 路径:', baseCoversPath)
        console.log('目标 Covers 路径:', coversPath)

        // 先确保目录存在，然后等待确认
        let directoryReady = false
        if (window.electronAPI && window.electronAPI.ensureDirectory) {
          try {
            const ensureResult = await window.electronAPI.ensureDirectory(coversPath)
            if (ensureResult.success) {
              console.log('✅ Covers 目录已确保存在:', coversPath)
              directoryReady = true
            } else {
              console.warn('⚠️ 创建 Covers 目录失败:', ensureResult.error)
            }
          } catch (error) {
            console.warn('⚠️ 确保 Covers 目录存在时出错:', error)
          }
        }

        // 添加短暂延迟，确保目录创建完成
        if (directoryReady) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (window.electronAPI && window.electronAPI.selectImageFile) {
          console.log('📂 调用 selectImageFile，初始路径:', coversPath)
          const filePath = await window.electronAPI.selectImageFile(coversPath)
          console.log('📂 selectImageFile 返回:', filePath)
          
          if (filePath) {
            this.newFolder.thumbnail = filePath
            console.log('✅ 已设置文件夹封面:', filePath)
            notify.toast('success', '设置成功', '已选择文件夹封面')
          } else {
            console.log('⚠️ 用户取消了选择')
          }
        } else {
          await alertService.warning('当前环境不支持选择图片功能', '提示')
        }
      } catch (error) {
        console.error('❌ 从文件夹选择封面失败:', error)
        notify.toast('error', '选择失败', `选择封面失败: ${error.message}`)
      }
    },

    async handleEditFolderConfirm(resourceData) {
      // ResourcesEditDialog 返回的资源数据
      try {
        if (!resourceData) {
          notify.toast('error', '保存失败', '没有接收到文件夹数据')
          return
        }

        const payload = {
          name: (resourceData.name || '').trim(),
          description: (resourceData.description || '').trim(),
          tags: Array.isArray(resourceData.tags) ? resourceData.tags : [],
          actors: Array.isArray(resourceData.actors) ? resourceData.actors : [],
          voiceActors: Array.isArray(resourceData.voiceActors) ? resourceData.voiceActors : [],
          productionTeam: Array.isArray(resourceData.productionTeam) ? resourceData.productionTeam : [],
          series: (resourceData.series || '').trim(),
          folderPath: (resourceData.folderPath || '').trim(),
          thumbnail: (resourceData.thumbnail || '').trim()
        }
        
        // 使用 composable 的 updateFolder 方法
        await this.updateFolder(this.editFolderForm.id, payload)
        
        // 更新筛选器数据
        this.updateFilterData()
        
        this.showEditFolderDialog = false
        notify.toast('success', '保存成功', `文件夹 "${payload.name}" 已更新`)
      } catch (e) {
        console.error('保存编辑文件夹失败:', e)
        notify.toast('error', '保存失败', `保存文件夹失败: ${e.message}`)
      }
    },

    async deleteFolder(folder) {
      const confirmed = await confirmService.confirm(`确定要删除文件夹 "${folder.name}" 吗？`, '确认删除')
      if (!confirmed) return
      
      try {
        // 使用 composable 的 deleteFolderFromManager 方法（重命名以避免递归调用）
        const success = await this.deleteFolderFromManager(folder.id)
        if (success) {
          // 更新筛选器数据
          this.updateFilterData()
          
          // 显示删除成功通知
          notify.toast('success', '删除成功', `已成功删除文件夹 "${folder.name}"`)
          console.log('文件夹删除成功:', folder.name)
          
          this.closeVideoDetail()
        } else {
          notify.toast('error', '删除失败', '文件夹删除失败，请重试')
        }
      } catch (error) {
        console.error('删除文件夹失败:', error)
        // 显示删除失败通知
        notify.toast('error', '删除失败', `无法删除文件夹 "${folder.name}": ${error.message}`)
      }
    },

    /**
     * 右键菜单点击事件处理
     * @param {*} data - 包含 item 和 selectedItem
     */
    handleContextMenuClick(data) {
      const { item, selectedItem } = data
      if (!selectedItem) return
      
      if (selectedItem.type === 'folder') {
        switch (item.key) {
          case 'detail':
            this.showFolderDetail(selectedItem)
            break
          case 'folder':
            this.openFolder(selectedItem)
            break
          case 'edit':
            this.editFolder(selectedItem)
            break
          case 'remove':
            this.deleteFolder(selectedItem)
            break
        }
      } else {
        switch (item.key) {
          case 'detail':
            this.showVideoDetail(selectedItem)
            break
          case 'play':
            this.playVideo(selectedItem)
            break
          case 'folder':
            this.openVideoFolder(selectedItem)
            break
          case 'edit':
            this.editVideo(selectedItem)
            break
          case 'remove':
            this.deleteVideo(selectedItem)
            break
        }
      }
    },
    
    // 处理空状态按钮点击事件
    handleEmptyStateAction(actionName) {
      if (actionName === 'showAddVideoDialog') {
        this.showAddVideoDialog()
      }
    },
    
    // 处理搜索查询变化
    handleSearchQueryChanged(newValue) {
      this.searchQuery = newValue
    },
    
    // 处理排序变化
    handleSortByChanged(newValue) {
      this.sortBy = newValue
      console.log('✅ VideoView 排序方式已更新:', newValue)
    },

    // getThumbnailUrl, getThumbnailUrlAsync, handleThumbnailError, resolveThumbnail 已移至 useVideoThumbnail composable
    // onThumbnailLoad 保留在组件中（如果需要）
    async onThumbnailLoad(event) {
      // 缩略图加载成功时的处理
      console.log('缩略图加载成功')
    },

    formatLastWatched(dateString) {
      if (!dateString) return '从未观看'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
      return `${Math.ceil(diffDays / 365)}年前`
    },

    formatAddedDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
      return `${Math.ceil(diffDays / 365)}年前`
    },

    formatFirstWatched(dateString) {
      if (!dateString) return '从未观看'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
      return `${Math.ceil(diffDays / 365)}年前`
    },

    formatDuration(minutes) {
      if (!minutes || minutes === 0) return '未知时长'
      
      // 将分钟转换为秒
      const totalSeconds = Math.floor(minutes * 60)
      const hours = Math.floor(totalSeconds / 3600)
      const mins = Math.floor((totalSeconds % 3600) / 60)
      const secs = totalSeconds % 60
      
      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }
    },

    // extractNameFromPath 已移至 useVideoThumbnail composable

    // 打开视频文件夹
    async openVideoFolder(video) {
      try {
        if (!video.filePath) {
          await alertService.warning('视频文件路径不存在', '提示')
          return
        }
        
        if (window.electronAPI && window.electronAPI.openFileFolder) {
          const result = await window.electronAPI.openFileFolder(video.filePath)
          if (result.success) {
            console.log('已打开视频文件夹:', result.folderPath)
          } else {
            console.error('打开文件夹失败:', result.error)
            await alertService.error(`打开文件夹失败: ${result.error}`, '错误')
          }
        } else {
          // 降级处理：在浏览器中显示路径
          await alertService.info(`视频文件位置:\n${video.filePath}`, '文件位置')
        }
      } catch (error) {
        console.error('打开视频文件夹失败:', error)
        await alertService.error(`打开文件夹失败: ${error.message}`, '错误')
      }
    },

    // 更新视频时长
    async updateVideoDuration(video) {
      try {
        if (!video.filePath) {
          notify.toast('error', '更新失败', '视频文件路径不存在')
          return
        }

        console.log('🔄 开始更新视频时长:', video.name)

        // 使用 composable 的 getVideoDuration 方法
        const duration = await this.getVideoDuration(video.filePath)
        if (duration > 0) {
          // 使用 composable 的 updateVideo 方法更新视频数据
          await this.updateVideo(video.id, {
            ...video,
            duration: duration
          })
          
          // 重新加载视频列表
          await this.loadVideos()
          
          console.log('✅ 视频时长更新成功:', duration, '分钟')
        } else {
          console.warn('⚠️ 无法获取视频时长')
          notify.toast('error', '更新失败', '无法获取视频时长，请检查视频文件是否有效')
        }
      } catch (error) {
        console.error('更新视频时长失败:', error)
        notify.toast('error', '更新失败', `更新视频时长失败: ${error.message}`)
      }
    },

    // 手动批量更新所有未知时长的视频
    async batchUpdateAllDurations() {
      console.log('🔄 开始手动批量更新所有视频时长...')
      
      // 筛选出需要更新时长的视频
      const videosToUpdate = this.videos.filter(video => {
        return video.filePath && 
               video.fileExists !== false && 
               (!video.duration || video.duration === 0)
      })
      
      if (videosToUpdate.length === 0) {
        notify.toast('info', '无需更新', '所有视频都有时长信息')
        return
      }
      
      const shouldUpdate = await confirmService.confirm(
        `发现 ${videosToUpdate.length} 个视频需要更新时长。\n\n` +
        `这可能需要一些时间，是否要开始更新？\n\n` +
        `点击"确定"开始更新，点击"取消"取消操作。`,
        '确认更新'
      )
      
      if (!shouldUpdate) {
        console.log('⏭️ 用户取消了批量更新')
        return
      }
      
      let updatedCount = 0
      let failedCount = 0
      
      // 显示更新进度通知
      notify.toast(
        'info',
        '正在批量更新视频时长', 
        `正在更新 ${videosToUpdate.length} 个视频的时长，请稍候...`
      )
      
      // 批量更新视频时长
      for (const video of videosToUpdate) {
        try {
          console.log(`🔄 正在更新视频时长: ${video.name}`)
          
          const duration = await this.getVideoDuration(video.filePath)
          if (duration > 0) {
            // 更新视频数据
            await this.videoManager.updateVideo(video.id, {
              ...video,
              duration: duration
            })
            
            // 更新本地数据
            video.duration = duration
            updatedCount++
            
            console.log(`✅ 视频时长更新成功: ${video.name} - ${duration} 分钟`)
          } else {
            console.warn(`⚠️ 无法获取视频时长: ${video.name}`)
            failedCount++
          }
        } catch (error) {
          console.error(`❌ 更新视频时长失败: ${video.name}`, error)
          failedCount++
        }
        
        // 添加小延迟，避免过于频繁的操作
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 重新加载视频列表以保存更改
      await this.loadVideos()
      
      // 显示更新结果
      if (updatedCount > 0) {
        notify.toast(
          'success',
          '批量更新完成', 
          `成功更新 ${updatedCount} 个视频的时长${failedCount > 0 ? `，${failedCount} 个视频更新失败` : ''}`
        )
      } else if (failedCount > 0) {
        notify.toast(
          'error',
          '批量更新失败', 
          `所有 ${failedCount} 个视频的时长更新失败，请检查视频文件是否有效`
        )
      }
      
      console.log(`📊 批量视频时长更新完成: 成功 ${updatedCount} 个，失败 ${failedCount} 个`)
    },

     // getVideoDuration 已移至 useVideoDuration composable

     // generateThumbnail, buildFileUrl, generateThumbnailFilename, getMaxThumbnailNumber, deleteOldThumbnail 已移至 useVideoThumbnail composable

    // getMaxFolderVideoThumbnailNumber, checkVideoFileAccess 已移至 composables

    // 加载设置
    async loadSettings() {
      try {
        return await saveManager.loadSettings()
      } catch (error) {
        console.error('加载设置失败:', error)
        // 返回默认设置
        return {
          videoPlayMode: 'external'
        }
      }
    },

    // playVideoInternal, playVideoExternal 已移至 useVideoPlayback composable

    // 处理缩略图预览加载错误（使用 composable 的方法）
    async handleThumbnailPreviewError(event) {
      // 使用 composable 的 handleThumbnailPreviewError 方法
      await this.handleThumbnailPreviewError(event, this.editVideoForm.thumbnail)
    },

    // 处理缩略图预览加载成功
    handleThumbnailPreviewLoad(event) {
      console.log('缩略图预览加载成功')
      event.target.style.display = 'block'
    },

    // 关闭路径更新对话框
    closePathUpdateDialog() {
      this.showPathUpdateDialog = false
      this.pathUpdateInfo = {
        existingVideo: null,
        newPath: '',
        newFileName: ''
      }
    },

    // 确认路径更新
    async confirmPathUpdate() {
      try {
        const { existingVideo, newPath } = this.pathUpdateInfo
        
        if (!existingVideo || !newPath) {
          console.error('路径更新信息不完整')
          notify.toast('error', '更新失败', '路径更新信息不完整')
          return
        }
        
        console.log('开始更新视频路径:', existingVideo.name)
        console.log('从:', existingVideo.filePath)
        console.log('到:', newPath)
        
        // 更新视频路径
        existingVideo.filePath = newPath
        existingVideo.fileExists = true
        
        // 重新获取视频时长（如果之前没有）- 使用 composable 的方法
        if (!existingVideo.duration || existingVideo.duration === 0) {
          try {
            console.log('🔄 重新获取视频时长...')
            const duration = await this.getVideoDuration(newPath)
            if (duration > 0) {
              existingVideo.duration = duration
              console.log('✅ 视频时长更新成功:', duration, '分钟')
            }
          } catch (e) {
            console.warn('获取视频时长失败:', e)
          }
        }
        
        // 重新生成缩略图（如果之前没有）- 使用 composable 的方法
        if (!existingVideo.thumbnail || !existingVideo.thumbnail.trim()) {
          try {
            console.log('🔄 重新生成缩略图...')
            const thumbnail = await this.generateThumbnail(newPath, existingVideo.name, null)
            if (thumbnail) {
              existingVideo.thumbnail = thumbnail
              console.log('✅ 缩略图生成成功')
            }
          } catch (e) {
            console.warn('生成缩略图失败:', e)
          }
        }
        
        // 使用 composable 的 updateVideo 方法保存视频数据
        await this.updateVideo(existingVideo.id, existingVideo)
        
        // 重新加载视频列表
        await this.loadVideos()
        
        // 关闭对话框
        this.closePathUpdateDialog()
        
        // 成功时不显示通知，只在控制台记录
        console.log('✅ 视频路径更新成功:', existingVideo.name)
        
        notify.toast('success', '路径更新成功', `视频 "${existingVideo.name}" 的路径已更新`)
        
      } catch (error) {
        console.error('更新视频路径失败:', error)
        notify.toast('error', '更新失败', `更新视频路径失败: ${error.message}`)
      }
    },


    // extractAllFilters 已移至 useVideoFilter composable（通过 allTags, allActors, allSeries 计算属性自动提取）
    // 筛选方法已移至 useVideoFilter composable
    // filterByTag, excludeByTag, clearTagFilter, filterByActor, excludeByActor, clearActorFilter,
    // filterBySeries, excludeBySeries, clearSeriesFilter 已移至 composable
    
    // 处理来自 App.vue 的筛选器事件
    handleFilterEvent(event, data) {
      switch (event) {
        case 'filter-select':
          if (data.filterKey === 'tags') {
            this.filterByTag(data.itemName)
          } else if (data.filterKey === 'actors') {
            this.filterByActor(data.itemName)
          } else if (data.filterKey === 'series') {
            this.filterBySeries(data.itemName)
          } else if (data.filterKey === 'others') {
            this.filterByOther(data.itemName)
          }
          break
        case 'filter-exclude':
          if (data.filterKey === 'tags') {
            this.excludeByTag(data.itemName)
          } else if (data.filterKey === 'actors') {
            this.excludeByActor(data.itemName)
          } else if (data.filterKey === 'series') {
            this.excludeBySeries(data.itemName)
          } else if (data.filterKey === 'others') {
            this.excludeByOther(data.itemName)
          }
          break
        case 'filter-clear':
          if (data === 'tags') {
            this.clearTagFilter()
          } else if (data === 'actors') {
            this.clearActorFilter()
          } else if (data === 'series') {
            this.clearSeriesFilter()
          } else if (data === 'others') {
            this.clearOtherFilter()
          }
          break
      }
      // 更新筛选器数据
      this.updateFilterData()
    },
    
    // 更新筛选器数据到 App.vue（使用 composable 的 getFilterData）
    updateFilterData() {
      if (this.getFilterData) {
        this.$emit('filter-data-updated', this.getFilterData())
      }
    },
    async handleSortChanged({ pageType, sortBy }) {
      try {
        await saveManager.saveSortSetting(pageType, sortBy)
        console.log(`✅ 已保存${pageType}页面排序方式:`, sortBy)
      } catch (error) {
        console.warn('保存排序方式失败:', error)
      }
    },
    // loadSortSetting 已移至 useVideoFilter composable
    async loadSortSetting() {
      if (this.loadSortSetting) {
        await this.loadSortSetting()
      }
    },
    
    // 处理分页组件的事件（使用 composable 的 handlePageChange）
    handleVideoPageChange(pageNum) {
      if (this.handlePageChange) {
        this.handlePageChange(pageNum)
      }
    },
    
    // 更新视频列表分页信息（composable 会自动更新，这里只需要同步 filteredVideosRef）
    updateVideoPagination() {
      // 同步 filteredVideos 到 filteredVideosRef，composable 会自动更新分页
      if (this.filteredVideosRef && this.filteredVideos) {
        this.filteredVideosRef = this.filteredVideos
      }
      // 使用 composable 的 updatePagination
      if (this.updatePagination) {
        this.updatePagination()
      }
    },
    
    // 从设置中加载视频分页配置
    async loadVideoPaginationSettings() {
      try {
        const settings = await this.loadSettings()
        
        if (settings && settings.video) {
          const newVideoPageSize = parseInt(settings.video.listPageSize) || 20
          
          // 更新视频列表分页大小
          if (this.videoPageSize !== newVideoPageSize) {
            this.videoPageSize = newVideoPageSize
            
            // 重新计算视频列表分页
            this.updateVideoPagination()
            
            console.log('视频列表分页设置已更新:', {
              listPageSize: this.videoPageSize,
              totalVideoPages: this.totalVideoPages,
              currentVideoPage: this.currentVideoPage
            })
          }
        }
      } catch (error) {
        console.error('加载视频分页设置失败:', error)
        // 使用默认值
        this.videoPageSize = 20
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.video-view {
  display: flex;
  height: 100%;
  overflow: hidden;
}

// 视频主内容区域
.video-content {
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
      content: '拖拽视频文件或文件夹到这里添加（支持多选）';
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

// 工具栏样式
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: var(--spacing-md) 40px var(--spacing-md) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  width: 300px;
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-20);
  }
}

.search-icon {
  position: absolute;
  right: var(--spacing-md);
  color: var(--text-secondary);
  pointer-events: none;
}

.sort-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
}

// 视频网格样式
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  padding: 10px 0;
}

.video-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px var(--shadow-medium);
    border-color: var(--accent-color);

    .video-thumbnail img {
      transform: scale(1.05);
    }

    .video-overlay {
      opacity: 1;
    }
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-base);
  }
}

.duration-badge {
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

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all var(--transition-base);

  &:hover {
    background: white;
    transform: scale(1.1);
  }
}

.watch-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  transition: width var(--transition-base);
}

.video-info {
  padding: var(--spacing-xl);
}

.video-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.3;
}

.video-series {
  font-size: var(--font-size-base);
  color: var(--accent-color);
  margin: 0 0 5px 0;
  font-weight: 500;
}

.video-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}

.video-tag {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 4px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  border: 1px solid var(--border-color);
}

.video-tag-more {
  background: var(--accent-color-20);
  color: var(--accent-color);
  padding: 4px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}

.video-actors {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.actors-label {
  font-weight: 500;
  margin-right: 5px;
}

.video-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.watch-count {
  font-weight: 500;
  color: var(--text-primary);
}

.added-date {
  font-size: 11px;
  color: var(--text-tertiary);
}


// 空状态样式
.empty-state {
  text-align: center;
  padding: 60px var(--spacing-xl);
  color: var(--text-secondary);

  h3 {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
  }

  p {
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-3xl);
  }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-xl);
  opacity: 0.5;
}

.btn-add-first-video {
  padding: var(--spacing-md) var(--spacing-2xl);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
  }
}

// 模态框样式
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
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-dark);
}

.video-detail-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
  }
}


.modal-body {
  padding: var(--spacing-xl);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

// 表单样式
.form-group {
  margin-bottom: var(--spacing-xl);

  label {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-weight: 500;
    font-size: var(--font-size-base);
  }

  input,
  textarea {
    width: 100%;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    transition: all var(--transition-base);
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-color-20);
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.file-input-group {
  display: flex;
  gap: var(--spacing-md);

  input {
    flex: 1;
  }
}

.btn-select-file {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
  }
}

.thumb-preview-wrapper {
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.thumb-preview {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.thumb-placeholder {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

// 按钮样式
.btn-cancel {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: var(--bg-tertiary);
  }
}

.btn-confirm {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-hover);
  }
}


.btn-open-folder {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-base);

  &:hover {
    background: var(--bg-secondary);
  }
}

.btn-update-duration {
  background: #17a2b8;
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-base);

  &:hover {
    background: #138496;
    transform: translateY(-1px);
  }
}

// 视频详情样式
.video-detail-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--spacing-3xl);
}

.video-detail-thumbnail {
  img {
    width: 100%;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }
}

.video-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  h4 {
    color: var(--text-primary);
    font-size: var(--font-size-md);
    margin: 0 0 var(--spacing-md) 0;
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-base);
    line-height: 1.5;
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 6px var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  border: 1px solid var(--border-color);
}

// 标签输入样式
.tags-input-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  padding: var(--spacing-sm);
  transition: all var(--transition-base);

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-20);
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

// 文件夹视频列表样式
.folder-videos-section {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);

  h4 {
    margin: 0 0 var(--spacing-xl) 0;
    color: var(--text-primary);
    font-size: var(--font-size-md);
    font-weight: 600;
  }
}

.folder-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  max-height: 500px;
  overflow-y: auto;
  padding: 4px;
}

.folder-video-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px var(--shadow-medium);
    border-color: var(--accent-color);

    .folder-video-thumbnail img {
      transform: scale(1.05);
    }

    .video-overlay {
      opacity: 1;
    }
  }
}

.folder-video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 aspect ratio
  overflow: hidden;
  background: var(--bg-secondary);
}

.folder-video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-base);
  }

  &.placeholder {
    font-size: 48px;
    color: var(--text-tertiary);
    background: var(--bg-secondary);
  }
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.overlay-action-button {
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
}

.folder-video-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.video-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 40px;
}

.video-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.action-button {
  padding: 6px var(--spacing-md);
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--transition-base);
  border: 1px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.generate-thumbnail-btn {
  background: var(--bg-tertiary);

  &:hover:not(:disabled) {
    background: #17a2b8;
    border-color: #17a2b8;
    color: white;
  }
}

.no-videos {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);

  p {
    margin: 0;
    font-style: italic;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .video-detail-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .modal-content {
    width: 95%;
    margin: var(--spacing-xl);
  }

  .folder-videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    max-height: 400px;
    gap: var(--spacing-md);
  }

  .folder-video-info {
    padding: var(--spacing-sm);
  }

  .video-name {
    font-size: var(--font-size-sm);
    min-height: 32px;
  }

  .action-button {
    padding: 4px var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}

</style>
