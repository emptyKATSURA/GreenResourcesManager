/**
 * SQLite 最小示例：仅用于跑通流程，不涉及业务
 * 使用 better-sqlite3（原生模块，性能更好）
 */

const path = require('path')
const fs = require('fs')

/**
 * 获取 SaveData 目录路径（考虑自定义路径）
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
          console.log('[SQLite] 使用自定义 SaveData 路径:', customPath)
          return customPath
        }
      } catch (error) {
        console.warn('[SQLite] 读取设置文件失败，使用默认路径:', error)
      }
    }
    
    // 使用默认路径
    console.log('[SQLite] 使用默认 SaveData 路径:', defaultSaveDataPath)
    return defaultSaveDataPath
  } catch (error) {
    console.error('[SQLite] 获取 SaveData 路径失败:', error)
    // 降级到默认路径
    return path.join(process.cwd(), 'SaveData')
  }
}

/**
 * 获取数据库文件路径
 * @returns {string} 数据库文件路径
 */
function getDatabasePath() {
  const saveDataDir = getSaveDataDirectory()
  const dbPath = path.join(saveDataDir, 'database.db')
  
  // 确保 SaveData 目录存在
  if (!fs.existsSync(saveDataDir)) {
    fs.mkdirSync(saveDataDir, { recursive: true })
    console.log('[SQLite] 已创建 SaveData 目录:', saveDataDir)
  }
  
  return dbPath
}

/**
 * 运行 SQLite 流程演示：初始化 -> 建表 -> 插入 -> 查询 -> 关闭
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function runDemo() {
  try {
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    db.exec('CREATE TABLE IF NOT EXISTS demo (id INTEGER PRIMARY KEY, name TEXT)')
    const insertStmt = db.prepare('INSERT INTO demo (id, name) VALUES (?, ?)')
    insertStmt.run(1, 'sqlite-demo')
    const selectStmt = db.prepare('SELECT * FROM demo')
    const rows = selectStmt.all()
    db.close()
    console.log('[SQLite Demo] 流程跑通: 建表 -> 插入 -> 查询 -> 关闭')
    console.log('[SQLite Demo] 查询结果:', rows)
    console.log('[SQLite Demo] 数据库文件路径:', dbPath)
    return { ok: true, message: 'better-sqlite3 流程正常' }
  } catch (err) {
    console.error('[SQLite Demo] 失败:', err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 解析 JSON 字段的辅助函数
 * @param {string|null|undefined} jsonString - JSON 字符串
 * @returns {any} 解析后的值，如果解析失败则返回空数组
 */
function parseJsonField(jsonString) {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return []
  }
}

/**
 * 获取数据（所有资源类型表），供前端「数据库」页面展示
 * @returns {Promise<{ ok: boolean, tables?: Array<{ tableName: string, rows: Array<any> }>, message?: string }>}
 */
