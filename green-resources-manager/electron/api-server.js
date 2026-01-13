/**
 * ============================================================================
 * HTTP API 服务器模块 (HTTP API Server)
 * ============================================================================
 * 
 * 功能说明：
 * 本模块负责启动和管理 HTTP API 服务器，提供 RESTful API 服务。
 * 
 * 架构说明：
 * - 服务器启动和管理逻辑在此模块
 * - 具体的 API 路由定义在各个资源类型的 API 模块中（apis/ 目录）
 * - 通过 apis/index.js 统一注册所有路由
 * 
 * 导出的函数：
 * - startHttpServer()  - 启动 HTTP API 服务器
 * - stopHttpServer()   - 停止 HTTP API 服务器
 * 
 * ============================================================================
 */

const express = require('express')
const { registerAllRoutes } = require('./apis')

// HTTP 服务器实例
let httpServer = null

/**
 * 启动 HTTP API 服务器
 */
function startHttpServer() {
  const port = 8765
  const apiApp = express()
  
  // 设置 JSON 解析中间件
  apiApp.use(express.json())
  
  // 设置 CORS 头（允许本地访问）
  apiApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
  })
  
  // 处理 GET 请求 - 根路径
  apiApp.get('/', (req, res) => {
    res.send('hello')
  })
  
  // 注册所有 API 路由
  registerAllRoutes(apiApp)
  
  // 启动服务器
  httpServer = apiApp.listen(port, '127.0.0.1', () => {
    console.log(`✅ HTTP API 服务器已启动: http://127.0.0.1:${port}`)
  })
  
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ HTTP API 服务器启动失败: 端口 ${port} 已被占用`)
    } else {
      console.error('❌ HTTP API 服务器错误:', err)
    }
  })
}

/**
 * 停止 HTTP API 服务器
 */
function stopHttpServer() {
  if (httpServer) {
    httpServer.close(() => {
      console.log('✅ HTTP API 服务器已关闭')
    })
    httpServer = null
  }
}

module.exports = {
  startHttpServer,
  stopHttpServer
}
