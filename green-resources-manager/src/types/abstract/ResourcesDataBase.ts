export abstract class ResourcesDataBase {

	id: string // 资源唯一标识符
	name: string // 资源名称
	description?: string // 资源描述
	tags?: string[] // 资源标签列表
	fileExists?: boolean // 资源是否存在
	addedDate?: string // 添加日期
	rating?: number // 评分
	comment?: string // 评论
	isFavorite?: boolean // 是否收藏
	isArchive?: boolean // 是否为压缩包
}
  