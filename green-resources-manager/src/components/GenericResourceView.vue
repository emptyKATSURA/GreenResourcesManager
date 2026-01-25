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
    <fun-drop-zone 
      class="resource-content"
      :accept="[]"
      :clickable="false"
      title="拖拽文件到这里添加资源"
      hint="支持任意类型文件"
      drag-text="松开鼠标添加资源"
      @drop="handleFileDrop"
      @error="handleDropError"
    >
      <template #default="{ isDragging }">
        <!-- 这里可以根据资源类型动态加载不同的网格组件 -->
        <div class="resources-grid" :class="{ 'is-dragging': isDragging }">
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
              :file-exists="getFileExists(item)"
              :scale="scale"
              :is-running="isResourceRunning(item)"
              @action="handleResourceAction"
            />
          </div>
        </div>
      </template>
    </fun-drop-zone>
    </BaseView>
    
    <!-- 详情面板 -->
    <DetailPanel
      :visible="showDetailDialog && !!selectedItem"
      :item="selectedItem"
      :type="detailPanelType"
      :is-running="selectedItem ? isResourceRunning(selectedItem) : false"
      :on-update-resource="updateResource"
      @close="closeDetail"
      @action="handleDetailAction"
    >
      <!-- 图片/漫画预览 -->
      <template #extra>
        <AlbumPagesGrid
          :pages="detailPages"
          :currentPage="detailCurrentPage"
          :pageSize="detailPageSize"
          :totalPages="detailTotalPages"
          :resolveImage="resolveImage"
          :handleImageError="handleImageError"
          @page-click="handleDetailPageClick"
          @page-change="handleDetailPageChange"
        />
      </template>
    </DetailPanel>
    
    <!-- 编辑资源对话框 -->
    <ResourcesEditDialog
      :visible="showEditDialog"
      mode="edit"
      :resource-class="ResourceClass"
      :resource-data="editForm"
      :is-electron-environment="isElectronEnvironment"
      :available-tags="allTags"
      add-title="添加资源"
      edit-title="编辑资源"
      add-button-text="添加"
      edit-button-text="保存修改"
      @close="closeEdit"
      @confirm="handleEditConfirm"
    />
    
    <!-- 漫画/图片查看器（用于 Image/Manga 资源类型） -->
    <ComicViewer
      v-if="showComicViewer || currentAlbum"
      :visible="showComicViewer"
      :album="currentAlbum"
      :pages="pages"
      :initial-page-index="currentPageIndex"
      @close="closeComicViewer"
      @page-change="handleComicViewerPageChange"
    />
    
    <!-- 小说阅读器（用于 Novel 资源类型） -->
    <div v-if="showNovelReader && currentReadingNovel" class="novel-reader-overlay" @click="closeNovelReader">
      <div class="novel-reader-content" @click.stop>
        <div class="reader-header">
          <div class="reader-title">
            <h3>{{ getNovelName(currentReadingNovel) }}</h3>
            <p class="reader-author">{{ getNovelAuthor(currentReadingNovel) }}</p>
          </div>
          <div class="reader-controls">
            <button class="btn-close-reader" @click="closeNovelReader" title="关闭阅读器">
              <span class="btn-icon">✕</span>
            </button>
          </div>
        </div>
        <div class="reader-content" ref="readerContent">
          <!-- PDF 文件使用 PDF 阅读器 -->
          <PdfReader
            v-if="getNovelFileType(currentReadingNovel) === 'pdf'"
            :file-path="getNovelFilePath(currentReadingNovel)"
            :initial-page="getNovelCurrentPage(currentReadingNovel) || 1"
            @page-changed="handlePdfPageChanged"
          />
          <!-- TXT 文件使用文本阅读器 -->
          <TextReader
            v-else-if="getNovelFileType(currentReadingNovel) === 'txt'"
            :file-path="getNovelFilePath(currentReadingNovel)"
            :initial-page="getNovelCurrentPage(currentReadingNovel) || 1"
            @page-changed="handleTextPageChanged"
            @progress-changed="handleTextProgressChanged"
          />
        </div>
      </div>
    </div>
    
    <!-- EPUB阅读器V2（用于 Novel 资源类型） -->
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
              ref="ebookReaderRef"
              :file-path="ebookReaderV2FilePath"
              @close="closeEbookReaderV2"
              @navigation-updated="handleNavigationUpdated"
              @rendition-ready="handleRenditionReady"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, toRefs } from 'vue'
import BaseView from './BaseView.vue'
import MediaCard from './MediaCard.vue'
import DetailPanel from './DetailPanel.vue'
import AlbumPagesGrid from './image/AlbumPagesGrid.vue'
import ComicViewer from './ComicViewer.vue'
import PdfReader from './PdfReader.vue'
import TextReader from './TextReader.vue'
import EbookReader from './epub-reader-v2/EbookReader.vue'
import ContentView from './epub-reader-v2/ContentView.vue'
import { createResourcePage } from '../composables/createResourcePage'
import { FunDropZone } from '../fun-ui'
// 资源类导入
import { Game } from '@resources/game.ts'
import { Software } from '@resources/soft.ts'
import { Manga } from '@resources/manga.ts'
import { SingleImage } from '@resources/singleImage.ts'
import { Video } from '@resources/video.ts'
import { VideoFolder } from '@resources/videoFolder.ts'
import { Novel } from '@resources/novel.ts'
import { Website } from '@resources/website.ts'
import { Audio } from '@resources/audio.ts'
import { Other } from '@resources/other.ts'
// 页面配置类导入
import { GamePage } from '../configs/pages/GamePage.ts'
import { TestGamePage } from '../configs/pages/TestPage.ts'
import { SoftwarePage } from '../configs/pages/SoftwarePage.ts'
import { ImagePage } from '../configs/pages/ImagePage.ts'
import { SingleImagePage } from '../configs/pages/SingleImagePage.ts'
import { VideoPage } from '../configs/pages/VideoPage.ts'
import { AnimePage } from '../configs/pages/AnimePage.ts'
import { NovelPage } from '../configs/pages/NovelPage.ts'
import { WebsitePage } from '../configs/pages/WebsitePage.ts'
import { AudioPage } from '../configs/pages/AudioPage.ts'
import { OtherPage } from '../configs/pages/OtherPage.ts'
import { executeActionHandler, type ActionHandlerContext } from '../utils/ResourceActionHandlers'
import { useGameRunningStore } from '../stores/game-running'
import { BaseResources } from '@resources/base/ResourcesDataBase.ts'
import notify from '../utils/NotificationService.ts'
import saveManager from '../utils/SaveManager.ts'
import { calculateAndUpdateResourceSize, calculateResourceSizesBatch } from '../utils/ResourceSizeService.ts'
import { useResourceFilter } from '../composables/useResourceFilter'
import { useImagePages } from '../composables/image/useImagePages'
import { useImageCache } from '../composables/image/useImageCache'
import ResourcesEditDialog from './ResourcesEditDialog.vue'
import type { FilterItem } from '../types/filter'

// 资源类型到资源类和页面配置的映射
const resourceClassMap: Record<string, { resourceClass: any; pageClass: any; testPageClass?: any }> = {
  Game: {
    resourceClass: Game,
    pageClass: GamePage,
    testPageClass: TestGamePage
  },
  Software: {
    resourceClass: Software,
    pageClass: SoftwarePage
  },
  Image: {
    resourceClass: Manga,
    pageClass: ImagePage
  },
  Manga: {
    resourceClass: Manga,
    pageClass: ImagePage
  },
  SingleImage: {
    resourceClass: SingleImage,
    pageClass: SingleImagePage
  },
  Video: {
    resourceClass: Video,
    pageClass: VideoPage
  },
  Anime: {
    resourceClass: VideoFolder, // 番剧使用文件夹结构
    pageClass: AnimePage
  },
  Novel: {
    resourceClass: Novel,
    pageClass: NovelPage
  },
  Website: {
    resourceClass: Website,
    pageClass: WebsitePage
  },
  Audio: {
    resourceClass: Audio,
    pageClass: AudioPage
  },
  Other: {
    resourceClass: Other, // Other 类型使用独立的 Other 资源类
    pageClass: OtherPage
  }
}

