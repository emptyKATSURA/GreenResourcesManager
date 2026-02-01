/**
 * ============================================================================
 * 网站 API 模块 (Website API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供网站资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（websites 表）
 *
 * 路由：
 * - GET    /api/websites       - 获取所有网站
 * - GET    /api/websites/:id   - 获取单个网站
 * - POST   /api/websites       - 创建网站
 * - PUT    /api/websites/:id   - 更新网站
 * - DELETE /api/websites/:id   - 删除网站
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

function generateWebsiteId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function registerWebsitesRoutes(router) {
  router.get('/api/websites', async (req, res) => {
    try {
      const websites = await sqlite.getTableResources('websites')
      res.json(websites)
    } catch (error) {
      console.error('获取所有网站失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.get('/api/websites/:id', async (req, res) => {
    try {
      const website = await sqlite.getResourceById('websites', req.params.id)
      if (website) {
        res.json(website)
      } else {
        res.status(404).json({ error: '网站不存在' })
      }
    } catch (error) {
      console.error('获取网站失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/api/websites', async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: '网站名称不能为空' })
      }

      const newWebsite = {
        id: generateWebsiteId(),
        resourceType: 'website',
        name: req.body.name,
        description: req.body.description || '',
        resourcePath: req.body.resourcePath || '',
        tags: req.body.tags || [],
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      const saveResult = await sqlite.saveResourceToTable('websites', newWebsite)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      const addResult = await sqlite.addResourceToPage('websites', 'websites', newWebsite.id)
      if (!addResult.ok) {
        console.warn('添加网站到页面失败:', addResult.message)
      }

      res.status(201).json(newWebsite)
    } catch (error) {
      console.error('创建网站失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.put('/api/websites/:id', async (req, res) => {
    try {
      const existingWebsite = await sqlite.getResourceById('websites', req.params.id)
      if (!existingWebsite) {
        return res.status(404).json({ error: '网站不存在' })
      }

      const updatedWebsite = {
        ...existingWebsite,
        ...req.body,
        id: existingWebsite.id,
        addedDate: existingWebsite.addedDate
      }

      const result = await sqlite.saveResourceToTable('websites', updatedWebsite)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedWebsite)
    } catch (error) {
      console.error('更新网站失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.delete('/api/websites/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('websites', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '网站不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除网站失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerWebsitesRoutes
}
