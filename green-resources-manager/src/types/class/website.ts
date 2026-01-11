import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from '../abstract/EditableProperties.ts'
import { SaveableProperties } from '../abstract/SaveableProperties.ts'
import { ResourcesDataBase } from '../abstract/ResourcesDataBase.ts'


export namespace Website{

	/**
	 * 网站基本信息接口
	 */
	export class WebsiteData extends ResourcesDataBase {
		url?: string // 网站URL（必填）
		visitCount?: number // 访问次数
		lastVisited?: string | null // 最后访问时间
		firstVisited?: string | null // 首次访问时间
		favicon?: string // 网站图标
		isBookmark?: boolean // 是否为书签
		isPrivate?: boolean // 是否私有
		notes?: string // 备注
		username?: string // 用户名（可选）
		password?: string // 密码（可选）
		loginUrl?: string // 登录URL（可选）
		status?: string // 状态：active, inactive, archived
		language?: string // 语言
		country?: string // 国家
		lastChecked?: string | null // 最后检查时间
		responseTime?: number // 响应时间
		sslStatus?: string // SSL状态：secure, insecure, unknown
	}

	/**
	 * 网站可保存属性类
	 * 定义哪些网站属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加网站特有的字段
	 */
	export class SaveableWebsiteProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加网站特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',
				'url',
				'tags',
				// isFavorite 已在基类（ResourcesDataBase）中定义，无需重复添加
				
				// 统计字段
				'visitCount',
				'lastVisited',
				'firstVisited',
				'addedDate',
				'rating',
				'comment',
				'isPrivate',
				'notes',
			]
		}
	}

	
	/**
	 * 网站可编辑属性类
	 * 定义网站资源的表单字段结构
	 */
	export class EditableWebsiteProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('网站名称', false)  // 可选
		url :FormField_Text = new FormField_Text('网站URL', true)  // 必填
		description :FormField_Textarea = new FormField_Textarea('网站描述', false)

		tags :FormField_Tags = new FormField_Tags('网站标签', false)
		
		// 注意：isFavorite（收藏）功能已在详情页提供，不需要在表单中编辑
		// 书签功能已移除，不再需要
	}
	
}