export default defineComponent({
  name: 'GenericResourceView',
  components: {
    BaseView,
    MediaCard,
    DetailPanel,
    AlbumPagesGrid,
    ComicViewer,
    PdfReader,
    TextReader,
    EbookReader,
    ContentView,
    ResourcesEditDialog,
    FunDropZone
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
  setup(props, { emit }) {
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
    
    // 根据页面 ID 选择正确的页面配置类
    // 只有 'test-game' 页面使用 TestGamePage，其他都使用正常的 pageClass
    const isTestPage = props.pageConfig?.id === 'test-game'
    const PageClass = (isTestPage && resourceConfig.testPageClass) 
      ? resourceConfig.testPageClass 
      : resourceConfig.pageClass
    
    const pageConfig = new PageClass()

    // 响应式数据
    const items = ref<any[]>([])
    const isElectronEnvironment = ref(false)
    const searchQuery = ref('')
    const sortBy = ref('name-asc')
    
    // 数据加载状态
    const isLoadingData = ref(false)
    
    /**
     * 从文件路径提取资源名称
     */
    const extractNameFromPath = (filePath: string): string => {
      if (!filePath) return '未知资源'
      const fileName = filePath.split(/[\\/]/).pop() || ''
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      
      let cleanName = nameWithoutExt
        .replace(/[-_\s]+/g, ' ')
        .trim()
      
      if (!cleanName) {
        cleanName = nameWithoutExt
      }
      
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    }
    
    /**
     * 处理拖拽文件
     */
    const handleFileDrop = async (files: File[]) => {
      try {
        console.log('[GenericResourceView] 拖拽文件数量:', files.length)
        
        if (files.length === 0) {
          notify.toast('error', '拖拽失败', '请拖拽文件到此处')
          return
        }
        
        let addedCount = 0
        let failedCount = 0
        let typeMismatchCount = 0
        
        for (const file of files) {
          try {
            const filePath = (file as any).path || file.name
            const fileName = file.name.toLowerCase()
            
            // 获取文件扩展名
            const fileExt = fileName.includes('.') 
              ? '.' + fileName.split('.').pop() 
              : ''
            
            console.log(`[GenericResourceView] 处理文件: ${file.name}, 扩展名: ${fileExt}`)
            
            // 检查是否已存在相同路径
            const existingItem = items.value.find((item: any) => {
              const itemPath = BaseResources.extractPrimitiveValue(
                item.resourcePath?.value || item.resourcePath
              )
              return itemPath === filePath
            })
            
            if (existingItem) {
              console.log(`[GenericResourceView] 资源已存在: ${file.name}`)
              failedCount++
              continue
            }
            
            // 根据页面配置的 resourceTypes 自动匹配资源类型
            const pageResourceTypes = props.pageConfig?.resourceTypes || [resourceType.value]
            console.log('[GenericResourceView] 页面支持的资源类型:', pageResourceTypes)
            
            let matchedResourceType: string | null = null
            let MatchedResourceClass: any = null
            
            // 遍历页面支持的资源类型，找到第一个匹配的
            for (const resType of pageResourceTypes) {
              const config = resourceClassMap[resType]
              if (!config) {
                console.warn(`[GenericResourceView] 未找到资源类型配置: ${resType}`)
                continue
              }
              
              const ResourceClassToCheck = config.resourceClass
              const acceptedExtensions = ResourceClassToCheck.acceptedExtensions || []
              
              console.log(`[GenericResourceView] 检查资源类型 ${resType}, 接受的扩展名:`, acceptedExtensions)
              
              // 检查是否接受所有文件类型
              if (acceptedExtensions.includes('*')) {
                matchedResourceType = resType
                MatchedResourceClass = ResourceClassToCheck
                console.log(`[GenericResourceView] 匹配成功（接受所有类型）: ${resType}`)
                break
              }
              
              // 检查文件扩展名是否匹配
              if (acceptedExtensions.some((ext: string) => ext.toLowerCase() === fileExt)) {
                matchedResourceType = resType
                MatchedResourceClass = ResourceClassToCheck
                console.log(`[GenericResourceView] 匹配成功: ${resType}`)
                break
              }
            }
            
            // 如果没有匹配的资源类型
            if (!matchedResourceType || !MatchedResourceClass) {
              console.warn(`[GenericResourceView] 文件 ${file.name} 不匹配页面的资源类型配置`)
              typeMismatchCount++
              continue
            }
            
            // 创建匹配到的资源类型
            const resourceData: any = {
              name: extractNameFromPath(file.name),
              description: '',
              tags: [],
              resourcePath: filePath,
              coverPath: '',
              folderSize: 0,
              playTime: 0,
              playCount: 0,
              lastPlayed: null,
              firstPlayed: null,
              addedDate: new Date().toISOString(),
              fileExists: true
            }
            
            // 获取文件大小
            if (isElectronEnvironment.value && window.electronAPI) {
              try {
                if (window.electronAPI.getFileStats) {
                  const result = await window.electronAPI.getFileStats(filePath)
                  if (result.success && result.size) {
                    resourceData.folderSize = result.size
                  }
                } else if (window.electronAPI.getFolderSize) {
                  const result = await window.electronAPI.getFolderSize(filePath)
                  if (result.success) {
                    resourceData.folderSize = result.size
                  }
                }
              } catch (error) {
                console.warn('[GenericResourceView] 获取文件大小失败:', error)
              }
            }
            
            // 使用匹配到的资源类创建实例
            const resource = MatchedResourceClass.fromJSON(resourceData)
            console.log(`[GenericResourceView] 创建资源对象 (类型: ${matchedResourceType}):`, resource)
            
            // 添加到列表
            items.value.push(resource)
            addedCount++
            
          } catch (error: any) {
            console.error(`[GenericResourceView] 添加文件失败: ${file.name}`, error)
            failedCount++
          }
        }
        
        // 保存数据
        if (addedCount > 0) {
          await saveData()
        }
        
        // 显示结果通知
        if (addedCount > 0) {
          notify.toast(
            'success',
            '添加成功',
            `成功添加 ${addedCount} 个资源${failedCount > 0 ? `，${failedCount} 个失败` : ''}${typeMismatchCount > 0 ? `，${typeMismatchCount} 个类型不匹配` : ''}`
          )
        } else if (typeMismatchCount > 0) {
          notify.toast(
            'error',
            '资源类型不匹配',
            `${typeMismatchCount} 个文件的类型不匹配当前页面的配置`
          )
        } else if (failedCount > 0) {
          notify.toast(
            'error',
            '添加失败',
            `${failedCount} 个文件添加失败（可能已存在）`
          )
        }
        
      } catch (error: any) {
        console.error('[GenericResourceView] 处理拖拽失败:', error)
        notify.toast('error', '处理失败', `处理拖拽文件失败: ${error.message}`)
      }
    }
    
    /**
     * 处理拖拽错误
     */
    const handleDropError = (error: { type: 'size' | 'count' | 'type', message: string }) => {
      const title = error.type === 'size' ? '文件过大' : 
                    error.type === 'count' ? '文件数量超限' : 
                    '文件类型不支持'
      notify.toast('error', title, error.message)
    }
    
    /**
     * 保存页面数据到文件
     */
    const saveData = async () => {
      const pageId = props.pageConfig?.id
      if (!pageId) {
        console.warn('[GenericResourceView] 无法保存数据：pageId 不存在')
        return false
      }
      
      try {
        // 将资源实例转换为可保存的 JSON 数据
        const saveableData = items.value.map(item => 
          BaseResources.getSaveableData ? BaseResources.getSaveableData(item) : item
        )
        
        const success = await saveManager.savePageData(pageId, saveableData)
        if (!success) {
          console.error(`[GenericResourceView] 页面 ${pageId} 数据保存失败`)
        }
        return success
      } catch (error) {
        console.error(`[GenericResourceView] 保存页面 ${pageId} 数据时出错:`, error)
        return false
      }
    }

    // 图片/漫画查看器相关状态（用于 Image/Manga 资源类型）
    const currentAlbum = ref<any>(null)
    const currentPageIndex = ref(0)
    const pages = ref<string[]>([])
    const showComicViewer = ref(false)
    
    // 详情页图片预览相关状态（用于 Image/Manga 资源类型）
    const detailPages = ref<string[]>([])
    const showDetailModal = ref(false) // 用于 imageCacheComposable（完全复刻 ImageView.vue）
    
    // 使用详情页图片分页 composable（完全复刻 ImageView.vue）
    const imagePagesComposable = useImagePages({
      pages: detailPages,
      defaultPageSize: 50
    })

    // 小说阅读器相关状态（用于 Novel 资源类型）
    const currentReadingNovel = ref<any>(null)
    const showNovelReader = ref(false)
    const showEbookReaderV2 = ref(false)
    const ebookReaderV2FilePath = ref<string>('')

    // 检查 Electron 环境
    isElectronEnvironment.value = !!(window as any).electronAPI

    // 获取排序选项
    const sortOptions = pageConfig.getSortOptions()

    // 游戏运行状态管理（使用 store）
    const gameRunningStore = useGameRunningStore()
    
    // 存储游戏启动时的初始 playTime（Map<resourceId, initialPlayTime>）
    const gameInitialPlayTimes = ref<Map<string, number>>(new Map())
    
    // 定时器引用（用于定期更新总时长）
    let playtimeUpdateTimer: ReturnType<typeof setInterval> | null = null

    // 检查资源是否正在运行（通用方法，支持所有资源类型）
    const isResourceRunning = (resource: any): boolean => {
      const resourceId = resource.id?.value || resource.id
      if (!resourceId) return false
      
      // 对于游戏类型，使用 gameRunningStore 检查
      if (resourceType.value === 'Game') {
        return gameRunningStore.isGameRunning(resourceId)
      }
      
      // 其他资源类型暂时不支持运行状态检查
      return false
    }

    // 创建用于筛选的 isGameRunning 函数（接受 Game 对象）
    const isGameRunningForFilter = (game: any) => {
      return gameRunningStore.isGameRunning(game.id?.value || game.id)
    }

    
    // 使用通用筛选 composable（传入页面配置实例和额外数据）
    const filterComposable = useResourceFilter(
      items, 
      searchQuery, 
      sortBy, 
      pageConfig, 
      { isGameRunning: isGameRunningForFilter }
    )
    
    // 从筛选器状态中获取所有标签（用于编辑对话框）
    const allTags = computed<FilterItem[]>(() => {
      const tagsState = filterComposable.filterStates?.tags
      return tagsState?.items?.value || []
    })

    // 终止游戏方法
    const terminateGame = async (resource: any) => {
      try {
        const resourceName = BaseResources.extractPrimitiveValue(resource.name?.value || resource.name)
        const executablePath = BaseResources.extractPrimitiveValue(
          resource.resourcePath?.value || resource.executablePath?.value || resource.resourcePath || resource.executablePath
        )
        const resourceId = BaseResources.extractPrimitiveValue(resource.id?.value || resource.id)
        
        if (!isElectronEnvironment.value || !window.electronAPI || !window.electronAPI.terminateGame) {
          notify.toast('error', '操作失败', '当前环境不支持强制结束游戏功能')
          return
        }

        const result = await window.electronAPI.terminateGame(executablePath)
        
        if (result.success) {
          // 从运行列表中移除
          if (resourceType.value === 'Game') {
            gameRunningStore.removeRunningGame(resourceId)
          }
          
          // 更新游戏时长（使用初始时长逻辑）
          if (result.playTime && result.playTime > 0) {
            const currentPlayTime = BaseResources.extractPrimitiveValue(resource.playTime?.value || resource.playTime) || 0
            const initialPlayTime = gameInitialPlayTimes.value.get(resourceId) || currentPlayTime
            // 计算最终总时长（使用 store 中的会话时长，如果 store 中还有数据）
            let totalPlayTime = currentPlayTime
            if (gameRunningStore.isGameRunning(resourceId)) {
              // 如果还在运行列表中，使用 store 计算
              totalPlayTime = gameRunningStore.getCurrentPlayTime(resourceId, initialPlayTime)
            } else {
              // 否则直接累加
              totalPlayTime = currentPlayTime + result.playTime
            }
            
            // 更新资源数据
            const item = items.value.find((i: any) => (i.id?.value || i.id) === resourceId)
            if (item) {
              if (item.playTime && typeof item.playTime === 'object' && 'value' in item.playTime) {
                item.playTime.value = totalPlayTime
              } else {
                item.playTime = totalPlayTime
              }
            }
            
            // 清除保存的初始值
            gameInitialPlayTimes.value.delete(resourceId)
          }
          
          notify.toast('success', '游戏已结束', `${resourceName} 已强制结束`)
        } else {
          console.warn('[GenericResourceView] ⚠️ 强制结束游戏失败:', result.error)
          notify.toast('error', '结束失败', `结束失败: ${result.error || '未知错误'}`)
        }
      } catch (error) {
        console.error('[GenericResourceView] ❌ 终止游戏失败:', error)
        notify.toast('error', '结束失败', `结束失败: ${error.message || '未知错误'}`)
      }
    }

    // 处理游戏进程结束事件
    const handleGameProcessEnded = (data: { executablePath: string; playTime: number; pid: number }) => {
      // 根据 executablePath 找到对应的资源
      const resource = items.value.find((item: any) => {
        const itemPath = BaseResources.extractPrimitiveValue(
          item.resourcePath?.value || item.executablePath?.value || item.resourcePath || item.executablePath
        )
        return itemPath === data.executablePath
      })
      
      if (resource) {
        const resourceId = BaseResources.extractPrimitiveValue(resource.id?.value || resource.id)
        const resourceName = BaseResources.extractPrimitiveValue(resource.name?.value || resource.name)
        
        // 从运行列表中移除
        if (resourceType.value === 'Game') {
          gameRunningStore.removeRunningGame(resourceId)
        }
        
        // 更新游戏时长（使用最终时长更新逻辑）
        if (data.playTime && data.playTime > 0) {
          // 获取初始 playTime（从保存的初始值获取，如果不存在则使用当前值）
          const currentPlayTime = BaseResources.extractPrimitiveValue(resource.playTime?.value || resource.playTime) || 0
          const initialPlayTime = gameInitialPlayTimes.value.get(resourceId) || currentPlayTime
          // 计算最终总时长（使用 store 中的会话时长，如果 store 中还有数据）
          let totalPlayTime = currentPlayTime
          if (gameRunningStore.isGameRunning(resourceId)) {
            // 如果还在运行列表中，使用 store 计算
            totalPlayTime = gameRunningStore.getCurrentPlayTime(resourceId, initialPlayTime)
          } else {
            // 否则直接累加
            totalPlayTime = currentPlayTime + data.playTime
          }
          
          // 更新资源数据
          if (resource.playTime && typeof resource.playTime === 'object' && 'value' in resource.playTime) {
            resource.playTime.value = totalPlayTime
          } else {
            resource.playTime = totalPlayTime
          }
          
          // 更新最后游玩时间
          if (resource.lastPlayed && typeof resource.lastPlayed === 'object' && 'value' in resource.lastPlayed) {
            resource.lastPlayed.value = new Date().toISOString()
          } else {
            resource.lastPlayed = new Date().toISOString()
          }
          
          // 清除保存的初始值
          gameInitialPlayTimes.value.delete(resourceId)
        }
      } else {
        console.warn('[GenericResourceView] ⚠️ 未找到对应的资源，executablePath:', data.executablePath)
      }
    }

    // 处理资源操作（根据 actionConfig 启动资源）
    const handleResourceAction = async (resource: any) => {
      // 从资源实例获取实际的资源类型
      const actualResourceType = BaseResources.extractPrimitiveValue(
        resource.resourceType?.value || resource.resourceType
      ) || resource?.constructor?.name || resourceType.value
      
      // 构建 handler 上下文
      const context: ActionHandlerContext = {
        isElectronEnvironment: isElectronEnvironment.value,
        updateResource: async (id: string, updates: any) => {
          // 更新资源数据
          const item = items.value.find((i: any) => (i.id?.value || i.id) === id)
          if (item) {
            // 更新 ResourceField 的值
            Object.keys(updates).forEach(key => {
              if (item[key] && typeof item[key] === 'object' && 'value' in item[key]) {
                item[key].value = updates[key]
              } else {
                item[key] = updates[key]
              }
            })
          }
        },
        isResourceRunning: (resource: any) => {
          return isResourceRunning(resource)
        },
        addRunningResource: (resourceInfo: any) => {
          // 对于游戏类型，添加到运行列表
          if (resourceType.value === 'Game') {
            gameRunningStore.addRunningGame({
              id: resourceInfo.id,
              pid: resourceInfo.pid,
              windowTitles: resourceInfo.windowTitles || [],
              gameName: resourceInfo.gameName || ''
            })
          }
        },
        removeRunningResource: (resourceId: string) => {
          // 对于游戏类型，从运行列表移除
          if (resourceType.value === 'Game') {
            gameRunningStore.removeRunningGame(resourceId)
          }
        },
        getInitialPlayTime: (resourceId: string) => {
          // 获取资源启动时的初始 playTime
          const item = items.value.find((i: any) => (i.id?.value || i.id) === resourceId)
          if (item) {
            const playTime = item.playTime?.value ?? item.playTime
            return playTime != null ? playTime : 0
          }
          return 0
        },
        saveInitialPlayTime: (resourceId: string, playTime: number) => {
          // 保存初始运行时长到 Map 中
          gameInitialPlayTimes.value.set(resourceId, playTime)
        },
        closeDetail: () => {
          // 关闭详情页面（如果有的话）
          if ((resourcePage as any).closeDetail) {
            (resourcePage as any).closeDetail()
          }
        },
        showTerminateConfirmDialog: (resource: any) => {
          // 显示终止确认对话框
          const resourceName = resource.name?.value || resource.name || '资源'
          if (confirm(`资源 "${resourceName}" 正在运行，是否要终止？`)) {
            // 调用终止方法
            terminateGame(resource)
          }
        },
        // 图片/漫画查看器相关方法（用于 Image/Manga 资源类型）
        setCurrentAlbum: (album: any) => {
          currentAlbum.value = album
        },
        setCurrentPageIndex: (index: number) => {
          currentPageIndex.value = index
        },
        clearPages: () => {
          pages.value = []
        },
        updateViewInfo: async (album: any) => {
          // 更新浏览信息（增加浏览次数、更新最后查看时间等）
          const albumId = BaseResources.extractPrimitiveValue(album.id?.value || album.id)
          const item = items.value.find((i: any) => (i.id?.value || i.id) === albumId)
          if (item) {
            // 更新最后查看时间
            const now = new Date().toISOString()
            if (item.lastViewed && typeof item.lastViewed === 'object' && 'value' in item.lastViewed) {
              item.lastViewed.value = now
            } else {
              item.lastViewed = now
            }
            
            // 增加浏览次数
            const currentViewCount = BaseResources.extractPrimitiveValue(item.viewCount?.value || item.viewCount) || 0
            if (item.viewCount && typeof item.viewCount === 'object' && 'value' in item.viewCount) {
              item.viewCount.value = currentViewCount + 1
            } else {
              item.viewCount = currentViewCount + 1
            }
          }
        },
        loadAlbumPages: async () => {
          // 加载专辑的图片文件列表
          if (!currentAlbum.value) {
            console.warn('[GenericResourceView] 当前专辑为空，无法加载页面')
            return
          }
          
          const resourcePath = BaseResources.extractPrimitiveValue(
            currentAlbum.value.resourcePath?.value || currentAlbum.value.resourcePath
          )
          
          if (!resourcePath) {
            console.warn('[GenericResourceView] 专辑路径为空，无法加载页面')
            return
          }
          
          try {
            if (isElectronEnvironment.value && window.electronAPI && window.electronAPI.listImageFiles) {
              const resp = await window.electronAPI.listImageFiles(resourcePath)
              
              if (resp.success) {
                pages.value = resp.files || []
              } else {
                console.error('[GenericResourceView] 加载图片文件失败:', resp.error)
                pages.value = []
              }
            } else {
              console.warn('[GenericResourceView] Electron API 不可用，无法加载图片文件')
              pages.value = []
            }
          } catch (error) {
            console.error('[GenericResourceView] 加载专辑页面失败:', error)
            pages.value = []
          }
        },
        showComicViewer: (show: boolean) => {
          showComicViewer.value = show
        },
        // 小说阅读器相关方法（用于 Novel 资源类型）
        setCurrentNovel: (novel: any) => {
          currentReadingNovel.value = novel
        },
        showNovelReader: (show: boolean) => {
          showNovelReader.value = show
        },
        showEbookReaderV2: (show: boolean) => {
          showEbookReaderV2.value = show
        },
        setEbookReaderV2FilePath: (filePath: string) => {
          ebookReaderV2FilePath.value = filePath
        },
        getGlobalSettings: async () => {
          // 获取全局设置（用于小说打开模式等）
          try {
            const saveManager = (await import('../utils/SaveManager.ts')).default
            const settings = await saveManager.loadSettings()
            
            // 返回小说相关设置
            return {
              novelDefaultOpenMode: settings.novel?.defaultOpenMode || settings.novelDefaultOpenMode || 'internal',
              novel: settings.novel || {}
            }
          } catch (error) {
            console.warn('[GenericResourceView] 获取全局设置失败:', error)
            return {
              novelDefaultOpenMode: 'internal',
              novel: {}
            }
          }
        },
        getFileType: (filePath: string): string => {
          if (!filePath) return 'txt'
          const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
          if (ext === '.epub') return 'epub'
          if (ext === '.mobi') return 'mobi'
          if (ext === '.pdf') return 'pdf'
          return 'txt'
        },
        updateReadingStats: async (novel: any) => {
          // 更新阅读统计（增加阅读次数、更新最后阅读时间等）
          const novelId = BaseResources.extractPrimitiveValue(novel.id?.value || novel.id)
          const item = items.value.find((i: any) => (i.id?.value || i.id) === novelId)
          if (item) {
            // 更新最后阅读时间
            const now = new Date().toISOString()
            if (item.lastRead && typeof item.lastRead === 'object' && 'value' in item.lastRead) {
              item.lastRead.value = now
            } else {
              item.lastRead = now
            }
            
            // 增加阅读次数
            const currentReadCount = BaseResources.extractPrimitiveValue(item.readCount?.value || item.readCount) || 0
            if (item.readCount && typeof item.readCount === 'object' && 'value' in item.readCount) {
              item.readCount.value = currentReadCount + 1
            } else {
              item.readCount = currentReadCount + 1
            }
          }
        }
      }

      // 执行 handler
      await executeActionHandler(resource, context)
    }

    // 关闭漫画查看器
    const closeComicViewer = () => {
      showComicViewer.value = false
      currentAlbum.value = null
      currentPageIndex.value = 0
      pages.value = []
    }

    // 处理漫画查看器页面变化
    const handleComicViewerPageChange = (newIndex: number) => {
      currentPageIndex.value = newIndex
    }

    // 小说阅读器相关方法
    const closeNovelReader = () => {
      showNovelReader.value = false
      currentReadingNovel.value = null
    }

    const closeEbookReaderV2 = () => {
      showEbookReaderV2.value = false
      ebookReaderV2FilePath.value = ''
      ebookNavigation.value = null
      ebookBookAvailable.value = false
      ebookRendition.value = null
    }

    // EPUB 阅读器 V2 相关状态
    const ebookNavigation = ref<any>(null)
    const ebookBookAvailable = ref(false)
    const ebookRendition = ref<any>(null)

    const handleNavigationUpdated = (navigation: any) => {
      ebookNavigation.value = navigation
      ebookBookAvailable.value = true
    }

    const handleRenditionReady = (rendition: any) => {
      ebookRendition.value = rendition
    }

    const ebookReaderRef = ref<any>(null)

    const handleEbookJumpTo = (href: string) => {
      if (ebookReaderRef.value && typeof ebookReaderRef.value.jumpTo === 'function') {
        ebookReaderRef.value.jumpTo(href)
      }
    }

    // 小说辅助方法
    const getNovelName = (novel: any): string => {
      return BaseResources.extractPrimitiveValue(novel.name?.value || novel.name) || '未知小说'
    }

    const getNovelAuthor = (novel: any): string => {
      return BaseResources.extractPrimitiveValue(novel.author?.value || novel.author) || ''
    }

    const getNovelFilePath = (novel: any): string => {
      return BaseResources.extractPrimitiveValue(
        novel.resourcePath?.value || novel.filePath?.value || novel.resourcePath || novel.filePath
      ) || ''
    }

    const getNovelFileType = (novel: any): string => {
      const filePath = getNovelFilePath(novel)
      if (!filePath) return 'txt'
      const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
      if (ext === '.epub') return 'epub'
      if (ext === '.mobi') return 'mobi'
      if (ext === '.pdf') return 'pdf'
      return 'txt'
    }

    const getNovelCurrentPage = (novel: any): number => {
      return BaseResources.extractPrimitiveValue(novel.currentPage?.value || novel.currentPage) || 1
    }

    const getNovelNameByPath = (filePath: string): string => {
      if (!filePath) return '未知小说'
      const novel = items.value.find((n: any) => {
        const nPath = BaseResources.extractPrimitiveValue(
          n.resourcePath?.value || n.filePath?.value || n.resourcePath || n.filePath
        )
        return nPath === filePath
      })
      return novel ? getNovelName(novel) : (filePath.split(/[\\/]/).pop() || '未知小说')
    }

    // 处理 PDF 页面变化
    const handlePdfPageChanged = async (pageNum: number) => {
      if (!currentReadingNovel.value) return
      
      const novelId = BaseResources.extractPrimitiveValue(currentReadingNovel.value.id?.value || currentReadingNovel.value.id)
      const item = items.value.find((i: any) => (i.id?.value || i.id) === novelId)
      if (item) {
        if (item.currentPage && typeof item.currentPage === 'object' && 'value' in item.currentPage) {
          item.currentPage.value = pageNum
        } else {
          item.currentPage = pageNum
        }
      }
    }

    // 处理文本阅读器页面变化
    const handleTextPageChanged = async (pageNum: number) => {
      if (!currentReadingNovel.value) return
      
      const novelId = BaseResources.extractPrimitiveValue(currentReadingNovel.value.id?.value || currentReadingNovel.value.id)
      const item = items.value.find((i: any) => (i.id?.value || i.id) === novelId)
      if (item) {
        if (item.currentPage && typeof item.currentPage === 'object' && 'value' in item.currentPage) {
          item.currentPage.value = pageNum
        } else {
          item.currentPage = pageNum
        }
      }
    }

    // 处理文本阅读器进度变化
    const handleTextProgressChanged = async (progress: number) => {
      if (!currentReadingNovel.value) return
      
      const novelId = BaseResources.extractPrimitiveValue(currentReadingNovel.value.id?.value || currentReadingNovel.value.id)
      const item = items.value.find((i: any) => (i.id?.value || i.id) === novelId)
      if (item) {
        if (item.readProgress && typeof item.readProgress === 'object' && 'value' in item.readProgress) {
          item.readProgress.value = progress
        } else {
          item.readProgress = progress
        }
      }
    }

    // 使用筛选 composable 的 filteredItems（已经是响应式的）
    // 直接使用 filterComposable.filteredGames，确保引用正确
    const filteredItems = filterComposable.filteredGames
    

    // 监听 items 变化，自动提取筛选器数据（完全按照 ImageView 的方式）
    watch([items], () => {
      if (filterComposable.extractAllFilters && items.value.length > 0) {
        filterComposable.extractAllFilters()
        // 延迟更新筛选器数据，确保数据已提取
        setTimeout(() => {
          // 注意：这里不能直接 emit，需要在 methods 中通过 updateFilterData 处理
        }, 0)
      }
    }, { immediate: false, deep: true })

    // 创建右键菜单处理器（简化版）
    const contextMenuHandlers = {
      detail: (item: any) => {
        // 调用 showDetail 方法（从 resourcePage 获取）
        if ((resourcePage as any).showDetail) {
          (resourcePage as any).showDetail(item)
        }
      },
      edit: (item: any) => {
        // 编辑
      },
      remove: (item: any) => {
        const index = items.value.findIndex((i: any) => (i.id?.value || i.id) === (item.id?.value || item.id))
        if (index > -1) {
          items.value.splice(index, 1)
        }
      },
      'update-folder-size': async (item: any) => {
        if (!isElectronEnvironment.value) {
          notify.toast('error', '操作失败', '当前环境不支持文件夹大小计算功能')
          return
        }
        
        const cardConfig = item.constructor?.cardDisplayConfig || 
                         (typeof item.constructor?.getCardDisplayConfig === 'function' 
                           ? item.constructor.getCardDisplayConfig() 
                           : null)
        if (cardConfig?.badge?.field !== 'folderSize') {
          notify.toast('error', '操作失败', '该资源类型不支持文件夹大小计算')
          return
        }
        
        try {
          const oldSize = BaseResources.extractPrimitiveValue(item.folderSize?.value || item.folderSize) || 0
          const success = await calculateAndUpdateResourceSize(item, isElectronEnvironment.value)
          
          if (success) {
            const newSize = BaseResources.extractPrimitiveValue(item.folderSize?.value || item.folderSize) || 0
            const oldSizeMB = (oldSize / 1024 / 1024).toFixed(2)
            const newSizeMB = (newSize / 1024 / 1024).toFixed(2)
            const itemName = BaseResources.extractPrimitiveValue(item.name?.value || item.name) || '未知'
            
            notify.toast(
              'success',
              '更新成功',
              `"${itemName}" 文件夹大小已更新\n旧大小: ${oldSizeMB} MB\n新大小: ${newSizeMB} MB`
            )
          } else {
            notify.toast('error', '更新失败', '无法获取文件夹大小')
          }
        } catch (error: any) {
          console.error('更新文件夹大小失败:', error)
          const itemName = BaseResources.extractPrimitiveValue(item.name?.value || item.name) || '未知'
          notify.toast('error', '更新失败', `无法获取 "${itemName}" 的文件夹大小: ${error.message}`)
        }
      }
    }

    // 使用工厂函数创建资源页面（简化版）
    // 使用图片缓存 composable（完全复刻 ImageView.vue，需要在 resourcePage 之前创建）
    const imageCacheComposable = useImageCache({
      enableThumbnails: true,
      jpegQuality: 80,
      thumbnailSize: 200,
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      preloadCount: 3,
      isComicViewer: showComicViewer,
      isDetailModal: showDetailModal,
      pages: detailPages
    })
    
    const resourcePage = createResourcePage({
      pageConfig: {
        pageType: (resourceType.value || 'game').toLowerCase() + 's',
        itemType: (pageConfig as any).name || '资源',
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
          
          // 如果资源有 folderSize 字段配置，自动计算大小
          const cardConfig = newItem.constructor?.cardDisplayConfig || 
                           (typeof newItem.constructor?.getCardDisplayConfig === 'function' 
                             ? newItem.constructor.getCardDisplayConfig() 
                             : null)
          if (cardConfig?.badge?.field === 'folderSize' && isElectronEnvironment.value) {
            await calculateAndUpdateResourceSize(newItem, isElectronEnvironment.value)
          }
          
          items.value.push(newItem)
          
          // 保存数据
          await saveData()
          
          return newItem
        },
        onUpdate: async (id: string, updates: any) => {
          const item = items.value.find((i: any) => (i.id?.value || i.id) === id)
          if (item) {
            Object.assign(item, updates)
            
            // 如果更新了 resourcePath，且资源有 folderSize 字段配置，重新计算大小
            if (updates.resourcePath && isElectronEnvironment.value) {
              const cardConfig = item.constructor?.cardDisplayConfig || 
                               (typeof item.constructor?.getCardDisplayConfig === 'function' 
                                 ? item.constructor.getCardDisplayConfig() 
                                 : null)
              if (cardConfig?.badge?.field === 'folderSize') {
                await calculateAndUpdateResourceSize(item, isElectronEnvironment.value)
              }
            }
            
            // 保存数据
            await saveData()
          }
        },
        onDelete: async (id: string) => {
          const index = items.value.findIndex((i: any) => (i.id?.value || i.id) === id)
          if (index > -1) {
            items.value.splice(index, 1)
            
            // 保存数据
            await saveData()
          }
        },
        onLoad: async () => {
          // 数据已在 onMounted 时加载
        },
        onSave: async () => {
          // 调用统一的保存函数
          await saveData()
        },
        getItemName: (item: any) => item.name?.value || item.name,
        itemType: pageConfig.name || '资源'
      },
      contextMenuItems: ResourceClass.contextMenuItems || [],
      contextMenuHandlers: contextMenuHandlers,
      emptyState: pageConfig.getEmptyStateConfig ? pageConfig.getEmptyStateConfig() : {
        icon: '📄',
        title: '暂无数据',
        description: '点击"添加"按钮添加新项目',
        buttonText: '添加',
        buttonAction: 'showAddDialog'
      },
      toolbar: {
        ...pageConfig.getToolbarConfig(),
        sortOptions: sortOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      },
      displayLayout: pageConfig.displayLayoutConfig,
      // 不提供 getStats，让 DetailPanel 使用配置生成的数据记录
      // getStats: (item: any) => {
      //   // 简化版统计信息
      //   return [
      //     { label: '名称', value: item.name?.value || item.name || '未知' }
      //   ]
      // },
      // 不提供 getActions，让 DetailPanel 使用默认的 actions（会根据 type 自动生成对应的按钮）
      // getActions: (item: any) => {
      //   return [
      //     { key: 'edit', icon: '✏️', label: '编辑', class: 'btn-edit' },
      //     { key: 'remove', icon: '🗑️', label: '删除', class: 'btn-remove' }
      //   ]
      // }
    })

    // 获取文件存在性状态（辅助函数）
    const getFileExists = (item: any): boolean => {
      if (item.fileExists && typeof item.fileExists === 'object' && 'value' in item.fileExists) {
        return item.fileExists.value !== false
      }
      return item.fileExists !== false
    }

    // 设置文件存在性状态（辅助函数）
    const setFileExists = (item: any, exists: boolean): void => {
      if (item.fileExists && typeof item.fileExists === 'object' && 'value' in item.fileExists) {
        item.fileExists.value = exists
      } else {
        item.fileExists = exists
      }
    }

    // 获取资源文件路径（支持多种字段名）
    const getResourceFilePath = (item: any): string | null => {
      // 尝试不同的路径字段名
      const pathFields = ['resourcePath', 'filePath', 'executablePath']
      for (const field of pathFields) {
        const fieldValue = item[field]
        if (fieldValue) {
          const path = BaseResources.extractPrimitiveValue(fieldValue)
          if (path) return path
        }
      }
      return null
    }

    // 通用的文件存在性检查函数
    const checkFileExistence = async (): Promise<void> => {
      if (!isElectronEnvironment.value || !window.electronAPI || !window.electronAPI.checkFileExists) {
        // 如果API不可用，默认设置为存在
        items.value.forEach((item: any) => {
          setFileExists(item, true)
        })
        return
      }
      
      let checkedCount = 0
      let missingCount = 0
      
      for (const item of items.value) {
        // 获取文件路径
        const filePath = getResourceFilePath(item)
        
        // 如果没有找到路径，标记为不存在
        if (!filePath) {
          setFileExists(item, false)
          missingCount++
          checkedCount++
          continue
        }
        
        try {
          const result = await window.electronAPI.checkFileExists(filePath)
          const exists = result.exists || false
          
          // 更新 fileExists 字段
          setFileExists(item, exists)
          
          if (!exists) {
            missingCount++
          }
        } catch (error) {
          const itemName = BaseResources.extractPrimitiveValue(item.name?.value || item.name) || '未知资源'
          console.error(`[GenericResourceView] ❌ 检测文件存在性失败: ${itemName}`, error)
          
          // 出错时标记为不存在
          setFileExists(item, false)
          missingCount++
        }
        
        checkedCount++
      }
      
      // 如果有丢失的文件，显示提醒
      if (missingCount > 0) {
        notify.toast('warning', '文件检测完成', `检测到 ${missingCount} 个文件不存在`)
      }
    }

    // 自动计算资源大小（仅针对配置了 folderSize 的资源）
    const calculateResourceSizes = async () => {
      if (!isElectronEnvironment.value) {
        return
      }
      
      // 检查资源类是否配置了 folderSize badge
      const cardConfig = ResourceClass.cardDisplayConfig || 
                        (typeof ResourceClass.getCardDisplayConfig === 'function' 
                          ? ResourceClass.getCardDisplayConfig() 
                          : null)
      
      if (cardConfig?.badge?.field !== 'folderSize') {
        return
      }
      
      // 筛选出有 resourcePath 的资源
      const resourcesToCalculate = items.value.filter((item: any) => {
        const resourcePath = BaseResources.extractPrimitiveValue(
          item.resourcePath?.value || item.resourcePath || item.executablePath?.value || item.executablePath
        )
        return resourcePath && typeof resourcePath === 'string' && resourcePath.trim()
      })
      
      if (resourcesToCalculate.length === 0) {
        return
      }
      
      // 批量计算大小
      await calculateResourceSizesBatch(
        resourcesToCalculate,
        isElectronEnvironment.value
      )
    }

    // 监听请求更新游戏时长事件（实时更新总时长）
    const handleRequestUpdatePlaytime = (event: CustomEvent) => {
      const { gameId } = event.detail
      const resource = items.value.find((i: any) => (i.id?.value || i.id) === gameId)
      if (resource && gameRunningStore && gameInitialPlayTimes.value) {
        // 如果还没有保存初始值，先保存（第一次更新时）
        if (!gameInitialPlayTimes.value.has(gameId)) {
          const playTimeValue = BaseResources.extractPrimitiveValue(resource.playTime?.value || resource.playTime) || 0
          gameInitialPlayTimes.value.set(gameId, playTimeValue)
        }
        
        // 获取初始 playTime（启动时的值）
        const initialPlayTime = gameInitialPlayTimes.value.get(gameId) || 0
        // 计算当前总时长 = 初始时长 + 会话时长
        const totalPlayTime = gameRunningStore.getCurrentPlayTime(gameId, initialPlayTime)
        // 更新游戏时长（用于显示）
        if (resource.playTime && typeof resource.playTime === 'object' && 'value' in resource.playTime) {
          resource.playTime.value = totalPlayTime
        } else {
          resource.playTime = totalPlayTime
        }
      }
    }
    
    // 监听请求最终游戏时长事件（游戏结束时）
    const handleRequestFinalPlaytime = (event: CustomEvent) => {
      const { gameId } = event.detail
      const resource = items.value.find((i: any) => (i.id?.value || i.id) === gameId)
      if (resource && gameRunningStore && gameInitialPlayTimes.value) {
        // 获取初始 playTime（从保存的初始值获取，如果不存在则使用当前值）
        const currentPlayTime = BaseResources.extractPrimitiveValue(resource.playTime?.value || resource.playTime) || 0
        const initialPlayTime = gameInitialPlayTimes.value.get(gameId) || currentPlayTime
        // 计算最终总时长
        const totalPlayTime = gameRunningStore.getCurrentPlayTime(gameId, initialPlayTime)
        // 更新并保存
        if (resource.playTime && typeof resource.playTime === 'object' && 'value' in resource.playTime) {
          resource.playTime.value = totalPlayTime
        } else {
          resource.playTime = totalPlayTime
        }
        // 清除保存的初始值
        gameInitialPlayTimes.value.delete(gameId)
        
        // 注意：这里不调用保存方法，因为 GenericResourceView 是通用组件，保存逻辑由上层管理
        // 如果需要保存，可以通过事件通知上层组件
      }
    }

    // 监听游戏进程结束事件
    onMounted(async () => {
      // 1. 加载页面数据
      const pageId = props.pageConfig?.id
      if (pageId) {
        isLoadingData.value = true
        try {
          const loadedData = await saveManager.loadPageData(pageId)
          
          // 将 JSON 数据转换为资源类实例
          if (ResourceClass && ResourceClass.fromJSON) {
            items.value = loadedData.map((data: any) => ResourceClass.fromJSON(data))
          } else {
            items.value = loadedData
          }
          
          // 数据加载完成后，触发筛选器更新并通知 App.vue
          if (filterComposable.extractAllFilters) {
            filterComposable.extractAllFilters()
            // 延迟更新，确保筛选数据已提取
            setTimeout(() => {
              const filterData = filterComposable.getFilterData()
              emit('filter-data-updated', filterData)
            }, 100)
          }
        } catch (error) {
          console.error(`[GenericResourceView] 页面 ${pageId} 数据加载失败:`, error)
          items.value = []
        } finally {
          isLoadingData.value = false
        }
      } else {
        console.warn('[GenericResourceView] 没有 pageId，无法加载数据')
        items.value = []
      }
      
      // 2. 注册事件监听器
      if (isElectronEnvironment.value && window.electronAPI && window.electronAPI.onGameProcessEnded) {
        window.electronAPI.onGameProcessEnded((event: any, data: any) => {
          handleGameProcessEnded(data)
        })
      }
      
      // 注册游戏时长更新事件监听器（用于实时更新总时长）
      window.addEventListener('game-request-update-playtime', handleRequestUpdatePlaytime as EventListener)
      window.addEventListener('game-request-final-playtime', handleRequestFinalPlaytime as EventListener)
      
      // 启动定时器，定期触发游戏时长更新（每1秒）
      // 只有当有游戏在运行时才触发更新
      playtimeUpdateTimer = setInterval(() => {
        if (resourceType.value === 'Game') {
          const runningGameIds = gameRunningStore.runningGameIds
          if (runningGameIds && runningGameIds.length > 0) {
            // 为每个运行中的游戏触发更新事件
            runningGameIds.forEach(gameId => {
              const event = new CustomEvent('game-request-update-playtime', {
                detail: { gameId }
              })
              window.dispatchEvent(event)
            })
          }
        }
      }, 1000) // 每1秒更新一次
      
      // 组件挂载后自动检查文件存在性
      // 注意：数据加载在前面已经处理了，这里的 items.value 检查是为了处理传入 props.items 的情况
      if (items.value && items.value.length > 0) {
        await checkFileExistence()
        // 自动计算资源大小
        await calculateResourceSizes()
      }
    })
    
    // 组件卸载前清理事件监听器
    onBeforeUnmount(() => {
      window.removeEventListener('game-request-update-playtime', handleRequestUpdatePlaytime as EventListener)
      window.removeEventListener('game-request-final-playtime', handleRequestFinalPlaytime as EventListener)
      // 清理定时器
      if (playtimeUpdateTimer) {
        clearInterval(playtimeUpdateTimer)
        playtimeUpdateTimer = null
      }
    })


    // 监听 items 变化，当数据更新时自动检查文件存在性和计算大小
    watch(
      () => items.value.length,
      async (newLength, oldLength) => {
        // 只在数据从空变为有数据，或者数据数量变化时检查
        if (newLength > 0 && (oldLength === 0 || newLength !== oldLength)) {
          // 延迟一点执行，确保数据已经更新完成
          await new Promise(resolve => setTimeout(resolve, 100))
          await checkFileExistence()
          await calculateResourceSizes()
        }
      },
      { immediate: false }
    )
    
    // 详情面板类型（计算属性）- 完全从资源的配置中读取
    const detailPanelType = computed(() => {
      // 从当前选中资源的配置中读取
      if (resourcePage.selectedItem.value) {
        const selectedItem = resourcePage.selectedItem.value
        const ResourceClass = selectedItem.constructor
        const config = ResourceClass?.detailPanelConfig
        
        // 如果配置中有 type 字段，使用配置的 type
        if (config?.type) {
          return config.type
        }
      }
      
      // 如果配置中没有 type，返回默认值（DetailPanel 需要 type prop）
      return 'game'
    })
    
    // 计算是否应该显示预览（完全从配置中读取）
    const shouldShowPreview = computed(() => {
      if (!resourcePage.selectedItem.value) return false
      const selectedItem = resourcePage.selectedItem.value
      const ResourceClass = selectedItem.constructor
      const config = ResourceClass?.detailPanelConfig
      // 完全从配置中读取，如果配置中启用了预览，就显示预览
      return config?.enablePreview === true
    })
    
    // 监听详情面板显示，同步 showDetailModal（完全复刻 ImageView.vue）
    watch(
      () => resourcePage.showDetailDialog.value,
      (showDetail) => {
        showDetailModal.value = showDetail
      }
    )
    
    // 监听详情面板显示，如果是 Image/Manga 类型且配置启用了预览，加载图片列表（完全复刻 ImageView.vue 的 showAlbumDetail 方法）
    watch(
      () => [resourcePage.showDetailDialog.value, resourcePage.selectedItem.value],
      async ([showDetail, selectedItem]) => {
        if (showDetail && selectedItem) {
          // 检查是否应该加载预览（完全从配置中读取）
          const ResourceClass = selectedItem.constructor
          const config = ResourceClass?.detailPanelConfig
          // 只根据配置的 enablePreview 判断，不依赖 detailPanelType
          const shouldLoad = config?.enablePreview === true
          
          if (shouldLoad) {
            try {
              detailPages.value = []
              imagePagesComposable.resetPagination()
              
              // 确保pageSize已从设置中加载（完全复刻 ImageView.vue）
              // 注意：在 watch 中无法直接访问 this，需要通过闭包访问
              // 这里先调用，如果方法不存在会在运行时处理
              try {
                if (imagePagesComposable.loadImageSettings && typeof imagePagesComposable.loadImageSettings === 'function') {
                  await imagePagesComposable.loadImageSettings()
                }
              } catch (error) {
                console.warn('[GenericResourceView] 加载图片设置失败:', error)
              }
              
              let files = []
              if (isElectronEnvironment.value && window.electronAPI && window.electronAPI.listImageFiles) {
                const resourcePath = BaseResources.extractPrimitiveValue(
                  selectedItem.resourcePath?.value || selectedItem.resourcePath
                )
                if (resourcePath) {
                  const resp = await window.electronAPI.listImageFiles(resourcePath)
                  if (resp.success) {
                    files = resp.files || []
                  }
                }
              }
              detailPages.value = files
              // 更新总页数（使用 composable 的方法）
              imagePagesComposable.updateTotalPages()
              
              // 更新资源的页数信息（如果资源有 pagesCount 字段）
              if (selectedItem.pagesCount && typeof selectedItem.pagesCount === 'object' && 'value' in selectedItem.pagesCount) {
                selectedItem.pagesCount.value = files.length
              } else if (selectedItem.pagesCount !== undefined) {
                selectedItem.pagesCount = files.length
              }
            } catch (error) {
              console.error('[GenericResourceView] 加载图片列表失败:', error)
            }
          }
        } else if (!showDetail) {
          // 关闭详情时清空图片列表
          detailPages.value = []
        }
      },
      { immediate: false }
    )
    
    // 注意：resolveImage 和 handleImageError 来自 imageCacheComposable（通过 ...imageCacheComposable 展开）
    // 不需要单独定义，完全复刻 ImageView.vue 的方式
    
    // 处理图片点击（打开阅读器，完全复刻 ImageView.vue 的 viewPage 方法）
    const handleDetailPageClick = async (index: number) => {
      // 计算实际索引（考虑分页，使用 composable 的 detailCurrentPageStartIndex）
      const actualIndex = imagePagesComposable.detailCurrentPageStartIndex.value + index
      currentPageIndex.value = actualIndex
      currentAlbum.value = resourcePage.selectedItem.value
      pages.value = detailPages.value
      
      // 增加浏览次数（使用 context 中的 updateViewInfo 方法，完全复刻 ImageView.vue）
      if (currentAlbum.value) {
        try {
          // 更新最后查看时间
          const now = new Date().toISOString()
          const albumId = BaseResources.extractPrimitiveValue(currentAlbum.value.id?.value || currentAlbum.value.id)
          const item = items.value.find((i: any) => (i.id?.value || i.id) === albumId)
          if (item) {
            if (item.lastViewed && typeof item.lastViewed === 'object' && 'value' in item.lastViewed) {
              item.lastViewed.value = now
            } else {
              item.lastViewed = now
            }
            
            // 增加浏览次数
            const currentViewCount = BaseResources.extractPrimitiveValue(item.viewCount?.value || item.viewCount) || 0
            if (item.viewCount && typeof item.viewCount === 'object' && 'value' in item.viewCount) {
              item.viewCount.value = currentViewCount + 1
            } else {
              item.viewCount = currentViewCount + 1
            }
          }
        } catch (error) {
          console.warn('[GenericResourceView] 更新浏览信息失败:', error)
        }
      }
      
      // 确保pages数组已加载完成后再显示阅读器
      showComicViewer.value = true
    }
    
    // 处理分页变化
    const handleDetailPageChange = (page: number) => {
      imagePagesComposable.jumpToPageGroup(page)
    }

    return {
      resourceType, // 返回 computed，保持响应式
      isElectronEnvironment,
      isResourceRunning,
      handleResourceAction,
      terminateGame,
      showComicViewer,
      currentAlbum,
      pages,
      currentPageIndex,
      closeComicViewer,
      handleComicViewerPageChange,
      // 小说阅读器相关
      showNovelReader,
      currentReadingNovel,
      showEbookReaderV2,
      ebookReaderV2FilePath,
      ebookNavigation,
      ebookBookAvailable,
      closeNovelReader,
      closeEbookReaderV2,
      handleNavigationUpdated,
      handleRenditionReady,
      handleEbookJumpTo,
      ebookReaderRef,
      getNovelName,
      getNovelAuthor,
      getNovelFilePath,
      getNovelFileType,
      getNovelCurrentPage,
      getNovelNameByPath,
      handlePdfPageChanged,
      handleTextPageChanged,
      handleTextProgressChanged,
      getFileExists, // 获取文件存在性状态
      checkFileExistence, // 文件存在性检查方法
      // 详情面板相关（从 resourcePage 获取）
      showDetailDialog: resourcePage.showDetailDialog,
      selectedItem: resourcePage.selectedItem,
      itemStats: resourcePage.itemStats,
      itemActions: resourcePage.itemActions,
      closeDetail: resourcePage.closeDetail,
      updateResource: resourcePage.updateResource,
      // 详情面板类型映射（计算属性）
      detailPanelType,
      // 详情页图片预览相关（完全复刻 ImageView.vue）
      // 图片缓存相关
      ...imageCacheComposable,
      // 详情页图片分页相关（排除 loadImageSettings，重命名为 loadImagePagesSettings 避免与方法冲突）
      loadImagePagesSettings: imagePagesComposable.loadImageSettings,
      detailCurrentPage: imagePagesComposable.detailCurrentPage,
      detailPageSize: imagePagesComposable.detailPageSize,
      detailTotalPages: imagePagesComposable.detailTotalPages,
      jumpToPageInput: imagePagesComposable.jumpToPageInput,
      paginatedPages: imagePagesComposable.paginatedPages,
      detailCurrentPageStartIndex: imagePagesComposable.detailCurrentPageStartIndex,
      nextPageGroup: imagePagesComposable.nextPageGroup,
      previousPageGroup: imagePagesComposable.previousPageGroup,
      jumpToPageGroup: imagePagesComposable.jumpToPageGroup,
      resetPagination: imagePagesComposable.resetPagination,
      updateTotalPages: imagePagesComposable.updateTotalPages,
      detailPages,
      handleDetailPageClick,
      handleDetailPageChange,
      // 拖拽相关
      handleFileDrop,
      handleDropError,
      // 详情面板操作处理
      handleDetailAction: (actionKey: string, item: any) => {
        // 根据 actionKey 处理不同的操作
        switch (actionKey) {
          case 'launch':
            handleResourceAction(item)
            break
          case 'terminate':
            terminateGame(item)
            break
          case 'folder':
            // 打开文件夹（需要根据资源类型实现）
            console.log('打开文件夹:', item)
            break
          case 'edit':
            // 编辑资源（调用 resourcePage 的 showEdit 方法）
            if ((resourcePage as any).showEdit) {
              (resourcePage as any).showEdit(item)
            }
            break
          case 'remove':
            // 删除资源（使用 resourcePage 的 deleteItem）
            if ((resourcePage as any).deleteItem) {
              (resourcePage as any).deleteItem(item)
            }
            break
          default:
            // 未知操作
        }
      },
      ...resourcePage, // 展开所有方法和属性，使模板可以直接访问
      // 明确声明方法，确保 TypeScript 能正确识别
      updateScale: resourcePage.updateScale,
      handleEmptyStateAction: resourcePage.handleEmptyStateAction,
      showAddDialogHandler: resourcePage.showAddDialogHandler,
      handleSortChanged: resourcePage.handleSortChanged,
      handleSearchQueryChanged: resourcePage.handleSearchQueryChanged,
      handleSortByChanged: resourcePage.handleSortByChanged,
      handleContextMenuClick: resourcePage.handleContextMenuClick,
      handlePageChange: resourcePage.handlePageChange,
      // 筛选相关（按照 GameView.vue 的方式暴露所有方法）
      // 注意：顺序与 GameView.vue 保持一致，先 toRefs 再展开 filterComposable
      ...toRefs(filterComposable),
      ...filterComposable,
      // 保存 filterComposable 引用，供 methods 中使用
      _filterComposable: filterComposable,
      // 明确暴露 filteredItems 和 paginatedItems，确保模板能正确访问
      // 重要：使用 filterComposable.filteredGames（即 filteredItems），而不是 resourcePage.filteredItems
      // 因为 resourcePage.filteredItems 可能没有正确响应筛选变化
      filteredItems: filterComposable.filteredGames, // 直接使用筛选 composable 的结果
      paginatedItems: resourcePage.paginatedItems,
      // 编辑对话框相关
      ResourceClass,
      allTags,
      // 编辑对话框状态和方法（从 resourcePage 获取）
      showEditDialog: resourcePage.showEditDialog,
      editForm: resourcePage.editForm,
      closeEdit: resourcePage.closeEdit,
      handleEditConfirm: resourcePage.handleEditConfirm
    }
    
    // 调试：检查 setup 返回的对象中的筛选方法
    const setupReturn = {
      resourceType,
      isElectronEnvironment,
      isResourceRunning,
      handleResourceAction,
      terminateGame,
      showComicViewer,
      currentAlbum,
      pages,
      currentPageIndex,
      closeComicViewer,
      handleComicViewerPageChange,
      showNovelReader,
      currentReadingNovel,
      showEbookReaderV2,
      ebookReaderV2FilePath,
      ebookNavigation,
      ebookBookAvailable,
      closeNovelReader,
      closeEbookReaderV2,
      handleNavigationUpdated,
      handleRenditionReady,
      handleEbookJumpTo,
      ebookReaderRef,
      getNovelName,
      getNovelAuthor,
      getNovelFilePath,
      getNovelFileType,
      getNovelCurrentPage,
      getNovelNameByPath,
      handlePdfPageChanged,
      handleTextPageChanged,
      handleTextProgressChanged,
      getFileExists,
      checkFileExistence,
      ...resourcePage,
      updateScale: resourcePage.updateScale,
      handleEmptyStateAction: resourcePage.handleEmptyStateAction,
      showAddDialogHandler: resourcePage.showAddDialogHandler,
      handleSortChanged: resourcePage.handleSortChanged,
      handleSearchQueryChanged: resourcePage.handleSearchQueryChanged,
      handleSortByChanged: resourcePage.handleSortByChanged,
      handleContextMenuClick: resourcePage.handleContextMenuClick,
      handlePageChange: resourcePage.handlePageChange,
      ...toRefs(filterComposable),
      ...filterComposable
    }
    
    return setupReturn as any // 使用 as any 绕过类型检查，因为方法确实存在
  },
  methods: {
    handleContextMenu(event: MouseEvent, item: any) {
      (this.$refs.baseView as any)?.showContextMenuHandler(event, item)
    },
    // 更新筛选器数据到 App.vue
    updateFilterData() {
      // 优先从 this 访问，如果不存在则从 filterComposable 访问
      const getFilterDataFn = (this as any).getFilterData || 
                             ((this as any)._filterComposable && (this as any)._filterComposable.getFilterData)
      
      console.log('[GenericResourceView] updateFilterData 被调用')
      console.log('[GenericResourceView] getFilterDataFn 存在:', !!getFilterDataFn)
      console.log('[GenericResourceView] _filterComposable 存在:', !!(this as any)._filterComposable)
      
      if (getFilterDataFn && typeof getFilterDataFn === 'function') {
        const filterData = getFilterDataFn()
        // 详细打印每个筛选器的状态
        const filtersDetail = filterData?.filters?.map((f: any) => ({
          key: f.key,
          title: f.title,
          itemsCount: f.items?.length || 0,
          selectedCount: f.selected?.length || 0,
          excludedCount: f.excluded?.length || 0,
          selected: f.selected || [],
          excluded: f.excluded || []
        })) || []
        console.log('[GenericResourceView] updateFilterData - 筛选器数据:', {
          filtersCount: filterData?.filters?.length || 0,
          filters: filtersDetail
        })
        // 特别检查 developers 筛选器的状态
        const developersFilter = filtersDetail.find((f: any) => f.key === 'developers')
        if (developersFilter) {
          console.log('[GenericResourceView] developers 筛选器状态:', {
            selected: developersFilter.selected,
            excluded: developersFilter.excluded,
            itemsCount: developersFilter.itemsCount
          })
        }
        this.$emit('filter-data-updated', filterData)
      } else {
        console.warn('[GenericResourceView] getFilterData 方法不存在，无法更新筛选器数据')
      }
    },
    // 处理来自 App.vue 的筛选器事件（动态支持所有筛选器，完全按照 GameView 的方式）
    handleFilterEvent(event, data) {
      console.log('GenericResourceView handleFilterEvent:', event, data)
      const filterKey = data?.filterKey || data
      
      // 动态获取筛选方法名
      const filterMethodName = `filterBy${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`
      const excludeMethodName = `excludeBy${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`
      const clearMethodName = `clear${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}Filter`
      
      console.log('[GenericResourceView] 筛选方法名:', { filterMethodName, excludeMethodName, clearMethodName })
      console.log('[GenericResourceView] 方法是否存在:', {
        filterMethod: !!this[filterMethodName],
        excludeMethod: !!this[excludeMethodName],
        clearMethod: !!this[clearMethodName]
      })
      
      switch (event) {
        case 'filter-select':
          if (this[filterMethodName] && typeof this[filterMethodName] === 'function') {
            // 获取筛选前的状态
            const filterComposable = (this as any)._filterComposable
            const filterState = filterComposable?.filterStates?.[filterKey]
            const beforeSelected = filterState?.selected?.value ? [...filterState.selected.value] : []
            console.log('[GenericResourceView] 调用筛选方法前，selected 状态:', beforeSelected)
            
            console.log('[GenericResourceView] 调用筛选方法:', filterMethodName, '参数:', data.itemName)
            this[filterMethodName](data.itemName)
            
            // 获取筛选后的状态
            const afterSelected = filterState?.selected?.value ? [...filterState.selected.value] : []
            console.log('[GenericResourceView] 调用筛选方法后，selected 状态:', afterSelected)
            console.log('[GenericResourceView] 筛选方法调用完成，更新筛选器数据')
            this.updateFilterData()
          } else {
            console.warn('[GenericResourceView] 筛选方法不存在:', filterMethodName)
          }
          break
        case 'filter-exclude':
          if (this[excludeMethodName] && typeof this[excludeMethodName] === 'function') {
            console.log('[GenericResourceView] 调用排除方法:', excludeMethodName, '参数:', data.itemName)
            this[excludeMethodName](data.itemName)
            this.updateFilterData()
          } else {
            console.warn('[GenericResourceView] 排除方法不存在:', excludeMethodName)
          }
          break
        case 'filter-clear':
          if (this[clearMethodName] && typeof this[clearMethodName] === 'function') {
            console.log('[GenericResourceView] 调用清除方法:', clearMethodName)
            this[clearMethodName]()
            this.updateFilterData()
          } else {
            console.warn('[GenericResourceView] 清除方法不存在:', clearMethodName)
          }
          break
      }
    }
  },
  async mounted() {
    // 等待下一个 tick，确保数据已完全更新到响应式系统中（完全按照 ImageView loadAlbums 的方式）
    await this.$nextTick()
    
    // 提取所有筛选器数据（使用 useResourceFilter 的方法，完全按照 ImageView loadAlbums 的方式）
    if (this.extractAllFilters && typeof this.extractAllFilters === 'function') {
      console.log('[GenericResourceView] 调用 extractAllFilters，当前 items 数量:', (this as any).items?.length || 0)
      this.extractAllFilters()
      console.log('[GenericResourceView] extractAllFilters 执行完成')
    } else {
      console.warn('[GenericResourceView] extractAllFilters 方法不存在')
    }

    // 初始化筛选器数据（完全按照 ImageView loadAlbums 的方式）
    this.updateFilterData()
    
    // 注意：不需要在这里注册全局事件监听器
    // ResourceView.vue 已经注册了全局事件监听器，并且会调用这个组件的 handleFilterEvent 方法
    // 这与 GameView.vue 和 ImageView.vue 的实现方式一致
  },
  beforeUnmount() {
    // 注意：不需要清理筛选事件监听器
    // 因为事件监听器是由 ResourceView.vue 注册的，它会负责清理
  }
})
</script>

