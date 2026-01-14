import { BasePage } from './base/BasePage.ts'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'
import { Game as GameClass } from '@resources/game.ts'

// Game 类型就是 GameClass 的实例类型
type Game = InstanceType<typeof GameClass>

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
	name: string = '游戏'
	icon: string = '🎮'
	description: string = '可以管理游戏、应用等exe文件'

	// 接受的资源类型（可以多个）
	resourceTypes: string[] = ['Game']

	// 页面布局配置
	displayLayoutConfig = {
		minWidth: 80,
		maxWidth: 400
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
}
