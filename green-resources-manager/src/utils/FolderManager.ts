/**
 * FolderManager - 视频文件夹管理器
 * 负责管理视频文件夹的增删改查操作
 * 统一使用 SQLite 存储，不再使用 JSON
 */
class FolderManager {
  folders: any[]
  pageId: string | null

  constructor(pageId?: string) {
    this.folders = []
    this.pageId = pageId || null
  }

  /**
   * 初始化文件夹管理器（从 SQLite 加载）
   */
  async init(_saveManager?: any) {
    await this.loadFolders()
  }

  /**
   * 从 SQLite 加载文件夹数据
   */
  async loadFolders() {
    const pageId = this.pageId || 'anime-series'
    if (typeof window === 'undefined' || !(window as any).electronAPI?.sqliteGetPageData) {
      console.warn('Electron API 不可用，无法从 SQLite 加载文件夹')
      this.folders = []
      return
    }
    try {
      const result = await (window as any).electronAPI.sqliteGetPageData(pageId)
      if (result?.ok && Array.isArray(result.data)) {
        this.folders = result.data.map((f: any) => ({
          ...f,
          folderPath: f.folderPath || f.resourcePath
        }))
        console.log(`[FolderManager] 从 SQLite 加载完成（页面: ${pageId}），共 ${this.folders.length} 个文件夹`)
      } else {
        this.folders = []
      }
    } catch (error) {
      console.error('[FolderManager] 从 SQLite 加载失败:', error)
      this.folders = []
    }
  }

  /**
   * 保存文件夹数据到 SQLite
   */
  async saveFolders() {
    const pageId = this.pageId || 'anime-series'
    if (typeof window === 'undefined' || !(window as any).electronAPI?.sqliteSavePageResources) {
      console.warn('Electron API 不可用，无法保存到 SQLite')
      return false
    }
    try {
      const resources = this.folders.map((f: any) => ({
        ...f,
        resourcePath: f.resourcePath || f.folderPath,
        resourceType: 'videoFolder'
      }))
      const result = await (window as any).electronAPI.sqliteSavePageResources(pageId, resources)
      if (result?.ok) {
        console.log(`[FolderManager] 保存到 SQLite 成功（页面: ${pageId}），共 ${this.folders.length} 个文件夹`)
        return true
      }
      return false
    } catch (error) {
      console.error('[FolderManager] 保存到 SQLite 失败:', error)
      return false
    }
  }

  /**
   * 获取所有文件夹
   * @returns {Array} 文件夹数组
   */
  getFolders() {
    return this.folders
  }

  /**
   * 根据ID获取文件夹
   * @param {string} id - 文件夹ID
   * @returns {Object|null} 文件夹对象
   */
  getFolderById(id) {
    return this.folders.find(folder => folder.id === id) || null
  }

  /**
   * 添加文件夹
   * @param {Object} folder - 文件夹对象
   * @returns {Promise<boolean>} 添加是否成功
   */
  async addFolder(folder) {
    try {
      // 检查ID是否已存在
      if (this.getFolderById(folder.id)) {
        console.warn('文件夹ID已存在:', folder.id)
        return false
      }

      // 验证文件夹数据
      if (!this.validateFolder(folder)) {
        console.error('文件夹数据验证失败')
        return false
      }

      this.folders.push(folder)
      await this.saveFolders()
      console.log('文件夹添加成功:', folder.name)
      return true
    } catch (error) {
      console.error('添加文件夹失败:', error)
      return false
    }
  }

  /**
   * 更新文件夹
   * @param {string} id - 文件夹ID
   * @param {Object} updates - 更新数据
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateFolder(id, updates) {
    try {
      const folderIndex = this.folders.findIndex(folder => folder.id === id)
      if (folderIndex === -1) {
        console.error('文件夹不存在:', id)
        return false
      }

      // 合并更新数据
      const updatedFolder = { ...this.folders[folderIndex], ...updates }
      
      // 验证更新后的数据
      if (!this.validateFolder(updatedFolder)) {
        console.error('更新后的文件夹数据验证失败')
        return false
      }

      this.folders[folderIndex] = updatedFolder
      await this.saveFolders()
      console.log('文件夹更新成功:', updatedFolder.name)
      return true
    } catch (error) {
      console.error('更新文件夹失败:', error)
      return false
    }
  }

  /**
   * 删除文件夹
   * @param {string} id - 文件夹ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteFolder(id) {
    try {
      const folderIndex = this.folders.findIndex(folder => folder.id === id)
      if (folderIndex === -1) {
        console.error('文件夹不存在:', id)
        return false
      }

      const deletedFolder = this.folders.splice(folderIndex, 1)[0]
      await this.saveFolders()
      console.log('文件夹删除成功:', deletedFolder.name)
      return true
    } catch (error) {
      console.error('删除文件夹失败:', error)
      return false
    }
  }

  /**
   * 验证文件夹数据
   * @param {Object} folder - 文件夹对象
   * @returns {boolean} 验证是否通过
   */
  validateFolder(folder) {
    // 基本字段验证
    if (!folder.id || !folder.name) {
      console.error('文件夹缺少必要字段: id, name')
      return false
    }

    // 文件夹路径验证
    if (!folder.folderPath || !folder.folderPath.trim()) {
      console.error('folderPath是必需字段')
      return false
    }

    // 标签和演员数组验证
    if (folder.tags && !Array.isArray(folder.tags)) {
      console.error('tags必须是数组')
      return false
    }

    if (folder.actors && !Array.isArray(folder.actors)) {
      console.error('actors必须是数组')
      return false
    }

    return true
  }

  /**
   * 获取包含指定视频的文件夹（基于文件夹路径扫描）
   * @param {string} videoPath - 视频文件路径
   * @returns {Array} 包含该视频的文件夹数组
   */
  getFoldersContainingVideo(videoPath) {
    return this.folders.filter(folder => 
      folder.folderPath && videoPath.startsWith(folder.folderPath)
    )
  }

  /**
   * 从文件夹中移除视频（基于路径匹配）
   * @param {string} videoPath - 视频文件路径
   * @returns {Promise<boolean>} 操作是否成功
   */
  async removeVideoFromFolders(videoPath) {
    try {
      // 由于现在文件夹只存储路径，不需要维护视频ID列表
      // 这个方法保留用于兼容性，但实际不需要做任何操作
      console.log('视频路径移除操作（基于文件夹路径模式，无需操作）:', videoPath)
      return true
    } catch (error) {
      console.error('从文件夹中移除视频失败:', error)
      return false
    }
  }

  /**
   * 清理无效的文件夹路径
   * @param {Array} validPaths - 有效的文件夹路径数组
   * @returns {Promise<boolean>} 操作是否成功
   */
  async cleanupInvalidVideoReferences(validPaths) {
    try {
      let hasChanges = false
      
      this.folders.forEach(folder => {
        if (folder.folderPath && !validPaths.includes(folder.folderPath)) {
          console.log(`文件夹 "${folder.name}" 路径无效: ${folder.folderPath}`)
          // 可以选择删除无效的文件夹，或者标记为无效
          // 这里我们保留文件夹，但记录警告
        }
      })

      if (hasChanges) {
        await this.saveFolders()
        console.log('文件夹路径验证完成')
      }

      return true
    } catch (error) {
      console.error('清理文件夹无效路径失败:', error)
      return false
    }
  }
}

export default FolderManager
