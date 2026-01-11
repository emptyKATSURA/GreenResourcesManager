import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFolder, 
	FormField_SelectVideoThumbnail,
	FormField as FormFieldType
} from './FormField.ts'

import { EditableProperties } from './EditableProperties.ts'

/**
 * 视频文件夹类
 * 用于定义视频文件夹资源的表单字段结构
 */
export class VideoFolder extends EditableProperties {
	// 文本字段
	name: FormField_Text = new FormField_Text('文件夹名称', false)
	series: FormField_Text = new FormField_Text('系列名', false)
	description: FormField_Textarea = new FormField_Textarea('文件夹描述', false)
	
	// 标签字段
	tags: FormField_Tags = new FormField_Tags('视频标签', false)
	actors: FormField_Tags = new FormField_Tags('演员', false)
	voiceActors: FormField_Tags = new FormField_Tags('声优', false)
	productionTeam: FormField_Tags = new FormField_Tags('制作组', false)
	
	// 文件夹选择字段
	folderPath: FormField_SelectFolder = new FormField_SelectFolder('文件夹路径', true)
	
	// 缩略图字段（使用视频缩略图选择）
	thumbnail: FormField_SelectVideoThumbnail = new FormField_SelectVideoThumbnail('缩略图', false)
}
