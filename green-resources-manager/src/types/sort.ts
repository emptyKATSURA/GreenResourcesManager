/**
 * 排序配置类型定义
 */

/**
 * 排序字段配置接口
 * @template T 资源类型
 */
export interface SortFieldConfig<T> {
  /** 字段访问器函数，从资源对象中提取要排序的字段值 */
  fieldAccessor: (item: T) => any
  /** 字段显示名称，用于生成排序选项标签 */
  label: string
  /** 可选的比较函数，如果不提供则使用默认比较 */
  compareFn?: (a: any, b: any) => number
}

/**
 * 排序选项接口（用于工具栏显示）
 */
export interface SortOption {
  /** 排序值，用于保存和识别，如 'name-asc' */
  value: string
  /** 显示标签，如 '按名称排序（升序）' */
  label: string
}
