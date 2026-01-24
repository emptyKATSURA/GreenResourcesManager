import { BasePage } from './base/BasePage.ts'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'
import type { FilterConfig, FilterItem } from '../../types/filter'
import { Game as GameClass } from '@resources/game.ts'

// Game 类型就是 GameClass 的实例类型
type Game = InstanceType<typeof GameClass>

/**
 * 游戏排序方式类型
 * 定义在 GamePage 类所在的文件中
 */
export type GameSortBy = 
	| 'name-asc' 
	| 'name-desc' 
	| 'lastPlayed-asc' 
	| 'lastPlayed-desc' 
	| 'playTime-asc' 
	| 'playTime-desc' 
	| 'added-asc' 
	| 'added-desc'

/**
 * 安全获取游戏属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 */
function getFieldValue<T>(field: any): T | undefined {
	if (field && typeof field === 'object' && 'value' in field) {
		return field.value as T
	}
	return field as T
}

export class GamePage extends BasePage {
	readonly id: string = 'games'
	readonly name: string = '游戏'
	readonly icon: string = '🎮'
	readonly description: string = '可以管理游戏、应用等exe文件'

	// 接受的资源类型（可以多个）
	resourceTypes: string[] = ['Game']

	// 页面布局配置
	displayLayoutConfig = {
		minWidth: 80,
		maxWidth: 400
	}
	
	/**
	 * 获取空状态配置
	 */
	getEmptyStateConfig() {
		return {
			icon: '🎮',
			title: '你的游戏库是空的',
			description: '点击"添加游戏"按钮来添加你的第一个游戏，或直接拖拽游戏文件到此处',
			buttonText: '添加第一个游戏',
			buttonAction: 'showAddGameDialog'
		}
	}
	
	/**
	 * 获取工具栏配置
	 */
	getToolbarConfig() {
		return {
			addButtonText: '添加游戏',
			searchPlaceholder: '搜索游戏...'
		}
	}

	/**
	 * 排序配置
	 * 每个配置项定义了一个排序选项，包含字段访问器和排序方向
	 * 用户可以根据需要自由定义排序方式
	 */
	private sortConfigs: Record<string, SortConfig<Game> & { label: string }> = {
		'name-asc': {
			label: '按名称排序',
			fieldAccessor: (game: Game) => {
				const name = getFieldValue<string>((game as any).name)
				return name || null
			},
			order: 'asc'
		},
		'name-desc': {
			label: '按名称排序（降序）',
			fieldAccessor: (game: Game) => {
				const name = getFieldValue<string>((game as any).name)
				return name || null
			},
			order: 'desc'
		},
		'lastPlayed-asc': {
			label: '按最后游玩时间',
			fieldAccessor: (game: Game) => {
				const lastPlayed = getFieldValue<string>((game as any).lastPlayed) || (game as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'asc'
		},
		'lastPlayed-desc': {
			label: '按最后游玩时间（降序）',
			fieldAccessor: (game: Game) => {
				const lastPlayed = getFieldValue<string>((game as any).lastPlayed) || (game as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'desc'
		},
		'playTime-asc': {
			label: '按游戏时长（升序）',
			fieldAccessor: (game: Game) => {
				const playTime = getFieldValue<number>((game as any).playTime) ?? (game as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'asc'
		},
		'playTime-desc': {
			label: '按游戏时长（降序）',
			fieldAccessor: (game: Game) => {
				const playTime = getFieldValue<number>((game as any).playTime) ?? (game as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'desc'
		},
		'added-asc': {
			label: '按添加时间（升序）',
			fieldAccessor: (game: Game) => {
				const addedDate = getFieldValue<string>((game as any).addedDate) || (game as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'asc'
		},
		'added-desc': {
			label: '按添加时间（降序）',
			fieldAccessor: (game: Game) => {
				const addedDate = getFieldValue<string>((game as any).addedDate) || (game as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'desc'
		}
	}

	/**
	 * 获取排序选项配置（用于工具栏显示）
	 * 直接返回配置中定义的排序选项
	 */
	getSortOptions(): SortOption[] {
		return Object.entries(this.sortConfigs).map(([value, config]) => ({
			value,
			label: config.label
		}))
	}

	/**
	 * 根据排序值获取排序配置
	 * @param sortValue 排序值，如 'name-asc' 或 'name-desc'
	 * @returns 排序配置，可直接用于 sortBy 工具函数
	 */
	getSortConfig(sortValue: string): SortConfig<Game> | null {
		const config = this.sortConfigs[sortValue]
		if (!config) {
			return null
		}
		
		// 返回排序配置（不包含 label）
		return {
			fieldAccessor: config.fieldAccessor,
			order: config.order,
			compareFn: config.compareFn
		}
	}

	/**
	 * 获取筛选配置
	 * 定义游戏页面支持的所有筛选器
	 * 合并基类的"丢失的资源"筛选和游戏特有的筛选器
	 */
	getFilterConfig<T = Game>(): FilterConfig<T>[] {
		// 获取基类的筛选配置（包含"丢失的资源"）
		const baseFilters = super.getFilterConfig<T>()
		
		// 游戏特有的筛选器
		const gameFilters: FilterConfig<T>[] = [
			{
				key: 'tags',
				title: '标签筛选',
				fieldAccessor: (game: any) => {
					const tags = getFieldValue<string[]>((game as any).tags)
					return tags || []
				},
				isArray: true
			},
			{
				key: 'developers',
				title: '开发商筛选',
				fieldAccessor: (game: any) => {
					const developers = getFieldValue<string[]>((game as any).developers)
					return developers || []
				},
				isArray: true
			},
			{
				key: 'publishers',
				title: '发行商筛选',
				fieldAccessor: (game: any) => {
					const publisher = getFieldValue<string>((game as any).publisher)
					return publisher || ''
				},
				isArray: false
			},
			{
				key: 'engines',
				title: '引擎筛选',
				fieldAccessor: (game: any) => {
					const engine = getFieldValue<string>((game as any).engine)
					return engine || ''
				},
				isArray: false
			},
			{
				key: 'others',
				title: '其他筛选',
				fieldAccessor: (game: any) => {
					// 这个字段访问器不会被使用，因为使用了 extractFn
					return null
				},
				isArray: false,
				// 自定义提取函数：提取"正在游玩"（"丢失的资源"已由基类提供）
				extractFn: (games: any[], additionalData?: any): FilterItem[] => {
					const items: FilterItem[] = []
					let runningGamesCount = 0

					games.forEach((game: any) => {
						// 统计正在游玩的游戏
						if (additionalData?.isGameRunning && additionalData.isGameRunning(game)) {
							runningGamesCount++
						}
					})

					// "正在游玩"始终显示，即使数量为0
					items.push({
						name: '正在游玩',
						count: runningGamesCount
					})

					return items
				},
				// 自定义匹配函数：处理"正在游玩"（"丢失的资源"已由基类处理）
				matchFn: (game: any, selected: string[], excluded: string[], additionalData?: any): boolean => {
					// 检查排除条件
					if (excluded.length > 0) {
						if (excluded.includes('正在游玩') && additionalData?.isGameRunning && additionalData.isGameRunning(game)) {
							return false
						}
					}

					// 检查选中条件
					if (selected.length > 0) {
						const isRunning = additionalData?.isGameRunning ? additionalData.isGameRunning(game) : false
						
						return selected.some(sel => {
							if (sel === '正在游玩') {
								return isRunning
							}
							return false
						})
					}

					return true
				}
			}
		] as FilterConfig<T>[]
		
		// 合并基类配置和游戏特有配置
		return [...baseFilters, ...gameFilters]
	}
}