<style scoped lang="scss">
.generic-resource-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// resource-content 本身就是 fun-drop-zone，需要直接覆盖样式
.resource-content {
  flex: 1;
  overflow-y: auto;
  
  // 覆盖 FunDropZone 的默认样式（resource-content 本身就是 fun-drop-zone）
  // 布局相关：使用 block 布局，不居中对齐
  display: block !important;
  align-items: unset !important;
  justify-content: unset !important;
  min-height: auto !important;
  height: 100%;
  
  // 移除默认边框和背景
  border: none !important;
  background: transparent !important;
  padding: var(--spacing-xl);
  cursor: default !important;
  
  // 移除默认 hover 效果
  &:hover {
    background: transparent !important;
    border-color: transparent !important;
  }
  
  // 拖拽时才显示边框和背景
  &.fun-drop-zone--dragging {
    background: rgba(59, 130, 246, 0.1) !important;
    border: 2px dashed var(--accent-color) !important;
    border-radius: var(--radius-xl);
  }
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  
  // 拖拽时降低不透明度
  &.is-dragging {
    opacity: 0.5;
    pointer-events: none;
  }
}

.resource-card {
  cursor: pointer;
  transition: transform var(--transition-base);
}

.resource-card:hover {
  transform: translateY(-4px);
}

/* 小说阅读器样式 */
.novel-reader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.novel-reader-content {
  width: 90%;
  height: 90%;
  background: var(--bg-primary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.reader-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.reader-author {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.reader-controls {
  display: flex;
  gap: 8px;
}

.btn-close-reader {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-close-reader:hover {
  background: var(--bg-tertiary);
}

.btn-icon {
  font-size: 1.2rem;
}

.reader-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.reader-content-wrapper {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.ebook-reader-v2-content {
  display: flex;
  height: 100%;
}

.chapter-navigation-sidebar {
  width: 250px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  background: var(--bg-secondary);
}

.chapter-nav-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.chapter-nav-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.reader-content-main {
  flex: 1;
  overflow: hidden;
}
</style>
