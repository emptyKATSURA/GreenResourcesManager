import { ResourceField } from '../../resources/base/ResourceField.ts'
import { 
	FormField_Text, 
	FormField_Textarea,
	FormField_Select,
	FormField_Tags,
	FormField_Checkbox,
	FormField as FormFieldType
} from '../../resources/base/FormField.ts'
import type { SortOption } from '../../../types/sort'
import type { FilterConfig, FilterItem } from '../../../types/filter'

/**
 * 安全获取资源属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 */
function getFieldValue<T>(field: any): T | undefined {
	if (field && typeof field === 'object' && 'value' in field) {
		return field.value as T
	}
	return field as T
}

/**
 * 空状态配置接口
 */
export interface EmptyStateConfig {
	icon: string
	title: string
	description: string
	buttonText: string
	buttonAction: string
}

/**
 * 工具栏配置接口
 */
export interface ToolbarConfig {
	addButtonText: string
	searchPlaceholder: string
}

/**
 * 页面基类（抽象类）
 * 定义所有页面类型必须实现的基础字段
 * 参考资源类的设计模式，使用 ResourceField 来定义字段
 */
export abstract class BasePage {
	/**
	 * 页面唯一标识（用于路由和数据存储）
	 * 子类必须定义此属性
	 * 例如：'games', 'software', 'images' 等
	 */
	abstract readonly id: string
	
	/**
	 * 页面显示名称
	 * 子类必须定义此属性
	 * 例如：'游戏', '软件', '图片' 等
	 */
	abstract readonly name: string
	
	/**
	 * 页面图标（emoji 或图标类名）
	 * 子类必须定义此属性
	 * 例如：'🎮', '💾', '🖼️' 等
	 */
	abstract readonly icon: string
	
	/**
	 * 页面描述信息（可选）
	 * 子类可以定义此属性
	 */
	readonly description?: string
	
	/**
	 * 接受的资源类型（可以多个）
	 * 子类应该定义此属性
	 * 例如：['Game'], ['Image', 'Manga'], ['Software'] 等
	 * 注意：resourceTypes[0] 会被用作页面的主资源类型
	 */
	resourceTypes?: string[]
	
	/**
	 * 获取排序选项配置
	 * 子类必须实现此方法，返回该页面支持的排序选项
	 * @returns 排序选项数组
	 */
	abstract getSortOptions(): SortOption[]
	
	/**
	 * 获取空状态配置
	 * 子类必须实现此方法，返回该页面的空状态配置
	 * @returns 空状态配置对象
	 */
	abstract getEmptyStateConfig(): EmptyStateConfig
	
	/**
	 * 获取工具栏配置
	 * 子类必须实现此方法，返回该页面的工具栏配置
	 * @returns 工具栏配置对象
	 */
	abstract getToolbarConfig(): ToolbarConfig
	
	/**
	 * 获取筛选配置
	 * 子类可以重写此方法，返回该页面支持的筛选器配置
	 * 默认返回包含"丢失的资源"筛选的配置
	 * 子类重写时应该调用 super.getFilterConfig() 并合并自己的配置，或者手动包含"丢失的资源"筛选
	 * @template T 资源类型
	 * @returns 筛选配置数组
	 */
	getFilterConfig<T = any>(): FilterConfig<T>[] {
		return [
			{
				key: 'missing-resources',
				title: '丢失的资源',
				fieldAccessor: (item: any) => {
					// 这个字段访问器不会被使用，因为使用了 extractFn
					return null
				},
				isArray: false,
				// 自定义提取函数：提取"丢失的资源"
				// 注意：即使数量为0也返回，确保筛选器始终显示
				extractFn: (items: any[]): FilterItem[] => {
					const result: FilterItem[] = []
					let missingResourcesCount = 0

					items.forEach((item: any) => {
						// 统计丢失的资源
						const fileExists = getFieldValue<boolean>(item.fileExists)
						if (fileExists === false) {
							missingResourcesCount++
						}
					})

					// 始终返回，即使数量为0，确保筛选器可以显示
					result.push({
						name: '丢失的资源',
						count: missingResourcesCount
					})

					return result
				},
				// 自定义匹配函数：处理"丢失的资源"
				matchFn: (item: any, selected: string[], excluded: string[]): boolean => {
					// 检查排除条件
					if (excluded.length > 0) {
						const fileExists = getFieldValue<boolean>(item.fileExists)
						if (excluded.includes('丢失的资源') && fileExists === false) {
							return false
						}
					}

					// 检查选中条件
					if (selected.length > 0) {
						const fileExists = getFieldValue<boolean>(item.fileExists)
						
						return selected.some(sel => {
							if (sel === '丢失的资源') {
								return fileExists === false
							}
							return false
						})
					}

					return true
				}
			}
		] as FilterConfig<T>[]
	}
}
