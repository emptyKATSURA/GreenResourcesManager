
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
	options: string[]
	constructor(fieldName: string, options: string[], required?: boolean) {
		super(fieldName, FormFieldType.SELECT, required)
		this.options = options
	}
}


export class FormField_SelectCover extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.SELECT, required)
	}
}


export class FormField_Radio extends FormField {
	options: string[]
	constructor(fieldName: string, options: string[], required?: boolean) {
		super(fieldName, FormFieldType.RADIO, required)
		this.options = options
	}
}

export class FormField_SelectFile extends FormField {
	filters: FileSelectFilter[]
	constructor(fieldName: string, filters: FileSelectFilter[], required?: boolean) {
		super(fieldName, FormFieldType.SELECT_FILE, required)
		this.filters = filters
	}
}
export class FormField_SelectFolder extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.SELECT_FOLDER, required)
	}
}

export class FormField_Tags extends FormField {
	constructor(fieldName: string, required?: boolean) {
		super(fieldName, FormFieldType.TAGS, required)
	}
}