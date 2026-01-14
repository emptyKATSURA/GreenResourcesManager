import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectEngine, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'


/**
 * 游戏类
 */
export class Game extends BaseResources {
	
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('游戏名', true)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('游戏简介', false)
	})
	
	developers: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('开发商', false)
	})
	
	publisher: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('发行商', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('标签', false)
	})
	
	engine: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectEngine('选择游戏引擎', false)
	})

	
	coverPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectGameCover('游戏封面', false)
	})

	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('游戏路径', [
			{ name: '可执行文件', extensions: ['exe', 'bat', 'ps1'] },
		], true)
	})
}


