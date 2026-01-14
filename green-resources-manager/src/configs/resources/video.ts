import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField_SelectVideoThumbnail,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 视频类
 */
export class Video extends BaseResources {
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('视频名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('视频描述', false)
	})
	
	series: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('系列名', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('视频标签', false)
	})
	
	actors: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('演员', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('视频文件', [
			{ name: '视频文件', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'] },
			{ name: '所有文件', extensions: ['*'] }
		], true)
	})
	
	thumbnail: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectVideoThumbnail('缩略图', false)
	})

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加视频',
		editTitle: '编辑视频',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'play', icon: '▶️', label: '播放视频' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'remove', icon: '🗑️', label: '删除视频' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🎬',
		title: '你的视频库是空的',
		description: '点击"添加视频"或"添加文件夹"按钮来添加内容，或直接拖拽视频文件/文件夹到此处（支持多选）',
		buttonText: '添加第一个视频',
		buttonAction: 'showAddVideoDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加视频',
		addFolderButtonText: '添加文件夹',
		searchPlaceholder: '搜索视频...',
		sortOptions: [
			{ value: 'name', label: '按名称排序' },
			{ value: 'lastWatched', label: '按最后观看时间' },
			{ value: 'watchCount', label: '按观看次数' },
			{ value: 'added', label: '按添加时间' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'play',
		icon: '▶️',
		label: '播放视频',
		handlerName: 'playVideo' // 组件中对应的方法名
	}
}
