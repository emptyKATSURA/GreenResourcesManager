import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectEngine, 
	FormField_SelectFile, 
	FormField_SelectCover,
	FormField as FormFieldType
} from './FormField.ts'

export class Game  {
	// 文本字段
	name :FormField_Text = new FormField_Text('游戏名', true)
	description :FormField_Textarea = new FormField_Textarea('游戏简介', false)
	developer :FormField_Text = new FormField_Text('开发商', false)
	publisher :FormField_Text = new FormField_Text('发行商', false)

	tags :FormField_Tags = new FormField_Tags('标签', false)
	
	// 选择字段 - 游戏引擎选项已配置在 FormField_SelectEngine 类中
	engine :FormField_SelectEngine = new FormField_SelectEngine('选择游戏引擎', false)
	
	// 文件选择字段 - 可以配置过滤器数组
	// 扩展名可以带点号（如 '.exe'）或不带点号（如 'exe'），都支持
	// 使用 '其他' 或 '*' 作为通配符，允许所有文件类型
	executablePath :FormField_SelectFile = new FormField_SelectFile('游戏路径', [
		{ name: '可执行文件', extensions: ['exe', 'dll'] },
		{ name: "所有文件", extensions: ["*"] }
	], true)
	image :FormField_SelectCover = new FormField_SelectCover('游戏封面', false)
	
	
	
}
