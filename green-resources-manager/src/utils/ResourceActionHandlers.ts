/**
 * 资源 Action Handler 注册系统
 * 将资源操作逻辑与页面解耦，通过资源类型的 handlerName 自动路由到对应的 handler
 */

import { BaseResources } from '@resources/base/ResourcesDataBase.ts'
import { isArchiveFile } from '../composables/useArchive'
import notify from './NotificationService.ts'

/**
 * Action Handler 函数类型
 */
export type ActionHandler = (resource: any, context: ActionHandlerContext) => Promise<void> | void

/**
 * Action Handler 上下文
 * 提供 handler 执行时需要的上下文信息
 */
export interface ActionHandlerContext {
  // 是否为 Electron 环境
  isElectronEnvironment: boolean
  
  // 更新资源的方法
  updateResource: (id: string, updates: any) => Promise<void>
  
  // 检查资源是否正在运行（用于游戏等可执行资源）
  isResourceRunning?: (resource: any) => boolean
  
  // 添加运行资源的方法（用于游戏等可执行资源）
  addRunningResource?: (resourceInfo: any) => void
  
  // 移除运行资源的方法（用于游戏等可执行资源）
  removeRunningResource?: (resourceId: string) => void
  
  // 获取资源初始运行时长（用于游戏等可执行资源）
  getInitialPlayTime?: (resourceId: string) => number
  
  // 保存初始运行时长（用于游戏等可执行资源）
  saveInitialPlayTime?: (resourceId: string, playTime: number) => void
  
  // 关闭详情页面的方法
  closeDetail?: () => void
  
  // 显示终止确认对话框的方法（用于游戏等可执行资源）
  showTerminateConfirmDialog?: (resource: any) => void
  
  // 打开专辑/漫画的方法（用于图片/漫画资源）
  openAlbum?: (album: any) => Promise<void>
  
  // 设置当前专辑的方法（用于图片/漫画资源）
  setCurrentAlbum?: (album: any) => void
  
  // 设置当前页面索引的方法（用于图片/漫画资源）
  setCurrentPageIndex?: (index: number) => void
  
  // 清空页面数据的方法（用于图片/漫画资源）
  clearPages?: () => void
  
  // 更新浏览信息的方法（用于图片/漫画资源）
  updateViewInfo?: (album: any) => Promise<void>
  
  // 加载专辑页面的方法（用于图片/漫画资源）
  loadAlbumPages?: () => Promise<void>
  
  // 显示阅读器的方法（用于图片/漫画资源）
  showComicViewer?: (show: boolean) => void
}

/**
 * Action Handler 注册表
 */
const actionHandlers = new Map<string, ActionHandler>()

/**
 * 注册 Action Handler
 * @param handlerName Handler 名称（对应资源类的 actionConfig.handlerName）
 * @param handler Handler 函数
 */
export function registerActionHandler(handlerName: string, handler: ActionHandler) {
  actionHandlers.set(handlerName, handler)
  console.log(`[ResourceActionHandlers] 已注册 handler: ${handlerName}`)
}

/**
 * 获取 Action Handler
 * @param handlerName Handler 名称
 * @returns Handler 函数，如果不存在则返回 null
 */
export function getActionHandler(handlerName: string): ActionHandler | null {
  return actionHandlers.get(handlerName) || null
}

/**
 * 执行 Action Handler
 * @param resource 资源实例
 * @param context Handler 上下文
 * @returns 是否成功找到并执行了 handler
 */
export async function executeActionHandler(
  resource: any,
  context: ActionHandlerContext
): Promise<boolean> {
  // 通过 resource.constructor 获取运行时的实际构造函数
  if (!resource || !resource.constructor) {
    console.warn('[ResourceActionHandlers] 资源或构造函数不存在')
    return false
  }

  // 获取 handler 名称
  const handlerName = resource.constructor.getActionHandlerName?.()
  if (!handlerName) {
    console.warn('[ResourceActionHandlers] 资源类型未配置 action handler')
    return false
  }

  // 查找并执行 handler
  const handler = getActionHandler(handlerName)
  if (!handler) {
    console.warn(`[ResourceActionHandlers] 未找到 handler: ${handlerName}`)
    return false
  }

  try {
    await handler(resource, context)
    return true
  } catch (error) {
    console.error(`[ResourceActionHandlers] 执行 handler ${handlerName} 失败:`, error)
    notify.toast('error', '操作失败', `执行操作失败: ${error.message}`)
    return false
  }
}

/**
 * 启动可执行文件的通用 Handler
 * 适用于所有可执行资源（Game, Software 等）
 */
