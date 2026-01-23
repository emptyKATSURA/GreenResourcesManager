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

	resourceType: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		defaultValue: 'manga'
	})
	
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

	// 图片专辑特有字段
	pagesCount: ResourceField<number> = new ResourceField<number>({
		saveable: false,
		defaultValue: 0
	})

	lastViewed: ResourceField<string | null> = new ResourceField<string | null>({
		saveable: true,
		defaultValue: null
	})

	viewCount: ResourceField<number> = new ResourceField<number>({
		saveable: true,
		defaultValue: 0
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
	// 注意：sortOptions 已移至页面配置（ImagePage.getSortOptions），这里不再包含
	static toolbarConfig = {
		addButtonText: '添加漫画',
		searchPlaceholder: '搜索漫画...'
	}

	// 静态配置：启动方式配置
	static actionConfig = {
		key: 'open',
		icon: '📖',
		label: '打开漫画',
		handlerName: 'openAlbum' // 组件中对应的方法名
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
		return './default-image.png'
	}

	// 静态配置：卡片显示配置
	static cardDisplayConfig = {
		title: 'name', // 标题：使用 name 字段
		subtitle: 'description', // 副标题：作者字段
		extra: 'author', // 额外信息：描述字段
		tags: 'tags', // 标签字段
		maxTags: 3, // 最多显示 3 个标签
		stats: [
			{
				type: 'count' as const,
				field: 'viewCount',
				label: '浏览',
				formatter: 'formatViewCount'
			},
			{
				type: 'date' as const,
				field: 'lastViewed',
				label: '',
				formatter: 'formatLastViewed'
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
				field: 'author',
				label: '作者',
				formatter: undefined
			},
			{
				field: 'resourcePath',
				label: '漫画路径',
				formatter: undefined
			}
		],
		dataRecords: [
			{
				field: 'pagesCount',
				label: '总页数',
				formatter: undefined,
				defaultValue: '0'
			},
			{
				field: 'viewCount',
				label: '浏览次数',
				formatter: undefined,
				defaultValue: '0 次'
			},
			{
				field: 'lastViewed',
				label: '最后查看',
				formatter: 'formatDate',
				defaultValue: '从未查看'
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
				key: 'open',
				icon: '📖',
				label: '开始阅读',
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
				label: '删除漫画',
				class: 'btn-remove'
			}
		]
	}
}
