
export enum FormFieldType {
	TEXT = 'text', // 文本
	NUMBER = 'number', // 数字
	DATE = 'date', // 日期
	TIME = 'time', // 时间
	SELECT = 'select', // 文本的下拉框
	SELECT_FILE = 'selectFile', // 文件选择
	SELECT_FOLDER = 'selectFolder', // 文件夹选择
	SELECT_COVER = 'selectCover', // 封面选择
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
	required?: boolean


	constructor(fieldName: string, fieldType: FormFieldType, required?: boolean) {
		this.fieldName = fieldName
		this.fieldType = fieldType
		this.required = required ?? true
	}
}


export class FormField_Text extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.TEXT, required)
	}
}

export class FormField_Textarea extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.TEXTAREA, required)
	}
}

export class FormField_Number extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.NUMBER, required)
	}
}

export class FormField_Date extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.DATE, required)
	}
}

export class FormField_Select extends FormField {
	options: string[]
	constructor(fieldName: string, options: string[], required?: boolean) {
		super(fieldName, FormFieldType.SELECT, required)
		this.options = options
	}
}

export class FormField_SelectEngine extends FormField {

	options: string[] = [
		// 主流通用引擎
		'Unity',
		'Unreal Engine',
		'Godot',
		'CryEngine',
		'Source Engine',

		// Web / 桌面壳 / 跨平台（独立游戏常用）
		'Electron',
		'NW.js',
		'Tauri',

		// 独立 / 轻量游戏引擎
		'GameMaker Studio',
		'Defold',
		'Cocos2d',
		'Cocos Creator',
		'Phaser',
		'Love2D',
		'MonoGame',
		'XNA',
		'libGDX',
		'Bevy',
		'HaxeFlixel',
		'GDevelop',

		// Galgame / 视觉小说引擎
		"Ren'Py",
		'TyranoBuilder',
		'TyranoScript',
		'Kirikiri / 吉里吉里',
		'Kirikiri Z',
		'NScripter',
		'ONScripter',
		'Artemis Engine',
		'Visual Novel Maker',
		'MondayOFF VN Engine',
		'Unity + VN Framework',
		'Godot + VN Plugin',

		// RPG 系
		'RPG Maker VX Ace',
		'RPG Maker MV',
		'RPG Maker MZ',
		'Wolf RPG Editor',

		// 交互叙事 / 非传统游戏
		'Twine',
		'Ink',
		'Yarn Spinner',

		// 可视化 / 教育
		'Scratch',
		'Construct',
		'Clickteam Fusion',

		// 底层 / 语言级
		'Flash / ActionScript',
		'Java',
		'Python / Pygame',
		'C++ 自研引擎',

		// 兜底
		'其他'
	]

	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.SELECT, required)
	}
}


/**
 * 封面选择字段
 */
abstract class FormField_SelectCover extends FormField {
	filters: FileSelectFilter[] = [
		{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] }
	]
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.SELECT_COVER, required)
	}
}


/**
 * 游戏封面选择字段
 */
export class FormField_SelectGameCover extends FormField_SelectCover {
	
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, required)
	}
}

/**
 * 漫画封面选择字段
 */
export class FormField_SelectMangaCover extends FormField_SelectCover {

	constructor(fieldName: string, required?: boolean) {
		super(fieldName, required)
	}
}

/**
 * 视频缩略图选择字段
 */
export class FormField_SelectVideoThumbnail extends FormField_SelectCover {

	constructor(fieldName: string, required?: boolean) {
		super(fieldName, required)
	}
}

/**
 * 单选按钮字段
 */
export class FormField_Radio extends FormField {
	options: string[]
	constructor(fieldName: string, options: string[], required?: boolean) {
		super(fieldName, FormFieldType.RADIO, required)
		this.options = options
	}
}

/**
 * 文件选择字段
 */
export class FormField_SelectFile extends FormField {
	filters: FileSelectFilter[]
	constructor(fieldName: string, filters: FileSelectFilter[], required?: boolean) {
		super(fieldName, FormFieldType.SELECT_FILE, required)
		this.filters = filters
	}
}

/**
 * 文件夹选择字段
 */
export class FormField_SelectFolder extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.SELECT_FOLDER, required)
	}
}

/**
 * 标签字段
 */
export class FormField_Tags extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.TAGS, required)
	}
}