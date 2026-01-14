import { BasePage } from './base/PageDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'
import { 
	FormField_Text, 
	FormField_Textarea,
	FormField_Select,
	FormField_Tags,
	FormField_Checkbox,
	FormField_Number
} from './base/FormField.ts'

/**
 * 页面配置类
 * 用于定义页面的各种配置选项
 * 可以配置页面接受哪些资源类型，以及页面的各种行为选项
 */
export class Page extends BasePage {
	
	// 页面配置选项
	
	// 工具栏配置：添加按钮文本
	addButtonText: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('添加按钮文本', false)
	})
	
	// 工具栏配置：搜索占位符
	searchPlaceholder: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('搜索占位符', false)
	})
	
	// 空状态配置：图标
	emptyStateIcon: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('空状态图标', false)
	})
	
	// 空状态配置：标题
	emptyStateTitle: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('空状态标题', false)
	})
	
	// 空状态配置：描述
	emptyStateDescription: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('空状态描述', false)
	})
	
	// 空状态配置：按钮文本
	emptyStateButtonText: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('空状态按钮文本', false)
	})
	
	// 分页配置：默认每页数量
	defaultPageSize: ResourceField<number> = new ResourceField<number>({
		saveable: true,
		editType: new FormField_Number('默认每页数量', false)
	})
	
	// 排序配置：默认排序方式
	defaultSortBy: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('默认排序方式', false)
	})
	
	// 显示布局配置：最小宽度
	minWidth: ResourceField<number> = new ResourceField<number>({
		saveable: true,
		editType: new FormField_Number('最小宽度', false)
	})
	
	// 显示布局配置：最大宽度
	maxWidth: ResourceField<number> = new ResourceField<number>({
		saveable: true,
		editType: new FormField_Number('最大宽度', false)
	})
	
	// 筛选器配置：支持的筛选字段（如 tags, developers, publishers 等）
	filterFields: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('筛选字段', false)
	})
	
	// 右键菜单配置：是否启用默认菜单
	enableDefaultContextMenu: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true,
		editType: new FormField_Checkbox('启用默认右键菜单', false)
	})
	
	// 拖拽配置：是否启用拖拽添加
	enableDragAndDrop: ResourceField<boolean> = new ResourceField<boolean>({
		saveable: true,
		editType: new FormField_Checkbox('启用拖拽添加', false)
	})
	
	// 拖拽配置：接受的文件扩展名
	acceptedExtensions: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('接受的文件扩展名', false)
	})
	
	/**
	 * 构造函数
	 * 设置默认值
	 */
	constructor() {
		super()
		
		// 设置默认值
		if (!this.addButtonText.value) {
			this.addButtonText.value = '添加'
		}
		if (!this.searchPlaceholder.value) {
			this.searchPlaceholder.value = '搜索...'
		}
		if (!this.defaultPageSize.value) {
			this.defaultPageSize.value = 20
		}
		if (!this.defaultSortBy.value) {
			this.defaultSortBy.value = 'name-asc'
		}
		if (!this.minWidth.value) {
			this.minWidth.value = 80
		}
		if (!this.maxWidth.value) {
			this.maxWidth.value = 400
		}
		if (this.enableDefaultContextMenu.value === undefined) {
			this.enableDefaultContextMenu.value = true
		}
		if (this.enableDragAndDrop.value === undefined) {
			this.enableDragAndDrop.value = true
		}
	}
}
