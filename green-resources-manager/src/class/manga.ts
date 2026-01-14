import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectMangaCover,
	FormField_SelectFolder,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 漫画/图片专辑类
 */
export class Manga extends BaseResources {
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('漫画名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('漫画简介', false)
	})
	
	author: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('作者', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('漫画标签', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFolder('漫画文件夹路径', true)
	})
	
	coverPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectMangaCover('封面图片', false)
	})
}
