import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from './base/EditableProperties.ts'
import { SaveableProperties } from './base/SaveableProperties.ts'
import { ResourcesDataBase } from './base/ResourcesDataBase.ts'


export namespace Audio{

	/**
	 * 音频基本信息接口
	 */
	export class AudioData extends ResourcesDataBase {
		artist?: string // 艺术家
		album?: string // 专辑
		genre?: string // 流派
		filePath?: string // 音频文件路径
		thumbnailPath?: string // 缩略图路径
		actors?: string[] // 演员列表
		notes?: string // 备注
		duration?: number // 时长（秒）
		playCount?: number // 播放次数
		lastPlayed?: string | null // 最后播放时间
		firstPlayed?: string | null // 首次播放时间
	}

	/**
	 * 音频可保存属性类
	 * 定义哪些音频属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加音频特有的字段
	 */
	export class SaveableAudioProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加音频特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',  // 基础字段
				'artist',
				'album',
				'genre',
				'filePath',
				'thumbnailPath',
				'actors',
				'tags',
				'notes',
				
				// 统计字段
				'duration',
				'playCount',
				'lastPlayed',
				'firstPlayed',
				'addedDate',
				'rating',
				'comment',
				'fileExists',
				'isFavorite',
			]
		}
	}

	
	/**
	 * 音频可编辑属性类
	 * 定义音频资源的表单字段结构
	 */
	export class EditableAudioProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('音频名称', false)  // 可选，可从文件名提取
		artist :FormField_Text = new FormField_Text('艺术家', false)
		notes :FormField_Textarea = new FormField_Textarea('备注', false)  // 备注字段

		// 标签字段
		tags :FormField_Tags = new FormField_Tags('标签', false)
		actors :FormField_Tags = new FormField_Tags('演员', false)  // 演员也使用标签字段类型
		
		// 文件选择字段
		filePath :FormField_SelectFile = new FormField_SelectFile('音频文件', [
			{ name: '音频文件', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
			{ name: '所有文件', extensions: ['*'] }
		], true)  // 必填
		
		thumbnailPath :FormField_SelectFile = new FormField_SelectFile('缩略图', [
			{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
			{ name: '所有文件', extensions: ['*'] }
		], false)  // 可选
	}
	
}
