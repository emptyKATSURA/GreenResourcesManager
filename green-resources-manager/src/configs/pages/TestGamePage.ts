import { GamePage } from './GamePage.ts'
import { Game as GameClass } from '@resources/game.ts'

/**
 * 测试游戏页面配置
 * 包含模拟数据，用于测试通用 ResourceView 组件
 */
export class TestGamePage extends GamePage {
	/**
	 * 获取模拟数据
	 * @returns 模拟游戏数据数组
	 */
	getMockData() {
		const game = new GameClass()
		game.id.value = 'mock-game-1'
		game.name.value = '示例游戏'
		game.description.value = '这是一个游戏示例，用于测试通用 ResourceView 组件'
		game.developers.value = ['示例开发商']
		game.publisher.value = '示例发行商'
		game.tags.value = ['动作', '冒险', 'RPG']
		game.engine.value = 'Unity'
		game.resourcePath.value = 'C:\\Games\\示例游戏\\game.exe'
		game.coverPath.value = ''
		game.rating.value = 4.5
		game.isFavorite.value = true
		game.addedDate.value = new Date().toISOString()
		game.fileExists.value = true
		return [game]
	}
}
