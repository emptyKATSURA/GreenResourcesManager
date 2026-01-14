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

/**
 * 页面基类（抽象类）
 * 定义所有页面类型必须实现的基础字段
 * 参考资源类的设计模式，使用 ResourceField 来定义字段
 */
export abstract class BasePage {
	/**
	 * 获取排序选项配置
	 * 子类必须实现此方法，返回该页面支持的排序选项
	 * @template T 资源类型
	 * @returns 排序选项数组
	 */
	abstract getSortOptions<T = any>(): SortOption<T>[]
}
