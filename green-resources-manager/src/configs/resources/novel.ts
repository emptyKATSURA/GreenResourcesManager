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

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加小说',
		editTitle: '编辑小说',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'read', icon: '📖', label: '开始阅读' },
		{ key: 'read-v2', icon: '📚', label: 'EPUB阅读器V2' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'remove', icon: '🗑️', label: '删除小说' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '📚',
		title: '你的小说库是空的',
		description: '点击"添加小说"按钮来添加你的第一本小说',
		buttonText: '添加第一本小说',
		buttonAction: 'showAddNovelDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加小说',
		searchPlaceholder: '搜索小说...',
		sortOptions: [
			{ value: 'name', label: '按名称排序' },
			{ value: 'author', label: '按作者排序' },
			{ value: 'readProgress', label: '按阅读进度' },
			{ value: 'added', label: '按添加时间' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'read',
		icon: '📖',
		label: '开始阅读',
		handlerName: 'openNovelReader' // 组件中对应的方法名
	}
}
