<template>
  <BaseView ref="baseView" :items="games" :filtered-items="filteredGames" :empty-state-config="emptyStateConfig"
    :toolbar-config="toolbarConfig" :context-menu-items="contextMenuItems"
    :pagination-config="paginationConfig" :sort-by="sortBy" :search-query="searchQuery"
    :scale="scale" :show-layout-control="true" @update:scale="updateScale"
    @empty-state-action="handleEmptyStateAction" @add-item="showAddDialogHandler" @sort-changed="handleSortChanged"
    @search-query-changed="handleSearchQueryChanged" @sort-by-changed="handleSortByChanged"
    @context-menu-click="handleContextMenuClick" @page-change="handlePageChange">
    <!-- 主内容区域 -->
    <div class="game-content" @drop="handleDrop" @dragover="handleDragOver" @dragenter="handleDragEnter"
      @dragleave="handleDragLeave" :class="{ 'drag-over': dragDropComposable?.isDragOver || false }">


      <!-- 游戏网格 -->
      <GameGrid 
        :games="paginatedItems"
        :is-game-running="isGameRunning"
        :is-electron-environment="isElectronEnvironment"
        :scale="scale"
        :base-width="400"
        :layout-styles="layoutStyles"
        @game-click="showGameDetail"
        @game-contextmenu="handleGameContextMenu"
        @game-action="handleResourceAction"
      />


      <!-- 游戏对话框（添加/编辑） -->
      <ResourcesEditDialog 
        :visible="showAddDialog" 
        mode="add"
        :resource-class="Game"
        :is-electron-environment="isElectronEnvironment"
        :available-tags="allTags"
        :enable-engine-auto-detect="true"
        :enable-screenshot-cover="true"
        add-title="添加游戏"
        edit-title="编辑游戏"
        add-button-text="添加游戏"
        edit-button-text="保存修改"
        :custom-confirm-handler="handleAddGameCustomConfirm"
        :custom-validation="(formData, isEditMode) => {
          if (isEditMode) return true
          const executablePath = formData.executablePath
          return executablePath && executablePath.trim() !== ''
        }"
        @close="closeAddDialog"
        @confirm="handleAddGameConfirm"
      />

      <ResourcesEditDialog 
        :visible="showEditDialog" 
        mode="edit"
        :resource-class="Game"
        :resource-data="editForm"
        :is-electron-environment="isElectronEnvironment"
        :available-tags="allTags"
        :enable-engine-auto-detect="true"
        :enable-screenshot-cover="true"
        add-title="添加游戏"
        edit-title="编辑游戏"
        add-button-text="添加游戏"
        edit-button-text="保存修改"
        @close="closeEdit"
        @confirm="handleEditGameConfirm"
      />

      <!-- 游戏详情页面 -->
      <DetailPanel 
        :visible="showDetailDialog && !!selectedItem" 
        :item="selectedItem"
        type="game"
        :is-running="selectedItem ? isGameRunning(selectedItem) : false"
        :on-update-resource="updateGameResource"
        @close="closeDetail"
        @action="handleDetailAction"
      />


      <!-- 路径更新确认对话框 -->
      <PathUpdateDialog :visible="showPathUpdateDialog" title="更新游戏路径" description="发现同名但路径不同的游戏文件："
        item-name-label="游戏名称" :item-name="pathUpdateInfo.existingItem?.name?.value || pathUpdateInfo.existingItem?.name || ''"
        :old-path="pathUpdateInfo.existingItem?.resourcePath?.value || pathUpdateInfo.existingItem?.executablePath?.value || pathUpdateInfo.existingItem?.resourcePath || pathUpdateInfo.existingItem?.executablePath || ''" :new-path="pathUpdateInfo.newPath || ''"
        missing-label="文件丢失" found-label="文件存在" question="是否要更新游戏路径？" @confirm="confirmPathUpdate"
        @cancel="closePathUpdateDialog" />

      <!-- 强制结束游戏确认对话框 -->
      <div v-if="showTerminateConfirmDialog" class="modal-overlay" @click="closeTerminateConfirmDialog">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>强制结束游戏</h3>
            <button class="btn-close" @click="closeTerminateConfirmDialog">✕</button>
          </div>
          <div class="modal-body">
            <p>确定要强制结束游戏 <strong>{{ gameToTerminate?.name }}</strong> 吗？</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">
              此操作将立即终止游戏进程，未保存的数据可能会丢失。
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeTerminateConfirmDialog">取消</button>
            <button class="btn-confirm" @click="confirmTerminateGame" style="background: #ef4444;">确认结束</button>
          </div>
        </div>
      </div>

      <!-- 密码输入对话框 -->
      <PasswordInputDialog
        :visible="showPasswordDialog"
        :title="passwordDialogTitle"
        :message="passwordDialogMessage"
        @confirm="handlePasswordConfirm"
        @cancel="handlePasswordCancel"
      />
    </div>
  </BaseView>
</template>

<script lang="ts">
import BaseView from '../../components/BaseView.vue'
import MediaCard from '../../components/MediaCard.vue'
import FormField from '../../components/FormField.vue'
import PathUpdateDialog from '../../components/PathUpdateDialog.vue'
import PasswordInputDialog from '../../components/PasswordInputDialog.vue'
import ResourcesEditDialog from '../../components/ResourcesEditDialog.vue'
import { Game } from '@resources/game.ts'
import { GamePage, type GameSortBy } from '../../configs/pages/GamePage.ts'
import { ResourceField } from '@resources/base/ResourceField.ts'
import DetailPanel from '../../components/DetailPanel.vue'
import GameGrid from '../../components/game/GameGrid.vue'

import saveManager from '../../utils/SaveManager.ts'
import notify from '../../utils/NotificationService.ts'
import alertService from '../../utils/AlertService.ts'
import confirmService from '../../utils/ConfirmService.ts'
import { ref, toRefs, PropType, computed } from 'vue'
import { PageConfig } from '../../types/page'
import type { FilterItem } from '../../types/filter'
import { useResourceFilter } from '../../composables/useResourceFilter'
import { useGameManagement } from '../../composables/game/useGameManagement'
import { useGameScreenshot } from '../../composables/game/useGameScreenshot'
import { useGameRunning } from '../../composables/game/useGameRunning'
import { useGamePlayTime } from '../../composables/game/useGamePlayTime'
import { useGameDragAndDrop } from '../../composables/game/useGameDragAndDrop'
import { useArchive, type ArchiveItem, isArchiveFile } from '../../composables/useArchive'
import { useGameRunningStore } from '../../stores/game-running'
import { createResourcePage } from '../../composables/createResourcePage'
import { formatPlayTime, formatLastPlayed, formatFirstPlayed } from '../../utils/formatters'
import { BaseResources } from '@resources/base/ResourcesDataBase.ts'
import { executeActionHandler, type ActionHandlerContext } from '../../utils/ResourceActionHandlers'

