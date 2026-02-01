/**
 * ============================================================================
 * API 路由注册模块 (API Routes Registry)
 * ============================================================================
 * 
 * 功能说明：
 * 本模块负责注册所有资源类型的 API 路由到 Express 应用。
 * 
 * 使用方式：
 * 1. 引入各个资源类型的 API 模块
 * 2. 调用 registerAllRoutes() 注册所有路由
 * 
 * 扩展说明：
 * 当需要添加新的资源类型 API（如漫画、声音等）时：
 * 1. 在 apis/ 目录下创建新的 API 文件（如 comics-api.js、audio-api.js）
 * 2. 在新文件中实现对应的路由注册函数（如 registerComicsRoutes）
 * 3. 在此文件中引入新模块并调用注册函数
 * 
 * ============================================================================
 */

const gamesApi = require('./games-api')
const mangaApi = require('./manga-api')
const videosApi = require('./videos-api')
const audioApi = require('./audio-api')
const novelsApi = require('./novel-api')
const websitesApi = require('./website-api')
const softwareApi = require('./software-api')

/**
 * 注册所有 API 路由到 Express 应用
 * @param {Object} app - Express 应用实例
 */
function registerAllRoutes(app) {
  // 注册游戏 API 路由
  gamesApi.registerGamesRoutes(app)
  
  // 注册漫画 API 路由
  mangaApi.registerMangaRoutes(app)
  
  // 注册视频 API 路由
  videosApi.registerVideosRoutes(app)
  
  // 注册音频 API 路由
  audioApi.registerAudioRoutes(app)
  
  // 注册小说 API 路由
  novelsApi.registerNovelsRoutes(app)
  
  // 注册网站 API 路由
  websitesApi.registerWebsitesRoutes(app)
  
  // 注册软件 API 路由
  softwareApi.registerSoftwareRoutes(app)
}

module.exports = {
  registerAllRoutes
}
