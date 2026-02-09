/**
 * 小说管理 Composable
 * 负责小说的 CRUD 操作和数据持久化
 */
import { ref, type Ref } from 'vue'
import { NovelManager } from '../../utils/NovelManager'
import notify from '../../utils/NotificationService'
import type { Novel } from '../../types/novel'

export function useNovelManagement(pageId: string = 'novels') {
  const novels = ref<Novel[]>([])
  const isLoading = ref(false)
  const novelManager = new NovelManager(pageId)

  /**
   * 加载所有小说
   */
  const loadNovels = async (): Promise<void> => {
    try {
      isLoading.value = true
      novels.value = await novelManager.loadNovels()
      console.log('小说数据加载完成:', novels.value.length, '本小说')
    } catch (error: any) {
      console.error('加载小说数据失败:', error)
      notify.toast('error', '加载失败', '无法加载小说列表')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存所有小说
   */
  const saveNovels = async (): Promise<void> => {
    try {
      await novelManager.saveNovels()
    } catch (error) {
      console.error('保存小说失败:', error)
      throw error
    }
  }

  /**
   * 添加小说
   */
  const addNovel = async (novelData: Partial<Novel>): Promise<Novel | null> => {
    try {
      const newNovel = await novelManager.addNovel(novelData)
      if (newNovel) {
        await loadNovels()
        return newNovel
      }
      return null
    } catch (error) {
      console.error('添加小说失败:', error)
      throw error
    }
  }

  /**
   * 更新小说
   */
  const updateNovel = async (id: string, novelData: Partial<Novel>): Promise<void> => {
    try {
      await novelManager.updateNovel(id, novelData)
      await loadNovels()
    } catch (error) {
      console.error('更新小说失败:', error)
      throw error
    }
  }

  /**
   * 删除小说
   */
  const deleteNovel = async (id: string): Promise<void> => {
    try {
      await novelManager.deleteNovel(id)
      await loadNovels()
    } catch (error) {
      console.error('删除小说失败:', error)
      throw error
    }
  }

  /**
   * 检查小说文件存在性
   */
  const checkFileExistence = async (): Promise<void> => {
    console.log('🔍 开始检测小说文件存在性...')
    
    if (!window.electronAPI || !window.electronAPI.checkFileExists) {
      console.log('⚠️ Electron API 不可用，跳过文件存在性检测')
      // 如果API不可用，默认设置为存在
      novels.value.forEach(novel => {
        novel.fileExists = true
      })
      return
    }
    
    let checkedCount = 0
    let missingCount = 0
    
    for (const novel of novels.value) {
      if (!novel.filePath) {
        novel.fileExists = false
        missingCount++
        continue
      }
      
      try {
        const result = await window.electronAPI.checkFileExists(novel.filePath)
        novel.fileExists = result.exists
        console.log(`🔍 检测结果: ${novel.name} - fileExists=${novel.fileExists}`)
        
        if (!result.exists) {
          missingCount++
          console.log(`❌ 小说文件不存在: ${novel.name} - ${novel.filePath}`)
        } else {
          console.log(`✅ 小说文件存在: ${novel.name}`)
        }
      } catch (error) {
        console.error(`❌ 检测小说文件存在性失败: ${novel.name}`, error)
        novel.fileExists = false
        missingCount++
      }
      
      checkedCount++
    }
    
    console.log(`📊 文件存在性检测完成: 检查了 ${checkedCount} 本小说，${missingCount} 个文件不存在`)
  }

  /**
   * 更新小说字数统计
   */
  const updateNovelsWordCount = async (): Promise<void> => {
    for (let novel of novels.value) {
      if (novel.totalWords === 0 && novel.filePath) {
        try {
          console.log('重新计算小说字数:', novel.name)
          const result = await window.electronAPI.readTextFile(novel.filePath)
          if (result.success && result.wordCount > 0) {
            novel.totalWords = result.wordCount
            novel.fileSize = result.fileSize || novel.fileSize
            // 保存更新
            await novelManager.updateNovel(novel.id, {
              totalWords: novel.totalWords,
              fileSize: novel.fileSize
            })
            console.log('字数更新成功:', novel.name, '字数:', novel.totalWords)
          }
        } catch (error) {
          console.error('更新小说字数失败:', novel.name, error)
        }
      }
    }
  }

  /**
   * 更新阅读统计：仅通过 visitedSessions 更新（lastRead 由 getter 从 visitedSessions 推导）
   */
  const updateReadingStats = async (novel: any): Promise<void> => {
    try {
      const now = new Date().toISOString()
      if (!novel.visitedSessions || typeof novel.visitedSessions !== 'object' || !('value' in novel.visitedSessions)) return

      const arr = Array.isArray(novel.visitedSessions.value) ? [...novel.visitedSessions.value] : []
      arr.push(now)
      novel.visitedSessions.value = arr

      const novelId = (novel as any).id?.value ?? (novel as any).id
      await novelManager.updateNovel(novelId, { visitedSessions: arr })

      console.log('阅读统计已更新:', (novel as any).name)
    } catch (error) {
      console.error('更新阅读统计失败:', error)
    }
  }

  /**
   * 分析小说文件
   */
  const analyzeNovelFile = async (filePath: string): Promise<{ totalWords?: number; fileSize?: number; encoding?: string; fileType?: string }> => {
    try {
      // 检测文件类型
      const getFileType = (path: string): 'txt' | 'epub' | 'mobi' => {
        if (!path) return 'txt'
        const ext = path.toLowerCase().substring(path.lastIndexOf('.'))
        if (ext === '.epub') return 'epub'
        if (ext === '.mobi') return 'mobi'
        return 'txt'
      }
      
      const fileType = getFileType(filePath)
      
      if (fileType === 'epub') {
        // EPUB 文件分析
        try {
          const { EpubParser } = await import('../../utils/EpubParser')
          const parser = new EpubParser()
          await parser.loadEpub(filePath)
          const metadata = await parser.getMetadata()
          
          // 获取文件大小
          let fileSize = 0
          if (window.electronAPI && window.electronAPI.getFileStats) {
            const stats = await window.electronAPI.getFileStats(filePath)
            if (stats.success) {
              fileSize = stats.size || 0
            }
          }
          
          parser.destroy()
          
          return {
            totalWords: metadata.totalWords || 0,
            fileSize: fileSize,
            encoding: 'utf-8',
            fileType: 'epub'
          }
        } catch (error) {
          console.error('分析 EPUB 文件失败:', error)
          return { fileType: 'epub' }
        }
      } else {
        // TXT 文件分析（原有逻辑）
        if (window.electronAPI && window.electronAPI.readTextFile) {
          const result = await window.electronAPI.readTextFile(filePath)
          if (result.success && result.content) {
            return {
              totalWords: result.wordCount || 0,
              fileSize: result.fileSize || 0,
              encoding: result.encoding || 'utf-8',
              fileType: fileType
            }
          }
        }
        return { fileType: fileType }
      }
    } catch (error) {
      console.error('分析文件失败:', error)
      return {}
    }
  }

  /**
   * 获取小说管理器实例
   */
  const getNovelManager = () => {
    return novelManager
  }

  return {
    novels,
    isLoading,
    loadNovels,
    saveNovels,
    addNovel,
    updateNovel,
    deleteNovel,
    checkFileExistence,
    updateNovelsWordCount,
    updateReadingStats,
    analyzeNovelFile,
    getNovelManager
  }
}

