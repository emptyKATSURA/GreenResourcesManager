<template>
        <BaseView
          ref="baseView"
          :items="audios"
          :filtered-items="filteredAudios"
          :empty-state-config="emptyStateConfig"
          :toolbar-config="toolbarConfig"
          :context-menu-items="contextMenuItems"
          :pagination-config="paginationConfig"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @empty-state-action="handleEmptyStateAction"
          @add-item="showAddDialogHandler"
          @sort-changed="handleSortChanged"
          @search-query-changed="handleSearchQueryChanged"
          @sort-by-changed="handleSortByChanged"
          @context-menu-click="handleContextMenuClick"
          @page-change="handlePageChange"
          :scale="scale"
          :show-layout-control="true"
          @update:scale="updateScale"
        >
    <!-- 音频主内容区域 -->
    <div 
      class="audio-content"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragOver }"
    >
      
      <!-- 主要内容区域 -->
      <div class="audio-main-content">
        <!-- 音频列表 -->
        <AudioGrid
          :audios="paginatedAudios"
          :isElectronEnvironment="true"
          :scale="scale"
          :layout-styles="layoutStyles"
          @audio-click="showAudioDetail"
          @audio-contextmenu="(event, audio) => ($refs.baseView as any).showContextMenuHandler(event, audio)"
          @audio-action="playAudio"
        />
      </div>
    </div>

    <!-- 添加音频对话框 -->
    <ResourcesEditDialog
      :visible="showAddDialog"
      mode="add"
      :resource-class="Audio"
      :is-electron-environment="true"
      :available-tags="allTags"
      add-title="添加音频"
      edit-title="编辑音频"
      add-button-text="添加"
      edit-button-text="保存修改"
      :custom-validation="(formData, isEditMode) => {
        return formData.filePath && formData.filePath.trim() !== ''
      }"
      :custom-confirm-handler="handleAddAudioCustomConfirm"
      @close="closeAddDialog"
      @confirm="handleAddAudioConfirm"
    />

    <!-- 音频详情对话框 -->
    <DetailPanel
          :visible="showDetailDialog && !!selectedItem"
          :item="selectedItem"
      type="audio"
      :stats="itemStats"
      :actions="itemActions"
      :on-update-resource="updateAudioResource"
      @close="closeAudioDetail"
      @action="handleDetailAction"
    />

    <!-- 编辑音频对话框 -->
    <ResourcesEditDialog
      :key="'edit-dialog-' + (editForm?.id || 'new')"
      :visible="showEditDialog"
      mode="edit"
      :resource-class="Audio"
      :resource-data="editForm"
      :is-electron-environment="true"
      :available-tags="allTags"
      add-title="添加音频"
      edit-title="编辑音频"
      add-button-text="添加"
      edit-button-text="保存修改"
      @close="closeEditDialog"
      @confirm="handleEditAudioConfirm"
    />


    <!-- 路径更新确认对话框 -->
    <PathUpdateDialog
      :visible="showPathUpdateDialog"
      title="更新音频路径"
      description="发现同名但路径不同的音频文件："
      item-name-label="音频名称"
      :item-name="pathUpdateInfo.existingItem?.name || ''"
      :old-path="pathUpdateInfo.existingItem?.filePath || ''"
      :new-path="pathUpdateInfo.newPath || ''"
      missing-label="文件丢失"
      found-label="文件存在"
      question="是否要更新音频路径？"
      @confirm="confirmPathUpdate"
      @cancel="closePathUpdateDialog"
    />
  </BaseView>
</template>

<script lang="ts">
import audioManager from '../../utils/AudioManager.js'
import BaseView from '../../components/BaseView.vue'
import FormField from '../../components/FormField.vue'
import AudioGrid from '../../components/audio/AudioGrid.vue'
import DetailPanel from '../../components/DetailPanel.vue'
import PathUpdateDialog from '../../components/PathUpdateDialog.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { Audio } from '../../class/audio.ts'

