import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectVideoThumbnail,
	FormField as FormFieldType
} from './FormField.ts'

/**
 * 视频类
 * 用于定义视频资源的表单字段结构
 */
export class Video {
	// 文本字段
	name: FormField_Text = new FormField_Text('视频名称', false)
	series: FormField_Text = new FormField_Text('系列名', false)
	description: FormField_Textarea = new FormField_Textarea('视频描述', false)
	
	// 标签字段
	tags: FormField_Tags = new FormField_Tags('视频标签', false)
	actors: FormField_Tags = new FormField_Tags('演员', false)
	
	// 文件选择字段
	filePath: FormField_SelectFile = new FormField_SelectFile('视频文件', [
		{ name: '视频文件', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'] },
		{ name: '所有文件', extensions: ['*'] }
	], true)
	
	// 缩略图字段（使用视频缩略图选择）
	thumbnail: FormField_SelectVideoThumbnail = new FormField_SelectVideoThumbnail('缩略图', false)
}