export const launchExecutableHandler: ActionHandler = async (resource, context) => {
  try {
    // 获取资源属性值（支持 ResourceField 和普通属性）
    const executablePath = BaseResources.extractPrimitiveValue(
      resource.resourcePath?.value || resource.executablePath?.value || resource.resourcePath || resource.executablePath
    )
    const resourceName = BaseResources.extractPrimitiveValue(resource.name?.value || resource.name)
    const resourceId = BaseResources.extractPrimitiveValue(resource.id?.value || resource.id)
    const isArchiveValue = BaseResources.extractPrimitiveValue(resource.isArchive?.value ?? resource.isArchive)
    const lastPlayedValue = BaseResources.extractPrimitiveValue(resource.lastPlayed?.value || resource.lastPlayed)
    const playCountValue = BaseResources.extractPrimitiveValue(resource.playCount?.value || resource.playCount) || 0
    const firstPlayedValue = BaseResources.extractPrimitiveValue(resource.firstPlayed?.value || resource.firstPlayed)
    const playTimeValue = BaseResources.extractPrimitiveValue(resource.playTime?.value || resource.playTime) || 0
    
    // 检查是否为压缩包，压缩包不能运行
    const isArchive = Boolean(isArchiveValue) || (executablePath && isArchiveFile(executablePath))
    if (isArchive) {
      notify.toast('warning', '无法运行', `压缩包文件无法直接运行。请先解压后再运行。`)
      return
    }

    // 检查资源是否正在运行
    if (context.isResourceRunning && context.isResourceRunning(resource)) {
      // 如果资源正在运行，显示确认对话框
      if (context.showTerminateConfirmDialog) {
        context.showTerminateConfirmDialog(resource)
      }
      return
    }

    console.log('启动资源:', resourceName, executablePath)
    console.log('更新前 - lastPlayed:', lastPlayedValue)
    console.log('更新前 - playCount:', playCountValue)

    // 更新资源统计（启动时也更新 lastPlayed，记录开始运行的时间）
    const updates: any = {
      lastPlayed: new Date().toISOString(),
      playCount: playCountValue + 1
    }

    // 如果是第一次启动，记录第一次运行时间
    if (!firstPlayedValue) {
      updates.firstPlayed = new Date().toISOString()
      console.log(`资源 ${resourceName} 第一次启动，记录时间:`, updates.firstPlayed)
    }

    await context.updateResource(resourceId, updates)
    console.log('更新后 - lastPlayed:', updates.lastPlayed)
    console.log('更新后 - playCount:', updates.playCount)
    console.log('资源数据已保存')

    if (context.isElectronEnvironment && window.electronAPI && window.electronAPI.launchGame) {
      console.log('使用 Electron API 启动资源')
      const result = await window.electronAPI.launchGame(executablePath, resourceName)

      if (result.success) {
        console.log('------------------------------')
        console.log('资源启动成功，进程ID:', result.pid)
        console.log('资源窗口标题列表:', result.windowTitles)
        console.log('------------------------------')

        // 将资源添加到全局运行列表中（包含完整信息）
        if (context.addRunningResource) {
          context.addRunningResource({
            id: resourceId,
            pid: result.pid,
            windowTitles: result.windowTitles || [],
            gameName: resourceName
          })
        }
        
        // 保存资源启动时的初始 playTime
        if (context.saveInitialPlayTime) {
          context.saveInitialPlayTime(resourceId, playTimeValue)
        }

        // 显示成功提示
        notify.toast('success', '启动成功', `${resourceName} 已启动`)
      } else {
        console.error('资源启动失败:', result.error)
        notify.toast('error', '启动失败', `启动失败: ${result.error}`)
        return
      }
    } else {
      // 提供更详细的错误信息
      let errorMessage = `无法启动: ${resourceName}\n\n`
      if (!context.isElectronEnvironment) {
        errorMessage += `❌ 错误：未检测到 Electron 环境\n`
        errorMessage += `当前环境：${navigator.userAgent.includes('Electron') ? 'Electron 但 API 未加载' : '浏览器环境'}\n\n`
        errorMessage += `解决方案：\n`
        errorMessage += `1. 确保在打包后的应用中运行\n`
        errorMessage += `2. 检查 preload.js 是否正确加载\n`
        errorMessage += `3. 重新构建应用\n\n`
      } else {
        errorMessage += `❌ 错误：Electron API 不可用\n`
        errorMessage += `请检查应用是否正确打包\n\n`
      }
      errorMessage += `资源路径: ${executablePath}`
      notify.toast('error', '启动失败', errorMessage)
      return
    }

    // 关闭详情页面
    if (context.closeDetail) {
      context.closeDetail()
    }
  } catch (error) {
    console.error('启动资源失败:', error)
    notify.toast('error', '启动失败', `启动失败: ${error.message}`)
  }
}

/**
 * 打开专辑/漫画的通用 Handler
 * 适用于图片专辑、漫画等资源类型
 */
export const openAlbumHandler: ActionHandler = async (resource, context) => {
  try {
    const resourceName = BaseResources.extractPrimitiveValue(resource.name?.value || resource.name)
    console.log('开始打开专辑:', resourceName)
    
    // 设置当前专辑
    if (context.setCurrentAlbum) {
      context.setCurrentAlbum(resource)
    }
    
    // 设置当前页面索引为 0
    if (context.setCurrentPageIndex) {
      context.setCurrentPageIndex(0)
    }
    
    // 清空之前的页面数据，确保重新加载
    if (context.clearPages) {
      context.clearPages()
    }
    
    // 增加浏览次数
    if (context.updateViewInfo) {
      try {
        await context.updateViewInfo(resource)
      } catch (error) {
        console.warn('更新浏览信息失败:', error)
        // 不阻止打开阅读器，继续执行
      }
    }
    
    // 先加载当前专辑的图片文件，再显示阅读器
    if (context.loadAlbumPages) {
      await context.loadAlbumPages()
    }
    
    // 确保pages数组已加载完成后再显示阅读器
    console.log('页面加载完成，显示阅读器')
    if (context.showComicViewer) {
      context.showComicViewer(true)
    }
  } catch (error) {
    console.error('打开专辑失败:', error)
    const resourceName = BaseResources.extractPrimitiveValue(resource.name?.value || resource.name)
    notify.toast('error', '打开失败', `无法打开 "${resourceName}": ${error.message || '未知错误'}`)
  }
}

// 注册默认的 handlers
registerActionHandler('launchExecutable', launchExecutableHandler)
registerActionHandler('openAlbum', openAlbumHandler)
