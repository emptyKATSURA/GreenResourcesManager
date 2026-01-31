/**
 * 刮削库可刮削字段配置
 * 表名（主存档/刮削库）与资源类的映射，用于「从存档导入刮削库」时只保存各资源配置的可刮削字段
 */

import { Game } from './game'
import { Software } from './soft'
import { Manga } from './manga'
import { Audio } from './audio'
import { Novel } from './novel'
import { Video } from './video'
import { Website } from './website'
import { SingleImage } from './singleImage'
import { Other } from './other'
import { VideoFolder } from './videoFolder'
import type { BaseResources } from './base/ResourcesDataBase'

/** 表名 -> 资源类（与 Electron RESOURCE_TABLES 一致） */
const TABLE_TO_RESOURCE: Record<string, typeof BaseResources> = {
  games: Game,
  manga: Manga,
  audio: Audio,
  novel: Novel,
  video: Video,
  software: Software,
  website: Website,
  singleImage: SingleImage,
  other: Other,
  videoFolder: VideoFolder
}

/**
 * 获取各表可刮削的字段名列表
 * 用于从存档导入刮削库时，只保存这些字段到刮削库
 * @returns { [tableName: string]: string[] }
 */
export function getScrapableFieldsByTable(): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const [tableName, ResourceClass] of Object.entries(TABLE_TO_RESOURCE)) {
    const keys = ResourceClass.getScrapableFieldKeys()
    if (keys.length > 0) {
      result[tableName] = keys
    }
  }
  return result
}
