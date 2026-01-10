/**
 * 小说相关类型定义
 */

import type { BaseResource } from './abstract/BaseResource'

/**
 * 小说基本信息接口
 */
export interface Novel extends BaseResource {
  author?: string
  genre?: string
  language?: string
  filePath?: string
  fileType?: 'txt' | 'epub' | 'mobi' // 文件类型
  fileSize?: number
  encoding?: string
  totalWords?: number
  totalChapters?: number
  currentChapter?: number
  readProgress?: number
  readTime?: number
  lastRead?: string
  firstRead?: string
  addedDate?: string
  rating?: number
  comment?: string // 新增评论字段（与 notes 并存，comment 用于用户评价，notes 用于其他备注）
  notes?: string
  status?: 'unread' | 'reading' | 'completed' | 'paused'
  isFavorite?: boolean
  isPrivate?: boolean
  coverImage?: string
  publishYear?: string
  publisher?: string
  isbn?: string
  series?: string
  volume?: string
  chapters?: any[] // EPUB 章节列表
  bookmarks?: any[]
  highlights?: any[]
  fileExists?: boolean
  [key: string]: any
}

/**
 * 小说排序方式
 */
export type NovelSortBy = 'name' | 'author' | 'readProgress' | 'added'

/**
 * 筛选项接口
 */
export interface FilterItem {
  name: string
  count: number
}

