/**
 * ============================================================================
 * 游戏 API 模块 (Games API)
 * ============================================================================
 * 
 * 功能说明：
 * 本模块提供游戏资源相关的 REST API 路由处理。
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

const fs = require('fs')
const path = require('path')
const { app } = require('electron')
const fileUtils = require('../utils/file-utils')

/**
 * 获取 SaveData 目录路径
 * @returns {string} SaveData 目录路径
 */
function getSaveDataDirectory() {
  try {
    // 先尝试从设置文件读取自定义路径
    const defaultSaveDataPath = path.join(process.cwd(), 'SaveData')
    const settingsPath = path.join(defaultSaveDataPath, 'Settings', 'settings.json')
    
    if (fs.existsSync(settingsPath)) {
      try {
        const settingsData = fs.readFileSync(settingsPath, 'utf8')
        const settings = JSON.parse(settingsData)
        
        if (settings.settings && settings.settings.saveDataLocation === 'custom' && settings.settings.saveDataPath) {
          // 使用自定义路径
          const customPath = path.join(settings.settings.saveDataPath, 'SaveData')
          console.log('使用自定义 SaveData 路径:', customPath)
          return customPath
        }
      } catch (error) {
        console.warn('读取设置文件失败，使用默认路径:', error)
      }
    }
    
    // 尝试使用 app.getAppPath() 获取应用路径
    try {
      const appPath = app.getAppPath()
      const appSaveDataPath = path.join(appPath, 'SaveData')
      if (fs.existsSync(appSaveDataPath)) {
        return appSaveDataPath
      }
      // 尝试应用路径的上级目录
      const parentSaveDataPath = path.join(appPath, '..', 'SaveData')
      if (fs.existsSync(parentSaveDataPath)) {
        return parentSaveDataPath
      }
    } catch (error) {
      console.warn('使用 app.getAppPath() 获取路径失败，使用默认路径:', error)
    }
    
    // 使用默认路径
    return defaultSaveDataPath
  } catch (error) {
    console.error('获取 SaveData 路径失败:', error)
    return path.join(process.cwd(), 'SaveData')
  }
}

/**
 * 获取所有游戏数据
 * @returns {Promise<Array>} 游戏数组
 */
async function getAllGames() {
  const saveDataDir = getSaveDataDirectory()
  const gamesFilePath = path.join(saveDataDir, 'Game', 'games.json')
  
  // 检查文件是否存在
  if (!fs.existsSync(gamesFilePath)) {
    return []
  }
  
  // 读取游戏数据文件
  const result = await fileUtils.readJsonFile(gamesFilePath)
  if (!result.success) {
    throw new Error(result.error || '读取游戏数据失败')
  }
  
  // 提取 games 数组
  return result.data?.games || []
}

/**
 * 根据ID获取单个游戏
 * @param {string} gameId - 游戏ID
 * @returns {Promise<Object|null>} 游戏对象，如果不存在则返回null
 */
async function getGameById(gameId) {
  const games = await getAllGames()
  return games.find(game => game.id === gameId) || null
}

/**
 * 保存游戏数据到文件
 * @param {Array} games - 游戏数组
 * @returns {Promise<boolean>} 保存是否成功
 */
async function saveGames(games) {
  const saveDataDir = getSaveDataDirectory()
  const gamesDir = path.join(saveDataDir, 'Game')
  const gamesFilePath = path.join(gamesDir, 'games.json')
  
  // 确保目录存在
  if (!fs.existsSync(gamesDir)) {
    fs.mkdirSync(gamesDir, { recursive: true })
  }
  
  // 准备保存的数据格式
  const data = {
    games: games,
    timestamp: new Date().toISOString(),
    version: '0.0.0' // 可以根据需要从应用版本获取
  }
  
  // 保存到文件
  const result = await fileUtils.writeJsonFile(gamesFilePath, data)
  if (!result.success) {
    throw new Error(result.error || '保存游戏数据失败')
  }
  
  return true
}

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
      const games = await getAllGames()
      res.json(games)
    } catch (error) {
      console.error('获取所有游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // GET /api/games/:id - 获取单个游戏
  router.get('/api/games/:id', async (req, res) => {
    try {
      const game = await getGameById(req.params.id)
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
      const games = await getAllGames()
      
      // 验证必需字段
      if (!req.body.name) {
        return res.status(400).json({ error: '游戏名称不能为空' })
      }
      
      // 生成ID
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
        isFavorite: req.body.isFavorite || false
      }
      
      // 添加到数组
      games.push(newGame)
      
      // 保存到文件
      await saveGames(games)
      
      // 返回创建的游戏（201 Created）
      res.status(201).json(newGame)
    } catch (error) {
      console.error('创建游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // PUT /api/games/:id - 更新游戏
  router.put('/api/games/:id', async (req, res) => {
    try {
      const games = await getAllGames()
      const gameIndex = games.findIndex(game => game.id === req.params.id)
      
      if (gameIndex === -1) {
        return res.status(404).json({ error: '游戏不存在' })
      }
      
      // 更新游戏数据（保留ID和addedDate，更新其他字段）
      const existingGame = games[gameIndex]
      const updatedGame = {
        ...existingGame,
        ...req.body,
        id: existingGame.id, // 不允许修改ID
        addedDate: existingGame.addedDate // 不允许修改添加日期
      }
      
      games[gameIndex] = updatedGame
      
      // 保存到文件
      await saveGames(games)
      
      // 返回更新后的游戏
      res.json(updatedGame)
    } catch (error) {
      console.error('更新游戏失败:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // DELETE /api/games/:id - 删除游戏
  router.delete('/api/games/:id', async (req, res) => {
    try {
      const games = await getAllGames()
      const gameIndex = games.findIndex(game => game.id === req.params.id)
      
      if (gameIndex === -1) {
        return res.status(404).json({ error: '游戏不存在' })
      }
      
      // 从数组中删除
      games.splice(gameIndex, 1)
      
      // 保存到文件
      await saveGames(games)
      
      // 返回 204 No Content
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
