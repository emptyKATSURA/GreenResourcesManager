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
import { changelogEntries as changelogData, type ChangelogEntry } from '../data/changelog'

function hasVersionBlocks(entry: ChangelogEntry): boolean {
  return !!(entry.refactor?.length || entry.features?.length || entry.experience?.length || entry.bugfixes?.length)
}

const changelogEntries = ref<ChangelogEntry[]>(changelogData)
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