async function getDemoData() {
  try {
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    const tables = []
    
    // ========== 创建 games 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        developers TEXT,
        publisher TEXT,
        tags TEXT,
        engine TEXT,
        coverPath TEXT,
        resourcePath TEXT,
        folderSize INTEGER DEFAULT 0,
        playTime INTEGER DEFAULT 0,
        playCount INTEGER DEFAULT 0,
        lastPlayed TEXT,
        firstPlayed TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectGamesStmt = db.prepare('SELECT * FROM games ORDER BY addedDate DESC')
    const gamesRows = selectGamesStmt.all()
    tables.push({
      tableName: 'games',
      rows: gamesRows.map(row => ({
        ...row,
        developers: parseJsonField(row.developers),
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 manga 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS manga (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        author TEXT,
        tags TEXT,
        resourcePath TEXT,
        coverPath TEXT,
        pagesCount INTEGER DEFAULT 0,
        lastViewed TEXT,
        viewCount INTEGER DEFAULT 0,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectMangaStmt = db.prepare('SELECT * FROM manga ORDER BY addedDate DESC')
    const mangaRows = selectMangaStmt.all()
    tables.push({
      tableName: 'manga',
      rows: mangaRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 audio 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS audio (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        artist TEXT,
        tags TEXT,
        actors TEXT,
        resourcePath TEXT,
        coverPath TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectAudioStmt = db.prepare('SELECT * FROM audio ORDER BY addedDate DESC')
    const audioRows = selectAudioStmt.all()
    tables.push({
      tableName: 'audio',
      rows: audioRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        actors: parseJsonField(row.actors),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 novel 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS novel (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        author TEXT,
        genre TEXT,
        tags TEXT,
        resourcePath TEXT,
        coverPath TEXT,
        publishYear TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectNovelStmt = db.prepare('SELECT * FROM novel ORDER BY addedDate DESC')
    const novelRows = selectNovelStmt.all()
    tables.push({
      tableName: 'novel',
      rows: novelRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 video 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS video (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        series TEXT,
        tags TEXT,
        actors TEXT,
        resourcePath TEXT,
        thumbnail TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectVideoStmt = db.prepare('SELECT * FROM video ORDER BY addedDate DESC')
    const videoRows = selectVideoStmt.all()
    tables.push({
      tableName: 'video',
      rows: videoRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        actors: parseJsonField(row.actors),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 software 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS software (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        developer TEXT,
        tags TEXT,
        resourcePath TEXT,
        coverPath TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectSoftwareStmt = db.prepare('SELECT * FROM software ORDER BY addedDate DESC')
    const softwareRows = selectSoftwareStmt.all()
    tables.push({
      tableName: 'software',
      rows: softwareRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 website 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS website (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        resourcePath TEXT,
        tags TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectWebsiteStmt = db.prepare('SELECT * FROM website ORDER BY addedDate DESC')
    const websiteRows = selectWebsiteStmt.all()
    tables.push({
      tableName: 'website',
      rows: websiteRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 singleImage 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS singleImage (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        author TEXT,
        tags TEXT,
        resourcePath TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectSingleImageStmt = db.prepare('SELECT * FROM singleImage ORDER BY addedDate DESC')
    const singleImageRows = selectSingleImageStmt.all()
    tables.push({
      tableName: 'singleImage',
      rows: singleImageRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 other 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS other (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT,
        resourcePath TEXT,
        coverPath TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectOtherStmt = db.prepare('SELECT * FROM other ORDER BY addedDate DESC')
    const otherRows = selectOtherStmt.all()
    tables.push({
      tableName: 'other',
      rows: otherRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 videoFolder 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS videoFolder (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        series TEXT,
        tags TEXT,
        actors TEXT,
        voiceActors TEXT,
        productionTeam TEXT,
        resourcePath TEXT,
        thumbnail TEXT,
        addedDate TEXT,
        rating REAL DEFAULT 0,
        comment TEXT,
        isFavorite INTEGER DEFAULT 0
      )
    `)
    const selectVideoFolderStmt = db.prepare('SELECT * FROM videoFolder ORDER BY addedDate DESC')
    const videoFolderRows = selectVideoFolderStmt.all()
    tables.push({
      tableName: 'videoFolder',
      rows: videoFolderRows.map(row => ({
        ...row,
        tags: parseJsonField(row.tags),
        actors: parseJsonField(row.actors),
        voiceActors: parseJsonField(row.voiceActors),
        productionTeam: parseJsonField(row.productionTeam),
        isFavorite: row.isFavorite === 1
      }))
    })
    
    // ========== 创建 pages 表（如果不存在）==========
    db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        addedDate TEXT,
        updatedDate TEXT
      )
    `)
    const selectPagesStmt = db.prepare('SELECT * FROM pages ORDER BY addedDate DESC')
    const pagesRows = selectPagesStmt.all()
    tables.push({
      tableName: 'pages',
      rows: pagesRows
    })
    
    // ========== 为每个页面创建独立的表 ==========
    // 默认页面列表（从页面配置中获取）
    const defaultPageIds = [
      'games',
      'software',
      'images',
      'single-image',
      'videos',
      'anime-series',
      'novels',
      'websites',
      'audio',
      'other',
      'test-game'
    ]
    
    // 获取所有已存在的页面ID（从pages表中）
    const existingPageIds = pagesRows.map(row => row.id).filter(Boolean)
    
    // 合并默认页面和已存在的页面ID
    const allPageIds = [...new Set([...defaultPageIds, ...existingPageIds])]
    
    // 为每个页面创建独立的表
    for (const pageId of allPageIds) {
      // 将页面ID转换为有效的表名（替换连字符为下划线，确保SQL安全）
      const tableName = `${pageId.replace(/-/g, '_')}_page`
      // 使用双引号包裹表名以确保SQL安全
      const quotedTableName = `"${tableName}"`
      
      // 创建页面表
      db.exec(`
        CREATE TABLE IF NOT EXISTS ${quotedTableName} (
          id TEXT PRIMARY KEY,
          resourceType TEXT NOT NULL,
          resourceId TEXT NOT NULL
        )
      `)
      
      // 创建索引以提高查询性能
      db.exec(`
        CREATE INDEX IF NOT EXISTS "idx_${tableName}_resource" ON ${quotedTableName}(resourceType, resourceId)
      `)
      
      // 查询页面表数据
      const selectPageStmt = db.prepare(`SELECT * FROM ${quotedTableName}`)
      const pageRows = selectPageStmt.all()
      tables.push({
        tableName: tableName,
        rows: pageRows
      })
    }
    
    db.close()
    
    // 返回所有表的数据
    return {
      ok: true,
      tables: tables
    }
  } catch (err) {
    return { ok: false, message: err.message }
  }
}

/**
 * 获取页面数据（从数据库读取）
 * @param {string} pageId - 页面ID
 * @returns {Promise<{ ok: boolean, data?: Array<any>, message?: string }>}
 */
async function getPageData(pageId) {
  try {
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    
    // 将页面ID转换为表名
    const tableName = `${pageId.replace(/-/g, '_')}_page`
    const quotedTableName = `"${tableName}"`
    
    // 检查页面表是否存在
    const tableExistsStmt = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `)
    const tableExists = tableExistsStmt.get(tableName)
    
    if (!tableExists) {
      db.close()
      console.log(`[SQLite] 页面表 ${tableName} 不存在，返回空数组`)
      return { ok: true, data: [] }
    }
    
    // 从页面表读取资源ID列表
    const selectPageStmt = db.prepare(`SELECT * FROM ${quotedTableName}`)
    const pageResources = selectPageStmt.all()
    
    console.log(`[SQLite] 页面 ${pageId} 的索引记录数: ${pageResources.length}`)
    
    if (pageResources.length === 0) {
      db.close()
      console.log(`[SQLite] 页面 ${pageId} 没有资源索引，返回空数组`)
      return { ok: true, data: [] }
    }
    
    // 按资源类型分组
    const resourcesByType = {}
    for (const resource of pageResources) {
      const { resourceType, resourceId } = resource
      console.log(`[SQLite] 页面索引: resourceType=${resourceType}, resourceId=${resourceId}`)
      if (!resourcesByType[resourceType]) {
        resourcesByType[resourceType] = []
      }
      resourcesByType[resourceType].push(resourceId)
    }
    
    console.log(`[SQLite] 按资源类型分组:`, Object.keys(resourcesByType).map(type => `${type}: ${resourcesByType[type].length}`).join(', '))
    
    // 从各个资源表中查询数据
    const allResources = []
    for (const [resourceType, resourceIds] of Object.entries(resourcesByType)) {
      if (resourceIds.length === 0) continue
      
      console.log(`[SQLite] 从 ${resourceType} 表查询 ${resourceIds.length} 个资源`)
      
      // 检查资源表是否存在
      const tableExistsStmt = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `)
      const tableExists = tableExistsStmt.get(resourceType)
      
      if (!tableExists) {
        console.warn(`[SQLite] 资源表 ${resourceType} 不存在，跳过查询`)
        continue
      }
      
      // 构建查询语句（使用 IN 子句）
      const placeholders = resourceIds.map(() => '?').join(',')
      const selectResourceStmt = db.prepare(`
        SELECT * FROM "${resourceType}" 
        WHERE id IN (${placeholders})
      `)
      
      const resources = selectResourceStmt.all(...resourceIds)
      console.log(`[SQLite] 从 ${resourceType} 表查询到 ${resources.length} 条记录，期望 ${resourceIds.length} 条`)
      
      // 解析 JSON 字段和布尔字段
      for (const resource of resources) {
        const parsedResource = { ...resource }
        
        // 解析 JSON 字段（根据资源类型不同，字段也不同）
        if (resourceType === 'games') {
          parsedResource.developers = parseJsonField(resource.developers)
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'manga') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'audio') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.actors = parseJsonField(resource.actors)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'novel') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'video') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.actors = parseJsonField(resource.actors)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'software') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'website') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'singleImage') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'other') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.isFavorite = resource.isFavorite === 1
        } else if (resourceType === 'videoFolder') {
          parsedResource.tags = parseJsonField(resource.tags)
          parsedResource.actors = parseJsonField(resource.actors)
          parsedResource.voiceActors = parseJsonField(resource.voiceActors)
          parsedResource.productionTeam = parseJsonField(resource.productionTeam)
          parsedResource.isFavorite = resource.isFavorite === 1
        }
        
        allResources.push(parsedResource)
      }
    }
    
    // 按照页面表中的顺序排序（保持原始顺序）
    const resourceMap = new Map(allResources.map(r => [r.id, r]))
    const orderedResources = pageResources
      .map(pr => resourceMap.get(pr.resourceId))
      .filter(Boolean)
    
    db.close()
    
    return {
      ok: true,
      data: orderedResources
    }
  } catch (err) {
    console.error(`[SQLite] 获取页面 ${pageId} 数据失败:`, err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 将资源数据转换为数据库格式（数组转JSON字符串，布尔转整数）
 * @param {any} resource - 资源数据
 * @param {string} resourceType - 资源类型
 * @returns {any} 转换后的资源数据
 */
function convertResourceForDatabase(resource, resourceType) {
  const converted = { ...resource }
  
  // 根据资源类型转换字段
  if (resourceType === 'games') {
    if (Array.isArray(converted.developers)) {
      converted.developers = JSON.stringify(converted.developers)
    }
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'manga') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'audio') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (Array.isArray(converted.actors)) {
      converted.actors = JSON.stringify(converted.actors)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'novel') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'video') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (Array.isArray(converted.actors)) {
      converted.actors = JSON.stringify(converted.actors)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'software') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'website') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'singleImage') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'other') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  } else if (resourceType === 'videoFolder') {
    if (Array.isArray(converted.tags)) {
      converted.tags = JSON.stringify(converted.tags)
    }
    if (Array.isArray(converted.actors)) {
      converted.actors = JSON.stringify(converted.actors)
    }
    if (Array.isArray(converted.voiceActors)) {
      converted.voiceActors = JSON.stringify(converted.voiceActors)
    }
    if (Array.isArray(converted.productionTeam)) {
      converted.productionTeam = JSON.stringify(converted.productionTeam)
    }
    if (typeof converted.isFavorite === 'boolean') {
      converted.isFavorite = converted.isFavorite ? 1 : 0
    }
  }
  
  return converted
}

/**
 * 保存资源到对应的资源表
 * @param {string} resourceType - 资源类型（表名）
 * @param {any} resource - 资源数据
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function saveResourceToTable(resourceType, resource) {
  try {
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    
    // 转换资源数据格式
    const convertedResource = convertResourceForDatabase(resource, resourceType)
    
    // 确保 id 字段存在
    if (!convertedResource.id) {
      db.close()
      return { ok: false, message: '资源缺少 id 字段' }
    }
    
    // 获取资源表的所有字段
    const tableInfoStmt = db.prepare(`PRAGMA table_info("${resourceType}")`)
    const columns = tableInfoStmt.all()
    const columnNames = columns.map(col => col.name)
    
    // 构建 INSERT OR REPLACE 语句
    const fields = columnNames.filter(name => convertedResource.hasOwnProperty(name))
    const placeholders = fields.map(() => '?').join(', ')
    const values = fields.map(field => convertedResource[field] ?? null)
    
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO "${resourceType}" (${fields.join(', ')}) 
      VALUES (${placeholders})
    `)
    
    insertStmt.run(...values)
    
    db.close()
    return { ok: true }
  } catch (err) {
    console.error(`[SQLite] 保存资源到 ${resourceType} 表失败:`, err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 在页面表中添加资源索引
 * @param {string} pageId - 页面ID
 * @param {string} resourceType - 资源类型
 * @param {string} resourceId - 资源ID
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function addResourceToPage(pageId, resourceType, resourceId) {
  try {
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    
    // 将页面ID转换为表名
    const tableName = `${pageId.replace(/-/g, '_')}_page`
    const quotedTableName = `"${tableName}"`
    
    // 确保页面表存在
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${quotedTableName} (
        id TEXT PRIMARY KEY,
        resourceType TEXT NOT NULL,
        resourceId TEXT NOT NULL
      )
    `)
    
    // 检查是否已存在
    const checkStmt = db.prepare(`
      SELECT id FROM ${quotedTableName} 
      WHERE resourceType = ? AND resourceId = ?
    `)
    const existing = checkStmt.get(resourceType, resourceId)
    
    if (!existing) {
      // 生成唯一ID
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 插入新记录
      const insertStmt = db.prepare(`
        INSERT INTO ${quotedTableName} (id, resourceType, resourceId) 
        VALUES (?, ?, ?)
      `)
      insertStmt.run(id, resourceType, resourceId)
    }
    
    db.close()
    return { ok: true }
  } catch (err) {
    console.error(`[SQLite] 添加资源到页面 ${pageId} 失败:`, err.message)
    return { ok: false, message: err.message }
  }
}

/**
 * 确保所有资源表存在（供 savePageResources / getPageData 等使用）
 * 资源表仅由 getDemoData 创建，用户未打开「数据库」页时不存在，导致拖拽保存失败
 * @param {object} db - better-sqlite3 Database 实例
 */
function ensureResourceTablesExist(db) {
  const ddl = [
    `CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, developers TEXT, publisher TEXT, tags TEXT, engine TEXT, coverPath TEXT, resourcePath TEXT, folderSize INTEGER DEFAULT 0, playTime INTEGER DEFAULT 0, playCount INTEGER DEFAULT 0, lastPlayed TEXT, firstPlayed TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS manga (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT, tags TEXT, resourcePath TEXT, coverPath TEXT, pagesCount INTEGER DEFAULT 0, lastViewed TEXT, viewCount INTEGER DEFAULT 0, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS audio (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, artist TEXT, tags TEXT, actors TEXT, resourcePath TEXT, coverPath TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS novel (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT, genre TEXT, tags TEXT, resourcePath TEXT, coverPath TEXT, publishYear TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS video (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, series TEXT, tags TEXT, actors TEXT, resourcePath TEXT, thumbnail TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS software (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, developer TEXT, tags TEXT, resourcePath TEXT, coverPath TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS website (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, resourcePath TEXT, tags TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS singleImage (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT, tags TEXT, resourcePath TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS other (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, category TEXT, tags TEXT, resourcePath TEXT, coverPath TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS videoFolder (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, series TEXT, tags TEXT, actors TEXT, voiceActors TEXT, productionTeam TEXT, resourcePath TEXT, thumbnail TEXT, addedDate TEXT, rating REAL DEFAULT 0, comment TEXT, isFavorite INTEGER DEFAULT 0)`
  ]
  for (const sql of ddl) db.exec(sql)
}

/**
 * 将 resourceType 映射到数据库表名
 * @param {string} resourceType - 资源类型（如 'game', 'audio'）
 * @returns {string} 数据库表名（如 'games', 'audio'）
 */
function mapResourceTypeToTableName(resourceType) {
  const mapping = {
    'game': 'games',
    'games': 'games',
    'software': 'software',
    'soft': 'software',
    'manga': 'manga',
    'image': 'manga',
    'images': 'manga',
    'novel': 'novel',
    'novels': 'novel',
    'video': 'video',
    'videos': 'video',
    'movie': 'video',
    'audio': 'audio',
    'website': 'website',
    'websites': 'website',
    'single-image': 'singleImage',
    'singleImage': 'singleImage',
    'other': 'other',
    'videoFolder': 'videoFolder',
    'video-folder': 'videoFolder',
    'anime': 'videoFolder',
    'anime-series': 'videoFolder'
  }
  
  return mapping[resourceType] || resourceType
}

/**
 * 保存页面资源（批量操作：保存所有资源到资源表，并更新页面索引）
 * @param {string} pageId - 页面ID
 * @param {Array<any>} resources - 资源数组
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function savePageResources(pageId, resources) {
  try {
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return { ok: false, message: '未收到任何资源数据' }
    }
    const Database = require('better-sqlite3')
    const dbPath = getDatabasePath()
    const db = new Database(dbPath)
    ensureResourceTablesExist(db)
    
    // 页面ID到资源类型的映射（用于推断资源类型）
    const pageIdToResourceType = {
      'games': 'game',
      'software': 'software',
      'images': 'manga',
      'single-image': 'singleImage',
      'videos': 'video',
      'anime-series': 'videoFolder',
      'novels': 'novel',
      'websites': 'website',
      'audio': 'audio',
      'other': 'other'
    }
    
    // 实际写入的资源数量（用于检测“全部被跳过”的情况）
    let insertedCount = 0
    // 开始事务
    const transaction = db.transaction(() => {
      // 存储每个资源对应的数据库表名（用于后续插入页面索引）
      const resourceTableMap = new Map()
      
      // 1. 保存所有资源到对应的资源表
      for (const resource of resources) {
        if (!resource.id) {
          console.warn(`[SQLite] 资源缺少 id 字段，跳过保存:`, resource)
          continue
        }
        
        // 从资源数据中获取资源类型
        let resourceType = resource.resourceType || resource.resource_type
        
        // 如果资源类型不存在，尝试从页面ID推断
        if (!resourceType) {
          resourceType = pageIdToResourceType[pageId] || pageId
          console.log(`[SQLite] 从页面ID推断资源类型: ${pageId} -> ${resourceType}`)
        }
        
        // 映射到数据库表名
        const tableName = mapResourceTypeToTableName(resourceType)
        console.log(`[SQLite] 保存资源到表 ${tableName}, resourceType: ${resourceType}, id: ${resource.id}`)
        
        // 保存映射关系
        resourceTableMap.set(resource.id, tableName)
        
        // 转换资源数据格式
        const convertedResource = convertResourceForDatabase(resource, tableName)
        
        // 获取资源表的所有字段
        const tableInfoStmt = db.prepare(`PRAGMA table_info("${tableName}")`)
        const columns = tableInfoStmt.all()
        const columnNames = columns.map(col => col.name)
        
        // 构建 INSERT OR REPLACE 语句
        // 确保 id 字段存在
        if (!convertedResource.id) {
          console.warn(`[SQLite] 转换后的资源缺少 id 字段，跳过保存`)
          continue
        }
        
        // 过滤字段：只包含表中存在的字段，且资源数据中有值或为null的字段
        const fields = columnNames.filter(name => {
          return name in convertedResource
        })
        
        if (fields.length === 0) {
          console.warn(`[SQLite] 资源 ${convertedResource.id} 没有匹配的字段，跳过保存`)
          continue
        }
        
        const placeholders = fields.map(() => '?').join(', ')
        const values = fields.map(field => {
          const value = convertedResource[field]
          return value !== undefined ? value : null
        })
        
        console.log(`[SQLite] 插入资源到 ${tableName}, 字段数: ${fields.length}, id: ${convertedResource.id}`)
        
        const insertStmt = db.prepare(`
          INSERT OR REPLACE INTO "${tableName}" (${fields.join(', ')}) 
          VALUES (${placeholders})
        `)
        
        insertStmt.run(...values)
        insertedCount++
        console.log(`[SQLite] 资源保存成功: ${tableName}.${convertedResource.id}`)
      }
      
      // 2. 清空页面表
      const tableName = `${pageId.replace(/-/g, '_')}_page`
      const quotedTableName = `"${tableName}"`
      
      // 确保页面表存在
      db.exec(`
        CREATE TABLE IF NOT EXISTS ${quotedTableName} (
          id TEXT PRIMARY KEY,
          resourceType TEXT NOT NULL,
          resourceId TEXT NOT NULL
        )
      `)
      
      // 清空页面表
      db.exec(`DELETE FROM ${quotedTableName}`)
      
      // 3. 重新插入页面索引（使用之前保存的映射关系）
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i]
        if (!resource.id) {
          console.warn(`[SQLite] 资源缺少 id 字段，跳过页面索引:`, resource)
          continue
        }
        
        // 从映射中获取数据库表名
        const dbTableName = resourceTableMap.get(resource.id)
        if (!dbTableName) {
          console.warn(`[SQLite] 资源 ${resource.id} 没有对应的表名映射，跳过页面索引`)
          continue
        }
        
        const resourceId = resource.id
        
        // 生成唯一ID
        const id = `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
        
        console.log(`[SQLite] 添加页面索引: ${quotedTableName}, resourceType: ${dbTableName}, resourceId: ${resourceId}`)
        
        // 插入页面索引
        const insertPageStmt = db.prepare(`
          INSERT INTO ${quotedTableName} (id, resourceType, resourceId) 
          VALUES (?, ?, ?)
        `)
        insertPageStmt.run(id, dbTableName, resourceId)
      }
      
      console.log(`[SQLite] 页面 ${pageId} 资源保存完成，共 ${resources.length} 条记录`)
    })
    
    transaction()
    db.close()
    
    if (insertedCount === 0) {
      return { ok: false, message: '所有资源均被跳过，未写入任何数据（请检查资源 id、resourceType 及表结构）' }
    }
    return { ok: true }
  } catch (err) {
    console.error(`[SQLite] 保存页面 ${pageId} 资源失败:`, err.message)
    return { ok: false, message: err.message }
  }
}

module.exports = { runDemo, getDemoData, getPageData, saveResourceToTable, addResourceToPage, savePageResources }
