/**
 * SQLite 最小示例：仅用于跑通流程，不涉及业务
 * 使用 better-sqlite3（原生模块，性能更好）
 */

const path = require('path')
const fs = require('fs')

/**
 * 运行 SQLite 流程演示：初始化 -> 建表 -> 插入 -> 查询 -> 关闭
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function runDemo() {
  try {
    const Database = require('better-sqlite3')
    
    // 使用内存数据库（:memory:）进行演示，不涉及文件
    const db = new Database(':memory:')

    // 建表
    db.exec('CREATE TABLE demo (id INTEGER PRIMARY KEY, name TEXT)')
    
    // 插入数据（使用 prepare 和 run）
    const insertStmt = db.prepare('INSERT INTO demo (id, name) VALUES (?, ?)')
    insertStmt.run(1, 'sqlite-demo')
    
    // 查询数据
    const selectStmt = db.prepare('SELECT * FROM demo')
    const rows = selectStmt.all()
    
    // 关闭数据库
    db.close()

    console.log('[SQLite Demo] 流程跑通: 建表 -> 插入 -> 查询 -> 关闭')
    console.log('[SQLite Demo] 查询结果:', rows)
    return { ok: true, message: 'better-sqlite3 流程正常' }
  } catch (err) {
    console.error('[SQLite Demo] 失败:', err.message)
    return { ok: false, message: err.message }
  }
}

module.exports = { runDemo }
