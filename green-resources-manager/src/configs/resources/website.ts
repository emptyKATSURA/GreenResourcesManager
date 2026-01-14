import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 网站类
 */
export class Website extends BaseResources {
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('网站名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('网站描述', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('网站URL', true)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('网站标签', false)
	})

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加网站',
		editTitle: '编辑网站',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'visit', icon: '🔗', label: '访问网站' },
		{ key: 'refresh-favicon', icon: '🔄', label: '刷新图标' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'delete', icon: '🗑️', label: '删除网站' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🌐',
		title: '你的网站收藏是空的',
		description: '点击"添加网站"按钮来添加你的第一个网站收藏',
		buttonText: '添加第一个网站',
		buttonAction: 'showAddDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加网站',
		importBookmarkButtonText: '从书签导入',
		searchPlaceholder: '搜索网站...',
		sortOptions: [
			{ value: 'name', label: '按名称' },
			{ value: 'visitCount', label: '按访问次数' },
			{ value: 'addedDate', label: '按添加时间' },
			{ value: 'lastVisited', label: '按最后访问' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'visit',
		icon: '🌐',
		label: '访问网站',
		handlerName: 'openWebsite' // 组件中对应的方法名
	}
}
