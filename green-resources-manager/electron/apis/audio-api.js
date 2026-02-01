/**
 * ============================================================================
 * 音频 API 模块 (Audio API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供音频资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（audio 表）
 *
 * 路由：
 * - GET    /api/audio       - 获取所有音频
 * - GET    /api/audio/:id   - 获取单个音频
 * - POST   /api/audio       - 创建音频
 * - PUT    /api/audio/:id   - 更新音频
 * - DELETE /api/audio/:id   - 删除音频
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

/**
 * 生成唯一的音频ID
 * @returns {string} 音频ID
 */
function generateAudioId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

/**
 * 注册音频相关的 API 路由
 * @param {Object} router - Express 路由对象
 */
function registerAudioRoutes(router) {
  // GET /api/audio - 获取所有音频
  router.get('/api/audio', async (req, res) => {
    try {
      const audio = await sqlite.getTableResources('audio')
      res.json(audio)
    } catch (error) {
      console.error('获取所有音频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // GET /api/audio/:id - 获取单个音频
  router.get('/api/audio/:id', async (req, res) => {
    try {
      const audio = await sqlite.getResourceById('audio', req.params.id)
      if (audio) {
        res.json(audio)
      } else {
        res.status(404).json({ error: '音频不存在' })
      }
    } catch (error) {
      console.error('获取音频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // POST /api/audio - 创建音频
  router.post('/api/audio', async (req, res) => {
    try {
      // 验证必需字段
      if (!req.body.name) {
        return res.status(400).json({ error: '音频名称不能为空' })
      }

      // 生成ID并构建音频对象
      const newAudio = {
        id: generateAudioId(),
        resourceType: 'audio',
        name: req.body.name,
        description: req.body.description || '',
        artist: req.body.artist || '',
        tags: req.body.tags || [],
        actors: req.body.actors || [],
        resourcePath: req.body.resourcePath || '',
        coverPath: req.body.coverPath || '',
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      // 保存到 audio 表
      const saveResult = await sqlite.saveResourceToTable('audio', newAudio)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      // 添加到 audio 页面
      const addResult = await sqlite.addResourceToPage('audio', 'audio', newAudio.id)
      if (!addResult.ok) {
        console.warn('添加音频到页面失败:', addResult.message)
      }

      res.status(201).json(newAudio)
    } catch (error) {
      console.error('创建音频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // PUT /api/audio/:id - 更新音频
  router.put('/api/audio/:id', async (req, res) => {
    try {
      const existingAudio = await sqlite.getResourceById('audio', req.params.id)
      if (!existingAudio) {
        return res.status(404).json({ error: '音频不存在' })
      }

      // 合并更新（保留 id 和 addedDate）
      const updatedAudio = {
        ...existingAudio,
        ...req.body,
        id: existingAudio.id,
        addedDate: existingAudio.addedDate
      }

      const result = await sqlite.saveResourceToTable('audio', updatedAudio)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedAudio)
    } catch (error) {
      console.error('更新音频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE /api/audio/:id - 删除音频
  router.delete('/api/audio/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('audio', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '音频不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除音频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerAudioRoutes
}
