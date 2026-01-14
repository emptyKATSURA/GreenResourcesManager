import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 软件类
 */
export class Software extends BaseResources {
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('软件名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('软件简介', false)
	})
	
	developer: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('开发商', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('软件标签', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('软件文件', [
			{ name: '可执行文件', extensions: ['exe', 'swf', 'bat'] },
			{ name: '压缩文件', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'tar.gz', 'bz2', 'tar.bz2', 'xz', 'tar.xz'] },
		], true)
	})
	
	coverPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectGameCover('软件封面', false)
	})
}
