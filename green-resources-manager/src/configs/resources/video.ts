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

	resourceType: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		defaultValue: 'movie'
	})
	
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

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'play',
		icon: '▶️',
		label: '播放视频',
		handlerName: 'playVideo' // 组件中对应的方法名
	}

	// 静态方法：获取显示文本配置（支持多态）
	static getDisplayTexts() {
		return {
			neverAccessed: '从未观看',
			justAccessed: '刚刚',
			accessAction: '观看',
			yesterdayAccessed: '昨天'
		}
	}

	// 静态方法：获取默认图标路径
	static getDefaultIcon() {
		return './default-video.png'
	}

	// 静态配置：卡片显示配置
	static cardDisplayConfig = {
		title: 'name', // 标题：使用 name 字段
		subtitle: 'series', // 副标题：系列名字段
		extra: 'description', // 额外信息：描述字段
		tags: 'tags', // 标签字段
		maxTags: 3, // 最多显示 3 个标签
		specialItems: [
			{
				field: 'actors',
				label: '演员:',
				isArray: true,
				maxArrayItems: 2,
				arrayJoin: ', '
			}
		],
		stats: [
			{
				type: 'count' as const,
				field: 'watchCount',
				label: '观看',
				formatter: 'formatWatchCount'
			},
			{
				type: 'date' as const,
				field: 'lastWatched',
				label: '',
				formatter: 'formatLastWatched'
			}
		]
	}

	// 静态配置：详情页显示配置
	static detailPanelConfig = {
		title: {
			field: 'name',
			formatter: undefined
		},
		objectiveInfo: [
			{
				field: 'series',
				label: '系列名',
				formatter: undefined
			},
			{
				field: 'actors',
				label: '演员',
				formatter: undefined,
				arrayJoin: '、'
			},
			{
				field: 'resourcePath',
				label: '视频路径',
				formatter: undefined
			}
		],
		dataRecords: [
			{
				field: 'watchCount',
				label: '观看次数',
				formatter: undefined,
				defaultValue: '0 次'
			},
			{
				field: 'lastWatched',
				label: '最后观看',
				formatter: 'formatLastPlayed',
				defaultValue: '从未观看'
			},
			{
				field: 'addedDate',
				label: '添加时间',
				formatter: 'formatDate',
				defaultValue: '未知'
			}
		],
		actions: [
			{
				key: 'play',
				icon: '▶️',
				label: '播放视频',
				class: 'btn-play'
			},
			{
				key: 'folder',
				icon: '📁',
				label: '打开文件夹',
				class: 'btn-open-folder'
			},
			{
				key: 'edit',
				icon: '✏️',
				label: '编辑信息',
				class: 'btn-edit'
			},
			{
				key: 'remove',
				icon: '🗑️',
				label: '删除视频',
				class: 'btn-remove'
			}
		]
	}
}
