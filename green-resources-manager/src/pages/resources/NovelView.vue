<template>
        <BaseView
          ref="baseView"
          :items="novels"
          :filtered-items="filteredNovels"
          :empty-state-config="novelEmptyStateConfig"
          :toolbar-config="novelToolbarConfig"
          :context-menu-items="novelContextMenuItems"
          :pagination-config="novelPaginationConfig"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @empty-state-action="handleEmptyStateAction"
          @add-item="showAddNovelDialog"
          @sort-changed="handleSortChanged"
          @search-query-changed="handleSearchQueryChanged"
          @sort-by-changed="handleSortByChanged"
          @context-menu-click="handleContextMenuClick"
          @page-change="handleNovelPageChange"
          :scale="scale"
          :show-layout-control="true"
          @update:scale="updateScale"
        >
    <!-- 主内容区域 -->
    <div 
      class="novel-content"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragOver }"
    >
      
      <!-- 主要内容区域 -->
      <div class="novel-main-content">
        <!-- 小说列表 -->
        <div class="novel-list-section">
          <!-- 小说网格 -->
          <div class="novels-grid" v-if="paginatedNovels.length > 0" :style="layoutStyles">
            <MediaCard
              v-for="novel in paginatedNovels" 
              :key="novel.id"
              :item="novel"
              type="novel"
              :isElectronEnvironment="true"
              :file-exists="novel.fileExists"
              :scale="scale"
              @click="showNovelDetail"
              @contextmenu="(event) => ($refs.baseView as any).showContextMenuHandler(event, novel)"
              @action="handleNovelClick"
            />
          </div>
        </div>
      </div>

      <!-- 悬浮阅读器区域 -->
      <div v-if="currentReadingNovel" class="novel-reader-overlay" @click="closeReader">
        <div class="novel-reader-content" @click.stop>
          <div class="reader-header">
            <div class="reader-title">
              <h3>{{ currentReadingNovel.name }}</h3>
              <p class="reader-author">{{ currentReadingNovel.author }}</p>
            </div>
            <div class="reader-controls">
              <button class="btn-close-reader" @click="closeReader" title="关闭阅读器">
                <span class="btn-icon">✕</span>
              </button>
            </div>
          </div>

          <div class="reader-content" ref="readerContent">
            <!-- PDF 文件使用 PDF 阅读器 -->
            <PdfReader
              v-if="currentReadingNovel?.fileType === 'pdf'"
              :file-path="currentReadingNovel.filePath"
              :initial-page="currentReadingNovel.currentPage || 1"
              @page-changed="handlePdfPageChanged"
            />
            <!-- TXT 文件使用文本阅读器 -->
            <TextReader
              v-else-if="currentReadingNovel?.fileType === 'txt'"
              :file-path="currentReadingNovel.filePath"
              :initial-page="currentReadingNovel.currentPage || 1"
              @page-changed="handleTextPageChanged"
              @progress-changed="handleTextProgressChanged"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 小说对话框（添加/编辑） -->
    <ResourcesEditDialog 
      :visible="showAddDialog" 
      mode="add"
      :resource-class="Novel"
      :is-electron-environment="true"
      :available-tags="allTags"
      add-title="添加小说"
      edit-title="编辑小说"
      add-button-text="添加小说"
      edit-button-text="保存修改"
      :custom-confirm-handler="handleAddNovelCustomConfirm"
      :custom-validation="(formData, isEditMode) => {
        if (isEditMode) return true
        const filePath = formData.filePath
        return filePath && filePath.trim() !== ''
      }"
      @close="closeAddNovelDialog"
      @confirm="handleAddNovelConfirm"
    />

    <ResourcesEditDialog 
      :visible="showEditDialog" 
      mode="edit"
      :resource-class="Novel"
      :resource-data="editNovelForm"
      :available-tags="allTags"
      add-title="添加小说"
      edit-title="编辑小说"
      add-button-text="添加小说"
      edit-button-text="保存修改"
      @close="closeEditNovelDialog"
      @confirm="handleEditNovelConfirm"
    />

    <!-- 小说详情页面 -->
    <DetailPanel
      :visible="showDetailModal"
      :item="currentNovel"
      type="novel"
      :stats="novelStats"
      :actions="novelActions"
      :on-update-resource="updateNovelResource"
      @close="closeNovelDetail"
      @action="handleDetailAction"
    />
    

    <!-- 路径更新确认对话框 -->
    <PathUpdateDialog
      :visible="showPathUpdateDialog"
      title="更新小说路径"
      description="发现同名但路径不同的小说文件："
      item-name-label="小说名称"
      :item-name="pathUpdateInfo.existingNovel?.name || ''"
      :old-path="pathUpdateInfo.existingNovel?.filePath || ''"
      :new-path="pathUpdateInfo.newPath || ''"
      missing-label="文件丢失"
      found-label="文件存在"
      question="是否要更新小说路径？"
      @confirm="confirmPathUpdate"
      @cancel="closePathUpdateDialog"
    />

    <!-- EPUB阅读器V2悬浮窗口 -->
    <div v-if="showEbookReaderV2" class="novel-reader-overlay" @click="closeEbookReaderV2">
      <div class="novel-reader-content" @click.stop>
        <div class="reader-header">
          <div class="reader-title">
            <h3>{{ getNovelNameByPath(ebookReaderV2FilePath) }}</h3>
          </div>
          <div class="reader-controls">
            <button class="btn-close-reader" @click="closeEbookReaderV2" title="关闭阅读器">
              <span class="btn-icon">✕</span>
            </button>
          </div>
        </div>
        <div class="reader-content-wrapper ebook-reader-v2-content">
          <!-- 左侧章节导航栏 -->
          <div class="chapter-navigation-sidebar">
            <div class="chapter-nav-header">
              <h4>章节列表</h4>
            </div>
            <ContentView
              :ifShowContent="true"
              :navigation="ebookNavigation"
              :bookAvailable="ebookBookAvailable"
              @jumpTo="handleEbookJumpTo"
            />
          </div>
          <!-- 右侧阅读器 -->
          <div class="reader-content-main">
            <EbookReader
              ref="ebookReader"
              :file-path="ebookReaderV2FilePath"
              @close="closeEbookReaderV2"
              @navigation-updated="handleNavigationUpdated"
              @rendition-ready="handleRenditionReady"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseView>
</template>

<script lang="ts">
import novelManager from '../../utils/NovelManager.js'
import BaseView from '../../components/BaseView.vue'
import FormField from '../../components/FormField.vue'
import MediaCard from '../../components/MediaCard.vue'
import DetailPanel from '../../components/DetailPanel.vue'
import PathUpdateDialog from '../../components/PathUpdateDialog.vue'
import PdfReader from '../../components/PdfReader.vue'
import TextReader from '../../components/TextReader.vue'
import EbookReader from '../../components/epub-reader-v2/EbookReader.vue'
import ContentView from '../../components/epub-reader-v2/ContentView.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { Novel } from '../../class/novel.ts'
import saveManager from '../../utils/SaveManager.ts'
import { useNovelManagement } from '../../composables/novel/useNovelManagement'
import { useNovelFilter } from '../../composables/novel/useNovelFilter'
import { ref, PropType } from 'vue'
import { PageConfig } from '../../types/page'
import { EpubParser } from '../../utils/EpubParser'
import { useDisplayLayout } from '../../composables/useDisplayLayout'

