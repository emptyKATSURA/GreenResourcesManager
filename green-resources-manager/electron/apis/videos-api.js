/**
 * ============================================================================
 * 视频 API 模块 (Videos API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供视频资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（videos 表）
 *
 * 路由：
 * - GET    /api/videos       - 获取所有视频
 * - GET    /api/videos/:id   - 获取单个视频
 * - POST   /api/videos       - 创建视频
 * - PUT    /api/videos/:id   - 更新视频
 * - DELETE /api/videos/:id   - 删除视频
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

/**
 * 生成唯一的视频ID
 * @returns {string} 视频ID
 */
function generateVideoId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

/**
 * 注册视频相关的 API 路由
 * @param {Object} router - Express 路由对象
 */
function registerVideosRoutes(router) {
  // GET /api/videos - 获取所有视频
  router.get('/api/videos', async (req, res) => {
    try {
      const videos = await sqlite.getTableResources('videos')
      res.json(videos)
    } catch (error) {
      console.error('获取所有视频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // GET /api/videos/:id - 获取单个视频
  router.get('/api/videos/:id', async (req, res) => {
    try {
      const video = await sqlite.getResourceById('videos', req.params.id)
      if (video) {
        res.json(video)
      } else {
        res.status(404).json({ error: '视频不存在' })
      }
    } catch (error) {
      console.error('获取视频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // POST /api/videos - 创建视频
  router.post('/api/videos', async (req, res) => {
    try {
      // 验证必需字段
      if (!req.body.name) {
        return res.status(400).json({ error: '视频名称不能为空' })
      }

      // 生成ID并构建视频对象
      const newVideo = {
        id: generateVideoId(),
        resourceType: 'movie',
        name: req.body.name,
        description: req.body.description || '',
        series: req.body.series || '',
        tags: req.body.tags || [],
        actors: req.body.actors || [],
        resourcePath: req.body.resourcePath || '',
        thumbnail: req.body.thumbnail || '',
        duration: req.body.duration || 0,
        visitedSessions: req.body.visitedSessions || [],
        addedDate: new Date().toISOString(),
        rating: req.body.rating || 0,
        comment: req.body.comment || '',
        isFavorite: req.body.isFavorite || false
      }

      // 保存到 videos 表
      const saveResult = await sqlite.saveResourceToTable('videos', newVideo)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      // 添加到 videos 页面
      const addResult = await sqlite.addResourceToPage('videos', 'videos', newVideo.id)
      if (!addResult.ok) {
        console.warn('添加视频到页面失败:', addResult.message)
      }

      res.status(201).json(newVideo)
    } catch (error) {
      console.error('创建视频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // PUT /api/videos/:id - 更新视频
  router.put('/api/videos/:id', async (req, res) => {
    try {
      const existingVideo = await sqlite.getResourceById('videos', req.params.id)
      if (!existingVideo) {
        return res.status(404).json({ error: '视频不存在' })
      }

      // 合并更新（保留 id 和 addedDate）
      const updatedVideo = {
        ...existingVideo,
        ...req.body,
        id: existingVideo.id,
        addedDate: existingVideo.addedDate
      }

      const result = await sqlite.saveResourceToTable('videos', updatedVideo)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedVideo)
    } catch (error) {
      console.error('更新视频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE /api/videos/:id - 删除视频
  router.delete('/api/videos/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('videos', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '视频不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除视频失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerVideosRoutes
}
