/**
 * 游戏相关类型定义
 */

import type { BaseResource } from './abstract/BaseResource'
import { Game } from './class/game.ts'

/**
 * 游戏统计信息接口
 */
export interface GameStats {
  label: string
  value: string | number
}

/**
 * 筛选项接口
 */
export interface FilterItem {
  name: string
  count: number
}

/**
 * 游戏排序方式
 */
export type GameSortBy = 
  | 'name-asc' | 'name-desc' 
  | 'lastPlayed-asc' | 'lastPlayed-desc' 
  | 'playTime-asc' | 'playTime-desc' 
  | 'added-asc' | 'added-desc'

/**
 * 游戏筛选选项接口
 */
export interface GameFilterOptions {
  searchQuery: string
  sortBy: GameSortBy
  selectedTags: string[]
  excludedTags: string[]
  selectedDevelopers: string[]
  excludedDevelopers: string[]
  selectedPublishers: string[]
  excludedPublishers: string[]
  selectedEngines: string[]
  excludedEngines: string[]
  selectedOthers: string[]
  excludedOthers: string[]
}

/**
 * 路径更新信息接口
 */
export interface PathUpdateInfo {
  existingGame: Game.GameData
  newPath: string
  newFileName: string
}

/**
 * 游戏拖拽选项接口
 */
export interface GameDragDropOptions {
  /**
   * 游戏列表（响应式）
   */
  games: import('vue').Ref<Game.GameData[]> | Game.GameData[]
  
  /**
   * 添加游戏的回调函数
   */
  onAddGame: (game: Game.GameData) => Promise<void>
  
  /**
   * 显示路径更新对话框的回调函数
   */
  onShowPathUpdateDialog: (info: PathUpdateInfo) => void
  
  /**
   * 是否为 Electron 环境
   */
  isElectronEnvironment: boolean
}

/**
 * 游戏筛选数据接口（用于筛选器组件）
 */
export interface GameFilterData {
  allTags: FilterItem[]
  allDevelopers: FilterItem[]
  allPublishers: FilterItem[]
  allEngines: FilterItem[]
  allOthers: FilterItem[]
  selectedTags: string[]
  excludedTags: string[]
  selectedDevelopers: string[]
  excludedDevelopers: string[]
  selectedPublishers: string[]
  excludedPublishers: string[]
  selectedEngines: string[]
  excludedEngines: string[]
  selectedOthers: string[]
  excludedOthers: string[]
}

