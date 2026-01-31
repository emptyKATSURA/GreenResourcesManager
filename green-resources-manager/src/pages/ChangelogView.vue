<template>
  <div class="changelog-view">
    <div class="changelog-content">
      <div class="changelog-list">
        <section
          v-for="(entry, idx) in changelogEntries"
          :key="idx"
          class="changelog-entry"
        >
          <div class="changelog-entry-header">
            <span class="changelog-version">{{ entry.version }}</span>
            <span v-if="entry.date" class="changelog-date">{{ entry.date }}</span>
          </div>
          <!-- 按模块展示：重构、新功能、体验优化、bug 修复 -->
          <template v-if="hasVersionBlocks(entry)">
            <div v-if="entry.refactor?.length" class="changelog-block">
              <h4 class="changelog-block-title refactor">重构</h4>
              <ul class="changelog-items">
                <li v-for="(item, i) in entry.refactor" :key="'r-' + i">{{ item }}</li>
              </ul>
            </div>
            <div v-if="entry.features?.length" class="changelog-block">
              <h4 class="changelog-block-title features">新功能</h4>
              <ul class="changelog-items">
                <li v-for="(item, i) in entry.features" :key="'f-' + i">{{ item }}</li>
              </ul>
            </div>
            <div v-if="entry.experience?.length" class="changelog-block">
              <h4 class="changelog-block-title experience">体验优化</h4>
              <ul class="changelog-items">
                <li v-for="(item, i) in entry.experience" :key="'e-' + i">{{ item }}</li>
              </ul>
            </div>
            <div v-if="entry.bugfixes?.length" class="changelog-block">
              <h4 class="changelog-block-title bugfixes">bug 修复</h4>
              <ul class="changelog-items">
                <li v-for="(item, i) in entry.bugfixes" :key="'b-' + i">{{ item }}</li>
              </ul>
            </div>
          </template>
          <!-- 无模块时：纯列表或备注 -->
          <template v-else>
            <ul v-if="entry.items && entry.items.length" class="changelog-items">
              <li v-for="(item, i) in entry.items" :key="i">{{ item }}</li>
            </ul>
            <p v-else class="changelog-note">{{ entry.note || '暂无详细说明' }}</p>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ChangelogEntry {
  version: string
  date: string
  refactor?: string[]
  features?: string[]
  experience?: string[]
  bugfixes?: string[]
  items?: string[]
  note?: string
}

function hasVersionBlocks(entry: ChangelogEntry): boolean {
  return !!(entry.refactor?.length || entry.features?.length || entry.experience?.length || entry.bugfixes?.length)
}

const changelogEntries = ref<ChangelogEntry[]>([
  {
    version: 'v0.7.0',
    date: '',
    features: ['编辑时 tag 栏可以弹出，方便快速添加'],
    experience: [
      '截图的文件夹命名优化，显示 ID+游戏名，防止游戏重命名后找不到之前的文件夹',
      '截图之后，如果当前游戏没有封面，把现在的截图默认作为封面图'
    ],
    bugfixes: ['优化截图算法，现在不会截图到其它窗口了']
  },
  {
    version: 'v0.6.9',
    date: '',
    features: ['编辑时 tag 栏可以弹出，方便快速添加'],
    experience: [
      '截图的文件夹命名优化，显示 ID+游戏名，防止游戏重命名后找不到之前的文件夹',
      '截图之后，如果当前游戏没有封面，把现在的截图默认作为封面图'
    ],
    bugfixes: ['优化截图算法，现在不会截图到其它窗口了']
  },
  {
    version: 'v0.6.8',
    date: '',
    features: ['编辑时 tag 栏可以弹出，方便快速添加'],
    experience: [
      '截图的文件夹命名优化，显示 ID+游戏名，防止游戏重命名后找不到之前的文件夹',
      '截图之后，如果当前游戏没有封面，把现在的截图默认作为封面图'
    ],
    bugfixes: ['优化截图算法，现在不会截图到其它窗口了']
  },
  {
    version: 'v0.6.7',
    date: '',
    bugfixes: ['详情页的各种样式问题'],
    features: [
      '增加游戏引擎的自动识别',
      '网站管理可以导入书签，快速注册',
      '创意工坊的页面与适配',
      '可以自由调整页面布局的大小'
    ],
    experience: [
      '删除三级菜单，使用二级',
      '扩充左侧标签分类',
      '数据详情页内容更符合各资源特点',
      '确认框不再默认使用 chrome 的 alert/confirm'
    ]
  },
  {
    version: 'v0.6.6',
    date: '',
    features: [
      '所有资源都可收藏+评分+评论',
      '左侧导航栏加二级（如应用下含软件和游戏，图片下含漫画和单图）',
      '桌宠功能及内置放置小游戏',
      '全局搜索功能'
    ],
    experience: ['侧边栏子栏目可自定义、顺序可调整'],
    bugfixes: [
      '添加文件夹导致的递归问题',
      '有新版本时编辑器内不提示更新的问题'
    ]
  },

])
</script>

<style scoped>
.changelog-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}
.changelog-content {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}
.changelog-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.changelog-entry {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}
.changelog-entry-header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}
.changelog-version {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
}
.changelog-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.changelog-block {
  margin-bottom: var(--spacing-md);
}
.changelog-block:last-child {
  margin-bottom: 0;
}
.changelog-block-title {
  margin: 0 0 0.35em 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.changelog-block-title.refactor {
  color: var(--changelog-refactor, #8b5cf6);
}
.changelog-block-title.features {
  color: var(--changelog-features, #22c55e);
}
.changelog-block-title.experience {
  color: var(--changelog-experience, #0ea5e9);
}
.changelog-block-title.bugfixes {
  color: var(--changelog-bugfixes, #ef4444);
}
.changelog-items {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
}
.changelog-items li {
  margin-bottom: 0.25em;
}
.changelog-note {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}
</style>
