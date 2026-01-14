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

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加漫画',
		editTitle: '编辑漫画',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'open', icon: '📖', label: '打开漫画' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'remove', icon: '🗑️', label: '删除漫画' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🖼️',
		title: '还没有添加漫画',
		description: '点击"添加漫画"按钮选择文件夹或压缩包，或直接拖拽文件夹/压缩包到此处（支持多选，支持 .zip、.rar、.7z 等格式）',
		buttonText: '添加第一个漫画',
		buttonAction: 'showAddAlbumDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加漫画',
		searchPlaceholder: '搜索漫画...',
		sortOptions: [
			{ value: 'name', label: '按名称排序' },
			{ value: 'author', label: '按作者排序' },
			{ value: 'added', label: '按添加时间' },
			{ value: 'viewCount', label: '按查看次数' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'open',
		icon: '📖',
		label: '打开漫画',
		handlerName: 'openAlbum' // 组件中对应的方法名
	}
}
