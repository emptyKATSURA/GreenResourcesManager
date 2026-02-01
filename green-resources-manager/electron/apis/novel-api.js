/**
 * ============================================================================
 * 小说 API 模块 (Novel API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供小说资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（novels 表）
 *
 * 路由：
 * - GET    /api/novels       - 获取所有小说
 * - GET    /api/novels/:id   - 获取单个小说
 * - POST   /api/novels       - 创建小说
 * - PUT    /api/novels/:id   - 更新小说
 * - DELETE /api/novels/:id   - 删除小说
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

function generateNovelId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function registerNovelsRoutes(router) {
  router.get('/api/novels', async (req, res) => {
    try {
      const novels = await sqlite.getTableResources('novels')
      res.json(novels)
    } catch (error) {
      console.error('获取所有小说失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.get('/api/novels/:id', async (req, res) => {
    try {
      const novel = await sqlite.getResourceById('novels', req.params.id)
      if (novel) {
        res.json(novel)
      } else {
        res.status(404).json({ error: '小说不存在' })
      }
    } catch (error) {
      console.error('获取小说失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/api/novels', async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: '小说名称不能为空' })
      }

      const newNovel = {
        id: generateNovelId(),
        resourceType: 'novel',
        name: req.body.name,
        description: req.body.description || '',
        author: req.body.author || '',
        genre: req.body.genre || '',
        tags: req.body.tags || [],
        resourcePath: req.body.resourcePath || '',
        coverPath: req.body.coverPath || '',
        publishYear: req.body.publishYear || '',
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      const saveResult = await sqlite.saveResourceToTable('novels', newNovel)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      const addResult = await sqlite.addResourceToPage('novels', 'novels', newNovel.id)
      if (!addResult.ok) {
        console.warn('添加小说到页面失败:', addResult.message)
      }

      res.status(201).json(newNovel)
    } catch (error) {
      console.error('创建小说失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.put('/api/novels/:id', async (req, res) => {
    try {
      const existingNovel = await sqlite.getResourceById('novels', req.params.id)
      if (!existingNovel) {
        return res.status(404).json({ error: '小说不存在' })
      }

      const updatedNovel = {
        ...existingNovel,
        ...req.body,
        id: existingNovel.id,
        addedDate: existingNovel.addedDate
      }

      const result = await sqlite.saveResourceToTable('novels', updatedNovel)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedNovel)
    } catch (error) {
      console.error('更新小说失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.delete('/api/novels/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('novels', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '小说不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除小说失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerNovelsRoutes
}
