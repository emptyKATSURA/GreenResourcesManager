import { ResourceField } from './ResourceField.ts'
import { FormField_Text } from './FormField.ts'

/**
 * 资源基类（抽象类）
 * 定义所有资源类型必须实现的基础字段
 * 子类必须实现或重写这些抽象属性
 */
export abstract class BaseResources {
	
	//内部字段

	// 资源唯一标识符
	id: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	/**
	 * 是否存在文件
	 */
	fileExists: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: false
	})
	
	/**
	 * 添加日期
	 */
	addedDate: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	/**
	 * 评分
	 */
	rating: ResourceField<number> = new ResourceField<number>({
		saveable: true
	})
	
	/**
	 * 评论
	 */
	comment: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	/**
	 * 是否为收藏
	 */
	isFavorite: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true
	})
	

	/**
	 * 是否为压缩包文件
	 */
	isArchive: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: false
	})
	
	

    //子类必须实现的字段
	abstract tags: ResourceField<string[]> // 资源标签
	abstract name: ResourceField<string> // 资源名称
	abstract description: ResourceField<string> // 资源描述
	abstract resourcePath: ResourceField<string> // 资源路径

	/**
	 * 生成唯一的资源ID
	 * @returns {string} 资源ID
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
	}

	/**
	 * 从任意值中提取原始值
	 * 如果值是 ResourceField 对象，递归提取其 value
	 * 如果值是包含 value 属性的对象，递归提取其 value
	 * 否则直接返回原值（原始类型或数组）
	 * @param value - 要提取的值
	 * @returns 原始值
	 */
	static extractPrimitiveValue(value: any): any {
		// 如果是 ResourceField 对象，递归提取
		if (value instanceof ResourceField) {
			return this.extractPrimitiveValue(value.value)
		}
		// 如果是普通对象且包含 value 属性，递归提取
		if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
			return this.extractPrimitiveValue(value.value)
		}
		// 否则直接返回（原始类型或数组）
		return value
	}

	/**
	 * 从资源实例中提取可保存的数据
	 * @param instance - 资源类实例（Game、Novel、Audio 等）
	 * @returns 只包含可保存字段的普通对象
	 */
	static getSaveableData(instance: BaseResources): any {
		const saveableData: any = {}
		for (const key in instance) {
			const field = (instance as any)[key]
			if (field instanceof ResourceField && field.saveable) {
				// 使用 extractPrimitiveValue 确保保存的是原始值
				saveableData[key] = this.extractPrimitiveValue(field.value)
			}
		}
		return saveableData
	}

	/**
	 * 从 JSON 对象创建资源类实例
	 * @param this - 资源类构造函数（Game、Novel、Audio 等）
	 * @param jsonData - 从 JSON 加载的普通对象
	 * @returns 资源类实例
	 */
	static fromJSON<T extends BaseResources>(
		this: new () => T,
		jsonData: any
	): T {
		const instance = new this()
		
		console.log('[BaseResources.fromJSON] 开始解析:', {
			jsonData,
			jsonDataKeys: Object.keys(jsonData || {})
		})
		
		// 遍历实例的所有属性，将 JSON 数据赋值给 ResourceField.value
		for (const key in instance) {
			const field = (instance as any)[key]
			if (field instanceof ResourceField) {
				// 如果 JSON 数据中有这个字段，赋值给 ResourceField.value
				if (jsonData[key] !== undefined && jsonData[key] !== null) {
					// 使用 extractPrimitiveValue 确保提取的是原始值
					const value = this.extractPrimitiveValue(jsonData[key])
					
					console.log('[BaseResources.fromJSON] 处理字段:', {
						key,
						originalValue: jsonData[key],
						extractedValue: value,
						valueType: typeof value,
						isObject: typeof value === 'object' && value !== null,
						isArray: Array.isArray(value)
					})
					
					field.value = value
					
					console.log('[BaseResources.fromJSON] 赋值完成:', {
						key,
						finalValue: field.value,
						finalValueType: typeof field.value
					})
				}
			}
		}
		
		return instance
	}
}
  