import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import confirmService from '../../utils/ConfirmService.ts'


export default {
  name: 'NovelView',
  components: {
    BaseView,
    FormField,
    MediaCard,
    DetailPanel,
    PathUpdateDialog,
    PdfReader,
    TextReader,
    EbookReader,
    ContentView,
    ResourcesEditDialog
  },
  emits: ['filter-data-updated'],
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({ id: 'novels', type: 'Novel' })
    }
  },
  setup(props) {
    // 初始化小说管理 composable
    const novelManagement = useNovelManagement(props.pageConfig.id)

    // 使用显示布局 composable
    const displayLayoutComposable = useDisplayLayout(80, 200)
    
    // 初始化小说筛选 composable
    const novelFilter = useNovelFilter({
      novels: novelManagement.novels,
      onFilterDataUpdated: (data) => {
        // 这个回调将在 mounted 中重新设置
      }
    })

    // 创建统一的资源更新函数（用于 DetailPanel）
    const updateNovelResource = async (id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) => {
      await novelManagement.updateNovel(id, updates)
    }
    
    // 路径更新对话框状态（需要在 setup 中定义，以便传递给 composable）
    const showPathUpdateDialog = ref(false)
    const pathUpdateInfo = ref({
      existingNovel: null,
      newPath: '',
      newFileName: ''
    })
    
    return {
      // 小说管理相关（重命名避免冲突）
      novels: novelManagement.novels,
      isLoading: novelManagement.isLoading,
      loadNovelsFromComposable: novelManagement.loadNovels,
      saveNovels: novelManagement.saveNovels,
      addNovelToManager: novelManagement.addNovel,
      updateNovelInManager: novelManagement.updateNovel,
      updateNovelResource,
      deleteNovelFromManager: novelManagement.deleteNovel,
      checkFileExistence: novelManagement.checkFileExistence,
      updateNovelsWordCount: novelManagement.updateNovelsWordCount,
      updateReadingStats: novelManagement.updateReadingStats,
      analyzeNovelFile: novelManagement.analyzeNovelFile,
      getNovelManager: novelManagement.getNovelManager,
      // 小说筛选相关
      searchQuery: novelFilter.searchQuery,
      sortBy: novelFilter.sortBy,
      selectedTags: novelFilter.selectedTags,
      excludedTags: novelFilter.excludedTags,
      selectedAuthors: novelFilter.selectedAuthors,
      excludedAuthors: novelFilter.excludedAuthors,
      allTags: novelFilter.allTags,
      allAuthors: novelFilter.allAuthors,
      filteredNovels: novelFilter.filteredNovels,
      filterByTag: novelFilter.filterByTag,
      excludeByTag: novelFilter.excludeByTag,
      clearTagFilter: novelFilter.clearTagFilter,
      filterByAuthor: novelFilter.filterByAuthor,
      excludeByAuthor: novelFilter.excludeByAuthor,
      clearAuthorFilter: novelFilter.clearAuthorFilter,
      handleFilterEvent: novelFilter.handleFilterEvent,
      updateFilterData: novelFilter.updateFilterData,
      setFilterDataUpdatedCallback: novelFilter.setFilterDataUpdatedCallback,
      // 显示布局相关
      ...displayLayoutComposable,
      // 路径更新对话框
      showPathUpdateDialog,
      pathUpdateInfo
    }
  },
  data() {
    return {
      // novels, searchQuery, sortBy, selectedTags, excludedTags, selectedAuthors, excludedAuthors, allTags, allAuthors, showPathUpdateDialog, pathUpdateInfo 已移至 composables
      showAddDialog: false,
      isDragOver: false,
      selectedNovel: null,
      showDetailModal: false,
      currentNovel: null,
      // newNovel 和 tagInput 已不需要，ResourcesEditDialog 会自动处理
      // 编辑相关状态
      showEditDialog: false,
      editNovelForm: null,  // ResourcesEditDialog 会自动处理数据加载
      // Novel 类用于 ResourcesEditDialog
      Novel: Novel.EditableNovelProperties,
      // 图片缓存
      imageCache: {},
      // 阅读器相关状态
      currentReadingNovel: null,
      // 全局设置缓存
      globalSettings: {
        novelDefaultOpenMode: 'internal',
        novelFontSize: 16,
        novelLineHeight: 1.6,
        novelFontFamily: 'Microsoft YaHei, sans-serif',
        novelBackgroundColor: '#ffffff',
        novelTextColor: '#333333',
        novelWordsPerPage: 1000,
        novelShowProgress: true
      },
      // 空状态配置
      novelEmptyStateConfig: {
        emptyIcon: '📚',
        emptyTitle: '你的小说库是空的',
        emptyDescription: '点击"添加小说"按钮来添加你的第一本小说',
        emptyButtonText: '添加第一本小说',
        emptyButtonAction: 'showAddNovelDialog',
        noResultsIcon: '🔍',
        noResultsTitle: '没有找到匹配的小说',
        noResultsDescription: '尝试使用不同的搜索词',
        noPageDataIcon: '📄',
        noPageDataTitle: '当前页没有小说',
        noPageDataDescription: '请切换到其他页面查看小说'
      },
      // 工具栏配置
      novelToolbarConfig: {
        addButtonText: '添加小说',
        searchPlaceholder: '搜索小说...',
        sortOptions: [
          { value: 'name', label: '按名称排序' },
          { value: 'author', label: '按作者排序' },
          { value: 'readProgress', label: '按阅读进度' },
          { value: 'added', label: '按添加时间' }
        ],
        pageType: 'novels'
      },
      // 右键菜单配置
      novelContextMenuItems: [
        { key: 'detail', icon: '👁️', label: '查看详情' },
        { key: 'read', icon: '📖', label: '开始阅读' },
        { key: 'read-v2', icon: '📚', label: 'EPUB阅读器V2' },
        { key: 'folder', icon: '📁', label: '打开文件夹' },
        { key: 'edit', icon: '✏️', label: '编辑信息' },
        { key: 'remove', icon: '🗑️', label: '删除小说' }
      ],
      // 小说列表分页相关
      currentNovelPage: 1,
      novelPageSize: 20, // 默认每页显示20个小说
      totalNovelPages: 0,
      // EPUB阅读器V2相关
      showEbookReaderV2: false,
      ebookReaderV2FilePath: '',
      ebookNavigation: null,
      ebookBookAvailable: false,
      ebookRendition: null
    }
  },
  computed: {
    // filteredNovels 已移至 useNovelFilter composable
    // 分页显示的小说列表
    paginatedNovels() {
      if (!this.filteredNovels || this.filteredNovels.length === 0) return []
      const start = (this.currentNovelPage - 1) * this.novelPageSize
      const end = start + this.novelPageSize
      return this.filteredNovels.slice(start, end)
    },
    // 当前小说页的起始索引
    currentNovelPageStartIndex() {
      return (this.currentNovelPage - 1) * this.novelPageSize
    },
    // canAddNovel 现在由 ResourcesEditDialog 的 customValidation 处理
    novelStats() {
      if (!this.currentNovel) return []
      
      return [
        { label: '阅读进度', value: `${this.currentNovel.readProgress || 0}%` },
        { label: '总字数', value: `${this.formatNumber(this.currentNovel.totalWords)} 字` },
        { label: '阅读时长', value: this.formatReadTime(this.currentNovel.readTime) },
        { label: '最后阅读', value: this.formatLastRead(this.currentNovel.lastRead) },
        { label: '添加时间', value: this.formatDate(this.currentNovel.addedDate) },
        { label: '文件大小', value: this.formatFileSize(this.currentNovel.fileSize) }
      ]
    },
    novelActions() {
      const actions = [
        { key: 'read', icon: '📖', label: '开始阅读', class: 'btn-play' }
      ]
      
      actions.push(
        { key: 'folder', icon: '📁', label: '打开文件夹', class: 'btn-open-folder' },
        { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
        { key: 'remove', icon: '🗑️', label: '删除小说', class: 'btn-remove' }
      )
      
      return actions
    },
    // 动态更新分页配置
    novelPaginationConfig() {
      return {
        currentPage: this.currentNovelPage,
        totalPages: this.totalNovelPages,
        pageSize: this.novelPageSize,
        totalItems: this.filteredNovels.length,
        itemType: '小说'
      }
    }
  },
  methods: {
    showAddNovelDialog() {
      this.showAddDialog = true
      // ResourcesEditDialog 会自动重置表单
    },
    closeAddNovelDialog() {
      this.showAddDialog = false
    },
    // 文件选择功能已由 ResourcesEditDialog 处理，不需要单独的方法
    extractNovelNameFromPath(filePath) {
      const fileName = filePath.split(/[\\/]/).pop()
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      
      let cleanName = nameWithoutExt
        .replace(/[-_\s]+/g, ' ')
        .trim()
      
      if (!cleanName) {
        cleanName = nameWithoutExt
      }
      
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    },
    /**
     * 检测文件类型
     */
    getFileType(filePath: string): 'txt' | 'epub' | 'mobi' | 'pdf' {
      if (!filePath) return 'txt'
      const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
      if (ext === '.epub') return 'epub'
      if (ext === '.mobi') return 'mobi'
      if (ext === '.pdf') return 'pdf'
      return 'txt'
    },
    // 分析小说文件（用于 customConfirmHandler）
    async analyzeNovelFile(filePath: string, formData: any) {
      try {
        const fileType = this.getFileType(filePath)
        
        if (fileType === 'epub') {
          // EPUB 文件分析
          try {
            const parser = new EpubParser()
            await parser.loadEpub(filePath)
            const metadata = await parser.getMetadata()
            const chapters = await parser.getChapters()
            
            // 获取文件大小
            let fileSize = 0
            if (window.electronAPI && window.electronAPI.getFileStats) {
              const stats = await window.electronAPI.getFileStats(filePath)
              if (stats.success) {
                fileSize = stats.size || 0
              }
            }
            
            // 更新表单数据
            formData.totalWords = metadata.totalWords || 0
            formData.fileSize = fileSize
            formData.encoding = 'utf-8'
            formData.totalChapters = chapters.length
            
            // 如果名称或作者为空，使用 EPUB 元数据填充
            if (!formData.name || !formData.name.trim()) {
              formData.name = metadata.title || formData.name
            }
            if (!formData.author || !formData.author.trim()) {
              formData.author = metadata.author || formData.author
            }
            if (!formData.description || !formData.description.trim()) {
              formData.description = metadata.description || formData.description
            }
            
            // 获取封面
            const cover = await parser.getCover()
            if (cover && (!formData.coverImage || !formData.coverImage.trim())) {
              formData.coverImage = cover
            }
            
            parser.destroy()
            
            console.log('EPUB 文件分析结果:', {
              title: metadata.title,
              author: metadata.author,
              totalWords: metadata.totalWords,
              totalChapters: chapters.length,
              fileSize
            })
          } catch (error) {
            console.error('分析 EPUB 文件失败:', error)
            notify.toast('error', '分析失败', `无法分析 EPUB 文件: ${error.message}`)
          }
        } else {
          // TXT 文件分析
          if (window.electronAPI && window.electronAPI.readTextFile) {
            const result = await window.electronAPI.readTextFile(filePath)
            if (result.success && result.content) {
              // 使用API返回的字数统计
              formData.totalWords = result.wordCount || 0
              formData.fileSize = result.fileSize || 0
              formData.encoding = result.encoding || 'utf-8'
              console.log('文件分析结果:', { 
                wordCount: result.wordCount, 
                fileSize: result.fileSize, 
                encoding: result.encoding 
              })
            }
          }
        }
      } catch (error) {
        console.error('分析文件失败:', error)
      }
    },
    // 添加小说时的自定义确认处理（处理文件名提取、文件分析等）
    async handleAddNovelCustomConfirm(formData, isEditMode) {
      if (isEditMode) return // 编辑模式不需要特殊处理
      
      const filePath = formData.filePath || ''
      if (!filePath || !filePath.trim()) {
        return // 文件路径为空，跳过
      }
      
      // 1. 如果名称为空，从文件路径提取
      if (!formData.name || !formData.name.trim()) {
        formData.name = this.extractNovelNameFromPath(filePath)
      }
      
      // 2. 分析文件（提取 EPUB 元数据或 TXT 字数统计）
      await this.analyzeNovelFile(filePath, formData)
      
      // 3. 设置默认值
      formData.readProgress = formData.readProgress || 0
      formData.readTime = 0
      formData.addedDate = new Date().toISOString()
    },
    async handleAddNovelConfirm(novelData) {
      try {
        // ResourcesEditDialog 已经通过 customValidation 验证了 filePath，这里只需要处理数据
        const fileType = this.getFileType(novelData.filePath)
        
        const finalNovelData = {
          name: (novelData.name || '').trim() || this.extractNovelNameFromPath(novelData.filePath),
          author: (novelData.author || '').trim() || '未知作者',
          genre: (novelData.genre || '').trim() || '',
          description: (novelData.description || '').trim() || '',
          tags: Array.isArray(novelData.tags) ? novelData.tags : [],
          filePath: (novelData.filePath || '').trim(),
          fileType: fileType,
          coverImage: (novelData.coverImage || '').trim() || '',
          readProgress: novelData.readProgress || 0,
          readTime: novelData.readTime || 0,
          addedDate: novelData.addedDate || new Date().toISOString(),
          // 从文件分析中获取的数据
          totalWords: novelData.totalWords || 0,
          fileSize: novelData.fileSize || 0,
          encoding: novelData.encoding || 'utf-8',
          totalChapters: novelData.totalChapters || 0
        }
        
        const novel = await this.addNovelToManager(finalNovelData)
        await this.loadNovels()
        this.closeAddNovelDialog()
        notify.native('添加成功', `小说 "${novel?.name || '未知'}" 已添加`)
      } catch (error) {
        console.error('添加小说失败:', error)
        alertService.error(`添加小说失败: ${error.message}`)
      }
    },
    showNovelDetail(novel) {
      this.currentNovel = novel
      this.showDetailModal = true
      this.showContextMenu = false
    },
    closeNovelDetail() {
      this.showDetailModal = false
      this.currentNovel = null
    },
    handleDetailAction(actionKey, novel) {
      switch (actionKey) {
        case 'read':
          this.openNovelReader(novel)
          break
        case 'folder':
          this.openNovelFolder(novel)
          break
        case 'edit':
          this.editNovel(novel)
          break
        case 'remove':
          this.removeNovel(novel)
          break
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
          this.showNovelDetail(selectedItem)
          break
        case 'read':
          this.openNovelReader(selectedItem)
          break
        case 'read-v2':
          this.openEbookReaderV2(selectedItem)
          break
        case 'folder':
          this.openNovelFolder(selectedItem)
          break
        case 'edit':
          this.editNovel(selectedItem)
          break
        case 'remove':
          this.removeNovel(selectedItem)
          break
      }
    },
    
    // 处理空状态按钮点击事件
    handleEmptyStateAction(actionName) {
      if (actionName === 'showAddNovelDialog') {
        this.showAddNovelDialog()
      }
    },
    
    // 处理搜索查询变化
    handleSearchQueryChanged(newValue) {
      this.searchQuery = newValue
    },
    
    // 处理排序变化
    handleSortByChanged(newValue) {
      this.sortBy = newValue
      console.log('✅ NovelView 排序方式已更新:', newValue)
    },
    editNovel(novel) {
      this.showContextMenu = false
      this.showDetailModal = false
      if (!novel) return
      // ResourcesEditDialog 会自动从 resourceData 加载数据
      this.editNovelForm = novel
      this.showEditDialog = true
    },
    closeEditNovelDialog() {
      this.showEditDialog = false
      this.editNovelForm = null
    },
    async handleEditNovelConfirm(updatedNovel) {
      try {
        const updateData = {
          name: (updatedNovel.name || '').trim(),
          author: (updatedNovel.author || '').trim(),
          genre: (updatedNovel.genre || '').trim(),
          description: (updatedNovel.description || '').trim() || '',
          tags: Array.isArray(updatedNovel.tags) ? updatedNovel.tags : [],
          readProgress: Math.max(0, Math.min(100, Number(updatedNovel.readProgress) || 0))
        }
        
        await this.updateNovelInManager(updatedNovel.id, updateData)
        await this.loadNovels()
        notify.native('保存成功', '小说信息已更新')
        this.closeEditNovelDialog()
      } catch (error: any) {
        console.error('保存编辑失败:', error)
        alertService.error('保存编辑失败: ' + error.message)
      }
    },
    async handleToggleFavorite(novel) {
      // 检查 novel 是否存在，避免在面板关闭时触发更新
      if (!novel || !novel.id) {
        return
      }
      try {
        const newFavoriteStatus = !novel.isFavorite
        await this.updateNovelInManager(novel.id, { isFavorite: newFavoriteStatus })
        // 更新当前小说对象，以便详情面板立即显示新状态
        if (this.currentNovel && this.currentNovel.id === novel.id) {
          this.currentNovel.isFavorite = newFavoriteStatus
        }
      } catch (error: any) {
        console.error('切换收藏状态失败:', error)
        alertService.error('切换收藏状态失败: ' + error.message)
      }
    },
    async removeNovel(novel) {
      if (!(await confirmService.confirm(`确定要删除小说 "${novel.name}" 吗？`))) return
      
      try {
        await this.deleteNovelFromManager(novel.id)
        
        // 显示删除成功通知
        notify.toast('success', '删除成功', `已成功删除小说 "${novel.name}"`)
        console.log('小说删除成功:', novel.name)
      } catch (error) {
        // 显示删除失败通知
        notify.toast('error', '删除失败', `无法删除小说 "${novel.name}": ${error.message}`)
        console.error('删除小说失败:', error)
      }
      
      this.showContextMenu = false
    },
    async openNovelReader(novel) {
      try {
        if (!novel.filePath) {
          alertService.warning('小说文件路径不存在')
          return
        }
        
        // 从全局设置中获取用户设置
        const globalSettings = await this.getGlobalSettings()
        const openMode = globalSettings.novelDefaultOpenMode || 'internal'
        
        console.log('=== 开始打开小说文件 ===')
        console.log('小说名称:', novel.name)
        console.log('文件路径:', novel.filePath)
        console.log('获取到的全局设置:', globalSettings)
        console.log('打开模式:', openMode)
        console.log('设置来源:', globalSettings.novelDefaultOpenMode)
        
        if (openMode === 'external') {
          console.log('选择外部应用打开')
          // 使用外部应用打开，不显示内部阅读器
          await this.openNovelWithExternalApp(novel)
          this.closeNovelDetail()
        } else {
          console.log('选择应用内阅读器打开')
          // 使用应用内阅读器
          await this.openNovelWithInternalReader(novel)
          this.closeNovelDetail()
        }
      } catch (error) {
        console.error('❌ 打开小说阅读器失败:', error)
        console.error('错误详情:', error.stack)
        alertService.error(`打开小说失败: ${error.message}`)
      }
    },
    async openNovelWithExternalApp(novel) {
      console.log('使用外部应用打开小说')
      console.log('Electron API 可用:', !!window.electronAPI)
      console.log('openExternal API 可用:', !!(window.electronAPI && window.electronAPI.openExternal))
      
      if (window.electronAPI && window.electronAPI.openExternal) {
        console.log('正在调用 openExternal API...')
        const result = await window.electronAPI.openExternal(novel.filePath)
        console.log('openExternal 返回结果:', result)
        
        if (result.success) {
          console.log('✅ 小说文件已用默认程序打开')
          notify.native('打开成功', `"${novel.name}" 已用默认程序打开`)
          
          // 更新阅读统计
          await this.updateReadingStats(novel)
        } else {
          console.error('❌ 打开小说文件失败:', result.error)
          alertService.error(`打开小说文件失败: ${result.error}`)
        }
      } else {
        console.log('❌ Electron API 不可用，使用降级处理')
        // 降级处理：在浏览器中显示文件路径
        alertService.info(`小说文件位置:\n${novel.filePath}\n\n请手动打开此文件进行阅读`)
      }
    },
    async openNovelWithInternalReader(novel) {
      console.log('使用应用内阅读器打开小说')
      try {
        // 检查文件类型，如果是 EPUB，使用 EPUB 阅读器 V2
        const fileType = this.getFileType(novel.filePath)
        if (fileType === 'epub') {
          console.log('EPUB 文件，使用 EPUB 阅读器 V2 打开')
          this.openEbookReaderV2(novel)
          return
        }
        
        // 其他文件类型使用原来的阅读器
        await this.selectNovelForReading(novel)
        notify.native('开始阅读', `"${novel.name}" 已在应用内打开`)
      } catch (error) {
        console.error('打开应用内阅读器失败:', error)
        alertService.error(`打开应用内阅读器失败: ${error.message}`)
      }
    },
    async openNovelFolder(novel) {
      try {
        if (!novel.filePath) {
          alertService.warning('小说文件路径不存在')
          return
        }
        
        if (window.electronAPI && window.electronAPI.openFileFolder) {
          const result = await window.electronAPI.openFileFolder(novel.filePath)
          if (result.success) {
            console.log('已打开小说文件夹:', result.folderPath)
          } else {
            console.error('打开文件夹失败:', result.error)
            alertService.error(`打开文件夹失败: ${result.error}`)
          }
        } else {
          alertService.info(`小说文件位置:\n${novel.filePath}`)
        }
      } catch (error) {
        console.error('打开小说文件夹失败:', error)
        alertService.error(`打开文件夹失败: ${error.message}`)
      }
    },
    formatReadTime(minutes) {
      if (!minutes) return '未阅读'
      if (minutes < 60) {
        return `${minutes} 分钟`
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours} 小时 ${mins} 分钟`
      } else {
        const days = Math.floor(minutes / 1440)
        const hours = Math.floor((minutes % 1440) / 60)
        return `${days} 天 ${hours} 小时`
      }
    },
    formatLastRead(dateString) {
      if (!dateString) return '从未阅读'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      
      if (diffDays === 0) {
        if (diffMinutes < 1) return '刚刚'
        if (diffMinutes < 60) return `${diffMinutes}分钟前`
        if (diffHours < 24) return `${diffHours}小时前`
      }
      
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      return this.formatDateTime(date)
    },
    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return this.formatDateTime(date)
    },
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    formatFileSize(bytes) {
      if (!bytes) return '未知'
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    formatNumber(num) {
      if (!num) return '0'
      return num.toLocaleString()
    },
    resolveCoverImage(imagePath) {
      if (!imagePath || (typeof imagePath === 'string' && imagePath.trim() === '')) {
        return './default-novel.png'
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
        return imagePath
      }
      if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('file:'))) {
        return imagePath
      }
      if (this.imageCache[imagePath]) return this.imageCache[imagePath]
      
      if (window.electronAPI && window.electronAPI.readFileAsDataUrl) {
        window.electronAPI.readFileAsDataUrl(imagePath).then((dataUrl) => {
          if (dataUrl) {
            this.$set ? this.$set(this.imageCache, imagePath, dataUrl) : (this.imageCache[imagePath] = dataUrl)
          } else {
            this.$set ? this.$set(this.imageCache, imagePath, './default-novel.png') : (this.imageCache[imagePath] = './default-novel.png')
          }
        }).catch(() => {
          this.$set ? this.$set(this.imageCache, imagePath, './default-novel.png') : (this.imageCache[imagePath] = './default-novel.png')
        })
      } else {
        const normalizedPath = String(imagePath).replace(/\\/g, '/')
        const fileUrl = `file:///${normalizedPath}`
        this.$set ? this.$set(this.imageCache, imagePath, fileUrl) : (this.imageCache[imagePath] = fileUrl)
      }
      
      return this.imageCache[imagePath] || './default-novel.png'
    },
    handleImageError(event) {
      event.target.src = './default-novel.png'
    },
    
    async loadNovels() {
      try {
        // 调用 composable 的 loadNovels 方法
        await this.loadNovelsFromComposable()

        // 更新筛选器数据（allTags 和 allAuthors 会自动计算）
        this.updateFilterData()
        
        // 为没有字数信息的小说重新计算字数（后台执行，不阻塞筛选器显示）
        Promise.resolve()
          .then(() => this.updateNovelsWordCount())
          .catch((e) => {
            console.warn('后台更新字数失败:', e)
          })
        
        // 检测文件存在性（仅在应用启动时检测一次）
        if (this.$root.shouldCheckFileLoss && this.$root.shouldCheckFileLoss()) {
          this.$root.markFileLossChecked()
          Promise.resolve()
            .then(() => this.checkFileExistence())
            .catch((e) => {
              console.warn('后台检测文件存在性失败:', e)
            })
            .finally(() => {
              this.updateFilterData()
            })
        }
        
        // 计算小说列表总页数
        this.updateNovelPagination()
        
      } catch (error: any) {
        console.error('加载小说数据失败:', error)
        notify.toast('error', '加载失败', '加载小说数据失败: ' + error.message)
      }
    },
    
    
    // checkFileExistence, extractAllTagsAndAuthors, filterByTag, excludeByTag, clearTagFilter,
    // filterByAuthor, excludeByAuthor, clearAuthorFilter, handleFilterEvent, updateFilterData,
    // updateNovelsWordCount, updateReadingStats 已移至 composables
    // 处理小说点击事件
    async handleNovelClick(novel) {
      try {
        // 从全局设置中获取用户设置
        const globalSettings = await this.getGlobalSettings()
        const openMode = globalSettings.novelDefaultOpenMode || 'internal'
        
        console.log('=== 处理小说点击事件 ===')
        console.log('小说名称:', novel.name)
        console.log('打开模式:', openMode)
        
        if (openMode === 'external') {
          console.log('使用外部应用打开')
          await this.openNovelReader(novel)
        } else {
          console.log('使用应用内阅读器')
          // 检查文件类型，如果是 EPUB，使用 EPUB 阅读器 V2
          const fileType = this.getFileType(novel.filePath)
          if (fileType === 'epub') {
            console.log('EPUB 文件，使用 EPUB 阅读器 V2 打开')
            this.openEbookReaderV2(novel)
          } else {
            await this.selectNovelForReading(novel)
          }
        }
      } catch (error) {
        console.error('处理小说点击失败:', error)
        alertService.error(`打开小说失败: ${error.message}`)
      }
    },
    
    // 阅读器相关方法
    async selectNovelForReading(novel) {
      try {
        console.log('选择小说进行阅读:', novel.name)
        
        // 检测文件类型（根据文件扩展名，而不是已保存的 fileType）
        const detectedType = this.getFileType(novel.filePath)
        
        // 如果检测到的类型与保存的类型不一致，更新文件类型
        if (novel.fileType !== detectedType) {
          console.log(`文件类型不匹配，更新: ${novel.fileType} -> ${detectedType}`)
          // 保存文件类型到数据库
          await this.updateNovelInManager(novel.id, {
            fileType: detectedType
          })
          novel.fileType = detectedType
        }
        
        const fileType = detectedType
        console.log('使用的文件类型:', fileType, '文件路径:', novel.filePath)
        
        if (fileType === 'pdf') {
          // PDF 文件由 PdfReader 组件自己处理
          console.log('PDF 文件，交由 PdfReader 组件处理')
          this.currentReadingNovel = novel
        } else if (fileType === 'epub') {
          // EPUB 文件应该使用 EPUB 阅读器 V2，不应该进入这里
          console.warn('EPUB 文件不应该使用内部阅读器，应该使用 EPUB 阅读器 V2')
          this.openEbookReaderV2(novel)
          return
        } else {
          // TXT 文件由 TextReader 组件处理
          console.log('TXT 文件，交由 TextReader 组件处理')
          this.currentReadingNovel = novel
        }
        
        await this.updateReadingStats(novel)
      } catch (error) {
        console.error('选择小说失败:', error)
        alertService.error(`选择小说失败: ${error.message}`)
      }
    },
    closeReader() {
      this.currentReadingNovel = null
    },
    /**
     * 处理 PDF 页面变化
     */
    async handlePdfPageChanged(pageNum: number) {
      if (!this.currentReadingNovel) return
      
      // 更新当前页面（用于保存阅读进度）
      this.currentReadingNovel.currentPage = pageNum
      
      // 保存进度
      try {
        await this.updateNovelInManager(this.currentReadingNovel.id, {
          currentPage: pageNum
        })
      } catch (error) {
        console.error('保存 PDF 阅读进度失败:', error)
      }
    },
    /**
     * 处理文本阅读器页面变化
     */
    async handleTextPageChanged(pageNum: number) {
      if (!this.currentReadingNovel) return
      
      // 更新当前页面（用于保存阅读进度）
      this.currentReadingNovel.currentPage = pageNum
      
      // 保存进度
      try {
        await this.updateNovelInManager(this.currentReadingNovel.id, {
          currentPage: pageNum
        })
      } catch (error) {
        console.error('保存文本阅读进度失败:', error)
      }
    },
    /**
     * 处理文本阅读器进度变化
     */
    async handleTextProgressChanged(progress: number) {
      if (!this.currentReadingNovel) return
      
      // 更新阅读进度
      this.currentReadingNovel.readProgress = progress
      
      // 保存进度
      try {
        await this.updateNovelInManager(this.currentReadingNovel.id, {
          readProgress: progress
        })
      } catch (error) {
        console.error('保存文本阅读进度失败:', error)
      }
    },
    async getGlobalSettings() {
      try {
        // 从 SaveManager 获取全局设置

        const settings = await saveManager.loadSettings()
        console.log('原始设置数据:', settings)
        console.log('novel对象:', settings.novel)
        console.log('defaultOpenMode值:', settings.novel?.defaultOpenMode)
        
        // 使用novel对象格式
        const novelSettings = {
          novelDefaultOpenMode: settings.novel?.defaultOpenMode || 'internal',
          novelFontSize: settings.novel?.readerSettings?.fontSize || 16,
          novelLineHeight: settings.novel?.readerSettings?.lineHeight || 1.6,
          novelFontFamily: settings.novel?.readerSettings?.fontFamily || 'Microsoft YaHei, sans-serif',
          novelBackgroundColor: settings.novel?.readerSettings?.backgroundColor || '#ffffff',
          novelTextColor: settings.novel?.readerSettings?.textColor || '#333333',
          novelWordsPerPage: settings.novel?.readerSettings?.wordsPerPage || 1000,
          novelShowProgress: settings.novel?.readerSettings?.showProgress !== undefined ? settings.novel.readerSettings.showProgress : true
        }
        
        console.log('处理后的小说设置:', novelSettings)
        console.log('最终使用的打开模式:', novelSettings.novelDefaultOpenMode)
        
        // 更新缓存的设置
        this.globalSettings = novelSettings
        
        return novelSettings
      } catch (error) {
        console.error('获取全局设置失败:', error)
        // 返回默认设置
        return {
          novelDefaultOpenMode: 'internal',
          novelFontSize: 16,
          novelLineHeight: 1.6,
          novelFontFamily: 'Microsoft YaHei, sans-serif',
          novelBackgroundColor: '#ffffff',
          novelTextColor: '#333333',
          novelWordsPerPage: 1000,
          novelShowProgress: true
        }
      }
    },

    // 拖拽处理方法
    handleDragOver(event) {
      event.preventDefault()
    },
    
    handleDragEnter(event) {
      event.preventDefault()
      this.isDragOver = true
    },
    
    handleDragLeave(event) {
      event.preventDefault()
      this.isDragOver = false
    },
    
    async handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      
      try {
        const files = Array.from(event.dataTransfer.files) as File[]
        
        console.log('=== 拖拽调试信息 ===')
        console.log('拖拽文件数量:', files.length)
        console.log('拖拽文件详细信息:', files.map((f :File) => ({
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size
        })))
        console.log('当前小说库状态:')
        this.novels.forEach((novel, index) => {
          console.log(`  ${index + 1}. ${novel.name}`)
          console.log(`     路径: ${novel.filePath}`)
          console.log(`     文件存在: ${novel.fileExists}`)
        })
        
        if (files.length === 0) {
          notify.toast('error', '拖拽失败', '请拖拽小说文件到此处')
          return
        }
        
        // 过滤出支持的小说文件
        const supportedExtensions = ['.txt', '.epub', '.mobi', '.pdf']
        const novelFiles = files.filter(file => {
          const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
          return supportedExtensions.includes(ext)
        })
        
        if (novelFiles.length === 0) {
          notify.toast('error', '文件类型不支持', '请拖拽 .txt、.epub、.mobi 或 .pdf 文件')
          return
        }
        
        console.log('检测到小说文件数量:', novelFiles.length)
        
        let addedCount = 0
        let failedCount = 0
        let failedReasons = []
        
        for (const novelFile of novelFiles) {
          try {
            // 检查是否已经存在相同的文件路径
            const existingNovelByPath = this.novels.find(novel => novel.filePath === novelFile.path)
            if (existingNovelByPath) {
              console.log(`小说文件已存在: ${novelFile.name}`)
              failedReasons.push(`"${novelFile.name}" 已存在于库中`)
              failedCount++
              continue
            }
            
            // 检查是否存在同名但路径不同的丢失文件
            const existingNovelByName = this.novels.find(novel => {
              const novelFileName = novel.filePath.split(/[\\/]/).pop().toLowerCase()
              const newFileName = novelFile.name.toLowerCase()
              const isSameName = novelFileName === newFileName
              const isFileMissing = !novel.fileExists
              
              console.log(`检查小说: ${novel.name}`)
              console.log(`  文件名: ${novelFileName} vs ${newFileName}`)
              console.log(`  是否同名: ${isSameName}`)
              console.log(`  文件存在: ${novel.fileExists}`)
              console.log(`  是否丢失: ${isFileMissing}`)
              console.log(`  匹配条件: ${isSameName && isFileMissing}`)
              
              return isSameName && isFileMissing
            })
            
            if (existingNovelByName) {
              console.log(`发现同名丢失文件: ${novelFile.name}`)
              console.log(`现有小说路径: ${existingNovelByName.filePath}`)
              console.log(`新文件路径: ${novelFile.path}`)
              // 显示路径更新确认对话框
              this.pathUpdateInfo = {
                existingNovel: existingNovelByName,
                newPath: novelFile.path,
                newFileName: novelFile.name
              }
              this.showPathUpdateDialog = true
              // 暂停处理，等待用户确认
              return
            }
            
            // 创建新的小说对象
            const novelData = {
              name: this.extractNovelNameFromPath(novelFile.name),
              author: '未知作者',
              genre: '',
              description: '',
              tags: [],
              filePath: novelFile.path,
              coverImage: '',
              readProgress: 0,
              readTime: 0,
              addedDate: new Date().toISOString()
            }
            
            console.log('创建小说对象:', novelData)
            
            // 添加到小说管理器
            await this.addNovelToManager(novelData)
            addedCount++
            
          } catch (error) {
            console.error(`添加小说文件失败: ${novelFile.name}`, error)
            failedReasons.push(`"${novelFile.name}" 添加失败: ${error.message}`)
            failedCount++
          }
        }
        
        // 重新加载小说列表
        await this.loadNovels()
        
        // 显示结果通知
        if (addedCount > 0 && failedCount === 0) {
          notify.toast('success', '添加成功', `成功添加 ${addedCount} 本小说`)
        } else if (addedCount > 0 && failedCount > 0) {
          notify.toast('warning', '部分成功', `成功添加 ${addedCount} 本小说，${failedCount} 个文件添加失败：${failedReasons.join('；')}`)
        } else if (addedCount === 0 && failedCount > 0) {
          notify.toast('error', '添加失败', `${failedCount} 个文件添加失败：${failedReasons.join('；')}`)
        }
        
        console.log(`拖拽处理完成: 成功 ${addedCount} 个，失败 ${failedCount} 个`)
        
      } catch (error) {
        console.error('处理拖拽文件失败:', error)
        notify.toast('error', '处理失败', `处理拖拽文件失败: ${error.message}`)
      }
    },

    // 路径更新相关方法
    closePathUpdateDialog() {
      this.showPathUpdateDialog = false
      this.pathUpdateInfo = {
        existingNovel: null,
        newPath: '',
        newFileName: ''
      }
    },
    
    async confirmPathUpdate() {
      try {
        const { existingNovel, newPath } = this.pathUpdateInfo
        
        if (!existingNovel || !newPath) {
          console.error('路径更新信息不完整')
          notify.toast('error', '更新失败', '路径更新信息不完整')
          return
        }
        
        console.log(`更新小说 "${existingNovel.name}" 的路径:`)
        console.log(`旧路径: ${existingNovel.filePath}`)
        console.log(`新路径: ${newPath}`)
        
        // 更新小说路径
        existingNovel.filePath = newPath
        existingNovel.fileExists = true
        
        // 重新分析文件信息
        const analysisData: any = {}
        await this.analyzeNovelFile(newPath, analysisData)
        
        // 检测文件类型
        const fileType = this.getFileType(newPath)
        
        // 保存更新后的数据
        await this.updateNovelInManager(existingNovel.id, {
          filePath: newPath,
          fileExists: true,
          fileType: fileType,
          totalWords: analysisData.totalWords || existingNovel.totalWords || 0,
          fileSize: analysisData.fileSize || existingNovel.fileSize || 0,
          encoding: analysisData.encoding || existingNovel.encoding || 'utf-8',
          totalChapters: analysisData.totalChapters || existingNovel.totalChapters || 0
        })
        
        // 关闭对话框
        this.closePathUpdateDialog()
        
        // 显示成功通知
        notify.toast(
          'success',
          '路径更新成功', 
          `小说 "${existingNovel.name}" 的路径已更新`
        )
        
        console.log(`小说 "${existingNovel.name}" 路径更新完成`)
        
      } catch (error) {
        console.error('更新小说路径失败:', error)
        notify.toast('error', '更新失败', `更新小说路径失败: ${error.message}`)
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
    async loadSortSetting() {
      try {
        const savedSortBy = await saveManager.getSortSetting('novels')
        if (savedSortBy && savedSortBy !== this.sortBy) {
          this.sortBy = savedSortBy
          console.log('✅ 已加载小说页面排序方式:', savedSortBy)
        }
      } catch (error) {
        console.warn('加载排序方式失败:', error)
      }
    },
    
    // 处理分页组件的事件
    handleNovelPageChange(pageNum) {
      this.currentNovelPage = pageNum
    },
    
    // 更新小说列表分页信息
    updateNovelPagination() {
      this.totalNovelPages = Math.ceil(this.filteredNovels.length / this.novelPageSize)
      // 确保当前页不超过总页数
      if (this.currentNovelPage > this.totalNovelPages && this.totalNovelPages > 0) {
        this.currentNovelPage = this.totalNovelPages
      }
      // 如果当前页为0且没有数据，重置为1
      if (this.currentNovelPage === 0 && this.filteredNovels.length > 0) {
        this.currentNovelPage = 1
      }
    },
    
    // 从设置中加载小说分页配置
    async loadNovelPaginationSettings() {
      try {
        const settings = await saveManager.loadSettings()
        
        if (settings && settings.novel) {
          const newNovelPageSize = parseInt(settings.novel.listPageSize) || 20
          
          // 更新小说列表分页大小
          if (this.novelPageSize !== newNovelPageSize) {
            this.novelPageSize = newNovelPageSize
            
            // 重新计算小说列表分页
            this.updateNovelPagination()
            
            console.log('小说列表分页设置已更新:', {
              listPageSize: this.novelPageSize,
              totalNovelPages: this.totalNovelPages,
              currentNovelPage: this.currentNovelPage
            })
          }
        }
      } catch (error) {
        console.error('加载小说分页设置失败:', error)
        // 使用默认值
        this.novelPageSize = 20
      }
    },
    // 打开 EPUB阅读器V2
    openEbookReaderV2(novel) {
      if (!novel || !novel.filePath) {
        notify.toast('error', '打开失败', '小说文件路径不存在')
        return
      }
      
      // 检查是否为 EPUB 文件
      const fileType = this.getFileType(novel.filePath)
      if (fileType !== 'epub') {
        notify.toast('error', '打开失败', '只有 EPUB 格式的小说可以使用此阅读器')
        return
      }
      
      // 直接使用文件路径，让 EbookReader 组件内部处理路径转换
      console.log('打开 EPUB阅读器V2，文件路径:', novel.filePath)
      this.ebookReaderV2FilePath = novel.filePath
      this.showEbookReaderV2 = true
    },
    // 关闭 EPUB阅读器V2
    closeEbookReaderV2() {
      this.showEbookReaderV2 = false
      this.ebookReaderV2FilePath = ''
      this.ebookNavigation = null
      this.ebookBookAvailable = false
      this.ebookRendition = null
    },
    // 处理navigation更新
    handleNavigationUpdated(navigation) {
      this.ebookNavigation = navigation
      this.ebookBookAvailable = true
    },
    // 处理章节跳转
    handleEbookJumpTo(href) {
      if (this.$refs.ebookReader) {
        this.$refs.ebookReader.jumpTo(href)
      }
    },
    // 处理rendition就绪
    handleRenditionReady(rendition) {
      this.ebookRendition = rendition
    },
    // 根据文件路径获取小说名称
    getNovelNameByPath(filePath) {
      if (!filePath) return '未知小说'
      const novel = this.novels.find(n => n.filePath === filePath)
      return novel ? novel.name : filePath.split(/[\\/]/).pop() || '未知小说'
    }
  },
  watch: {
    // 监听筛选结果变化，更新分页信息
    filteredNovels: {
      handler() {
        this.updateNovelPagination()
      },
      immediate: false
    },
    // 监听搜索查询变化，重置到第一页
    searchQuery() {
      this.currentNovelPage = 1
    },
    // 监听排序变化，重置到第一页
    sortBy() {
      this.currentNovelPage = 1
    }
  },
  async mounted() {
    // 设置筛选器数据更新回调
    this.setFilterDataUpdatedCallback((data) => {
      this.$emit('filter-data-updated', data)
    })
    
    // 加载小说数据
    await this.loadNovels()
    
    // 加载小说分页设置
    await this.loadNovelPaginationSettings()
    
    // 加载排序设置
    await this.loadSortSetting()
    
    // 初始化筛选器数据
    this.updateFilterData()
    
    // 加载全局设置
    await this.getGlobalSettings()
  }
}
</script>

