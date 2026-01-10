export enum FormFieldType {
	TEXT = 'text', // 文本
	NUMBER = 'number', // 数字
	DATE = 'date', // 日期
	TIME = 'time', // 时间
	SELECT = 'select', // 文本的下拉框
	SELECT_FILE = 'selectFile', // 文件选择
	SELECT_FOLDER = 'selectFolder', // 文件夹选择
	CHECKBOX = 'checkbox', // 复选框
	RADIO = 'radio', // 单选按钮
	TEXTAREA = 'textarea', // 文本域
	TAGS = 'tags', // 标签
}

// 文件选择过滤器类型
export interface FileSelectFilter {
	name: string // 过滤器名称（如 '图片文件'、'可执行文件'）
	extensions: string[] // 允许的文件扩展名数组（如 ['jpg', 'png']，支持 '*' 或 '其他' 作为通配符）
}

export abstract class FormField {
	fieldName: string
	fieldType: FormFieldType


	constructor(fieldName: string, fieldType: FormFieldType) {
		this.fieldName = fieldName
		this.fieldType = fieldType
	}
}


export class FormField_Text extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.TEXT)
	}
}

export class FormField_Number extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.NUMBER)
	}
}

export class FormField_Date extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.DATE)
	}
}

export class FormField_Select extends FormField {
	options: string[]
	constructor(fieldName: string, options: string[]) {
		super(fieldName, FormFieldType.SELECT)
		this.options = options
	}
}

export class FormField_Radio extends FormField {
	options: string[]
	constructor(fieldName: string, options: string[]) {
		super(fieldName, FormFieldType.RADIO)
		this.options = options
	}
}

export class FormField_SelectFile extends FormField {
	filters: FileSelectFilter[]
	constructor(fieldName: string, filters: FileSelectFilter[]) {
		super(fieldName, FormFieldType.SELECT_FILE)
		this.filters = filters
	}
}
export class FormField_SelectFolder extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.SELECT_FOLDER)
	}
}

export class FormField_Tags extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.TAGS)
	}
}

export class Game  {
	// 文本字段
	name :FormField_Text = new FormField_Text('游戏名')
	description :FormField_Text = new FormField_Text('游戏简介')
	developer :FormField_Text = new FormField_Text('开发商')
	publisher :FormField_Text = new FormField_Text('发行商')

	tags :FormField_Tags = new FormField_Tags('标签')
	
	// 选择字段 - 可以配置选项列表
	engine :FormField_Select = new FormField_Select('游戏引擎', [
		'Unity', 
		'Unreal Engine', 
		'Godot', 
		'GameMaker Studio',
		'RPG Maker VX Ace',
		'RPG Maker MV',
		'RPG Maker MZ',
		'其他'
	])
	
	// 文件选择字段 - 可以配置过滤器数组
	// 扩展名可以带点号（如 '.exe'）或不带点号（如 'exe'），都支持
	// 使用 '其他' 或 '*' 作为通配符，允许所有文件类型
	executablePath :FormField_SelectFile = new FormField_SelectFile('游戏路径', [
		{ name: '可执行文件', extensions: ['exe', 'dll'] },
		{ name: "所有文件", extensions: ["*"] }
	])
	image :FormField_SelectFile = new FormField_SelectFile('游戏封面', [
		{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
	])
	
	// 数字字段
	folderSize :FormField_Number = new FormField_Number('游戏文件夹大小')
	playTime :FormField_Number = new FormField_Number('游戏时长')
	playCount :FormField_Number = new FormField_Number('游戏运行次数')
	
	// 日期字段
	lastPlayed :FormField_Date = new FormField_Date('最后游玩时间')
	
}