import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import confirmService from '../../utils/ConfirmService.ts'
import { useAudioDuration } from '../../composables/audio/useAudioDuration'
import { useAudioDragDrop } from '../../composables/audio/useAudioDragDrop'
import { useAudioManagement } from '../../composables/audio/useAudioManagement'
import { useAudioFilter } from '../../composables/audio/useAudioFilter'
import { useAudioPlayback } from '../../composables/audio/useAudioPlayback'
import { useDisplayLayout } from '../../composables/useDisplayLayout'
import { createResourcePage } from '../../composables/createResourcePage'
import { formatDuration as formatDurationUtil } from '../../utils/formatters.ts'
import { ref, computed, watch } from 'vue'

export default {
  name: 'AudioView',
  components: {
    BaseView,
    FormField,
    AudioGrid,
    DetailPanel,
    PathUpdateDialog,
    ResourcesEditDialog
  },
  emits: ['filter-data-updated'],
  setup() {
    // 初始化音频时长 composable
    const { getAudioDuration } = useAudioDuration()

    // 使用显示布局 composable
    const displayLayoutComposable = useDisplayLayout(80, 280)
    
    // 初始化音频管理 composable
    const audioManagement = useAudioManagement()
    
    // 初始化音频筛选 composable
    // 注意：onFilterDataUpdated 需要在组件实例化后设置，所以先传一个占位函数
    const audioFilter = useAudioFilter({
      audios: audioManagement.audios,
      onFilterDataUpdated: (data) => {
        // 这个回调将在 mounted 中重新设置
      }
    })
    
    // 路径更新对话框状态（需要在 setup 中定义，以便传递给 composable）
    const showPathUpdateDialog = ref(false)
    const pathUpdateInfo = ref({
      existingAudio: null,
      newPath: '',
      newFileName: ''
    })
    
    // 音频拖拽 composable 将在 methods 中初始化（因为需要访问 this）
    let audioDragDropComposable: ReturnType<typeof useAudioDragDrop> | null = null
    
    // 初始化音频播放 composable
    const audioPlayback = useAudioPlayback({
      audios: audioManagement.audios,
      onIncrementPlayCount: audioManagement.incrementPlayCount
    })

    // ========== 工具函数 ==========
    const formatDate = (dateString: string) => {
      if (!dateString) return '未知'
      try {
        return new Date(dateString).toLocaleDateString('zh-CN')
      } catch {
        return '未知'
      }
    }

    const extractNameFromPath = (filePath: string) => {
      if (!filePath) return ''
      const normalized = filePath.replace(/\\/g, '/')
      const filename = normalized.substring(normalized.lastIndexOf('/') + 1)
      const dotIndex = filename.lastIndexOf('.')
      return dotIndex > 0 ? filename.substring(0, dotIndex) : filename
    }

    const getThumbnailUrl = (thumbnailPath: string) => {
      if (!thumbnailPath) return ''
      if (window.electronAPI?.getFileUrl) {
        return window.electronAPI.getFileUrl(thumbnailPath)
      }
      return thumbnailPath.startsWith('file://') ? thumbnailPath : `file://${thumbnailPath}`
    }

    // ========== 使用工厂函数创建资源页面 ==========
    const resourcePage = createResourcePage({
      pageConfig: {
        pageType: 'audio',
        itemType: '音频',
        defaultPageSize: 20,
        defaultSortBy: 'name'
      },
      items: audioManagement.audios,
      filteredItems: audioFilter.filteredAudios,
      searchQuery: audioFilter.searchQuery,
      sortBy: audioFilter.sortBy,
      crudConfig: {
        items: audioManagement.audios,
        onAdd: audioManagement.addAudio,
        onUpdate: audioManagement.updateAudio,
        onDelete: audioManagement.deleteAudio,
        onLoad: audioManagement.loadAudios,
        onSave: audioManagement.saveAudios,
        getItemName: (audio: any) => audio.name,
        itemType: '音频'
      },
      contextMenuItems: [
        { key: 'detail', icon: '👁️', label: '查看详情' },
        { key: 'play', icon: '▶️', label: '播放' },
        { key: 'addToPlaylist', icon: '➕', label: '添加到播放列表' },
        { key: 'folder', icon: '📁', label: '打开文件夹' },
        { key: 'edit', icon: '✏️', label: '编辑信息' },
        { key: 'delete', icon: '🗑️', label: '删除音频' }
      ],
      contextMenuHandlers: {
        detail: (audio: any) => resourcePage.showDetail(audio),
        play: (audio: any) => audioPlayback.playAudio(audio),
        addToPlaylist: (audio: any) => audioPlayback.addToPlaylist(audio),
        folder: (audio: any) => audioPlayback.openAudioFolder(audio),
        edit: (audio: any) => resourcePage.showEdit(audio),
        delete: (audio: any) => resourcePage.deleteItem(audio)
      },
      emptyState: {
        icon: '🎵',
        title: '你的音频库是空的',
        description: '点击"添加音频"按钮来添加你的第一个音频',
        buttonText: '添加第一个音频',
        buttonAction: 'showAddDialog'
      },
      toolbar: {
        addButtonText: '添加音频',
        searchPlaceholder: '搜索音频...',
        sortOptions: [
          { value: 'name', label: '按名称' },
          { value: 'artist', label: '按艺术家' },
          { value: 'playCount', label: '按播放次数' },
          { value: 'addedDate', label: '按添加时间' }
        ]
      },
      displayLayout: {
        minWidth: 80,
        maxWidth: 280
      },
      getStats: (audio: any) => [
        { label: '艺术家', value: audio.artist || '未知' },
        { label: '时长', value: formatDurationUtil(audio.duration) },
        { label: '播放次数', value: `${audio.playCount || 0} 次` },
        { label: '添加时间', value: formatDate(audio.addedDate) }
      ],
      getActions: (audio: any) => {
        const actions = [
          { key: 'play', icon: '▶️', label: '播放', class: 'btn-play' },
          { key: 'addToPlaylist', icon: '➕', label: '添加到播放列表', class: 'btn-add-to-playlist' },
          { key: 'folder', icon: '📁', label: '打开文件夹', class: 'btn-open-folder' },
          { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
          { key: 'remove', icon: '🗑️', label: '删除音频', class: 'btn-remove' }
        ]
        
        // 如果没有时长，添加更新时长按钮
        if (!audio.duration || audio.duration === 0) {
          actions.splice(2, 0, { key: 'updateDuration', icon: '⏱️', label: '更新时长', class: 'btn-update-duration' })
        }
        
        return actions
      }
    })

    // ========== 拖拽处理 ==========
    const audioDragDrop = useAudioDragDrop({
      audios: audioManagement.audios,
      onAddAudio: audioManagement.addAudio,
      onShowPathUpdateDialog: ((info: any) => {
        // 适配器：将 audio 类型的 PathUpdateInfo 转换为通用类型
        resourcePage.showPathUpdateDialogHandler({
          existingItem: info.existingAudio || info.existingItem,
          newPath: info.newPath,
          newFileName: info.newFileName || info.newPath?.split(/[/\\]/).pop() || ''
        })
      }) as any,
      onReloadData: audioManagement.loadAudios,
      extractAudioNameFromPath: extractNameFromPath
    })

    // 创建统一的资源更新函数（用于 DetailPanel）
    const updateAudioResource = async (id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) => {
      await audioManagement.updateAudio(id, updates)
    }

    // ========== 监听筛选结果变化，更新分页 ==========
    // 注意：分页的 watch 已在 usePagination 内部处理，这里不需要额外监听
    // 如果需要手动触发，可以使用 resourcePage.updatePagination()
    
    // ========== 监听搜索和排序变化，重置到第一页 ==========
    watch([audioFilter.searchQuery, audioFilter.sortBy], () => {
      resourcePage.resetToFirstPage()
    })

    return {
      getAudioDuration,
      // 音频管理相关
      audios: audioManagement.audios,
      isLoading: audioManagement.isLoading,
      loadAudiosFromComposable: audioManagement.loadAudios,
      saveAudios: audioManagement.saveAudios,
      addAudioToManager: audioManagement.addAudio,
      updateAudioInManager: audioManagement.updateAudio,
      deleteAudioFromManager: audioManagement.deleteAudio,
      incrementPlayCountInManager: audioManagement.incrementPlayCount,
      checkFileExistence: audioManagement.checkFileExistence,
      getAudioManager: audioManagement.getAudioManager,
      // 音频筛选相关
      searchQuery: audioFilter.searchQuery,
      sortBy: audioFilter.sortBy,
      selectedTags: audioFilter.selectedTags,
      excludedTags: audioFilter.excludedTags,
      selectedArtists: audioFilter.selectedArtists,
      excludedArtists: audioFilter.excludedArtists,
      allTags: audioFilter.allTags,
      allArtists: audioFilter.allArtists,
      filteredAudios: audioFilter.filteredAudios,
      filterByTag: audioFilter.filterByTag,
      excludeByTag: audioFilter.excludeByTag,
      clearTagFilter: audioFilter.clearTagFilter,
      filterByArtist: audioFilter.filterByArtist,
      excludeByArtist: audioFilter.excludeByArtist,
      clearArtistFilter: audioFilter.clearArtistFilter,
      handleFilterEvent: audioFilter.handleFilterEvent,
      updateFilterData: audioFilter.updateFilterData,
      setFilterDataUpdatedCallback: audioFilter.setFilterDataUpdatedCallback,
      // 音频播放相关
      playAudio: audioPlayback.playAudio,
      addToPlaylist: audioPlayback.addToPlaylist,
      openAudioFolder: audioPlayback.openAudioFolder,
      // 资源页面（使用工厂函数创建，包含分页、CRUD、右键菜单、配置等）
      ...resourcePage,
      // 统一的资源更新函数
      updateAudioResource,
      // 工具函数
      formatDate,
      extractNameFromPath,
      getThumbnailUrl,
      // 拖拽相关
      ...audioDragDrop
    }
  },
  data() {
    return {
      // Audio 类用于 ResourcesEditDialog
      Audio: Audio.EditableAudioProperties,
    }
  },
  computed: {
    // 分页显示的音频列表（使用 composable 的 paginatedItems）
    paginatedAudios() {
      return this.paginatedItems
    }
  },
  methods: {
    async loadAudios() {
      try {
        // 调用 composable 的 loadAudios 方法
        await this.loadAudiosFromComposable()

        // 更新筛选器数据
        this.updateFilterData()
        
        // 检测文件存在性（仅在应用启动时检测一次）
        if (this.$root.shouldCheckFileLoss && this.$root.shouldCheckFileLoss()) {
          this.$root.markFileLossChecked()
          Promise.resolve()
            .then(() => this.checkFileExistence())
            .catch((e) => {
              console.warn('[AudioView] 后台检测文件存在性失败:', e)
            })
            .finally(() => {
              this.updateFilterData()
            })
        }
        
        // 更新分页（使用 composable 的方法）
        this.updatePagination()
      } catch (error: any) {
        console.error('加载音频数据失败:', error)
        notify.toast('error', '加载失败', '加载音频数据失败: ' + error.message)
      }
    },
    
    // checkFileExistence, updateFilterOptions, filterByTag, excludeByTag, clearTagFilter, 
    // filterByArtist, excludeByArtist, clearArtistFilter, handleFilterEvent, updateFilterData 已移至 composables
    
    // 添加音频时的自定义确认处理（在 ResourcesEditDialog 的 confirm 事件之前执行）
    async handleAddAudioCustomConfirm(formData: any): Promise<any> {
      const audioData = { ...formData }
      
      // 如果名称为空，从文件路径提取
      if (!audioData.name || audioData.name.trim() === '') {
        if (audioData.filePath) {
          audioData.name = this.extractNameFromPath(audioData.filePath)
        }
      }
      
      // 如果文件路径存在，自动获取音频时长
      if (audioData.filePath) {
        try {
          audioData.duration = await this.getAudioDuration(audioData.filePath)
        } catch (error) {
          console.warn('获取音频时长失败:', error)
          audioData.duration = 0
        }
      }
      
      // 设置默认值
      audioData.playCount = 0
      audioData.addedDate = new Date().toISOString()
      
      return audioData
    },
    
    // handleAddAudioConfirm 使用 crud.handleAddConfirm，但需要保留验证逻辑
    async handleAddAudioConfirm(audioData: any) {
      if (!audioData.filePath) {
        notify.toast('error', '添加失败', '请选择音频文件')
        return
      }
      await this.handleAddConfirm(audioData)
    },
    
    // deleteAudio 使用 crud.deleteItem（已包含确认对话框和通知）
    async deleteAudio(audio: any) {
      await this.deleteItem(audio)
    },
    
    // showAudioDetail 使用 crud.showDetail，但需要保留关闭菜单逻辑
    showAudioDetail(audio: any) {
      this.showDetail(audio)
      // 关闭上下文菜单（如果存在）
      if (this.$refs.baseView) {
        (this.$refs.baseView as any).showContextMenu = false
      }
    },
    
    // closeAudioDetail 使用 crud.closeDetail
    closeAudioDetail() {
      this.closeDetail()
    },
    handleDetailAction(actionKey, audio) {
      switch (actionKey) {
        case 'play':
          this.playAudio(audio)
          break
        case 'addToPlaylist':
          this.addToPlaylist(audio)
          break
        case 'updateDuration':
          this.updateAudioDuration(audio)
          break
        case 'folder':
          this.openAudioFolder(audio)
          break
        case 'edit':
          this.editAudio(audio)
          break
        case 'remove':
          this.deleteAudio(audio)
          break
      }
    },
    
    // closeAddDialog 已在 setup() 中通过 resourcePage 返回，无需重新定义
    
    // handleContextMenuClick 使用 contextMenu.handleContextMenuClick
    handleContextMenuClick(data: any) {
      this.handleContextMenuClick(data)
    },
    
    // handleEmptyStateAction 使用 resourcePage.handleEmptyStateAction
    // 但需要包装以处理特定的 actionName
    handleEmptyStateAction(actionName: string) {
      if (actionName === 'showAddDialog') {
        this.showAddDialogHandler()
      }
    },
    
    // editAudio 使用 crud.showEdit，但需要保留业务特定逻辑
    editAudio(audio: any) {
      this.showEdit(audio)
      // 关闭上下文菜单（如果存在）
      if (this.$refs.baseView) {
        (this.$refs.baseView as any).showContextMenu = false
      }
    },
    
    // closeEditDialog 使用 crud.closeEdit
    closeEditDialog() {
      this.closeEdit()
    },
    
    // 保存编辑
    // handleEditAudioConfirm 使用 crud.handleEditConfirm，但需要保留验证逻辑
    async handleEditAudioConfirm(updatedAudio: any) {
      if (!updatedAudio.name || !updatedAudio.name.trim()) {
        await alertService.warning('请输入音频名称', '提示')
        return
      }
      
      // 确保 actors 是数组
      if (updatedAudio.actors && !Array.isArray(updatedAudio.actors)) {
        updatedAudio.actors = []
      }
      
      // 确保 tags 是数组
      if (updatedAudio.tags && !Array.isArray(updatedAudio.tags)) {
        updatedAudio.tags = []
      }
      
      await this.handleEditConfirm(updatedAudio)
    },
    
    async handleToggleFavorite(audio) {
      // 检查 audio 是否存在，避免在面板关闭时触发更新
      if (!audio || !audio.id) {
        return
      }
      try {
        const newFavoriteStatus = !audio.isFavorite
        await this.updateAudioInManager(audio.id, { isFavorite: newFavoriteStatus })
        // 更新当前音频对象，以便详情面板立即显示新状态
        if (this.selectedItem && this.selectedItem.id === audio.id) {
          this.selectedItem.isFavorite = newFavoriteStatus
        }
      } catch (error: any) {
        console.error('切换收藏状态失败:', error)
        await alertService.error('切换收藏状态失败: ' + error.message, '错误')
      }
    },
    
    // formatDuration 和 formatDate 已在 setup() 中定义

    // 更新音频时长
    async updateAudioDuration(audio) {
      try {
        if (!audio.filePath) {
          await alertService.warning('音频文件路径不存在', '提示')
          return
        }
        
        console.log('🔄 开始更新音频时长:', audio.name)
        const duration = await this.getAudioDuration(audio.filePath)
        
        if (duration > 0) {
          // 更新音频数据
          await this.updateAudioInManager(audio.id, { duration })
          
          // 更新本地数据
          const index = this.audios.findIndex(a => a.id === audio.id)
          if (index !== -1) {
            this.audios[index].duration = duration
          }
          
          // 更新选中的音频数据
          if (this.selectedItem && this.selectedItem.id === audio.id) {
            this.selectedItem.duration = duration
          }
          
          console.log('✅ 音频时长更新成功:', duration, '秒')
          notify.native('时长更新成功', `音频时长已更新为: ${this.formatDuration(duration)}`)
        } else {
          await alertService.warning('无法获取音频时长，请检查文件是否有效', '提示')
        }
      } catch (error) {
        console.error('更新音频时长失败:', error)
        await alertService.error('更新音频时长失败: ' + error.message, '错误')
      }
    },

    
    extractNameFromPath(filePath) {
      if (!filePath) return ''
      const normalized = filePath.replace(/\\/g, '/')
      const filename = normalized.substring(normalized.lastIndexOf('/') + 1)
      const dotIndex = filename.lastIndexOf('.')
      return dotIndex > 0 ? filename.substring(0, dotIndex) : filename
    },
    
    // 拖拽方法已在 setup() 中通过 audioDragDrop 暴露（handleDragOver, handleDragEnter, handleDragLeave, handleDrop）

    // 路径更新相关方法
    closePathUpdateDialog() {
      this.showPathUpdateDialog = false
      this.pathUpdateInfo = {
        existingAudio: null,
        newPath: '',
        newFileName: ''
      }
    },
    
    async confirmPathUpdate() {
      try {
        const { existingAudio, newPath } = this.pathUpdateInfo
        
        if (!existingAudio || !newPath) {
          console.error('路径更新信息不完整')
          notify.toast('error', '更新失败', '路径更新信息不完整')
          return
        }
        
        console.log(`更新音频 "${existingAudio.name}" 的路径:`)
        console.log(`旧路径: ${existingAudio.filePath}`)
        console.log(`新路径: ${newPath}`)
        
        // 更新音频路径
        existingAudio.filePath = newPath
        existingAudio.fileExists = true
        
        // 重新获取音频时长（如果之前没有）
        if (!existingAudio.duration || existingAudio.duration === 0) {
          try {
            console.log('🔄 重新获取音频时长...')
            const duration = await this.getAudioDuration(newPath)
            if (duration > 0) {
              existingAudio.duration = duration
              console.log('✅ 音频时长更新成功:', duration, '秒')
            }
          } catch (e) {
            console.warn('获取音频时长失败:', e)
          }
        }
        
        // 保存更新后的数据
        await this.updateAudioInManager(existingAudio.id, {
          filePath: newPath,
          fileExists: true,
          duration: existingAudio.duration
        })
        
        // 重新加载音频列表
        await this.loadAudios()
        
        // 关闭对话框
        this.closePathUpdateDialog()
        
        // 显示成功通知
        notify.toast(
          'success',
          '路径更新成功', 
          `音频 "${existingAudio.name}" 的路径已更新`
        )
        
        console.log(`音频 "${existingAudio.name}" 路径更新完成`)
        
      } catch (error) {
        console.error('更新音频路径失败:', error)
        notify.toast('error', '更新失败', `更新音频路径失败: ${error.message}`)
      }
    },
    // handleSortChanged 使用 resourcePage.handleSortChanged（已在 setup() 中暴露）
    // loadSortSetting 使用 resourcePage.loadSortSetting（已在 setup() 中暴露）
    
    // handleAudioPageChange 使用 pagination.handlePageChange（已在 setup() 中暴露）
    // updateAudioPagination 使用 pagination.updatePagination（已在 setup() 中暴露）
    // loadAudioPaginationSettings 使用 pagination.loadPaginationSettings（已在 setup() 中暴露）
  },
  // watch 已移至 setup() 中，使用 composables 的 watch
  async mounted() {
    // 设置筛选器数据更新回调
    this.setFilterDataUpdatedCallback((data) => {
      this.$emit('filter-data-updated', data)
    })
    
    await this.loadAudios()
    
    // 加载分页设置（使用 composable 的方法）
    await this.loadPaginationSettings('audio')
    
    // 加载排序设置（使用 composable 的方法）
    await this.loadSortSetting()
    
    // 初始化筛选器数据
    this.updateFilterData()
  }
}
</script>

<style lang="scss" scoped>
// 音频主内容区域
.audio-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  position: relative;
  transition: all 0.3s ease;

  &.drag-over {
    background-color: rgba(102, 192, 244, 0.1);
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed var(--accent-color);
    border-radius: 12px;

    &::before {
      content: '拖拽音频文件到这里添加音频（支持多选）';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--accent-color);
      color: white;
      padding: 20px 40px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      pointer-events: none;
    }
  }
}