<style lang="scss" scoped>
// 小说主内容区域
.novel-content {
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
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed var(--accent-color);
    border-radius: 12px;

    &::before {
      content: '拖拽小说文件到这里添加小说（支持多选）';
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
.novel-main-content {
  padding: 20px;
  box-sizing: border-box;
}

// 小说列表区域
.novel-list-section {
  width: 100%;
}

// 悬浮阅读器覆盖层
.novel-reader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
}

// 阅读器内容区域
.novel-reader-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 98vw;
  height: 98vh;
  max-width: 1800px;
  max-height: 1200px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
  overflow: hidden;
}

// 阅读器头部
.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;

  .reader-title {
    flex: 1;
    h3 {
      margin: 0 0 5px 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }
  }

  .reader-author {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .reader-controls {
    display: flex;
    gap: 8px;
  }
}

.btn-close-reader {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
}


// 阅读内容包装器
.reader-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background: var(--bg-primary);
}

// 左侧章节导航栏
.chapter-navigation-sidebar {
  width: 280px;
  min-width: 280px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .chapter-nav-header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    flex-shrink: 0;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

// 右侧阅读器主内容
.reader-content-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

// 阅读内容（保持向后兼容）
.reader-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.novel-text {
  line-height: 1.8;
  font-size: 16px;
  color: var(--text-primary);
  text-align: justify;
  word-break: break-word;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.btn-retry {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: var(--accent-hover);
  }
}

// 阅读器底部
.reader-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  flex-shrink: 0;
  border-radius: 0 0 12px 12px;
}

