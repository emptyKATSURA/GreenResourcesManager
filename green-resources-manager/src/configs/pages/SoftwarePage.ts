import { BasePage } from './base/BasePage.ts'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'
import type { FilterConfig } from '../../types/filter'
import { Software as SoftwareClass } from '@resources/soft.ts'

// Software 类型就是 SoftwareClass 的实例类型
type Software = InstanceType<typeof SoftwareClass>

/**
 * 安全获取软件属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 */
function getFieldValue<T>(field: any): T | undefined {
	if (field && typeof field === 'object' && 'value' in field) {
		return field.value as T
	}
	return field as T
}

export class SoftwarePage extends BasePage {
	readonly id: string = 'software'
	readonly name: string = '软件'
	readonly icon: string = '💾'
	readonly description: string = '可以管理软件、应用等exe文件'

	// 接受的资源类型（可以多个）
	resourceTypes: string[] = ['Software']

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
			icon: '💾',
			title: '你的软件库是空的',
			description: '点击"添加软件"按钮来添加你的第一个软件，或直接拖拽软件文件（.exe、.swf、.bat）或压缩包（.zip、.rar、.7z 等）到此处',
			buttonText: '添加第一个软件',
			buttonAction: 'showAddGameDialog'
		}
	}
	
	/**
	 * 获取工具栏配置
	 */
	getToolbarConfig() {
		return {
			addButtonText: '添加软件',
			searchPlaceholder: '搜索软件...'
		}
	}

	/**
	 * 排序配置
	 * 每个配置项定义了一个排序选项，包含字段访问器和排序方向
	 * 用户可以根据需要自由定义排序方式
	 */
	private sortConfigs: Record<string, SortConfig<Software> & { label: string }> = {
		'name-asc': {
			label: '按名称排序',
			fieldAccessor: (software: Software) => {
				const name = getFieldValue<string>((software as any).name)
				return name || null
			},
			order: 'asc'
		},
		'name-desc': {
			label: '按名称排序（降序）',
			fieldAccessor: (software: Software) => {
				const name = getFieldValue<string>((software as any).name)
				return name || null
			},
			order: 'desc'
		},
		'lastPlayed-asc': {
			label: '按最后运行时间',
			fieldAccessor: (software: Software) => {
				const lastPlayed = getFieldValue<string>((software as any).lastPlayed) || (software as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'asc'
		},
		'lastPlayed-desc': {
			label: '按最后运行时间（降序）',
			fieldAccessor: (software: Software) => {
				const lastPlayed = getFieldValue<string>((software as any).lastPlayed) || (software as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'desc'
		},
		'playTime-asc': {
			label: '按运行时长（升序）',
			fieldAccessor: (software: Software) => {
				const playTime = getFieldValue<number>((software as any).playTime) ?? (software as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'asc'
		},
		'playTime-desc': {
			label: '按运行时长（降序）',
			fieldAccessor: (software: Software) => {
				const playTime = getFieldValue<number>((software as any).playTime) ?? (software as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'desc'
		},
		'added-asc': {
			label: '按添加时间（升序）',
			fieldAccessor: (software: Software) => {
				const addedDate = getFieldValue<string>((software as any).addedDate) || (software as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'asc'
		},
		'added-desc': {
			label: '按添加时间（降序）',
			fieldAccessor: (software: Software) => {
				const addedDate = getFieldValue<string>((software as any).addedDate) || (software as any).addedDate
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
	getSortConfig(sortValue: string): SortConfig<Software> | null {
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
	 * 定义软件页面支持的所有筛选器
	 * 合并基类的"丢失的资源"筛选和软件特有的筛选器
	 */
	getFilterConfig<T = Software>(): FilterConfig<T>[] {
		// 获取基类的筛选配置（包含"丢失的资源"）
		const baseFilters = super.getFilterConfig<T>()
		
		// 软件特有的筛选器
		const softwareFilters: FilterConfig<T>[] = [
			{
				key: 'tags',
				title: '标签筛选',
				fieldAccessor: (software: any) => {
					const tags = getFieldValue<string[]>((software as any).tags)
					return tags || []
				},
				isArray: true
			},
			{
				key: 'developers',
				title: '开发商筛选',
				fieldAccessor: (software: any) => {
					const developers = getFieldValue<string[]>((software as any).developers)
					return developers || []
				},
				isArray: true
			}
		] as FilterConfig<T>[]
		
		// 合并基类配置和软件特有配置
		return [...baseFilters, ...softwareFilters]
	}
}