export default {
  name: 'GameView',
  components: {
    BaseView,
    MediaCard,
    FormField,
    PathUpdateDialog,
    ResourcesEditDialog,
    DetailPanel,
    GameGrid
  },
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({ id: 'games', type: 'Game' })
    }
  },
  emits: ['filter-data-updated'],
  setup(props) {
    // 创建页面配置实例
    const gamePage = new GamePage()
    
    // 获取排序选项配置（用于工具栏显示）
    const sortOptions = gamePage.getSortOptions()
    
    // 响应式数据
    const games = ref([])
    const isElectronEnvironment = ref(false)
    const searchQuery = ref('')
    const sortBy = ref<GameSortBy>('name-asc')

    // 获取父组件方法的辅助函数（在 Options API 中通过 this.$parent 访问）
    // 注意：这些函数会在组件实例化后通过 methods 中的包装方法设置
    let getRunningGamesFn: () => Map<string, any> = () => gameRunningStore.getRunningGamesMap()
    let isGameRunningFn: (gameId: string) => boolean = (gameId) => gameRunningStore.isGameRunning(gameId)

    // 创建用于筛选的 isGameRunning 函数（接受 Game 对象）
    // 直接使用 store，确保总是获取最新的运行状态
    const isGameRunningForFilter = (game: any) => {
      return gameRunningStore.isGameRunning(game.id?.value || game.id)
    }

    // 使用通用筛选 composable（传入页面配置实例和额外数据）
    const filterComposable = useResourceFilter(
      games, 
      searchQuery, 
      sortBy, 
      gamePage, 
      { isGameRunning: isGameRunningForFilter }
    )

    // 从筛选器状态中获取所有标签（用于编辑对话框）
    const allTags = computed<FilterItem[]>(() => {
      const tagsState = filterComposable.filterStates?.tags
      return tagsState?.items?.value || []
    })

    // 使用管理 composable
    const managementComposable = useGameManagement(
      games,
      filterComposable.extractAllFilters,
      isElectronEnvironment,
      props.pageConfig.id
    )

    // 使用游戏运行状态 store（暴露给组件使用）
    const gameRunningStore = useGameRunningStore()

    // 获取父组件方法的辅助函数（在 Options API 中通过 this.$parent 访问）
    // 注意：这些函数会在组件实例化后通过 methods 中的包装方法设置
    let addRunningGameFn: (gameInfo: any) => void = (gameInfo) => gameRunningStore.addRunningGame(gameInfo)
    let removeRunningGameFn: (gameId: string) => void = (gameId) => gameRunningStore.removeRunningGame(gameId)

    // 使用截图 composable
    const screenshotComposable = useGameScreenshot(
      isElectronEnvironment,
      () => getRunningGamesFn(),
      // 截图成功后的回调：如果游戏没有封面图，自动设置为截图
      async (result) => {
        if (!result.gameId || !result.filepath) return
        
        // 在 games 数组中查找对应的游戏
        const game = games.value.find((g: any) => (g.id?.value || g.id) === result.gameId)
        if (!game) {
          console.log('未找到对应的游戏，无法设置封面图')
          return
        }
        
        // 检查游戏是否已有封面图（向后兼容：同时检查 coverPath 和 image）
        const currentCover = game.coverPath?.value || (game as any).image
        if (!currentCover || currentCover.trim() === '') {
          try {
            // 更新游戏封面图
            const gameId = game.id?.value || game.id
            await managementComposable.updateGame(gameId, { coverPath: result.filepath } as any)
            const gameName = game.name?.value || game.name
            console.log(`✅ 已自动将截图设置为游戏 "${gameName}" 的封面图`)
            
            // 显示提示（可选）
            notify.toast('success', '封面已更新', `已自动将截图设置为 "${gameName}" 的封面图`)
          } catch (error: any) {
            console.error('设置封面图失败:', error)
          }
        } else {
          const gameName = game.name?.value || game.name
          console.log(`游戏 "${gameName}" 已有封面图，跳过自动设置`)
        }
      }
    )

    // 使用运行状态 composable
    const runningComposable = useGameRunning(
      games,
      () => getRunningGamesFn(),
      (gameInfo) => addRunningGameFn(gameInfo),
      (gameId) => removeRunningGameFn(gameId)
    )

    // 使用游戏时长 composable
    const playTimeComposable = useGamePlayTime(
      games,
      managementComposable.updateGamePlayTime,
      managementComposable.updateGame,
      managementComposable.checkGameTimeAchievements,
      (gameId) => removeRunningGameFn(gameId)
    )

    // ========== 工具函数 ==========
    const formatDateUtil = (dateString: string) => {
      if (!dateString) return '未知'
      try {
        return new Date(dateString).toLocaleDateString('zh-CN')
      } catch {
        return '未知'
      }
    }

    // ========== 使用工厂函数创建资源页面 ==========
    // 注意：contextMenuHandlers 需要在 setup 中定义，但某些处理器需要访问组件方法
    // 所以先创建占位函数，在 mounted 中会直接修改这个对象的属性（而不是创建新对象）
    // 这样 useResourceContextMenu 内部保存的引用也会更新
    const contextMenuHandlers = {
      detail: (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      launch: (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      folder: (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      'screenshot-folder': (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      'update-folder-size': (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      'compress-to': (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      'compress-here': (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      extract: (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      'extract-here': (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      edit: (game: any) => {
        // 这个会在 mounted 中被覆盖
      },
      remove: (game: any) => {
        // 这个会在 mounted 中被覆盖
      }
    }
    
    const resourcePage = createResourcePage({
      pageConfig: {
        pageType: 'games',
        itemType: '游戏',
        defaultPageSize: 20,
        defaultSortBy: 'name-asc'
      },
      items: games,
      filteredItems: filterComposable.filteredGames,
      searchQuery: searchQuery,
      sortBy: sortBy,
      crudConfig: {
        items: games,
        onAdd: async (gameData: any) => {
          return await managementComposable.addGame(gameData as any)
        },
        onUpdate: async (id: string, updates: any) => {
          await managementComposable.updateGame(id, updates)
        },
        onDelete: async (id: string) => {
          await managementComposable.removeGame(id)
        },
        onLoad: managementComposable.loadGames,
        onSave: async () => {
          await managementComposable.saveGames()
        },
        getItemName: (game: any) => game.name?.value || game.name,
        itemType: '游戏'
      },
      contextMenuItems: Game.contextMenuItems,
      contextMenuHandlers: contextMenuHandlers,
      emptyState: Game.emptyStateConfig,
      toolbar: {
        ...Game.toolbarConfig,
        // 从页面配置获取排序选项（只提取 value 和 label，用于工具栏显示）
        sortOptions: sortOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      },
      displayLayout: gamePage.displayLayoutConfig,
      getStats: (game: any) => [
        { label: '开发商', value: game.developers?.value?.[0] || game.developer?.value || game.developer || '未知' },
        { label: '发行商', value: game.publisher?.value || game.publisher || '未知' },
        { label: '引擎', value: game.engine?.value || game.engine || '未知' },
        { label: '游戏时长', value: formatPlayTime(game.playTime?.value || game.playTime || 0) },
        { label: '游玩次数', value: `${game.playCount?.value || game.playCount || 0} 次` },
        { label: '最后游玩', value: formatLastPlayed(game.lastPlayed?.value || game.lastPlayed) },
        { label: '首次游玩', value: formatFirstPlayed(game.firstPlayed?.value || game.firstPlayed) },
        { label: '添加时间', value: formatDateUtil(game.addedDate?.value || game.added || game.addedDate) }
      ],
      getActions: (game: any) => {
        // 注意：isGameRunning 函数会在组件实例化后设置，这里先使用 store
        const gameId = game.id?.value || game.id
        const isRunning = gameRunningStore.isGameRunning(gameId)
        const actionConfig = Game.actionConfig
        const actions = [
          { key: actionConfig.key, icon: actionConfig.icon, label: isRunning ? '游戏运行中' : actionConfig.label, class: 'btn-launch' },
          { key: 'folder', icon: '📁', label: '打开文件夹', class: 'btn-open-folder' },
          { key: 'edit', icon: '✏️', label: '编辑信息', class: 'btn-edit' },
          { key: 'remove', icon: '🗑️', label: '删除游戏', class: 'btn-remove' }
        ]
        
        // 如果游戏正在运行，添加终止按钮
        if (isRunning) {
          actions.splice(1, 0, { key: 'terminate', icon: '⏹️', label: '结束游戏', class: 'btn-terminate' })
        }
        
        return actions
      }
    })

    // 拖拽相关函数（需要在组件实例化后设置）
    let showPathUpdateDialogFn: (info: { existingGame: any; newPath: string; newFileName: string }) => void = () => {}
    let addGameFn: (game: any) => Promise<void> = async () => {}

    // 使用拖拽 composable（延迟初始化，因为需要访问组件方法）
    const dragDropComposable = ref<ReturnType<typeof useGameDragAndDrop> | null>(null)

    // 使用压缩/解压 composable（通用功能）
    // 注意：密码对话框的状态在组件中管理，通过回调函数传递给 composable
    const archiveComposable = useArchive({
      isElectronEnvironment,
      onShowPasswordDialog: (config) => {
        // 这个回调会在 methods 中设置，用于显示密码对话框
        // 暂时留空，在 mounted 中会设置
      }
    })

    return {
      // 工具函数
      formatDateUtil,
      // 数据
      games,
      isElectronEnvironment,
      searchQuery,
      sortBy,
      // 筛选相关
      ...toRefs(filterComposable),
      ...filterComposable,
      allTags, // 暴露 allTags 供模板使用
      // 管理相关
      ...toRefs(managementComposable),
      ...managementComposable,
      // 截图相关
      ...toRefs(screenshotComposable),
      ...screenshotComposable,
      // 运行状态相关
      ...runningComposable,
      // 游戏时长相关
      ...playTimeComposable,
      // 暴露 gameRunningStore 供组件使用
      gameRunningStore,
      // 资源页面（使用工厂函数创建，包含分页、CRUD、右键菜单、配置等）
      ...resourcePage,
      // 压缩/解压相关
      ...archiveComposable,
      // 拖拽相关（延迟初始化）
      dragDropComposable,
      // 内部函数设置器（供 mounted 使用）
      _setDragDropFunctions: (functions: {
        showPathUpdateDialog: (info: { existingGame: any; newPath: string; newFileName: string }) => void
        addGame: (game: any) => Promise<void>
      }) => {
        showPathUpdateDialogFn = functions.showPathUpdateDialog
        addGameFn = functions.addGame
        
        // 初始化拖拽 composable（传入响应式的 games）
        dragDropComposable.value = useGameDragAndDrop({
          games: games, // 传入 ref，composable 内部会处理
          onAddGame: addGameFn,
          onShowPathUpdateDialog: (info: any) => {
            // 适配器：将 game 类型的 PathUpdateInfo 转换为通用类型
            resourcePage.showPathUpdateDialogHandler({
              existingItem: info.existingGame || info.existingItem,
              newPath: info.newPath,
              newFileName: info.newFileName || info.newPath?.split(/[/\\]/).pop() || ''
            })
          },
          isElectronEnvironment: isElectronEnvironment.value
        })
      },
      _setParentFunctions: (functions: {
        getRunningGames: () => Map<string, any>
        addRunningGame: (gameInfo: any) => void
        removeRunningGame: (gameId: string) => void
        isGameRunning: (gameId: string) => boolean
      }) => {
        const store = gameRunningStore
        getRunningGamesFn = () => store.getRunningGamesMap()
        addRunningGameFn = (gameInfo: any) => store.addRunningGame(gameInfo)
        removeRunningGameFn = (gameId: string) => store.removeRunningGame(gameId)
        isGameRunningFn = (gameId: string) => store.isGameRunning(gameId)
      },
      // 暴露资源页面引用，供 methods 中更新 contextMenuHandlers
      _resourcePage: resourcePage,
      // 暴露 contextMenuHandlers 引用，供 mounted 中直接修改属性
      _contextMenuHandlers: contextMenuHandlers,
      // 暴露压缩/解压 composable 引用，供 mounted 中设置密码对话框回调
      _archiveComposable: archiveComposable,
      // 暴露截图 composable 引用，供 mounted 中使用
      _screenshotComposable: screenshotComposable
    }
  },
  data() {
    return {
      // 对话框状态已移至工厂函数（showAddDialog, showEditDialog, showDetailDialog, selectedItem, editForm）
      // 事件处理器（用于清理）
      handleGamePlaytimeUpdate: null as ((event: CustomEvent) => void) | null,
      handleGamePlaytimeSave: null as ((event: CustomEvent) => void) | null,
      handleRequestUpdatePlaytime: null as ((event: CustomEvent) => void) | null,
      handleRequestFinalPlaytime: null as ((event: CustomEvent) => void) | null,
      // 存储游戏启动时的初始 playTime（Map<gameId, initialPlayTime>）
      gameInitialPlayTimes: null as Map<string, number> | null,
      // 密码输入对话框
      showPasswordDialog: false,
      passwordDialogTitle: '输入密码',
      passwordDialogMessage: '该压缩包需要密码，请输入密码：',
      passwordDialogCallback: null, // 存储密码确认后的回调函数
      passwordDialogGame: null, // 存储需要解压的游戏
      passwordDialogOutputDir: null, // 存储输出目录
      passwordDialogTriedPasswords: [], // 存储已尝试的密码
      // 强制结束游戏确认对话框
      showTerminateConfirmDialog: false,
      gameToTerminate: null,
      // Game 类用于 ResourcesEditDialog
      Game: Game
      // 路径更新对话框已移至工厂函数（showPathUpdateDialog, pathUpdateInfo）
      // 空状态配置已移至工厂函数（emptyStateConfig）
      // 工具栏配置已移至工厂函数（toolbarConfig）
      // 右键菜单配置已移至工厂函数（contextMenuItems）
    }
  },
  computed: {
    // paginatedGames 现在通过工厂函数的 paginatedItems 访问
    paginatedGames() {
      return this.paginatedItems || []
    }
    // filteredGames 已移至 useGameFilter composable
    // paginationConfig 已移至工厂函数
    // contextMenuItems 已移至工厂函数
    // emptyStateConfig 已移至工厂函数
    // toolbarConfig 已移至工厂函数
  },
  methods: {
    // checkGameCollectionAchievements 和 checkGameTimeAchievements 已移至 useGameManagement composable
    // showAddGameDialog 和 closeAddGameDialog 已移至工厂函数（showAddDialogHandler, closeAddDialog）
    // 添加游戏时的自定义确认处理（处理文件夹大小、默认值等）
    async handleAddGameCustomConfirm(formData, isEditMode) {
      if (isEditMode) return // 编辑模式不需要特殊处理
      
      // 1. 如果名称为空，从可执行文件路径提取
      const executablePathValue = formData.executablePath || ''
      if (!formData.name && executablePathValue) {
        const fileName = executablePathValue.split(/[\\/]/).pop() || ''
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
        let cleanName = nameWithoutExt
          .replace(/\.exe$/i, '')
          .replace(/\.swf$/i, '')
          .replace(/\.bat$/i, '')
          .replace(/\.zip$/i, '')
          .replace(/\.rar$/i, '')
          .replace(/\.7z$/i, '')
          .replace(/\.tar$/i, '')
          .replace(/\.gz$/i, '')
          .replace(/\.bz2$/i, '')
          .replace(/\.xz$/i, '')
          .replace(/^game[-_\s]*/i, '')
          .replace(/[-_\s]+/g, ' ')
          .trim()
        if (!cleanName) cleanName = nameWithoutExt
        formData.name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
      }

      // 2. 获取文件夹大小
      let folderSize = 0
      const filePath = executablePathValue.trim()
      const isArchive = isArchiveFile(filePath)
      
      if (!isArchive && this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFolderSize) {
        try {
          const result = await window.electronAPI.getFolderSize(filePath)
          if (result.success) {
            folderSize = result.size
          }
        } catch (error) {
          console.error('获取文件夹大小失败:', error)
        }
      } else if (isArchive && this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFileStats) {
        try {
          const result = await window.electronAPI.getFileStats(filePath)
          if (result.success && result.size) {
            folderSize = result.size
          }
        } catch (error) {
          console.error('获取压缩包文件大小失败:', error)
        }
      }

      // 3. 设置默认值
      formData.folderSize = folderSize
      formData.playTime = 0
      formData.playCount = 0
      formData.lastPlayed = null
      formData.firstPlayed = null
      formData.addedDate = new Date().toISOString()
      formData.isArchive = isArchive
    },
    async handleAddGameConfirm(game) {
      await this.handleAddConfirm(game)
    },
    /**
     * 统一的资源 action 处理
     * 根据资源类型自动路由到对应的处理方法
     * 通过全局 Action Handler 注册系统执行，与页面解耦
     */
    async handleResourceAction(resource: any) {
      // 构建 handler 上下文
      const context: ActionHandlerContext = {
        isElectronEnvironment: this.isElectronEnvironment,
        updateResource: async (id: string, updates: any) => {
          await this.updateGame(id, updates)
        },
        isResourceRunning: (resource: any) => {
          return this.isGameRunning(resource)
        },
        addRunningResource: (resourceInfo: any) => {
          this.addRunningGame(resourceInfo)
        },
        removeRunningResource: (resourceId: string) => {
          this.removeRunningGame(resourceId)
        },
        getInitialPlayTime: (resourceId: string) => {
          return this.gameInitialPlayTimes?.get(resourceId) || 0
        },
        saveInitialPlayTime: (resourceId: string, playTime: number) => {
          if (!this.gameInitialPlayTimes) {
            this.gameInitialPlayTimes = new Map()
          }
          this.gameInitialPlayTimes.set(resourceId, playTime)
        },
        closeDetail: () => {
          this.closeGameDetail()
        },
        showTerminateConfirmDialog: (resource: any) => {
          this.showTerminateConfirmDialog = true
          this.gameToTerminate = resource
        }
      }

      // 执行 handler
      await executeActionHandler(resource, context)
    },
    
    showGameDetail(game) {
      this.showDetail(game)
      // 关闭上下文菜单（如果存在）
      if (this.$refs.baseView) {
        (this.$refs.baseView as any).showContextMenu = false
      }
    },
    // closeGameDetail 已移至工厂函数（closeDetail）
    handleGameContextMenu(event, game) {
      (this.$refs.baseView as any).showContextMenuHandler(event, game)
    },
    /**
     * 统一的资源更新函数（用于 DetailPanel 的 onUpdateResource prop）
     */
    async updateGameResource(id: string, updates: { rating?: number; comment?: string; isFavorite?: boolean }) {
      await this.updateGame(id, updates)
    },
    handleDetailAction(actionKey, game) {
      switch (actionKey) {
        case 'launch':
          this.handleResourceAction(game)
          break
        case 'terminate':
          // 显示确认对话框
          this.showTerminateConfirmDialog = true
          this.gameToTerminate = game
          break
        case 'folder':
          this.openGameFolder(game)
          break
        case 'edit':
          this.editGame(game)
          break
        case 'remove':
          this.deleteItem(game)
          break
      }
    },
    /**
     * 右键菜单点击事件处理
     * 注意：工厂函数已经提供了 handleContextMenuClick，但我们需要在 mounted 中更新 contextMenuHandlers
     * 以支持游戏特有的菜单项（screenshot-folder, update-folder-size, compress, extract 等）
     */
    // handleUpdateRating, handleUpdateComment, handleToggleFavorite 已移至 DetailPanel 内部统一处理
    // 通过 onUpdateResource prop 统一处理评分、评论和收藏的更新
    editGame(game) {
      this.showEdit(game)
      // 关闭上下文菜单（如果存在）
      if (this.$refs.baseView) {
        (this.$refs.baseView as any).showContextMenu = false
      }
    },
    // closeEditGameDialog 已移至工厂函数（closeEdit）
    async handleEditGameConfirm(updatedGame) {
      console.log('[handleEditGameConfirm] 收到 updatedGame:', {
        updatedGame,
        id: updatedGame.id,
        idType: typeof updatedGame.id,
        idIsResourceField: updatedGame.id instanceof ResourceField
      })
      
      // 确保 ID 是字符串值，而不是 ResourceField 对象
      const gameId = updatedGame.id instanceof ResourceField 
        ? updatedGame.id.value 
        : String(updatedGame.id || '')
      
      console.log('[handleEditGameConfirm] 提取的 gameId:', {
        gameId,
        gameIdType: typeof gameId,
        gameIdString: String(gameId)
      })
      
      // 使用工厂函数提供的 handleEditConfirm，但需要保留业务特定逻辑
      const updates = {
        name: updatedGame.name,
        developer: updatedGame.developer,
        publisher: updatedGame.publisher,
        engine: updatedGame.engine,
        description: updatedGame.description,
        tags: updatedGame.tags,
        executablePath: updatedGame.executablePath,
        coverPath: updatedGame.coverPath || (updatedGame as any).image
      }
      
      const finalData = { ...updatedGame, ...updates, id: gameId }
      console.log('[handleEditGameConfirm] 传递给 handleEditConfirm 的数据:', {
        finalData,
        finalId: finalData.id,
        finalIdType: typeof finalData.id
      })
      
      await this.handleEditConfirm(finalData)
    },
    // handleRemoveGame 已移至工厂函数（deleteItem）
    // 格式化函数已在 setup 中通过工厂函数使用，这里不再需要暴露
    // loadGames 已移至 useGameManagement composable
    async loadGamesWithChecks() {
      // 调用 composable 的 loadGames（从 setup 返回，方法名是 loadGames）
      if (typeof (this as any).loadGames === 'function') {
        await (this as any).loadGames()
      }

      this.updateFilterData()

      // 检测文件存在性（仅在应用启动时检测一次）
      if ((this.$root as any).shouldCheckFileLoss && (this.$root as any).shouldCheckFileLoss()) {
        // 标记为已开始检测，避免其它页面重复发起检测
        ;(this.$root as any).markFileLossChecked()
        Promise.resolve()
          .then(() => this.checkFileExistence())
          .catch((e) => {
            console.warn('[GameView] 后台检测文件存在性失败:', e)
          })
          .finally(() => {
            // 检测完成后，刷新筛选器
            this.updateFilterData()
          })
      }

      // 为现有游戏计算文件夹大小（如果还没有的话）
      Promise.resolve()
        .then(() => this.updateExistingGamesFolderSize())
        .catch((e) => {
          console.warn('[GameView] 后台计算文件夹大小失败:', e)
        })

      // 分页信息会自动更新（usePagination composable 会监听 filteredGames 的变化）
      // 如果需要手动触发，可以使用 this.updatePagination()

      Promise.resolve()
        .then(() => this.checkGameCollectionAchievements())
        .catch((e) => {
          console.warn('[GameView] 后台成就检测失败(checkGameCollectionAchievements):', e)
        })

      Promise.resolve()
        .then(() => this.checkGameTimeAchievements())
        .catch((e) => {
          console.warn('[GameView] 后台成就检测失败(checkGameTimeAchievements):', e)
        })
    },
    // updateExistingGamesFolderSize 和 checkFileExistence 已移至 useGameManagement composable

    // 显示丢失文件提醒
    showMissingFilesAlert(missingFiles) {
      // 构建文件列表文本
      const fileList = missingFiles.map(file =>
        `• ${file.name}${file.path !== '未设置路径' && file.path !== '路径检测失败' ? ` (${file.path})` : ''}`
      ).join('\n')

      // 显示 toast 通知，包含详细信息
      notify.toast(
        'warning',
        '游戏文件丢失提醒',
        `发现 ${missingFiles.length} 个游戏文件丢失：\n${fileList}\n\n请检查文件路径或重新添加这些游戏。`
      )

      // 在控制台输出详细信息
      console.warn('📋 丢失的游戏文件列表:')
      missingFiles.forEach((file, index) => {
        console.warn(`${index + 1}. ${file.name}`)
        if (file.path !== '未设置路径' && file.path !== '路径检测失败') {
          console.warn(`   路径: ${file.path}`)
        }
      })
    },

    async updateGameFolderSize(game) {
      try {
        const gameId = game.id?.value || game.id
        await this.updateGameFolderSize(gameId)
      } catch (error: any) {
        const gameName = game.name?.value || game.name
        console.error(`❌ 更新游戏 ${gameName} 文件夹大小失败:`, error)
      }
    },
    // 动态筛选方法：根据筛选配置动态生成
    // 这些方法现在直接从 composable 中获取，只需要在调用后更新筛选器数据
    // 处理来自 App.vue 的筛选器事件（动态支持所有筛选器）
    handleFilterEvent(event, data) {
      console.log('GameView handleFilterEvent:', event, data)
      const filterKey = data?.filterKey || data
      
      // 动态获取筛选方法名
      const filterMethodName = `filterBy${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`
      const excludeMethodName = `excludeBy${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`
      const clearMethodName = `clear${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}Filter`
      
      switch (event) {
        case 'filter-select':
          if (this[filterMethodName] && typeof this[filterMethodName] === 'function') {
            this[filterMethodName](data.itemName)
            this.updateFilterData()
          }
          break
        case 'filter-exclude':
          if (this[excludeMethodName] && typeof this[excludeMethodName] === 'function') {
            this[excludeMethodName](data.itemName)
            this.updateFilterData()
          }
          break
        case 'filter-clear':
          if (this[clearMethodName] && typeof this[clearMethodName] === 'function') {
            this[clearMethodName]()
            this.updateFilterData()
          }
          break
      }
    },
    // 更新筛选器数据到 App.vue
    updateFilterData() {
      const filterData = this.getFilterData()
      this.$emit('filter-data-updated', filterData)
    },
    // updateGamePlayTime 已移至 useGamePlayTime composable
    async updateGamePlayTime(data) {
      // 调用 composable 的方法（注意：方法名相同，但 this.updateGamePlayTime 指向 composable 的方法）
      await (this as any).updateGamePlayTime(data)
    },
    // isGameRunning 已移至 useGameRunning composable
    isGameRunning(game) {
      // 调用 composable 的方法
      return (this as any).isGameRunning(game)
    },
    async terminateGame(game) {
      try {
        const gameName = game.name?.value || game.name
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        const gameId = game.id?.value || game.id
        
        console.log('[DEBUG] 🛑 开始强制结束游戏:', gameName, executablePath)
        
        if (!this.isElectronEnvironment || !window.electronAPI || !window.electronAPI.terminateGame) {
          notify.toast('error', '操作失败', '当前环境不支持强制结束游戏功能')
          return
        }

        const result = await window.electronAPI.terminateGame(executablePath)
        
        if (result.success) {
          console.log('[DEBUG] ✅ 游戏已强制结束，PID:', result.pid, '运行时长:', result.playTime, '秒')
          notify.toast('success', '游戏已结束', `${gameName} 已强制结束`)
        } else {
          console.warn('[DEBUG] ⚠️ 强制结束游戏失败:', result.error)
          
          // 检查错误信息是否包含"未找到运行中的游戏进程"
          const isProcessNotFound = result.error && (
            result.error.includes('未找到') || 
            result.error.includes('运行中的游戏进程') ||
            result.error.includes('not found') ||
            result.error.includes('process not found')
          )
          
          if (isProcessNotFound) {
            // 如果未找到进程，显示警告并从运行列表中移除
            console.warn('[DEBUG] ⚠️ 游戏进程未找到，从运行列表中移除:', gameId)
            notify.toast('warning', '游戏已停止', `未找到 ${gameName} 的运行进程，已将其标记为已停止`)
            
            // 检查游戏是否在运行列表中，如果在则移除
            if (this.isGameRunning(game)) {
              this.removeRunningGame(gameId)
              console.log('[DEBUG] ✅ 已从运行列表中移除游戏:', gameId)
            }
          } else {
            // 其他错误，显示错误提示
            notify.toast('error', '操作失败', `强制结束游戏失败: ${result.error}`)
          }
        }
      } catch (error) {
        console.error('[DEBUG] ❌ 强制结束游戏异常:', error)
        
        const gameName = game.name?.value || game.name
        const gameId = game.id?.value || game.id
        
        // 检查错误信息是否包含"未找到运行中的游戏进程"
        const errorMessage = error.message || String(error)
        const isProcessNotFound = errorMessage.includes('未找到') || 
          errorMessage.includes('运行中的游戏进程') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('process not found')
        
        if (isProcessNotFound) {
          // 如果未找到进程，显示警告并从运行列表中移除
          console.warn('[DEBUG] ⚠️ 游戏进程未找到，从运行列表中移除:', gameId)
          notify.toast('warning', '游戏已停止', `未找到 ${gameName} 的运行进程，已将其标记为已停止`)
          
          // 检查游戏是否在运行列表中，如果在则移除
          if (this.isGameRunning(game)) {
            this.removeRunningGame(gameId)
            console.log('[DEBUG] ✅ 已从运行列表中移除游戏:', gameId)
          }
        } else {
          notify.toast('error', '操作失败', `强制结束游戏失败: ${errorMessage}`)
        }
      }
    },
    closeTerminateConfirmDialog() {
      this.showTerminateConfirmDialog = false
      this.gameToTerminate = null
    },
    async confirmTerminateGame() {
      if (this.gameToTerminate) {
        await this.terminateGame(this.gameToTerminate)
        this.closeTerminateConfirmDialog()
      }
    },
    // 密码输入对话框处理方法
    handlePasswordConfirm(password) {
      this.showPasswordDialog = false
      if (this.passwordDialogCallback) {
        this.passwordDialogCallback(password)
      }
      // 清理状态
      this.passwordDialogCallback = null
      this.passwordDialogGame = null
      this.passwordDialogOutputDir = null
      this.passwordDialogTriedPasswords = []
    },
    handlePasswordCancel() {
      this.showPasswordDialog = false
      if (this.passwordDialogCallback) {
        // 传递 null 表示取消
        this.passwordDialogCallback(null)
      }
      // 清理状态
      this.passwordDialogCallback = null
      this.passwordDialogGame = null
      this.passwordDialogOutputDir = null
      this.passwordDialogTriedPasswords = []
    },



    // playScreenshotSound 和 takeScreenshot 已移至 useGameScreenshot composable
    // 不再需要在这里定义，否则会覆盖 composable 的方法导致递归调用
    // 直接使用 composable 导出的方法即可
    // 应用内快捷键功能已禁用，只使用全局快捷键
    // handleKeyDown(event) {
    //   // 获取用户设置的截图快捷键
    //   const settings = JSON.parse(localStorage.getItem('butter-manager-settings') || '{}')
    //   const screenshotKey = settings.screenshotKey || 'F12'
    //   
    //   // 检查是否匹配用户设置的快捷键
    //   if (this.isKeyMatch(event, screenshotKey)) {
    //     event.preventDefault()
    //     this.takeScreenshot()
    //   }
    // },
    // isKeyMatch(event, keySetting) {
    //   // 只支持F12键
    //   if (keySetting === 'F12') {
    //     return event.key === 'F12' && !event.ctrlKey && !event.altKey && !event.shiftKey
    //   }
    //   
    //   return false
    // },
    // initializeGlobalShortcut 已移至 useGameScreenshot composable
    // 不再需要在这里定义，否则会覆盖 composable 的方法导致递归调用
    // 直接使用 composable 导出的方法即可

    // SaveManager 相关方法
    async exportGames() {
      try {
        const success = await saveManager.exportData('games')
        if (success) {
          notify.native('导出成功', '游戏数据已导出到文件')
        } else {
          notify.native('导出失败', '游戏数据导出失败')
        }
      } catch (error) {
        console.error('导出游戏数据失败:', error)
        notify.native('导出失败', `导出失败: ${error.message}`)
      }
    },

    async getStorageInfo() {
      const info = await saveManager.getStorageInfo()
      if (info) {
        const sizeKB = Math.round(info.total.size / 1024)
        const sizeMB = Math.round(sizeKB / 1024 * 100) / 100
        return {
          totalSize: sizeMB > 1 ? `${sizeMB} MB` : `${sizeKB} KB`,
          gameCount: info.games.count,
          settingsCount: info.settings.count,
          backupCount: info.backup.count
        }
      }
      return null
    },

    async parseGameSaveFile(file) {
      try {
        const content = await file.text()
        const result = saveManager.parseGameSaveFile(content)
        if (result.success) {
          console.log('游戏存档解析成功:', result.slots)
          return result
        } else {
          console.error('游戏存档解析失败:', result.error)
          return null
        }
      } catch (error) {
        console.error('读取游戏存档文件失败:', error)
        return null
      }
    },

    async openGameFolder(game) {
      try {
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        if (!executablePath) {
          await alertService.warning('游戏文件路径不存在', '提示')
          return
        }

        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.openFileFolder) {
          const result = await window.electronAPI.openFileFolder(executablePath)
          if (result.success) {
            console.log('已打开游戏文件夹:', result.folderPath)

          } else {
            console.error('打开文件夹失败:', result.error)
            await alertService.error(`打开文件夹失败: ${result.error}`, '错误')
          }
        } else {
          // 降级处理：在浏览器中显示路径
          await alertService.info(`游戏文件位置:\n${executablePath}`, '文件位置')
        }
      } catch (error) {
        console.error('打开游戏文件夹失败:', error)
        await alertService.error(`打开文件夹失败: ${error.message}`, '错误')
      }
    },
    // openGameScreenshotFolder 已移至 useGameScreenshot composable，直接使用 composable 导出的方法
    // 不再需要在这里定义，否则会覆盖 composable 的方法导致递归调用
    // 压缩/解压相关方法已移至 useArchive composable（通用功能）
    // compressFile, compressFileToCurrentDir, extractArchive, extractArchiveToCurrentDir, performCompression, performExtraction
    // 拖拽处理方法
    // 拖拽相关方法已移至 useGameDragAndDrop composable
    handleDragOver(event) {
      if (this.dragDropComposable?.handleDragOver) {
        this.dragDropComposable.handleDragOver(event)
      }
    },

    handleDragEnter(event) {
      if (this.dragDropComposable?.handleDragEnter) {
        this.dragDropComposable.handleDragEnter(event)
      }
    },

    handleDragLeave(event) {
      if (this.dragDropComposable?.handleDragLeave) {
        this.dragDropComposable.handleDragLeave(event)
      }
    },

    async handleDrop(event) {
      if (this.dragDropComposable?.handleDrop) {
        await this.dragDropComposable.handleDrop(event)
      }
    },

    // 旧的 handleDrop 方法已移除，现在使用 useGameDragAndDrop composable

    // 检查是否在 Electron 环境中
    checkElectronEnvironment() {
      this.isElectronEnvironment = !!(window.electronAPI && typeof window.electronAPI === 'object')

      if (this.isElectronEnvironment) {
        console.log('✅ 检测到 Electron 环境')
      } else {
        console.log('❌ 未检测到 Electron 环境，可能是浏览器环境或 API 未正确加载')
        console.log('当前环境信息:')
        console.log('- userAgent:', navigator.userAgent)
        console.log('- location:', window.location.href)
        console.log('- process:', typeof process !== 'undefined' ? process.versions : 'undefined')
      }
    },

    // 路径更新相关方法
    closePathUpdateDialog() {
      this.showPathUpdateDialog = false
      this.pathUpdateInfo = {
        existingGame: null,
        newPath: '',
        newFileName: ''
      }
    },

    async confirmPathUpdate() {
      try {
        const { existingItem, newPath } = this.pathUpdateInfo

        if (!existingItem || !newPath) {
          console.error('路径更新信息不完整')
          return
        }

        const itemName = existingItem.name?.value || existingItem.name
        const oldPath = existingItem.resourcePath?.value || existingItem.executablePath?.value || existingItem.resourcePath || existingItem.executablePath
        console.log(`更新游戏 "${itemName}" 的路径:`)
        console.log(`旧路径: ${oldPath}`)
        console.log(`新路径: ${newPath}`)

        // 更新游戏路径
        if (existingItem.resourcePath && typeof existingItem.resourcePath === 'object' && 'value' in existingItem.resourcePath) {
          existingItem.resourcePath.value = newPath
        } else if (existingItem.executablePath && typeof existingItem.executablePath === 'object' && 'value' in existingItem.executablePath) {
          existingItem.executablePath.value = newPath
        } else {
          existingItem.resourcePath = newPath
          existingItem.executablePath = newPath
        }
        
        if (existingItem.fileExists && typeof existingItem.fileExists === 'object' && 'value' in existingItem.fileExists) {
          existingItem.fileExists.value = true
        } else {
          existingItem.fileExists = true
        }

        // 重新计算文件夹大小
        if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.getFolderSize) {
          try {
            const result = await window.electronAPI.getFolderSize(newPath)
            if (result.success) {
              if (existingItem.folderSize && typeof existingItem.folderSize === 'object' && 'value' in existingItem.folderSize) {
                existingItem.folderSize.value = result.size
              } else {
                existingItem.folderSize = result.size
              }
              console.log(`游戏 ${itemName} 文件夹大小: ${result.size} 字节`)
            }
          } catch (error) {
            console.error('获取文件夹大小失败:', error)
          }
        }

        // 保存更新后的数据
        await this.saveGames()

        // 关闭对话框
        this.closePathUpdateDialog()

        // 显示成功通知
        notify.toast(
          'success',
          '路径更新成功',
          `游戏 "${itemName}" 的路径已更新`
        )

        console.log(`游戏 "${itemName}" 路径更新完成`)

      } catch (error) {
        console.error('更新游戏路径失败:', error)
        notify.toast('error', '更新失败', `更新游戏路径失败: ${error.message}`)
      }
    },
    // handleSortChanged, loadSortSetting 已移至工厂函数
    // handlePageChange 已移至工厂函数
    // handleEmptyStateAction 已移至工厂函数
    // handleSearchQueryChanged, handleSortByChanged 已移至工厂函数
  },
  watch: {
    // 监听搜索和排序变化，重置到第一页（已在工厂函数中处理，但这里保留以兼容旧代码）
    searchQuery() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    },
    sortBy() {
      if (this.resetToFirstPage) {
        this.resetToFirstPage()
      }
    }
  },
  async mounted() {
    // 设置父组件函数引用（在 Options API 中通过 this.$root 访问）
    if ((this as any)._setParentFunctions && this.$root) {
      (this as any)._setParentFunctions({
        getRunningGames: () => (this.$root as any).runningGames || new Map(),
        addRunningGame: (gameInfo: any) => (this.$root as any).addRunningGame(gameInfo),
        removeRunningGame: (gameId: string) => (this.$root as any).removeRunningGame(gameId),
        isGameRunning: (gameId: string) => (this.$root as any).isGameRunning(gameId)
      })
    }

    // 更新工厂函数的 contextMenuHandlers，添加游戏特有的处理
    // 注意：直接修改 contextMenuHandlers 对象的属性，而不是创建新对象
    // 这样 useResourceContextMenu 内部保存的引用也会更新
    if ((this as any)._contextMenuHandlers) {
      const contextMenuHandlers = (this as any)._contextMenuHandlers
      const screenshotComposable = (this as any)._screenshotComposable
      // 直接修改对象的属性，而不是创建新对象
      contextMenuHandlers.detail = (game: any) => this.showGameDetail(game)
      contextMenuHandlers.launch = (game: any) => this.handleResourceAction(game)
      contextMenuHandlers.folder = (game: any) => this.openGameFolder(game)
      contextMenuHandlers['screenshot-folder'] = (game: any) => {
        if (screenshotComposable && screenshotComposable.openGameScreenshotFolder) {
          screenshotComposable.openGameScreenshotFolder(game)
        } else {
          console.error('无法打开截图文件夹：screenshotComposable 不可用')
        }
      }
      contextMenuHandlers['update-folder-size'] = (game: any) => this.updateGameFolderSize(game)
      contextMenuHandlers['compress-to'] = (game: any) => {
        const gameName = game.name?.value || game.name
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        this.compressFile({ name: gameName, path: executablePath })
      }
      contextMenuHandlers['compress-here'] = (game: any) => {
        const gameName = game.name?.value || game.name
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        this.compressFileToCurrentDir({ name: gameName, path: executablePath })
      }
      contextMenuHandlers.extract = (game: any) => {
        const gameName = game.name?.value || game.name
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        const isArchiveValue = game.isArchive?.value ?? game.isArchive
        this.extractArchive({ name: gameName, path: executablePath, isArchive: isArchiveValue })
      }
      contextMenuHandlers['extract-here'] = (game: any) => {
        const gameName = game.name?.value || game.name
        const executablePath = game.resourcePath?.value || game.executablePath?.value || game.resourcePath || game.executablePath
        const isArchiveValue = game.isArchive?.value ?? game.isArchive
        this.extractArchiveToCurrentDir({ name: gameName, path: executablePath, isArchive: isArchiveValue })
      }
      contextMenuHandlers.edit = (game: any) => this.editGame(game)
      contextMenuHandlers.remove = (game: any) => this.deleteItem(game)
    }

    // 设置压缩/解压 composable 的密码对话框回调
    if ((this as any)._archiveComposable) {
      const archiveComposable = (this as any)._archiveComposable
      // 设置密码对话框回调
      if (archiveComposable.setPasswordDialogCallback) {
        archiveComposable.setPasswordDialogCallback((config: any) => {
          this.passwordDialogTitle = config.title
          this.passwordDialogMessage = config.message
          this.passwordDialogCallback = async (password: string | null) => {
            await config.onConfirm(password)
          }
          this.showPasswordDialog = true
        })
      }
    }

    // 设置拖拽函数
    if ((this as any)._setDragDropFunctions) {
      (this as any)._setDragDropFunctions({
        showPathUpdateDialog: (info: any) => {
          this.showPathUpdateDialogHandler({
            existingItem: info.existingGame || info.existingItem,
            newPath: info.newPath,
            newFileName: info.newFileName || info.newPath?.split(/[/\\]/).pop() || ''
          })
        },
        addGame: async (game: any) => {
          await this.addGame(game)
        }
      })
    }

    this.checkElectronEnvironment()
    
    // 移除等待逻辑，因为 ResourceView 仅在 App.vue 初始化完成后才渲染
    console.log('✅ 存档系统已初始化，开始加载游戏数据')
    
    await this.loadGamesWithChecks()
    
    // 加载分页设置（使用工厂函数的方法）
    await this.loadPaginationSettings('games')
    
    // 加载排序设置（使用工厂函数的方法，但需要兼容旧格式）
    try {
      const savedSortBy = await saveManager.getSortSetting('games')
      if (savedSortBy) {
        // 兼容旧的排序值，转换为新格式
        let normalizedSortBy = savedSortBy
        if (!savedSortBy.includes('-')) {
          // 旧的排序值（如 'name'），默认转换为升序
          normalizedSortBy = `${savedSortBy}-asc`
        }
        
        if (normalizedSortBy !== this.sortBy) {
          this.sortBy = normalizedSortBy as GameSortBy
          console.log('✅ 已加载游戏页面排序方式:', normalizedSortBy)
        }
      }
    } catch (error) {
      console.warn('加载排序方式失败:', error)
    }

    // 游戏运行状态现在由 App.vue 全局管理，无需在此处处理

    // 监听游戏时长更新事件（接收总时长，直接设置）
    this.handleGamePlaytimeUpdate = (event: CustomEvent) => {
      const { gameId, totalPlayTime, shouldSave } = event.detail
      const game = this.games.find(g => (g.id?.value || g.id) === gameId)
      if (game) {
        // 直接设置总时长，不累加
        if (game.playTime && typeof game.playTime === 'object' && 'value' in game.playTime) {
          game.playTime.value = totalPlayTime
        } else {
          game.playTime = totalPlayTime
        }
        const gameName = game.name?.value || game.name
        const playTimeValue = game.playTime?.value || game.playTime
        console.log(`[GameView] 游戏 ${gameName} 时长已更新: ${playTimeValue} 秒`)
        
        if (shouldSave) {
          // 游戏结束时保存
          this.saveGames()
          console.log(`[GameView] 游戏 ${gameName} 时长已保存`)
        }
      }
    }
    
    // 初始化游戏初始时长存储
    if (!this.gameInitialPlayTimes) {
      this.gameInitialPlayTimes = new Map()
    }
    
    // 监听请求更新游戏时长事件（App.vue 定时触发）
    this.handleRequestUpdatePlaytime = (event: CustomEvent) => {
      const { gameId } = event.detail
      const game = this.games.find(g => (g.id?.value || g.id) === gameId)
      if (game && this.gameRunningStore && this.gameInitialPlayTimes) {
        // 如果还没有保存初始值，先保存（第一次更新时）
        if (!this.gameInitialPlayTimes.has(gameId)) {
          const playTimeValue = game.playTime?.value || game.playTime || 0
          this.gameInitialPlayTimes.set(gameId, playTimeValue)
        }
        
        // 获取初始 playTime（启动时的值）
        const initialPlayTime = this.gameInitialPlayTimes.get(gameId) || 0
        // 计算当前总时长 = 初始时长 + 会话时长
        const totalPlayTime = this.gameRunningStore.getCurrentPlayTime(gameId, initialPlayTime)
        // 更新游戏时长（用于显示）
        if (game.playTime && typeof game.playTime === 'object' && 'value' in game.playTime) {
          game.playTime.value = totalPlayTime
        } else {
          game.playTime = totalPlayTime
        }
        const gameName = game.name?.value || game.name
        console.log(`[GameView] 游戏 ${gameName} 时长已更新: ${totalPlayTime} 秒 (初始: ${initialPlayTime}, 会话: ${totalPlayTime - initialPlayTime})`)
      }
    }
    
    // 监听请求最终游戏时长事件（游戏结束时）
    this.handleRequestFinalPlaytime = (event: CustomEvent) => {
      const { gameId } = event.detail
      const game = this.games.find(g => (g.id?.value || g.id) === gameId)
      if (game && this.gameRunningStore && this.gameInitialPlayTimes) {
        // 获取初始 playTime（从保存的初始值获取，如果不存在则使用当前值）
        const currentPlayTime = game.playTime?.value || game.playTime || 0
        const initialPlayTime = this.gameInitialPlayTimes.get(gameId) || currentPlayTime
        // 计算最终总时长
        const totalPlayTime = this.gameRunningStore.getCurrentPlayTime(gameId, initialPlayTime)
        // 更新并保存
        if (game.playTime && typeof game.playTime === 'object' && 'value' in game.playTime) {
          game.playTime.value = totalPlayTime
        } else {
          game.playTime = totalPlayTime
        }
        // 清除保存的初始值
        this.gameInitialPlayTimes.delete(gameId)
        this.saveGames()
        const gameName = game.name?.value || game.name
        console.log(`[GameView] 游戏 ${gameName} 最终时长已保存: ${totalPlayTime} 秒`)
      }
    }
    
    // 监听游戏时长保存事件
    this.handleGamePlaytimeSave = (event: CustomEvent) => {
      const { gameId } = event.detail
      const game = this.games.find(g => (g.id?.value || g.id) === gameId)
      if (game) {
        this.saveGames()
        const gameName = game.name?.value || game.name
        console.log(`[GameView] 游戏 ${gameName} 时长已保存`)
      }
    }
    
    window.addEventListener('game-playtime-update', this.handleGamePlaytimeUpdate as EventListener)
    window.addEventListener('game-playtime-save', this.handleGamePlaytimeSave as EventListener)
    window.addEventListener('game-request-update-playtime', this.handleRequestUpdatePlaytime as EventListener)
    window.addEventListener('game-request-final-playtime', this.handleRequestFinalPlaytime as EventListener)

    // 加载游戏分页设置（使用 composable 的方法）
    if (this.loadPaginationSettings) {
      await this.loadPaginationSettings('game')
    }

    // 初始化拖拽 composable
    if (this._setDragDropFunctions) {
      this._setDragDropFunctions({
        showPathUpdateDialog: (info) => {
          this.pathUpdateInfo = {
            existingGame: info.existingGame,
            newPath: info.newPath,
            newFileName: info.newFileName
          }
          this.showPathUpdateDialog = true
        },
        addGame: this.addGame
      })
    }

    // 加载排序设置
    await this.loadSortSetting()

    // 初始化筛选器数据
    this.updateFilterData()


    // 监听游戏进程结束事件
    if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.onGameProcessEnded) {
      console.log('[DEBUG] 🎧 注册 game-process-ended 事件监听器')
      window.electronAPI.onGameProcessEnded((event, data) => {
        console.log('[DEBUG] 📥 收到 game-process-ended 事件，数据:', data)
        this.updateGamePlayTime(data)
      })
    } else {
      console.log('[DEBUG] ⚠️ 无法注册 game-process-ended 事件监听器')
    }

    // 监听全局截图触发事件（只使用全局快捷键）
    if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.onGlobalScreenshotTrigger) {
      window.electronAPI.onGlobalScreenshotTrigger(() => {
        console.log('全局快捷键触发截图')
        this.takeScreenshot()
      })
    } else {
      // 应用内快捷键功能已禁用
      console.log('全局快捷键不可用，应用内快捷键已禁用')
    }

    // 监听 Flash 播放器错误事件
    if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.onFlashPlayerError) {
      window.electronAPI.onFlashPlayerError((event, data) => {
        console.error('Flash 播放器错误:', data)
        if (data.type === 'no-path') {
          // 未指定路径，使用 alertService
          alertService.error(data.message, 'Flash 播放器错误')
        } else {
          // 其他错误，使用 toast
          notify.toast('error', 'Flash 播放器错误', data.message)
        }
      })
    }

    // 初始化全局快捷键
    this.initializeGlobalShortcut()
  },
  beforeUnmount() {
    // 清理游戏时长更新事件监听
    if (this.handleGamePlaytimeUpdate) {
      window.removeEventListener('game-playtime-update', this.handleGamePlaytimeUpdate as EventListener)
    }
    if (this.handleGamePlaytimeSave) {
      window.removeEventListener('game-playtime-save', this.handleGamePlaytimeSave as EventListener)
    }
    if (this.handleRequestInitialPlaytime) {
      window.removeEventListener('game-request-initial-playtime', this.handleRequestInitialPlaytime as EventListener)
    }
    
    // 应用内快捷键功能已禁用，无需清理
    // document.removeEventListener('keydown', this.handleKeyDown)

    // 清理全局截图事件监听器
    if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.removeGlobalScreenshotListener) {
      // 移除全局截图事件监听器
      window.electronAPI.removeGlobalScreenshotListener()
      console.log('清理全局截图事件监听器')
    } else if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.removeAllListeners) {
      // 降级方案：移除所有监听器
      window.electronAPI.removeAllListeners('global-screenshot-trigger')
      console.log('清理所有全局截图事件监听器')
    }

    // 清理 Flash 播放器错误事件监听器
    if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.removeFlashPlayerErrorListener) {
      window.electronAPI.removeFlashPlayerErrorListener()
      console.log('清理 Flash 播放器错误事件监听器')
    } else if (this.isElectronEnvironment && window.electronAPI && window.electronAPI.removeAllListeners) {
      window.electronAPI.removeAllListeners('flash-player-error')
      console.log('清理 Flash 播放器错误事件监听器（降级方案）')
    }
  }
}
</script>

<style lang="scss" scoped>
// 游戏主内容区域
.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--spacing-xl);
  height: 100%;
  overflow-y: auto;
  position: relative;
  transition: all var(--transition-base);
  box-sizing: border-box;

  // 拖拽样式
  &.drag-over {
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed var(--accent-color);
    border-radius: var(--radius-xl);

    &::before {
      content: '拖拽游戏文件到这里添加游戏 (.exe / .swf / .bat / .zip / .rar / .7z 等)';
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
    }
  }
}

// 游戏网格样式已移至 GameGrid.vue 组件

// 强制结束游戏确认对话框样式
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
}

// 响应式设计
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    margin: var(--spacing-xl);
  }

  .detail-body {
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .detail-image {
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
