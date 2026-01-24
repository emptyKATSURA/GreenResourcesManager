/**
 * 页面配置管理器（新版 - 完全基于配置文件）
 * 
 * 设计理念：
 * - 零存档：所有配置直接从 src/configs/pages/index.ts 读取
 * - 配置即代码：页面元数据在配置类中定义
 * - 即插即用：添加页面只需在 index.ts 注册
 * 
 * 与旧版 CustomPageManager 的区别：
 * - CustomPageManager: 依赖 pages.json 存档，需要初始化、保存等操作
 * - PageConfigManager: 直接从配置文件读取，无需任何存档操作
 */

import { PageConfig, ResourceType, RESOURCE_TYPES } from '../types/page';
import { PAGE_CONFIGS, type PageConfigMeta } from '../configs/pages/index';

/**
 * 页面配置管理器（新版）
 * 完全基于配置文件，无需存档系统
 */
class PageConfigManager {
  private pages: PageConfig[] = [];
  private initialized = false;

  /**
   * 初始化页面配置
   * 直接从配置文件读取，无需异步操作
   */
  init(): void {
    if (this.initialized) return;

    console.log('[PageConfigManager] 从配置文件加载页面...');
    
    const now = Date.now();
    
    // 遍历所有页面配置
    this.pages = PAGE_CONFIGS.map(meta => {
      // 实例化页面配置类，获取元数据
      const pageInstance = new meta.pageClass();
      
      // 从 resourceTypes[0] 推导主资源类型
      const resourceType = (pageInstance.resourceTypes && pageInstance.resourceTypes.length > 0)
        ? pageInstance.resourceTypes[0] as ResourceType
        : 'Other' as ResourceType;
      
      // 从页面实例读取所有配置信息（页面类自己定义）
      const pageConfig: PageConfig = {
        id: pageInstance.id,                        // 从页面类读取 id
        name: pageInstance.name,                    // 从页面类读取 name
        icon: pageInstance.icon,                    // 从页面类读取 icon
        type: resourceType,                         // 从 resourceTypes[0] 推导
        description: pageInstance.description || '', // 从页面类读取 description
        isDefault: meta.isDefault !== false,
        isHidden: meta.isHidden || false,
        order: meta.order,
        createdAt: now,
        updatedAt: now
      };
      
      console.log(`[PageConfigManager] 加载页面: ${pageConfig.id} (${pageConfig.name}), type: ${resourceType}`);
      return pageConfig;
    });
    
    console.log(`[PageConfigManager] 成功加载 ${this.pages.length} 个页面配置`);
    this.initialized = true;
  }


  /**
   * 获取所有页面配置（按顺序排序）
   */
  getPages(): PageConfig[] {
    if (!this.initialized) {
      this.init();
    }
    return [...this.pages].sort((a, b) => a.order - b.order);
  }

  /**
   * 获取可见页面配置（排除隐藏的页面）
   */
  getVisiblePages(): PageConfig[] {
    return this.getPages().filter(p => !p.isHidden);
  }

  /**
   * 根据 ID 获取页面配置
   */
  getPage(id: string): PageConfig | undefined {
    if (!this.initialized) {
      this.init();
    }
    return this.pages.find(p => p.id === id);
  }

  /**
   * 获取页面配置类实例
   * 这个方法返回实际的页面配置类实例（包含排序、筛选等逻辑）
   */
  getPageInstance(id: string): any {
    const meta = PAGE_CONFIGS.find(config => {
      const instance = new config.pageClass();
      return instance.id === id;
    });
    if (!meta) {
      console.warn(`[PageConfigManager] 未找到页面配置: ${id}`);
      return null;
    }
    
    // 实例化并返回
    return new meta.pageClass();
  }

  /**
   * 重新加载配置
   * 在开发环境中，如果修改了配置文件，可以调用此方法刷新
   */
  reload(): void {
    this.initialized = false;
    this.pages = [];
    this.init();
    console.log('[PageConfigManager] 配置已重新加载');
  }

  /**
   * 获取页面配置类（不实例化）
   * 返回页面配置的类构造函数
   */
  getPageClass(id: string): any {
    const meta = PAGE_CONFIGS.find(config => {
      const instance = new config.pageClass();
      return instance.id === id;
    });
    return meta?.pageClass || null;
  }

  /**
   * 检查页面是否存在
   */
  hasPage(id: string): boolean {
    return PAGE_CONFIGS.some(config => {
      const instance = new config.pageClass();
      return instance.id === id;
    });
  }

  /**
   * 获取默认页面配置
   * 返回标记为默认的页面列表
   */
  getDefaultPages(): PageConfig[] {
    return this.getPages().filter(p => p.isDefault);
  }

  /**
   * 获取页面统计信息
   */
  getStats() {
    if (!this.initialized) {
      this.init();
    }
    
    return {
      total: this.pages.length,
      visible: this.pages.filter(p => !p.isHidden).length,
      hidden: this.pages.filter(p => p.isHidden).length,
      default: this.pages.filter(p => p.isDefault).length,
      custom: this.pages.filter(p => !p.isDefault).length
    };
  }
}

// 导出单例实例
export const pageConfigManager = new PageConfigManager();
export default pageConfigManager;

// 同时导出类，以便需要时创建新实例
export { PageConfigManager };
