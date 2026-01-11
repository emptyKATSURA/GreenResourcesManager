import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectEngine, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from '../abstract/EditableProperties.ts'
import { SaveableProperties } from '../abstract/SaveableProperties.ts'
import { ResourcesDataBase } from '../abstract/ResourcesDataBase.ts'


export namespace Game{

	/**
	 * 游戏基本信息接口
	 */
	export class GameData extends ResourcesDataBase {
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
	 * 游戏可保存属性类
	 * 定义哪些游戏属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加游戏特有的字段
	 * 
	 * 使用示例：
	 * ```typescript
	 * // 获取需要保存的字段列表（包含基类的 id, name）
	 * const fields = Game.SaveableGameProperties.getSaveableFields()
	 * 
	 * // 从完整游戏数据中提取只包含可保存字段的对象
	 * const saveableData = Game.SaveableGameProperties.extractSaveableData(gameData)
	 * 
	 * // 批量处理游戏数组
	 * const saveableGames = games.map(game => 
	 *   Game.SaveableGameProperties.extractSaveableData(game)
	 * )
	 * ```
	 */
	export class SaveableGameProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加游戏特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',
				'developer',
				'publisher',
				'tags',
				'engine',
				'executablePath',
				'coverPath',
				
				// 统计字段
				'folderSize',
				'playTime',
				'playCount',
				'lastPlayed',
				'firstPlayed',
				'addedDate',
				'fileExists',
			]
		}
	}

	
	/**
	 * 游戏可编辑属性类
	 * 定义游戏资源的表单字段结构
	 */
	export class EditableGameProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('游戏名', true)
		description :FormField_Textarea = new FormField_Textarea('游戏简介', false)
		developer :FormField_Text = new FormField_Text('开发商', false)
		publisher :FormField_Text = new FormField_Text('发行商', false)

		tags :FormField_Tags = new FormField_Tags('标签', false)
		
		// 选择字段 - 游戏引擎选项已配置在 FormField_SelectEngine 类中
		engine :FormField_SelectEngine = new FormField_SelectEngine('选择游戏引擎', false)
		
		// 文件选择字段 - 可以配置过滤器数组
		// 扩展名可以带点号（如 '.exe'）或不带点号（如 'exe'），都支持
		// 使用 '其他' 或 '*' 作为通配符，允许所有文件类型
		executablePath :FormField_SelectFile = new FormField_SelectFile('游戏路径', [
			{ name: '可执行文件', extensions: ['exe', 'bat', 'ps1'] },
		], true)
		coverPath :FormField_SelectGameCover = new FormField_SelectGameCover('游戏封面', false)
	}
	
}

