/**
 * 统一资源基类定义
 * 所有资源类型都基于此基类扩展
 */

export interface BaseResource {
  
  /**
   * 资源唯一标识符
   */
  id: string
  
  /**
   * 资源名称
   */
  name: string
  
  /**
   * 资源描述
   */
  description?: string
  
  /**
   * 资源标签列表
   */
  tags?: string[]

  /**
   * 资源是否存在
   */
  fileExists?: boolean
  
}
