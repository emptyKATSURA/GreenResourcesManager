import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from '../abstract/EditableProperties.ts'
import { SaveableProperties } from '../abstract/SaveableProperties.ts'
import { ResourcesDataBase } from '../abstract/ResourcesDataBase.ts'


export namespace Software{

	/**
	 * 软件基本信息接口
	 */
	export class SoftwareData extends ResourcesDataBase {
		developer?: string // 开发商
		executablePath?: string // 可执行文件路径
		coverPath?: string  // 软件封面
		folderSize?: number // 文件夹大小
		playTime?: number // 游玩时长
		playCount?: number // 游玩次数
		lastPlayed?: string | null // 最后游玩时间
		firstPlayed?: string | null // 首次游玩时间
	}

	/**
	 * 软件可保存属性类
	 * 定义哪些软件属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加软件特有的字段
	 */
	export class SaveableSoftwareProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加软件特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',
				'developer',
				'tags',
				'executablePath',
				'coverPath',
				
				// 统计字段
				'folderSize',
				'fileExists',
				'addedDate',
				'rating',
				'comment',
				'isFavorite',
				'isArchive',
			]
		}
	}

	
	/**
	 * 软件可编辑属性类
	 * 定义软件资源的表单字段结构
	 */
	export class EditableSoftwareProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('软件名称', false)  // 可选，可从文件名提取
		description :FormField_Textarea = new FormField_Textarea('软件简介', false)
		developer :FormField_Text = new FormField_Text('开发商', false)

		tags :FormField_Tags = new FormField_Tags('软件标签', false)
		
		// 文件选择字段 - 支持可执行文件和压缩包
		executablePath :FormField_SelectFile = new FormField_SelectFile('软件文件', [
			{ name: '可执行文件', extensions: ['exe', 'swf', 'bat'] },
			{ name: '压缩文件', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'tar.gz', 'bz2', 'tar.bz2', 'xz', 'tar.xz'] },
		], true)  // 必填
		
		// 封面选择字段 - 使用游戏封面类型（支持截图作为封面）
		image :FormField_SelectGameCover = new FormField_SelectGameCover('软件封面', false)
	}
	
}
