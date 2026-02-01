/**
 * ============================================================================
 * 漫画 API 模块 (Manga API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供漫画资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（images 表）
 *
 * 路由：
 * - GET    /api/manga       - 获取所有漫画
 * - GET    /api/manga/:id   - 获取单个漫画
 * - POST   /api/manga       - 创建漫画
 * - PUT    /api/manga/:id   - 更新漫画
 * - DELETE /api/manga/:id   - 删除漫画
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

/**
 * 生成唯一的漫画ID
 * @returns {string} 漫画ID
 */
function generateMangaId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

/**
 * 注册漫画相关的 API 路由
 * @param {Object} router - Express 路由对象
 */
function registerMangaRoutes(router) {
  // GET /api/manga - 获取所有漫画
  router.get('/api/manga', async (req, res) => {
    try {
      const manga = await sqlite.getTableResources('images')
      res.json(manga)
    } catch (error) {
      console.error('获取所有漫画失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // GET /api/manga/:id - 获取单个漫画
  router.get('/api/manga/:id', async (req, res) => {
    try {
      const manga = await sqlite.getResourceById('images', req.params.id)
      if (manga) {
        res.json(manga)
      } else {
        res.status(404).json({ error: '漫画不存在' })
      }
    } catch (error) {
      console.error('获取漫画失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // POST /api/manga - 创建漫画
  router.post('/api/manga', async (req, res) => {
    try {
      // 验证必需字段
      if (!req.body.name) {
        return res.status(400).json({ error: '漫画名称不能为空' })
      }

      // 生成ID并构建漫画对象
      const newManga = {
        id: generateMangaId(),
        resourceType: 'manga',
        name: req.body.name,
        description: req.body.description || '',
        author: req.body.author || '',
        tags: req.body.tags || [],
        resourcePath: req.body.resourcePath || '',
        coverPath: req.body.coverPath || '',
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      // 保存到 images 表
      const saveResult = await sqlite.saveResourceToTable('images', newManga)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      // 添加到 images 页面
      const addResult = await sqlite.addResourceToPage('images', 'images', newManga.id)
      if (!addResult.ok) {
        console.warn('添加漫画到页面失败:', addResult.message)
      }

      res.status(201).json(newManga)
    } catch (error) {
      console.error('创建漫画失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // PUT /api/manga/:id - 更新漫画
  router.put('/api/manga/:id', async (req, res) => {
    try {
      const existingManga = await sqlite.getResourceById('images', req.params.id)
      if (!existingManga) {
        return res.status(404).json({ error: '漫画不存在' })
      }

      // 合并更新（保留 id 和 addedDate）
      const updatedManga = {
        ...existingManga,
        ...req.body,
        id: existingManga.id,
        addedDate: existingManga.addedDate
      }

      const result = await sqlite.saveResourceToTable('images', updatedManga)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedManga)
    } catch (error) {
      console.error('更新漫画失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE /api/manga/:id - 删除漫画
  router.delete('/api/manga/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('images', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '漫画不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除漫画失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerMangaRoutes
}
