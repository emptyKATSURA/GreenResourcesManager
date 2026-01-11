import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_Number,
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType
} from './FormField.ts'
import { EditableProperties } from '../abstract/EditableProperties.ts'
import { SaveableProperties } from '../abstract/SaveableProperties.ts'
import { ResourcesDataBase } from '../abstract/ResourcesDataBase.ts'


export namespace Novel{

	/**
	 * 小说基本信息接口
	 */
	export class NovelData extends ResourcesDataBase {
		author?: string // 作者
		genre?: string // 类型/分类
		language?: string // 语言
		filePath?: string // 文件路径
		fileType?: 'txt' | 'epub' | 'mobi' | 'pdf' // 文件类型
		fileSize?: number // 文件大小
		encoding?: string // 编码
		totalWords?: number // 总字数
		totalChapters?: number // 总章节数
		currentChapter?: number // 当前章节
		readProgress?: number // 阅读进度 (0-100)
		readTime?: number // 阅读时长
		lastRead?: string | null // 最后阅读时间
		firstRead?: string | null // 首次阅读时间
		coverImage?: string // 封面图片
		publishYear?: string // 出版年份
		publisher?: string // 出版社
		isbn?: string // ISBN
		series?: string // 系列
		volume?: string // 卷数
		chapters?: any[] // EPUB 章节列表
		bookmarks?: any[] // 书签
		highlights?: any[] // 高亮
		notes?: string // 备注
		status?: 'unread' | 'reading' | 'completed' | 'paused' // 阅读状态
		isPrivate?: boolean // 是否私有
	}

	/**
	 * 小说可保存属性类
	 * 定义哪些小说属性需要保存到文件
	 * 基础字段（id, name）已在基类中定义，这里只需要添加小说特有的字段
	 */
	export class SaveableNovelProperties extends SaveableProperties {
		static getSaveableFields(): string[] {
			// 获取基类的基础字段（id, name）
			const baseFields = super.getSaveableFields()
			
			// 添加小说特有的字段
			return [
				...baseFields,  
				
				// 可编辑字段
				'description',
				'author',
				'genre',
				'tags',
				'filePath',
				'coverImage',
				'readProgress',
				
				// 统计字段
				'readTime',
				'lastRead',
				'firstRead',
				'addedDate',
				'rating',
				'comment',
				'totalWords',
				'totalChapters',
				'currentChapter',
				'fileType',
				'fileSize',
				'encoding',
				'status',
				'notes',
				'fileExists',
			]
		}
	}

	
	/**
	 * 小说可编辑属性类
	 * 定义小说资源的表单字段结构
	 */
	export class EditableNovelProperties extends EditableProperties {
		// 文本字段
		name :FormField_Text = new FormField_Text('小说名称', false)  // 可选，可从文件名提取
		author :FormField_Text = new FormField_Text('作者', false)
		genre :FormField_Text = new FormField_Text('类型', false)
		description :FormField_Textarea = new FormField_Textarea('小说简介', false)

		tags :FormField_Tags = new FormField_Tags('小说标签', false)
		
		// 文件选择字段 - 支持小说文件
		filePath :FormField_SelectFile = new FormField_SelectFile('小说文件', [
			{ name: '小说文件', extensions: ['txt', 'epub', 'mobi', 'pdf'] },
		], true)  // 必填
		
		// 封面选择字段 - 使用游戏封面类型（支持截图作为封面）
		coverImage :FormField_SelectGameCover = new FormField_SelectGameCover('封面图片', false)
		publishYear :FormField_Text = new FormField_Text('出版年份', false)
		

	}
	
}
