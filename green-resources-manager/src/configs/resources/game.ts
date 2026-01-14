import { 
	FormField_Text, 
	FormField_Textarea, 
	FormField_Tags, 
	FormField_SelectEngine, 
	FormField_SelectFile, 
	FormField_SelectGameCover,
	FormField as FormFieldType,
	FormField
} from './base/FormField.ts'
import { BaseResources } from './base/ResourcesDataBase.ts'
import { ResourceField } from './base/ResourceField.ts'


/**
 * 游戏类
 */
export class Game extends BaseResources {
	
	
	name: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('游戏名', true)
	})
	
	description: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Textarea('游戏简介', false)
	})
	
	developers: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('开发商', false)
	})
	
	publisher: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_Text('发行商', false)
	})
	
	tags: ResourceField<string[]> = new ResourceField<string[]>({
		saveable: true,
		editType: new FormField_Tags('标签', false)
	})
	
	engine: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectEngine('选择游戏引擎', false)
	})

	
	coverPath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectGameCover('游戏封面', false)
	})

	resourcePath: ResourceField<string> = new ResourceField<string>({
		saveable: true,
		editType: new FormField_SelectFile('游戏路径', [
			{ name: '可执行文件', extensions: ['exe', 'bat', 'ps1'] },
		], true)
	})

	


	  
  // 静态配置：编辑对话框配置
  static editDialogConfig = {
    addTitle: '添加游戏',
    editTitle: '编辑游戏',
  }

  // 静态配置：右键菜单项
  static contextMenuItems = [
    { key: 'detail', icon: '👁️', label: '查看详情' },
    { key: 'launch', icon: '▶️', label: '启动游戏' },
    { key: 'folder', icon: '📁', label: '打开文件夹' },
    { key: 'screenshot-folder', icon: '📸', label: '打开截图文件夹' },
    { key: 'update-folder-size', icon: '📊', label: '更新文件夹大小' },
    { 
      key: 'compress', 
      icon: '🗜️', 
      label: '压缩文件',
      children: [
        { key: 'compress-to', icon: '🗜️', label: '压缩到指定目录...' },
        { key: 'compress-here', icon: '🗜️', label: '压缩到当前目录' }
      ]
    },
    { 
      key: 'extract', 
      icon: '📦', 
      label: '解压文件',
      children: [
        { key: 'extract', icon: '📦', label: '解压到指定目录...' },
        { key: 'extract-here', icon: '📦', label: '解压到当前目录' }
      ]
    },
    { key: 'edit', icon: '✏️', label: '编辑信息' },
    { key: 'remove', icon: '🗑️', label: '删除游戏' }
  ]

  // 静态配置：空状态配置
  static emptyStateConfig = {
    icon: '🎮',
    title: '你的游戏库是空的',
    description: '点击"添加游戏"按钮来添加你的第一个游戏，或直接拖拽游戏文件（.exe、.swf、.bat）或压缩包（.zip、.rar、.7z 等）到此处',
    buttonText: '添加第一个游戏',
    buttonAction: 'showAddGameDialog'
  }

  // 静态配置：工具栏配置
  // 注意：sortOptions 已移至页面配置（GamePage.getSortOptions），这里不再包含
  static toolbarConfig = {
    addButtonText: '添加游戏',
    searchPlaceholder: '搜索游戏...'
  }

  // 静态配置：启动方式配置
  static actionConfig = {
    key: 'launch',
    icon: '▶️',
    label: '启动游戏',
    handlerName: 'launchGame' // 组件中对应的方法名
  }

}