// 主要内容区域
.audio-main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 120px);
  padding: 20px;
  box-sizing: border-box;
}

// 工具栏样式
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

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.search-icon {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.sort-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
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
  z-index: 1000;
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

  h3 {
    color: var(--text-primary);
    margin: 0;
  }
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

// 表单样式
.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 5px;
    color: var(--text-primary);
    font-weight: 500;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.file-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.file-path-input {
  flex: 1;
}

.btn-browse {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;

  &:hover {
    background: var(--accent-hover);
  }
}

// 按钮样式
.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
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

  &:hover {
    background: var(--accent-hover);
  }
}

// 音频详情样式
.audio-detail-modal {
  max-width: 800px;
}

.audio-detail-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
}

.audio-detail-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
}

.audio-detail-icon {
  font-size: 4rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.audio-detail-info {
  flex: 1;
}

.detail-section {
  margin-bottom: 25px;

  h4 {
    color: var(--text-primary);
    margin-bottom: 15px;
    font-size: 1.1rem;
  }
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

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: var(--accent-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.notes-text {
  color: var(--text-primary);
  line-height: 1.5;
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: 8px;
  margin: 0;
}

// 详情按钮样式（已移至公共样式文件）

.btn-add-to-playlist {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;

  &:hover {
    background: #7c3aed;
  }
}

.btn-update-duration {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: #138496;
    transform: translateY(-1px);
  }
}

// 标签输入样式
.tags-input-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background: var(--accent-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  gap: 4px;
}

.tag-text {
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.tag-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  padding: 4px 0;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.tag-hint {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  margin-top: 4px;
}

// 演员标签样式
.actor-tag {
  background: #8b5cf6 !important;
}

// 缩略图预览样式
.thumbnail-preview {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-light);
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .audio-detail-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>