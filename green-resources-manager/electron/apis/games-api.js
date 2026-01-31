/**
 * ============================================================================
 * 游戏 API 模块 (Games API)
 * ============================================================================
 *
 * 功能说明：
 * 本模块提供游戏资源相关的 REST API 路由处理。
 * 数据存储：SQLite 数据库（games 表 + games_page 页面索引）
 *
 * 路由：
 * - GET    /api/games       - 获取所有游戏
 * - GET    /api/games/:id   - 获取单个游戏
 * - POST   /api/games       - 创建游戏
 * - PUT    /api/games/:id   - 更新游戏
 * - DELETE /api/games/:id   - 删除游戏
 *
 * ============================================================================
 */

const sqlite = require('../database/sqlite')

/**
 * 生成唯一的游戏ID
 * @returns {string} 游戏ID
 */
function generateGameId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

/**
 * 注册游戏相关的 API 路由
 * @param {Object} router - Express 路由对象
 */
function registerGamesRoutes(router) {
  // GET /api/games - 获取所有游戏
  router.get('/api/games', async (req, res) => {
    try {
      const games = await sqlite.getTableResources('games')
      res.json(games)
    } catch (error) {
      console.error('获取所有游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // GET /api/games/:id - 获取单个游戏
  router.get('/api/games/:id', async (req, res) => {
    try {
      const game = await sqlite.getResourceById('games', req.params.id)
      if (game) {
        res.json(game)
      } else {
        res.status(404).json({ error: '游戏不存在' })
      }
    } catch (error) {
      console.error('获取游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // POST /api/games - 创建游戏
  router.post('/api/games', async (req, res) => {
    try {
      // 验证必需字段
      if (!req.body.name) {
        return res.status(400).json({ error: '游戏名称不能为空' })
      }

      // 生成ID并构建游戏对象
      const newGame = {
        id: generateGameId(),
        name: req.body.name,
        description: req.body.description || '',
        developer: req.body.developer || '',
        publisher: req.body.publisher || '',
        tags: req.body.tags || [],
        engine: req.body.engine || '',
        executablePath: req.body.executablePath || '',
        coverPath: req.body.coverPath || '',
        folderSize: req.body.folderSize || 0,
        playTime: req.body.playTime || 0,
        playCount: req.body.playCount || 0,
        lastPlayed: req.body.lastPlayed || null,
        firstPlayed: req.body.firstPlayed || null,
        addedDate: new Date().toISOString(),
        fileExists: req.body.fileExists !== undefined ? req.body.fileExists : true,
        isArchive: req.body.isArchive || false,
        rating: req.body.rating,
        comment: req.body.comment,
        isFavorite: req.body.isFavorite || false,
        resourceType: 'game'
      }

      // 保存到 games 表
      const saveResult = await sqlite.saveResourceToTable('games', newGame)
      if (!saveResult.ok) {
        return res.status(500).json({ error: saveResult.message })
      }

      // 添加到 games 页面
      const addResult = await sqlite.addResourceToPage('games', 'games', newGame.id)
      if (!addResult.ok) {
        // 已保存到表，页面索引失败不影响创建
        console.warn('添加游戏到页面失败:', addResult.message)
      }

      res.status(201).json(newGame)
    } catch (error) {
      console.error('创建游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // PUT /api/games/:id - 更新游戏
  router.put('/api/games/:id', async (req, res) => {
    try {
      const existingGame = await sqlite.getResourceById('games', req.params.id)
      if (!existingGame) {
        return res.status(404).json({ error: '游戏不存在' })
      }

      // 合并更新（保留 id 和 addedDate）
      const updatedGame = {
        ...existingGame,
        ...req.body,
        id: existingGame.id,
        addedDate: existingGame.addedDate
      }

      const result = await sqlite.saveResourceToTable('games', updatedGame)
      if (!result.ok) {
        return res.status(500).json({ error: result.message })
      }

      res.json(updatedGame)
    } catch (error) {
      console.error('更新游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // DELETE /api/games/:id - 删除游戏
  router.delete('/api/games/:id', async (req, res) => {
    try {
      const result = await sqlite.deleteResourceFromTable('games', req.params.id)
      if (!result.ok) {
        return res.status(404).json({ error: result.message || '游戏不存在' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('删除游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
}

module.exports = {
  registerGamesRoutes
}
