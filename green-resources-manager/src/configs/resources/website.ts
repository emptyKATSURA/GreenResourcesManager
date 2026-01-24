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

	resourceType: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		defaultValue: 'website'
	})
	
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

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'visit',
		icon: '🌐',
		label: '访问网站',
		handlerName: 'openWebsite' // 组件中对应的方法名
	}

	// 静态方法：获取显示文本配置（支持多态）
	static getDisplayTexts() {
		return {
			neverAccessed: '从未访问',
			justAccessed: '刚刚',
			accessAction: '访问',
			yesterdayAccessed: '昨天'
		}
	}

	// 静态方法：获取默认图标路径
	static getDefaultIcon() {
		return './default-image.png'
	}

	// 静态配置：卡片显示配置
	static cardDisplayConfig = {
		title: 'name', // 标题：使用 name 字段
		subtitle: 'description', // 副标题：描述字段
		tags: 'tags', // 标签字段
		maxTags: 3, // 最多显示 3 个标签
		stats: [
			{
				type: 'count' as const,
				field: 'visitCount',
				label: '访问',
				formatter: 'formatVisitCount'
			},
			{
				type: 'date' as const,
				field: 'lastVisited',
				label: '',
				formatter: 'formatLastVisited'
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
				field: 'resourcePath',
				label: '网站URL',
				formatter: undefined
			}
		],
		dataRecords: [
			{
				field: 'visitCount',
				label: '访问次数',
				formatter: undefined,
				defaultValue: '0 次'
			},
			{
				field: 'lastVisited',
				label: '最后访问',
				formatter: 'formatLastPlayed',
				defaultValue: '从未访问'
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
				key: 'visit',
				icon: '🔗',
				label: '访问网站',
				class: 'btn-play'
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
				label: '删除网站',
				class: 'btn-remove'
			}
		]
	}
}
