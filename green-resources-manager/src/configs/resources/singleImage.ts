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
 * 单图片类
 */
export class SingleImage extends BaseResources {

	resourceType: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		defaultValue: 'single-image'
	})
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('图片名称', false)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('图片简介', false)
	})
	
	author: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('作者', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('图片标签', false)
	})
	
	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('图片文件', [
			{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
			{ name: '所有文件', extensions: ['*'] }
		], true)
	})

	// 静态配置：编辑对话框配置
	static editDialogConfig = {
		addTitle: '添加图片',
		editTitle: '编辑图片',
	}

	// 静态配置：右键菜单项
	static contextMenuItems = [
		{ key: 'detail', icon: '👁️', label: '查看详情' },
		{ key: 'open', icon: '🖼️', label: '打开图片' },
		{ key: 'folder', icon: '📁', label: '打开文件夹' },
		{ key: 'edit', icon: '✏️', label: '编辑信息' },
		{ key: 'remove', icon: '🗑️', label: '删除图片' }
	]

	// 静态配置：空状态配置
	static emptyStateConfig = {
		icon: '🖼️',
		title: '还没有添加图片',
		description: '点击"添加图片"按钮选择图片文件，或直接拖拽图片文件到此处（支持多选，支持 .jpg、.jpeg、.png、.gif、.bmp、.webp、.svg 等格式）',
		buttonText: '添加第一个图片',
		buttonAction: 'showAddAlbumDialog'
	}

	// 静态配置：工具栏配置
	static toolbarConfig = {
		addButtonText: '添加图片',
		searchPlaceholder: '搜索图片...',
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
		icon: '🖼️',
		label: '打开图片',
		handlerName: 'openImage' // 组件中对应的方法名
	}

	// 静态方法：获取显示文本配置（支持多态）
	static getDisplayTexts() {
		return {
			neverAccessed: '从未查看',
			justAccessed: '刚刚',
			accessAction: '查看',
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
		subtitle: 'author', // 副标题：作者字段
		extra: 'description', // 额外信息：描述字段
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
}
