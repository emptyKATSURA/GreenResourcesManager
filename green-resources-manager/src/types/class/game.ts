export enum FormFieldType {
	TEXT = 'text',
	NUMBER = 'number',
	DATE = 'date',
	TIME = 'time',
	SELECT = 'select',
	SELECT_FILE = 'selectFile',
	SELECT_FOLDER = 'selectFolder',
	CHECKBOX = 'checkbox',
	RADIO = 'radio',
	TEXTAREA = 'textarea',
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
	allowedExtensions: string[]
	constructor(fieldName: string,allowedExtensions: string[]) {
		super(fieldName, FormFieldType.SELECT_FILE)
		this.allowedExtensions = allowedExtensions
	}
}
export class FormField_SelectFolder extends FormField {
	constructor(fieldName: string) {
		super(fieldName, FormFieldType.SELECT_FOLDER)
	}
}

export class Game  {
	// 文本字段
	name :FormField_Text = new FormField_Text('游戏名')
	description :FormField_Text = new FormField_Text('游戏简介')
	developer :FormField_Text = new FormField_Text('开发商')
	publisher :FormField_Text = new FormField_Text('发行商')
	
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
	
	// 文件选择字段 - 可以配置允许的文件扩展名
	// 扩展名可以带点号（如 '.exe'）或不带点号（如 'exe'），都支持
	// 使用 '其他' 作为通配符，允许所有文件类型
	executablePath :FormField_SelectFile = new FormField_SelectFile('游戏路径', ['exe', 'dll', '其他'])
	image :FormField_SelectFile = new FormField_SelectFile('游戏封面', ['jpg', 'jpeg', 'png', 'gif', 'webp', '其他'])
	
	// 数字字段
	folderSize :FormField_Number = new FormField_Number('游戏文件夹大小')
	playTime :FormField_Number = new FormField_Number('游戏时长')
	playCount :FormField_Number = new FormField_Number('游戏运行次数')
	
	// 日期字段
	lastPlayed :FormField_Date = new FormField_Date('最后游玩时间')
	
	// 单选按钮字段示例（如果需要）
	// status :FormField_Radio = new FormField_Radio('游戏状态', ['已安装', '未安装', '已卸载'])
}
