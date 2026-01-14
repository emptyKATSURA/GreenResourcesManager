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

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加软件',
		editTitle: '编辑软件',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'launch', icon: '▶️', label: '启动软件' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'remove', icon: '🗑️', label: '删除软件' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🎮',
		title: '你的软件库是空的',
		description: '点击"添加软件"按钮来添加你的第一个软件，或直接拖拽软件文件（.exe、.swf、.bat）或压缩包（.zip、.rar、.7z 等）到此处',
		buttonText: '添加第一个软件',
		buttonAction: 'showAddGameDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加软件',
		searchPlaceholder: '搜索软件...',
		sortOptions: [
			{ value: 'name', label: '按名称排序' },
			{ value: 'lastPlayed', label: '按最后运行时间' },
			{ value: 'playTime', label: '按运行时长' },
			{ value: 'added', label: '按添加时间' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'launch',
		icon: '▶️',
		label: '启动软件',
		handlerName: 'launchSoftware' // 组件中对应的方法名
	}
}
