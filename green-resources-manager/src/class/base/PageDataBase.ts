import { ResourceField } from './ResourceField.ts'
import { 
	FormField_Text, 
	FormField_Textarea,
	FormField_Select,
	FormField_Tags,
	FormField_Checkbox,
	FormField as FormFieldType
} from './FormField.ts'

/**
 * 页面基类（抽象类）
 * 定义所有页面类型必须实现的基础字段
 * 参考资源类的设计模式，使用 ResourceField 来定义字段
 */
export abstract class BasePage {
	
	// 基础字段
	
	// 页面唯一标识符
	id: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	// 页面名称
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('页面名称', true)
	})
	
	// 页面图标
	icon: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('页面图标', false)
	})
	
	// 页面描述
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('页面描述', false)
	})
	
	// 页面接受哪些资源类型（可以多个）
	resourceTypes: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('资源类型', true)
	})
	
	// 是否默认页面
	isDefault: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true,
		editType: new FormField_Checkbox('默认页面', false)
	})
	
	// 是否隐藏
	isHidden: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true,
		editType: new FormField_Checkbox('隐藏页面', false)
	})
	
	// 显示顺序
	order: ResourceField<number> = new ResourceField<number>({
		saveable: true,
		editType: new FormField_Number('显示顺序', false)
	})
	
	// 创建时间
	createdAt: ResourceField<number> = new ResourceField<number>({
		saveable: true
	})
	
	// 更新时间
	updatedAt: ResourceField<number> = new ResourceField<number>({
		saveable: true
	})
	
	/**
	 * 生成唯一的页面ID
	 * @returns {string} 页面ID
	 */
	protected generateId(): string {
		return Date.now().toString() + Math.random().toString(36).substr(2, 9)
	}
	
	/**
	 * 构造函数
	 * 自动生成 id（如果还没有值）
	 * 注意：fromJSON 会覆盖这个值（如果 JSON 中有 id）
	 */
	constructor() {
		// 如果 id 还没有值，自动生成
		if (!this.id.value) {
			this.id.value = this.generateId()
		}
		// 设置创建时间
		if (!this.createdAt.value) {
			this.createdAt.value = Date.now()
		}
		// 设置更新时间
		this.updatedAt.value = Date.now()
	}
	
	/**
	 * 从页面实例中提取可保存的数据
	 * @param instance - 页面类实例
	 * @returns 只包含可保存字段的普通对象
	 */
	static getSaveableData(instance: BasePage): any {
		const saveableData: any = {}
		for (const key in instance) {
			const field = (instance as any)[key]
			if (field instanceof ResourceField && field.saveable) {
				saveableData[key] = field.value
			}
		}
		return saveableData
	}
	
	/**
	 * 从 JSON 对象创建页面类实例
	 * @param this - 页面类构造函数
	 * @param jsonData - 从 JSON 加载的普通对象
	 * @returns 页面类实例
	 */
	static fromJSON<T extends BasePage>(
		this: new () => T,
		jsonData: any
	): T {
		const instance = new this()
		
		// 遍历实例的所有属性，将 JSON 数据赋值给 ResourceField.value
		for (const key in instance) {
			const field = (instance as any)[key]
			if (field instanceof ResourceField) {
				// 如果 JSON 数据中有这个字段，赋值给 ResourceField.value
				if (jsonData[key] !== undefined && jsonData[key] !== null) {
					field.value = jsonData[key]
				}
			}
		}
		
		// 更新 updatedAt
		instance.updatedAt.value = Date.now()
		
		return instance
	}
	
	/**
	 * 更新页面数据
	 * @param updates - 要更新的字段
	 */
	update(updates: Partial<Record<keyof BasePage, any>>): void {
		for (const key in updates) {
			const field = (this as any)[key]
			if (field instanceof ResourceField) {
				field.value = (updates as any)[key]
			}
		}
		// 更新 updatedAt
		this.updatedAt.value = Date.now()
	}
}