.reader-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-prev,
.btn-next {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

// EPUB 章节导航样式
.epub-chapter-nav {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.chapter-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }

  &:hover {
    border-color: var(--accent-color);
  }
}

// 选中状态的小说卡片
.novel-card {
  &.selected {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.2);
  }
}

// 工具栏样式
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 35px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  width: 250px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.search-icon {
  position: absolute;
  right: 10px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select,
.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
}

// 小说网格样式
.novels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

// 空状态样式
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);

  h3 {
    color: var(--text-primary);
    font-size: 1.5rem;
    margin-bottom: 10px;
    transition: color 0.3s ease;
  }

  p {
    margin-bottom: 30px;
    transition: color 0.3s ease;
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.btn-add-first-novel {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background: var(--accent-hover);
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
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-medium);
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
    transition: color 0.3s ease;
  }
}


.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 8px;
    transition: color 0.3s ease;
  }
}

.required {
  color: #ef4444;
  font-weight: bold;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.1);
  }
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.3s ease;
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
  border-radius: 6px;
  background: var(--bg-tertiary);
  padding: 8px;
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
  min-height: 20px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background: var(--accent-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  gap: 4px;
  transition: background 0.3s ease;

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
  transition: background 0.3s ease;

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

.file-input-group {
  display: flex;
  gap: 10px;

  .form-input {
    flex: 1;
  }
}

.btn-browse {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background: var(--accent-hover);
  }
}

