/**
 * 刮削库数据库操作模块
 * 独立的 SQLite 数据库文件：scraper-library.db
 * 存储从主存档导入的固有数据（无 id）
 * 与主存档共用同一 SaveData 目录，确保路径一致
 */

const path = require('path')
const fs = require('fs')

/**
 * 获取刮削库数据库文件路径
 * 使用与主存档相同的 SaveData 目录
 */
function getScraperDbPath() {
  const sqliteDemo = require('./sqlite-demo')
  const saveDataDir = sqliteDemo.getSaveDataDirectory()
  
  // 确保 SaveData 目录存在
  if (!fs.existsSync(saveDataDir)) {
    fs.mkdirSync(saveDataDir, { recursive: true })
    console.log('[ScraperDB] 已创建 SaveData 目录:', saveDataDir)
  }
  
  return path.join(saveDataDir, 'scraper-library.db')
}

/**
 * 确保刮削库表存在
 * 统一表：scraper_items，字段为所有资源类型的并集
 */
function ensureScraperTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scraper_items (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      sourceTable TEXT NOT NULL,
      name TEXT,
      description TEXT,
      resourcePath TEXT,
      coverPath TEXT,
      thumbnail TEXT,
      tags TEXT,
      author TEXT,
      series TEXT,
      developers TEXT,
      developer TEXT,
      publisher TEXT,
      actors TEXT,
      voiceActors TEXT,
      productionTeam TEXT,
      artist TEXT,
      genre TEXT,
      category TEXT,
      publishYear TEXT,
      duration INTEGER,
      pagesCount INTEGER,
      viewCount INTEGER,
      playTime INTEGER,
      playCount INTEGER,
      lastPlayed TEXT,
      firstPlayed TEXT,
      lastViewed TEXT,
      addedDate TEXT,
      rating REAL,
      comment TEXT,
      isFavorite INTEGER,
      folderSize INTEGER,
      engine TEXT,
      importedAt TEXT
    )
  `)
  
  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_scraper_sourceTable ON scraper_items(sourceTable)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_scraper_name ON scraper_items(name)
  `)
}

/**
 * 从主存档导入数据到刮削库
 * @returns {Promise<{ ok: boolean, count?: number, message?: string }>}
 */
async function scraperDbImportFromArchive() {
  try {
    const Database = require('better-sqlite3')
    
    // 1. 打开主存档数据库（只读）
    const mainDbPath = require('./sqlite-demo').getDatabasePath()
    const mainDb = new Database(mainDbPath, { readonly: true })
    
    // 2. 打开刮削库数据库（读写）
    const scraperDbPath = getScraperDbPath()
    const scraperDb = new Database(scraperDbPath)
    ensureScraperTable(scraperDb)
    
    // 3. 资源表列表
    const resourceTables = [
      'games',
      'manga',
      'audio',
      'novel',
      'video',
      'software',
      'website',
      'singleImage',
      'other',
      'videoFolder'
    ]
    
    // 4. 清空刮削库（每次导入前清空，避免重复）
    scraperDb.exec('DELETE FROM scraper_items')
    
    let totalImported = 0
    const importedAt = new Date().toISOString()
    
    // 5. 从各资源表读取并导入
    const transaction = scraperDb.transaction(() => {
      for (const tableName of resourceTables) {
        // 检查表是否存在
        const tableExistsStmt = mainDb.prepare(`
          SELECT name FROM sqlite_master WHERE type='table' AND name=?
        `)
        const tableExists = tableExistsStmt.get(tableName)
        if (!tableExists) {
          console.log(`[ScraperDB] 表 ${tableName} 不存在，跳过`)
          continue
        }
        
        // 读取所有行
        const selectStmt = mainDb.prepare(`SELECT * FROM "${tableName}"`)
        const rows = selectStmt.all()
        
        console.log(`[ScraperDB] 从 ${tableName} 读取 ${rows.length} 条记录`)
        
        // 插入到刮削库（去掉 id）
        for (const row of rows) {
          const { id, ...rest } = row
          
          // 构建插入语句（只插入非 undefined 的字段）
          const fields = ['sourceTable', 'importedAt']
          const values = [tableName, importedAt]
          
          for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) {
              fields.push(key)
              values.push(value)
            }
          }
          
          const placeholders = fields.map(() => '?').join(', ')
          const insertStmt = scraperDb.prepare(`
            INSERT INTO scraper_items (${fields.join(', ')})
            VALUES (${placeholders})
          `)
          
          insertStmt.run(...values)
          totalImported++
        }
      }
    })
    
    transaction()
    
    mainDb.close()
    scraperDb.close()
    
    console.log(`[ScraperDB] 导入完成，共 ${totalImported} 条记录`)
    return { ok: true, count: totalImported }
  } catch (err) {
    console.error('[ScraperDB] 导入失败:', err.message, err.stack)
    return { ok: false, message: err.message }
  }
}

/**
 * 获取刮削库所有数据
 * @returns {Promise<{ ok: boolean, data?: Array<any>, message?: string }>}
 */
async function scraperDbGetAll() {
  try {
    const Database = require('better-sqlite3')
    const scraperDbPath = getScraperDbPath()
    const db = new Database(scraperDbPath)
    ensureScraperTable(db)
    
    const selectStmt = db.prepare('SELECT * FROM scraper_items ORDER BY _id DESC')
    const rows = selectStmt.all()
    
    // 解析 JSON 字段
    const parsedRows = rows.map(row => {
      const parsed = { ...row }
      // 解析可能的 JSON 字段
      const jsonFields = ['tags', 'developers', 'actors', 'voiceActors', 'productionTeam']
      for (const field of jsonFields) {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try {
            parsed[field] = JSON.parse(parsed[field])
          } catch (e) {
            // 保持原值
          }
        }
      }
      // 布尔字段
      if (parsed.isFavorite !== undefined) {
        parsed.isFavorite = parsed.isFavorite === 1
      }
      return parsed
    })
    
    db.close()
    
    return { ok: true, data: parsedRows }
  } catch (err) {
    console.error('[ScraperDB] 获取数据失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 清空刮削库
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function scraperDbClear() {
  try {
    const Database = require('better-sqlite3')
    const scraperDbPath = getScraperDbPath()
    const db = new Database(scraperDbPath)
    ensureScraperTable(db)
    
    db.exec('DELETE FROM scraper_items')
    
    db.close()
    
    return { ok: true }
  } catch (err) {
    console.error('[ScraperDB] 清空失败:', err.message)
    return { ok: false, message: err.message }
  }
}

module.exports = {
  scraperDbImportFromArchive,
  scraperDbGetAll,
  scraperDbClear
}
