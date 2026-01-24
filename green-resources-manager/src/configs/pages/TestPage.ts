import { BasePage } from './base/BasePage.ts'
import type { SortOption } from '../../types/sort'
import type { SortConfig } from '../../utils/sortBy'
import type { FilterConfig } from '../../types/filter'
import { Game as GameClass } from '@resources/game.ts'
import { Software } from '@resources/soft.ts'
import { Manga } from '@resources/manga.ts'
import { Novel } from '@resources/novel.ts'
import { Video } from '@resources/video.ts'
import { VideoFolder } from '@resources/videoFolder.ts'
import { Website } from '@resources/website.ts'
import { Audio } from '@resources/audio.ts'
import { SingleImage } from '@resources/singleImage.ts'

// Game 类型就是 GameClass 的实例类型
type Game = InstanceType<typeof GameClass>

/**
 * 安全获取游戏属性值的辅助函数
 * 如果属性是 ResourceField，返回其 value；否则直接返回属性值
 */
function getFieldValue<T>(field: any): T | undefined {
	if (field && typeof field === 'object' && 'value' in field) {
		return field.value as T
	}
	return field as T
}

/**
 * 测试游戏页面配置
 * 包含模拟数据，用于测试通用 ResourceView 组件
 */
export class TestGamePage extends BasePage {
	name: string = '测试'
	icon: string = '🧪'
	description: string = '测试页面，包含模拟数据用于测试通用 ResourceView 组件'

	// 接受的资源类型（可以多个）
	resourceTypes: string[] = ['Game']

	// 页面布局配置
	displayLayoutConfig = {
		minWidth: 150,
		maxWidth: 600
	}

