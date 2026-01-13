import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectEngine, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType,
	FormField
} from './FormField.ts'
import { ResourcesDataBase } from './base/ResourcesDataBase.ts'

/**
 * 资源字段类（泛型）
 * 用于定义资源属性的值、可保存性和编辑类型
 * 这个类统一管理字段的值、是否可保存以及编辑表单类型
 * 
 * @template T - 字段值的类型，例如 string、number、string[] 等
 * 
 * 使用示例：
 * ```typescript
 * // 字符串类型字段
 * const nameField = new ResourceField<string>({
 *   value: '',
 *   saveable: true,
 *   editType: new FormField_Text('名称', true)
 * })
 * 
 * // 数组类型字段
 * const tagsField = new ResourceField<string[]>({
 *   value: [],
 *   saveable: true,
 *   editType: new FormField_Tags('标签', false)
 * })
 * ```
 */
export class ResourceField<T = any> {
	
	value: T  // 字段的值
	defaultValue?: T // 字段的默认值
	saveable: boolean // 是否可保存到文件
	editType: FormField // 编辑类型（表单字段）

	/**
	 * 构造函数
	 * @param params - 参数对象
	 * @param params.value - 字段的值（类型为 T）
	 * @param params.defaultValue - 字段的默认值（可选，类型为 T）
	 * @param params.saveable - 是否可保存到文件
	 * @param params.editType - 编辑类型（表单字段）
	 */
	constructor(params: {defaultValue?: T; saveable: boolean; editType: FormField }) {
		this.defaultValue = params.defaultValue
		this.saveable = params.saveable ?? true
		this.editType = params.editType
	}
}

/**
 * 游戏类
 * 用于定义表单字段结构（供 ResourcesEditDialog 使用）
 * 字段直接使用 FormField 类型，简洁明了
 * 
 * 使用示例：
 * ```typescript
 * // 作为表单类使用（用于 ResourcesEditDialog）
 * const gameForm = new Game()
 * 
 * // 获取需要保存的字段列表
 * const fields = Game.getSaveableFields()
 * 
 * // 从完整游戏数据中提取只包含可保存字段的对象
 * const saveableData = Game.extractSaveableData(gameData)
 * ```
 */
export class Game {
	// 基础字段 - 使用泛型约束类型，提供类型安全
	name: ResourceField<string> = new ResourceField<string>({
		defaultValue: '',
		saveable: true,
		editType: new FormField_Text('游戏名', true)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_Textarea('游戏简介', false)
	})
	
	developer: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_Text('开发商', false)
	})
	
	publisher: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_Text('发行商', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		value: [],
		saveable: true,
		editType: new FormField_Tags('标签', false)
	})
	
	engine: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_SelectEngine('选择游戏引擎', false)
	})
	
	executablePath: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_SelectFile('游戏路径', [
			{ name: '可执行文件', extensions: ['exe', 'bat', 'ps1'] },
		], true)
	})
	
	coverPath: ResourceField<string> = new ResourceField<string>({
		value: '',
		saveable: true,
		editType: new FormField_SelectGameCover('游戏封面', false)
	})

	/**
	 * 获取需要保存的字段列表
	 * 包含基础字段（id, name等）和游戏特有字段
	 * @returns 字段名数组
	 */
	static getSaveableFields(): string[] {
		// 基础字段（所有资源类型都有的字段）
		const baseFields = [
			'id',   // 资源唯一标识符
			'name', // 资源名称
			'rating',// 评分
			'comment',// 评论
			'isFavorite',// 是否收藏
			'isArchive',// 是否为压缩包
			'addedDate',// 添加日期
			'fileExists',// 是否存在
		]
		
		// 从 Game 类实例中提取可保存字段
		const gameInstance = new Game()
		const saveableFields: string[] = []
		
		for (const key in gameInstance) {
			const field = (gameInstance as any)[key]
			if (field instanceof ResourceField && field.saveable) {
				saveableFields.push(key)
			}
		}
		
		return [
			...baseFields,
			...saveableFields,
			// 统计字段（这些字段不在 Game 类中，但需要保存）
			'folderSize',
			'playTime',
			'playCount',
			'lastPlayed',
			'firstPlayed',
		]
	}

	/**
	 * 从数据对象中提取需要保存的属性
	 * @param data 完整的数据对象
	 * @returns 只包含可保存字段的对象
	 */
	static extractSaveableData<T extends Record<string, any>>(data: T): Partial<T> {
		const fields = Game.getSaveableFields()
		if (fields.length === 0) {
			// 如果没有定义字段，返回所有数据（向后兼容）
			return data
		}
		
		const result: Partial<T> = {}
		for (const field of fields) {
			if (field in data) {
				result[field as keyof T] = data[field]
			}
		}
		return result
	}
}

/**
 * 为了保持向后兼容，提供命名空间导出
 * 这样现有代码中的 Game.EditableGameProperties、Game.SaveableGameProperties 和 Game.GameData 仍然可以工作
 */
export namespace Game {
	/**
	 * 游戏数据接口
	 * 用于类型定义，保持与现有代码的兼容性
	 */
	export interface GameData extends ResourcesDataBase {
		developer?: string
		publisher?: string
		engine?: string
		executablePath?: string
		coverPath?: string
		folderSize?: number
		playTime?: number
		playCount?: number
		lastPlayed?: string | null
		firstPlayed?: string | null

		[key: string]: any
	}
	
	/**
	 * 可编辑属性类（指向 Game 类）
	 * 用于 ResourcesEditDialog 等组件
	 * 注意：这是一个值导出，可以直接作为构造函数使用
	 */
	export const EditableGameProperties: typeof Game = Game
	
	/**
	 * 可保存属性类（静态方法集合）
	 * 提供保存相关的静态方法
	 */
	export class SaveableGameProperties {
		static getSaveableFields(): string[] {
			return Game.getSaveableFields()
		}
		
		static extractSaveableData<T extends Record<string, any>>(data: T): Partial<T> {
			return Game.extractSaveableData(data)
		}
	}
}

