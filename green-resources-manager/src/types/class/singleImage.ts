import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from '../abstract/EditableProperties.ts'
import { SaveableProperties } from '../abstract/SaveableProperties.ts'
import { ResourcesDataBase } from '../abstract/ResourcesDataBase.ts'


export namespace SingleImage{

	/**
	 * 单图片基本信息接口
	 */
	export class SingleImageData extends ResourcesDataBase {
		author?: string // 作者
		folderPath?: string // 图片文件路径（单图片模式下，这是图片文件本身的路径）
		cover?: string // 封面（单图片模式下，封面就是图片本身，但可能用于存储缩略图路径）
		viewCount?: number // 查看次数
		pagesCount?: number // 页数（单图片模式下始终为 1）
	}

	/**
	 * 单图片可保存属性类
	 * 定义哪些单图片属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加单图片特有的字段
	 */
	export class SaveableSingleImageProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加单图片特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',
				'author',
				'tags',
				'folderPath',
				'cover',
				
				// 统计字段
				'viewCount',
				'pagesCount',
				'addedDate',
				'rating',
				'comment',
				'fileExists',
			]
		}
	}

	
	/**
	 * 单图片可编辑属性类
	 * 定义单图片资源的表单字段结构
	 */
	export class EditableSingleImageProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('图片名称', false)  // 可选，可从文件名提取
		author :FormField_Text = new FormField_Text('作者', false)
		description :FormField_Textarea = new FormField_Textarea('图片简介', false)

		tags :FormField_Tags = new FormField_Tags('图片标签', false)
		
		// 图片文件选择字段（单图片模式，选择单个图片文件）
		// 注意：字段名是 folderPath，但实际上是文件路径（为了与漫画相统一）
		folderPath :FormField_SelectFile = new FormField_SelectFile('图片文件', [
			{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
			{ name: '所有文件', extensions: ['*'] }
		], true)  // 必填
		
		// 注意：单图片模式下不需要单独的封面字段，因为图片本身就是封面
	}
	
}
