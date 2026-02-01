/**
 * ============================================================================
 * 软件 API 模块 (Software API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供软件资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（software 表）
 *
 * 路由：
 * - GET    /api/software       - 获取所有软件
 * - GET    /api/software/:id   - 获取单个软件
 * - POST   /api/software       - 创建软件
 * - PUT    /api/software/:id   - 更新软件
 * - DELETE /api/software/:id   - 删除软件
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

function generateSoftwareId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function registerSoftwareRoutes(router) {
  router.get('/api/software', async (req, res) => {
    try {
      const software = await sqlite.getTableResources('software')
      res.json(software)
    } catch (error) {
      console.error('获取所有软件失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.get('/api/software/:id', async (req, res) => {
    try {
      const software = await sqlite.getResourceById('software', req.params.id)
      if (software) {
        res.json(software)
      } else {
        res.status(404).json({ error: '软件不存在' })
      }
    } catch (error) {
      console.error('获取软件失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/api/software', async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: '软件名称不能为空' })
      }

      const newSoftware = {
        id: generateSoftwareId(),
        resourceType: 'software',
        name: req.body.name,
        description: req.body.description || '',
        developer: req.body.developer || '',
        tags: req.body.tags || [],
        resourcePath: req.body.resourcePath || '',
        coverPath: req.body.coverPath || '',
        folderSize: req.body.folderSize || 0,
        playTime: req.body.playTime || 0,
        playCount: req.body.playCount || 0,
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      const saveResult = await sqlite.saveResourceToTable('software', newSoftware)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      const addResult = await sqlite.addResourceToPage('software', 'software', newSoftware.id)
      if (!addResult.ok) {
        console.warn('添加软件到页面失败:', addResult.message)
      }

      res.status(201).json(newSoftware)
    } catch (error) {
      console.error('创建软件失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.put('/api/software/:id', async (req, res) => {
    try {
      const existingSoftware = await sqlite.getResourceById('software', req.params.id)
      if (!existingSoftware) {
        return res.status(404).json({ error: '软件不存在' })
      }

      const updatedSoftware = {
        ...existingSoftware,
        ...req.body,
        id: existingSoftware.id,
        addedDate: existingSoftware.addedDate
      }

      const result = await sqlite.saveResourceToTable('software', updatedSoftware)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedSoftware)
    } catch (error) {
      console.error('更新软件失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.delete('/api/software/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('software', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '软件不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除软件失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerSoftwareRoutes
}