	/**
	 * 排序配置
	 * 每个配置项定义了一个排序选项，包含字段访问器和排序方向
	 * 用户可以根据需要自由定义排序方式
	 */
	private sortConfigs: Record<string, SortConfig<Game> & { label: string }> = {
		'name-asc': {
			label: '按名称排序',
			fieldAccessor: (game: Game) => {
				const name = getFieldValue<string>((game as any).name)
				return name || null
			},
			order: 'asc'
		},
		'name-desc': {
			label: '按名称排序（降序）',
			fieldAccessor: (game: Game) => {
				const name = getFieldValue<string>((game as any).name)
				return name || null
			},
			order: 'desc'
		},
		'lastPlayed-asc': {
			label: '按最后游玩时间',
			fieldAccessor: (game: Game) => {
				const lastPlayed = getFieldValue<string>((game as any).lastPlayed) || (game as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'asc'
		},
		'lastPlayed-desc': {
			label: '按最后游玩时间（降序）',
			fieldAccessor: (game: Game) => {
				const lastPlayed = getFieldValue<string>((game as any).lastPlayed) || (game as any).lastPlayed
				return lastPlayed ? new Date(lastPlayed).getTime() : null
			},
			order: 'desc'
		},
		'playTime-asc': {
			label: '按游戏时长（升序）',
			fieldAccessor: (game: Game) => {
				const playTime = getFieldValue<number>((game as any).playTime) ?? (game as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'asc'
		},
		'playTime-desc': {
			label: '按游戏时长（降序）',
			fieldAccessor: (game: Game) => {
				const playTime = getFieldValue<number>((game as any).playTime) ?? (game as any).playTime
				return playTime != null ? playTime : null
			},
			order: 'desc'
		},
		'added-asc': {
			label: '按添加时间（升序）',
			fieldAccessor: (game: Game) => {
				const addedDate = getFieldValue<string>((game as any).addedDate) || (game as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'asc'
		},
		'added-desc': {
			label: '按添加时间（降序）',
			fieldAccessor: (game: Game) => {
				const addedDate = getFieldValue<string>((game as any).addedDate) || (game as any).addedDate
				return addedDate ? new Date(addedDate).getTime() : null
			},
			order: 'desc'
		}
	}

	/**
	 * 获取排序选项配置（用于工具栏显示）
	 * 直接返回配置中定义的排序选项
	 */
	getSortOptions(): SortOption[] {
		return Object.entries(this.sortConfigs).map(([value, config]) => ({
			value,
			label: config.label
		}))
	}

	/**
	 * 根据排序值获取排序配置
	 * @param sortValue 排序值，如 'name-asc' 或 'name-desc'
	 * @returns 排序配置，可直接用于 sortBy 工具函数
	 */
	getSortConfig(sortValue: string): SortConfig<Game> | null {
		const config = this.sortConfigs[sortValue]
		if (!config) {
			return null
		}
		
		// 返回排序配置（不包含 label）
		return {
			fieldAccessor: config.fieldAccessor,
			order: config.order,
			compareFn: config.compareFn
		}
	}

	/**
	 * 获取筛选配置
	 * 定义测试页面支持的筛选器：标签和开发商
	 * 合并基类的"丢失的资源"筛选
	 */
	getFilterConfig<T = Game>(): FilterConfig<T>[] {
		// 获取基类的筛选配置（包含"丢失的资源"）
		const baseFilters = super.getFilterConfig<T>()
		
		// 测试页面特有的筛选器
		const testFilters: FilterConfig<T>[] = [
			{
				key: 'tags',
				title: '标签筛选',
				fieldAccessor: (game: any) => {
					const tags = getFieldValue<string[]>((game as any).tags)
					return tags || []
				},
				isArray: true
			},
			{
				key: 'developers',
				title: '开发商筛选',
				fieldAccessor: (game: any) => {
					const developers = getFieldValue<string[]>((game as any).developers)
					return developers || []
				},
				isArray: true
			}
		] as FilterConfig<T>[]
		
		// 合并基类配置和测试页面特有配置
		return [...baseFilters, ...testFilters]
	}

	/**
	 * 获取模拟数据
	 * @returns 包含所有资源类型的模拟数据数组
	 */
	getMockData() {
		const now = new Date().toISOString()
		
		// Game - 游戏
		const game = new GameClass()
		game.id.value = 'mock-game-1'
		game.name.value = '示例游戏'
		game.description.value = '这是一个游戏示例，用于测试通用 ResourceView 组件'
		game.developers.value = ['示例开发商']
		game.publisher.value = '示例发行商'
		game.tags.value = ['动作', '冒险', 'RPG']
		game.engine.value = 'Unity'
		game.resourcePath.value = 'G:\\下载的数据\\telegram\\悲剧之森\\悲剧之森\\player.exe'
		game.coverPath.value = ''
		game.rating.value = 4
		game.isFavorite.value = true
		game.addedDate.value = now
		game.fileExists.value = true

		// Software - 软件
		const software = new Software()
		software.id.value = 'mock-software-1'
		software.name.value = '示例软件'
		software.description.value = '这是一个软件示例'
		software.developer.value = '示例软件公司'
		software.tags.value = ['工具', '实用']
		software.resourcePath.value = 'C:\\Programs\\示例软件\\app.exe'
		software.addedDate.value = now
		software.fileExists.value = true

		// Manga - 漫画/图片专辑
		const manga = new Manga()
		manga.id.value = 'mock-manga-1'
		manga.name.value = '示例漫画'
		manga.description.value = '这是一个漫画示例'
		manga.author.value = '示例作者'
		manga.tags.value = ['漫画', '日漫']
		manga.resourcePath.value = 'C:\\Users\\闫\\Pictures\\いい画面'
		manga.pagesCount.value = 100
		manga.addedDate.value = now
		manga.fileExists.value = true

		// Novel - 小说
		const novel = new Novel()
		novel.id.value = 'mock-novel-1'
		novel.name.value = '示例小说'
		novel.description.value = '这是一个小说示例'
		novel.author.value = '示例作家'
		novel.genre.value = '轻小说'
		novel.tags.value = ['小说', '轻小说']
		novel.resourcePath.value = 'C:\\Novels\\示例小说.txt'
		novel.addedDate.value = now
		novel.fileExists.value = true

		// Video - 视频
		const video = new Video()
		video.id.value = 'mock-video-1'
		video.name.value = '示例视频'
		video.description.value = '这是一个视频示例'
		video.series.value = '示例系列'
		video.tags.value = ['视频', '电影']
		video.actors.value = ['演员A', '演员B']
		video.resourcePath.value = 'C:\\Videos\\示例视频.mp4'
		video.addedDate.value = now
		video.fileExists.value = true

		// VideoFolder - 视频文件夹（番剧）
		const videoFolder = new VideoFolder()
		videoFolder.id.value = 'mock-videofolder-1'
		videoFolder.name.value = '示例番剧'
		videoFolder.description.value = '这是一个番剧示例'
		videoFolder.series.value = '示例番剧系列'
		videoFolder.tags.value = ['番剧', '动画']
		videoFolder.actors.value = ['声优A', '声优B']
		videoFolder.voiceActors.value = ['声优A', '声优B']
		videoFolder.resourcePath.value = 'C:\\Anime\\示例番剧'
		videoFolder.addedDate.value = now
		videoFolder.fileExists.value = true

		// Website - 网站
		const website = new Website()
		website.id.value = 'mock-website-1'
		website.name.value = '示例网站'
		website.description.value = '这是一个网站示例'
		website.resourcePath.value = 'https://example.com'
		website.tags.value = ['网站', '工具']
		website.addedDate.value = now
		website.fileExists.value = true

		// Audio - 音频
		const audio = new Audio()
		audio.id.value = 'mock-audio-1'
		audio.name.value = '示例音频'
		audio.description.value = '这是一个音频示例'
		audio.artist.value = '示例艺术家'
		audio.tags.value = ['音乐', 'OST']
		audio.resourcePath.value = 'C:\\Audio\\示例音频.mp3'
		audio.addedDate.value = now
		audio.fileExists.value = true

		// SingleImage - 单图片
		const singleImage = new SingleImage()
		singleImage.id.value = 'mock-singleimage-1'
		singleImage.name.value = '示例图片'
		singleImage.description.value = '这是一个单图片示例'
		singleImage.author.value = '示例摄影师'
		singleImage.tags.value = ['图片', '摄影']
		singleImage.resourcePath.value = 'C:\\Images\\示例图片.jpg'
		singleImage.addedDate.value = now
		singleImage.fileExists.value = true

		return [
			game,
			software,
			manga,
			novel,
			video,
			videoFolder,
			website,
			audio,
			singleImage
		]
	}
}
