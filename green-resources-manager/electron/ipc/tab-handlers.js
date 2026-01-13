const { getTabManager } = require('../window/tab-manager')

/**
 * 注册标签页相关的 IPC 处理器
 * @param {IpcMain} ipcMain - Electron IPC 主进程对象
 * @param {BrowserWindow} mainWindow - 主窗口实例
 * @param {boolean} isDev - 是否为开发环境
 */
function registerTabHandlers(ipcMain, mainWindow, isDev) {
  // 创建新标签页
  ipcMain.handle('tab-create', async (event, { url, title } = {}) => {
    try {
      const tabManager = getTabManager(mainWindow, isDev)
      const tabId = tabManager.createTab(url, title)
      return { success: true, tabId }
    } catch (error) {
      console.error('创建标签页失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 关闭标签页
  ipcMain.handle('tab-close', async (event, { tabId }) => {
    try {
      const tabManager = getTabManager(mainWindow, isDev)
      tabManager.closeTab(tabId)
      return { success: true }
    } catch (error) {
      console.error('关闭标签页失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 切换活动标签页
  ipcMain.handle('tab-activate', async (event, { tabId }) => {
    try {
      const tabManager = getTabManager(mainWindow, isDev)
      tabManager.setActiveTab(tabId)
      return { success: true }
    } catch (error) {
      console.error('切换标签页失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取所有标签页
  ipcMain.handle('tab-get-all', async (event) => {
    try {
      const tabManager = getTabManager(mainWindow, isDev)
      const tabs = tabManager.getAllTabs()
      const activeTabId = tabManager.getActiveTabId()
      return { success: true, tabs, activeTabId }
    } catch (error) {
      console.error('获取标签页列表失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 导航标签页
  ipcMain.handle('tab-navigate', async (event, { tabId, url }) => {
    try {
      const tabManager = getTabManager(mainWindow, isDev)
      tabManager.navigateTab(tabId, url)
      return { success: true }
    } catch (error) {
      console.error('导航标签页失败:', error)
      return { success: false, error: error.message }
    }
  })
}

module.exports = {
  registerTabHandlers
}
