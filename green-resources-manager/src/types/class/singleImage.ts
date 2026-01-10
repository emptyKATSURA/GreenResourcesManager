import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField as FormFieldType
} from './FormField.ts'

/**
 * 单图片类
 * 用于定义单图片资源的表单字段结构
 */
export class SingleImage {
	// 文本字段
	name: FormField_Text = new FormField_Text('图片名称', false)
	author: FormField_Text = new FormField_Text('作者', false)
	description: FormField_Textarea = new FormField_Textarea('图片简介', false)
	
	// 标签字段
	tags: FormField_Tags = new FormField_Tags('图片标签', false)
	
	// 图片文件选择字段（单图片模式，选择单个图片文件）
	// 扩展名可以带点号（如 '.jpg'）或不带点号（如 'jpg'），都支持
	folderPath: FormField_SelectFile = new FormField_SelectFile('图片文件', [
		{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
		{ name: '所有文件', extensions: ['*'] }
	], true)
	
	// 注意：单图片模式下不需要单独的封面字段，因为图片本身就是封面
}
