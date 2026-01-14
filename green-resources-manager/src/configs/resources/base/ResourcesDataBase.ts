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
	
	fileExists: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true
	})
	
	addedDate: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	rating: ResourceField<number> = new ResourceField<number>({
		saveable: true
	})
	
	comment: ResourceField<string> = new ResourceField<string>({
		saveable: true
	})
	
	isFavorite: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true
	})
	
	isArchive: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true
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
	 * 从资源实例中提取可保存的数据
	 * @param instance - 资源类实例（Game、Novel、Audio 等）
	 * @returns 只包含可保存字段的普通对象
	 */
	static getSaveableData(instance: BaseResources): any {
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
		
		return instance
	}
}
  