.file-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 6px;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
  }
}

.btn-confirm {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 小说详情页面样式
.novel-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.novel-detail-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-medium);
  transition: background-color 0.3s ease;
}

.detail-header {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.detail-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;

  &:hover {
    color: var(--text-primary);
  }
}

.detail-body {
  display: flex;
  gap: 30px;
  padding: 30px;
}

.detail-cover {
  flex-shrink: 0;
  width: 300px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 25px var(--shadow-medium);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;
}

.detail-author {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.detail-genre {
  color: var(--text-tertiary);
  font-size: 1rem;
  margin: 0 0 15px 0;
  font-style: italic;
  transition: color 0.3s ease;
}

.detail-description {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
  transition: background-color 0.3s ease;
}

.description-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.description-content {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  transition: color 0.3s ease;
}

.detail-tags {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
  transition: background-color 0.3s ease;
}

.tags-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  transition: color 0.3s ease;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  background: var(--accent-color);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.3s ease;

  &:hover {
    background: var(--accent-hover);
  }
}

.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.detail-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}



.btn-open-folder {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
  }
}

// EPUB阅读器V2内容区域
.ebook-reader-v2-content {
  padding: 0;
  overflow: hidden;
  
  :deep(.ebook) {
    width: 100%;
    height: 100%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .novels-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .novel-cover {
    height: 200px;
  }

  .modal-content {
    width: 95vw;
    margin: 20px;
  }

  .detail-body {
    flex-direction: column;
    gap: 20px;
  }

  .detail-cover {
    width: 100%;
    height: 250px;
  }

  .detail-stats {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
