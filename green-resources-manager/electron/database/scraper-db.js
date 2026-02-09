/**
 * 刮削库数据库操作模块
 * 独立的 SQLite 数据库文件：scraper-library.db
 * 每个资源类型一张表，结构：_id, jsonData, updateTime, author
 * 与主存档共用同一 SaveData 目录，确保路径一致
 */

const path = require('path')
const fs = require('fs')

const RESOURCE_TABLES = [
  'games', 'manga', 'audio', 'novel', 'video',
  'software', 'website', 'singleImage', 'other', 'videoFolder'
]

/**
 * 获取刮削库数据库文件路径
 * 使用与主存档相同的 SaveData 目录
 */
function getScraperDbPath() {
  const sqliteDemo = require('./sqlite')
  const saveDataDir = sqliteDemo.getSaveDataDirectory()
  
  if (!fs.existsSync(saveDataDir)) {
    fs.mkdirSync(saveDataDir, { recursive: true })
    console.log('[ScraperDB] 已创建 SaveData 目录:', saveDataDir)
  }
  
  return path.join(saveDataDir, 'scraper-library.db')
}

/**
 * 确保刮削库表存在
 * 每个资源类型一张表：_id, jsonData, updateTime, author
 */
function ensureScraperTables(db) {
  for (const tableName of RESOURCE_TABLES) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        _id INTEGER PRIMARY KEY AUTOINCREMENT,
        jsonData TEXT NOT NULL,
        updateTime TEXT NOT NULL,
        author TEXT
      )
    `)
  }
}

/**
 * 将待写入刮削库的对象中的 resourcePath 按表类型处理：
 * - website：完整保留 resourcePath（URL），不替换
 * - 其它：不保存完整路径，替换为 resourceFileName、resourceFolderName
 *   - 资源为文件时：fileName=文件名，folderName=所在文件夹名
 *   - 资源为文件夹时：fileName=路径最后一段（资源文件夹名），folderName=父文件夹名
 * @param {object} data 待写入的对象
 * @param {string} tableName 表名，用于判断是否为 website
 */
function replaceResourcePathWithFileNameAndFolder(data, tableName) {
  if (!data || typeof data.resourcePath === 'undefined') return data
  // 网站类：resourcePath 为 URL，完整保存
  if (tableName === 'website') return data
  const fullPath = String(data.resourcePath || '').trim()
  const fileName = fullPath ? path.basename(fullPath) : ''
  const dirPath = fullPath ? path.dirname(fullPath) : ''
  const folderName = dirPath ? path.basename(dirPath) : ''
  const { resourcePath, ...rest } = data
  return { ...rest, resourceFileName: fileName, resourceFolderName: folderName }
}

/**
 * 从主存档导入数据到刮削库
 * 每资源一表，每行：_id, jsonData, updateTime, author
 * resourcePath 不写入刮削库，改为写入 resourceFileName、resourceFolderName
 * @param {Record<string, string[]>} [scrapableFieldsByTable] 各表可刮削字段名列表；若提供则只保存这些字段，否则保存除 id 外全部
 * @param {string} [sourceDbPath] 存档数据库路径；若提供则从该文件读取，否则从默认主存档路径读取
 * @returns {Promise<{ ok: boolean, count?: number, message?: string }>}
 */
async function scraperDbImportFromArchive(scrapableFieldsByTable, sourceDbPath) {
  try {
    const Database = require('better-sqlite3')
    
    const mainDbPath = sourceDbPath && typeof sourceDbPath === 'string' && fs.existsSync(sourceDbPath)
      ? sourceDbPath
      : require('./sqlite').getDatabasePath()
    const mainDb = new Database(mainDbPath, { readonly: true })
    
    const scraperDbPath = getScraperDbPath()
    const scraperDb = new Database(scraperDbPath)
    ensureScraperTables(scraperDb)
    
    const updateTime = new Date().toISOString()
    let totalImported = 0

    // 从 user 表读取当前用户名，作为导入数据的 author
    let userName = null
    try {
      const userRow = mainDb.prepare('SELECT user_data FROM user WHERE id = ?').get('main')
      if (userRow?.user_data) {
        const userData = JSON.parse(userRow.user_data)
        userName = userData?.name ? String(userData.name).trim() || null : null
      }
    } catch (e) {
      console.warn('[ScraperDB] 读取 user 表失败，author 将为空:', e?.message)
    }
    
    const transaction = scraperDb.transaction(() => {
      for (const tableName of RESOURCE_TABLES) {
        scraperDb.exec(`DELETE FROM "${tableName}"`)
        
        const tableExists = mainDb.prepare(`
          SELECT name FROM sqlite_master WHERE type='table' AND name=?
        `).get(tableName)
        if (!tableExists) {
          console.log(`[ScraperDB] 主存档表 ${tableName} 不存在，跳过`)
          continue
        }
        
        const rows = mainDb.prepare(`SELECT id, jsonData FROM "${tableName}"`).all()
        console.log(`[ScraperDB] 从 ${tableName} 读取 ${rows.length} 条记录`)
        
        const allowedKeys = scrapableFieldsByTable && Array.isArray(scrapableFieldsByTable[tableName])
          ? scrapableFieldsByTable[tableName]
          : null
        
        const insertStmt = scraperDb.prepare(`
          INSERT INTO "${tableName}" (jsonData, updateTime, author)
          VALUES (?, ?, ?)
        `)
        
        for (const row of rows) {
          let dataToSave
          try {
            dataToSave = row.jsonData ? JSON.parse(row.jsonData) : {}
          } catch {
            dataToSave = {}
          }
          dataToSave.id = row.id
          if (allowedKeys && allowedKeys.length > 0) {
            const filtered = {}
            for (const key of allowedKeys) {
              if (key in dataToSave) filtered[key] = dataToSave[key]
            }
            dataToSave = filtered
          }
          dataToSave = replaceResourcePathWithFileNameAndFolder(dataToSave, tableName)
          const jsonData = JSON.stringify(dataToSave)
          insertStmt.run(jsonData, updateTime, userName)
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
 * 直接返回原始数据，不做任何转换（jsonData 保持为字符串）
 * @returns {Promise<{ ok: boolean, data?: Array<any>, message?: string }>}
 */
async function scraperDbGetAll() {
  try {
    const Database = require('better-sqlite3')
    const scraperDbPath = getScraperDbPath()
    const db = new Database(scraperDbPath)
    ensureScraperTables(db)
    
    const allRows = []
    for (const tableName of RESOURCE_TABLES) {
      const rows = db.prepare(`SELECT _id, jsonData, updateTime, author FROM "${tableName}" ORDER BY _id DESC`).all()
      for (const row of rows) {
        allRows.push({
          _id: row._id,
          sourceTable: tableName,
          updateTime: row.updateTime,
          author: row.author,
          jsonData: row.jsonData
        })
      }
    }
    
    allRows.sort((a, b) => (b.updateTime || '').localeCompare(a.updateTime || ''))
    db.close()
    return { ok: true, data: allRows }
  } catch (err) {
    console.error('[ScraperDB] 获取数据失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 搜索刮削库：按同名或同文件夹匹配
 * @param {string} sourceTable - 资源表名（games, novel, video 等）
 * @param {string} name - 资源名称
 * @param {string} resourcePath - 资源路径（用于提取文件夹）
 * @returns {Promise<{ ok: boolean, matches?: Array<{ _id, sourceTable, updateTime, author, jsonData }>, message?: string }>}
 */
async function scraperDbSearch(sourceTable, name, resourcePath) {
  try {
    const Database = require('better-sqlite3')
    const scraperDbPath = getScraperDbPath()
    const db = new Database(scraperDbPath)
    ensureScraperTables(db)

    if (!RESOURCE_TABLES.includes(sourceTable)) {
      db.close()
      return { ok: false, message: `无效的资源表: ${sourceTable}` }
    }

    const rows = db.prepare(`SELECT _id, jsonData, updateTime, author FROM "${sourceTable}"`).all()
    const nameNorm = (name || '').trim().toLowerCase()
    const itemDir = resourcePath ? path.dirname(path.normalize(resourcePath)).toLowerCase().replace(/\\/g, '/') : ''

    const matches = []
    for (const row of rows) {
      let data
      try {
        data = JSON.parse(row.jsonData)
      } catch (e) {
        continue
      }
      const scrapedName = (data.name || '').trim().toLowerCase()
      const scrapedPath = data.resourcePath || data.executablePath || data.filePath || ''
      const scrapedDir = scrapedPath ? path.dirname(path.normalize(scrapedPath)).toLowerCase().replace(/\\/g, '/') : ''

      const matchByName = nameNorm && scrapedName && nameNorm === scrapedName
      const matchByFolder = itemDir && scrapedDir && itemDir === scrapedDir

      if (matchByName || matchByFolder) {
        matches.push({
          _id: row._id,
          sourceTable,
          updateTime: row.updateTime,
          author: row.author,
          jsonData: row.jsonData,
          matchType: matchByName && matchByFolder ? 'name+folder' : matchByName ? 'name' : 'folder'
        })
      }
    }

    db.close()
    return { ok: true, matches }
  } catch (err) {
    console.error('[ScraperDB] 搜索失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 将刮削数据应用到主存档的指定资源（仅补全空字段）
 * @param {string} sourceTable - 资源表名
 * @param {number} mainResourceId - 主存档资源 id
 * @param {string} jsonData - 刮削库的 jsonData 字符串
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function scraperDbApplyToResource(sourceTable, mainResourceId, jsonData) {
  try {
    const Database = require('better-sqlite3')
    const mainDbPath = require('./sqlite').getDatabasePath()
    const db = new Database(mainDbPath)

    if (!RESOURCE_TABLES.includes(sourceTable)) {
      db.close()
      return { ok: false, message: `无效的资源表: ${sourceTable}` }
    }

    let scraped
    try {
      scraped = JSON.parse(jsonData)
    } catch (e) {
      db.close()
      return { ok: false, message: '解析刮削数据失败' }
    }

    const row = db.prepare(`SELECT id, jsonData FROM "${sourceTable}" WHERE id = ?`).get(mainResourceId)
    if (!row) {
      db.close()
      return { ok: false, message: '未找到主存档资源' }
    }

    let current
    try {
      current = row.jsonData ? JSON.parse(row.jsonData) : {}
    } catch {
      current = {}
    }
    const scraperOnlyKeys = ['resourceFileName', 'resourceFolderName']
    let hasUpdate = false
    for (const [key, value] of Object.entries(scraped)) {
      if (key === 'id' || scraperOnlyKeys.includes(key)) continue
      const currentVal = current[key]
      const isEmpty = currentVal === null || currentVal === undefined || currentVal === ''
      if (isEmpty && value !== null && value !== undefined && value !== '') {
        current[key] = value
        hasUpdate = true
      }
    }
    if (!hasUpdate) {
      db.close()
      return { ok: true, message: '无需更新（主存档已有完整数据）' }
    }
    db.prepare(`UPDATE "${sourceTable}" SET jsonData = ? WHERE id = ?`).run(JSON.stringify(current), mainResourceId)
    db.close()
    return { ok: true }
  } catch (err) {
    console.error('[ScraperDB] 应用刮削数据失败:', err.message)
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
    ensureScraperTables(db)
    
    for (const tableName of RESOURCE_TABLES) {
      db.exec(`DELETE FROM "${tableName}"`)
    }
    
    db.close()
    return { ok: true }
  } catch (err) {
    console.error('[ScraperDB] 清空失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 从指定路径读取外部刮削库数据（格式与 getAll 一致）
 * @param {string} dbPath - 外部 .db 文件路径
 * @returns {Promise<{ ok: boolean, data?: Array<{ _id, sourceTable, updateTime, author, jsonData }>, message?: string }>}
 */
async function scraperDbReadExternal(dbPath) {
  if (!dbPath || typeof dbPath !== 'string') {
    return { ok: false, message: '未指定数据库路径' }
  }
  try {
    const Database = require('better-sqlite3')
    if (!fs.existsSync(dbPath)) {
      return { ok: false, message: '文件不存在' }
    }
    const db = new Database(dbPath, { readonly: true })
    const allRows = []
    for (const tableName of RESOURCE_TABLES) {
      try {
        const rows = db.prepare(`SELECT _id, jsonData, updateTime, author FROM "${tableName}" ORDER BY _id DESC`).all()
        for (const row of rows) {
          allRows.push({
            _id: row._id,
            sourceTable: tableName,
            updateTime: row.updateTime,
            author: row.author,
            jsonData: row.jsonData
          })
        }
      } catch (e) {
        // 表不存在则跳过
      }
    }
    allRows.sort((a, b) => (b.updateTime || '').localeCompare(a.updateTime || ''))
    db.close()
    return { ok: true, data: allRows }
  } catch (err) {
    console.error('[ScraperDB] 读取外部刮削库失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 合并外部数据到本地刮削库
 * @param {Array<{ localId: number, sourceTable: string, jsonData: string, updateTime: string, author: string | null }>} overwrites - 要覆盖的本地行
 * @param {Array<{ sourceTable: string, jsonData: string, updateTime: string, author: string | null }>} adds - 要新增的行
 * @returns {Promise<{ ok: boolean, overwritten?: number, added?: number, message?: string }>}
 */
async function scraperDbMerge(overwrites, adds) {
  try {
    const Database = require('better-sqlite3')
    const scraperDbPath = getScraperDbPath()
    const db = new Database(scraperDbPath)
    ensureScraperTables(db)

    let overwritten = 0
    let added = 0

    const transaction = db.transaction(() => {
      for (const item of overwrites || []) {
        const { localId, sourceTable, jsonData, updateTime, author } = item
        if (!RESOURCE_TABLES.includes(sourceTable)) continue
        db.prepare(`
          UPDATE "${sourceTable}" SET jsonData = ?, updateTime = ?, author = ? WHERE _id = ?
        `).run(jsonData || '', updateTime || '', author != null ? author : null, localId)
        overwritten++
      }
      for (const item of adds || []) {
        const { sourceTable, jsonData, updateTime, author } = item
        if (!RESOURCE_TABLES.includes(sourceTable)) continue
        db.prepare(`
          INSERT INTO "${sourceTable}" (jsonData, updateTime, author) VALUES (?, ?, ?)
        `).run(jsonData || '', updateTime || '', author != null ? author : null)
        added++
      }
    })
    transaction()
    db.close()
    return { ok: true, overwritten, added }
  } catch (err) {
    console.error('[ScraperDB] 合并失败:', err.message)
    return { ok: false, message: err.message }
  }
}

module.exports = {
  scraperDbImportFromArchive,
  scraperDbGetAll,
  scraperDbClear,
  scraperDbSearch,
  scraperDbApplyToResource,
  scraperDbReadExternal,
  scraperDbMerge
}
