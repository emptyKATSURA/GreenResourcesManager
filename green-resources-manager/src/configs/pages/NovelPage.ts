import { BasePage } from './base/BasePage.ts'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'
import { Novel as NovelClass } from '@resources/novel.ts'

// Novel 类型就是 NovelClass 的实例类型
type Novel = InstanceType<typeof NovelClass>

/**
 * 安全获取小说属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 */
function getFieldValue<T>(field: any): T | undefined {
	if (field && typeof field === 'object' && 'value' in field) {
		return field.value as T
	}
	return field as T
}

export class NovelPage extends BasePage {
	name: string = '小说'
	icon: string = '📚'
	description: string = '可以管理小说文件，支持 TXT、EPUB、PDF 等格式'

	// 接受的资源类型
	resourceTypes: string[] = ['Novel']

	// 页面布局配置
	displayLayoutConfig = {
		minWidth: 150,
		maxWidth: 400
	}

	/**
	 * 排序配置
	 */
	private sortConfigs: Record<string, SortConfig<Novel> & { label: string }> = {
		'name-asc': {
			label: '按名称排序',
			fieldAccessor: (novel: Novel) => {
				const name = getFieldValue<string>((novel as any).name)
				return name || null
			},
			order: 'asc'
		},
		'name-desc': {
			label: '按名称排序（降序）',
			fieldAccessor: (novel: Novel) => {
				const name = getFieldValue<string>((novel as any).name)
				return name || null
			},
			order: 'desc'
		},
		'author-asc': {
			label: '按作者排序',
			fieldAccessor: (novel: Novel) => {
				const author = getFieldValue<string>((novel as any).author)
				return author || null
			},
			order: 'asc'
		},
		'author-desc': {
			label: '按作者排序（降序）',
			fieldAccessor: (novel: Novel) => {
				const author = getFieldValue<string>((novel as any).author)
				return author || null
			},
			order: 'desc'
		},
		'readProgress-asc': {
			label: '按阅读进度（升序）',
			fieldAccessor: (novel: Novel) => {
				const readProgress = getFieldValue<number>((novel as any).readProgress)
				return readProgress != null ? readProgress : null
			},
			order: 'asc'
		},
		'readProgress-desc': {
			label: '按阅读进度（降序）',
			fieldAccessor: (novel: Novel) => {
				const readProgress = getFieldValue<number>((novel as any).readProgress)
				return readProgress != null ? readProgress : null
			},
			order: 'desc'
		},
		'added-asc': {
			label: '按添加时间（升序）',
			fieldAccessor: (novel: Novel) => {
				const addedDate = getFieldValue<string>((novel as any).addedDate) || (novel as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'asc'
		},
		'added-desc': {
			label: '按添加时间（降序）',
			fieldAccessor: (novel: Novel) => {
				const addedDate = getFieldValue<string>((novel as any).addedDate) || (novel as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'desc'
		},
		'lastRead-asc': {
			label: '按最后阅读（升序）',
			fieldAccessor: (novel: Novel) => {
				const lastRead = getFieldValue<string | null>((novel as any).lastRead)
				return lastRead ? new Date(lastRead).getTime() : null
			},
			order: 'asc'
		},
		'lastRead-desc': {
			label: '按最后阅读（降序）',
			fieldAccessor: (novel: Novel) => {
				const lastRead = getFieldValue<string | null>((novel as any).lastRead)
				return lastRead ? new Date(lastRead).getTime() : null
			},
			order: 'desc'
		}
	}

	/**
	 * 获取排序选项配置（用于工具栏显示）
	 */
	getSortOptions(): SortOption[] {
		return Object.entries(this.sortConfigs).map(([value, config]) => ({
			value,
			label: config.label
		}))
	}

	/**
	 * 根据排序值获取排序配置
	 */
	getSortConfig(sortValue: string): SortConfig<Novel> | null {
		const config = this.sortConfigs[sortValue]
		if (!config) {
			return null
		}
		
		return {
			fieldAccessor: config.fieldAccessor,
			order: config.order,
			compareFn: config.compareFn
		}
	}
}
