/**
 * 可保存属性基类
 * 用于定义哪些属性需要保存到文件
 * 所有资源类型的基础字段（id, name）都在基类中定义
 */
export abstract class SaveableProperties {
	/**
	 * 获取需要保存的字段列表
	 * 基类返回所有资源类型都有的基础字段
	 * 子类可以重写此方法，调用 super.getSaveableFields() 并添加额外字段
	 * @returns 字段名数组
	 */
	static getSaveableFields(): string[] {
		return [
			'id',   // 资源唯一标识符
			'name' , // 资源名称
			'rating',// 评分
			'comment',// 评论
			'isFavorite',// 是否收藏
			'isArchive',// 是否为压缩包
			'addedDate',// 添加日期
			'fileExists',// 是否存在
		]
	}

	/**
	 * 从数据对象中提取需要保存的属性
	 * @param data 完整的数据对象
	 * @returns 只包含可保存字段的对象
	 */
	static extractSaveableData<T extends Record<string, any>>(data: T): Partial<T> {
		const fields = this.getSaveableFields()
		if (fields.length === 0) {
			// 如果没有定义字段，返回所有数据（向后兼容）
			return data
		}
		
		const result: Partial<T> = {}
		for (const field of fields) {
			if (field in data) {
				result[field as keyof T] = data[field]
			}
		}
		return result
	}
}