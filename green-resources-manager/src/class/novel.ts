import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_Number,
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 小说类
 */
export class Novel extends BaseResources {
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('小说名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('小说简介', false)
	})
	
	author: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('作者', false)
	})
	
	genre: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('类型', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('小说标签', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('小说文件', [
			{ name: '小说文件', extensions: ['txt', 'epub', 'mobi', 'pdf'] },
		], true)
	})
	
	coverPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectGameCover('封面图片', false)
	})
	
	publishYear: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('出版年份', false)
	})
}
