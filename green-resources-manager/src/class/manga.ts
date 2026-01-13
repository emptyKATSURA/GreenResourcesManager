import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectMangaCover,
	FormField as FormFieldType,
	FormField_SelectFolder
} from './FormField.ts'

/**
 * 漫画/图片专辑类
 * 用于定义漫画资源的表单字段结构
 */
export class Manga {
	// 文本字段
	name: FormField_Text = new FormField_Text('漫画名称', false)
	author: FormField_Text = new FormField_Text('作者', false)
	description: FormField_Textarea = new FormField_Textarea('漫画简介', false)
	
	// 标签字段
	tags: FormField_Tags = new FormField_Tags('漫画标签', false)
	
	folderPath: FormField_SelectFolder = new FormField_SelectFolder('漫画文件夹路径', true)
	
	// 封面选择字段
	cover: FormField_SelectMangaCover = new FormField_SelectMangaCover('封面图片', false)
}
