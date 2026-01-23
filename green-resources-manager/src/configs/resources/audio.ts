import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectFile, 
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'

/**
 * 音频类
 */
export class Audio extends BaseResources {

	resourceType: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		defaultValue: 'audio'
	})
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('音频名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('备注', false)
	})
	
	artist: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('艺术家', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('标签', false)
	})
	
	actors: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('演员', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('音频文件', [
			{ name: '音频文件', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
			{ name: '所有文件', extensions: ['*'] }
		], true)
	})
	
	thumbnailPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('缩略图', [
			{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
			{ name: '所有文件', extensions: ['*'] }
		], false)
	})

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加音频',
		editTitle: '编辑音频',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'play', icon: '▶️', label: '播放' },
		{ key: 'addToPlaylist', icon: '➕', label: '添加到播放列表' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'delete', icon: '🗑️', label: '删除音频' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🎵',
		title: '你的音频库是空的',
		description: '点击"添加音频"按钮来添加你的第一个音频',
		buttonText: '添加第一个音频',
		buttonAction: 'showAddDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加音频',
		searchPlaceholder: '搜索音频...',
		sortOptions: [
			{ value: 'name', label: '按名称' },
			{ value: 'artist', label: '按艺术家' },
			{ value: 'playCount', label: '按播放次数' },
			{ value: 'addedDate', label: '按添加时间' }
		]
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'play',
		icon: '▶️',
		label: '播放',
		handlerName: 'playAudio' // 组件中对应的方法名
	}

	// 静态方法：获取显示文本配置（支持多态）
	static getDisplayTexts() {
		return {
			neverAccessed: '从未播放',
			justAccessed: '刚刚',
			accessAction: '播放',
			yesterdayAccessed: '昨天'
		}
	}

	// 静态方法：获取默认图标路径
	static getDefaultIcon() {
		return './default-audio.png'
	}

	// 静态配置：卡片显示配置
	static cardDisplayConfig = {
		title: 'name', // 标题：使用 name 字段
		subtitle: 'artist', // 副标题：艺术家字段
		extra: 'description', // 额外信息：描述字段（备注）
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
				field: 'playCount',
				label: '播放',
				formatter: 'formatPlayCount'
			},
			{
				type: 'date' as const,
				field: 'lastPlayed',
				label: '',
				formatter: 'formatLastPlayed'
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
				field: 'artist',
				label: '艺术家',
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
				label: '音频路径',
				formatter: undefined
			}
		],
		dataRecords: [
			{
				field: 'playCount',
				label: '播放次数',
				formatter: undefined,
				defaultValue: '0 次'
			},
			{
				field: 'lastPlayed',
				label: '最后播放',
				formatter: 'formatLastPlayed',
				defaultValue: '从未播放'
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
				label: '播放',
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
				key: 'delete',
				icon: '🗑️',
				label: '删除音频',
				class: 'btn-remove'
			}
		]
	}
}
