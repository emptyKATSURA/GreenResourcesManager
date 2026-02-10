<template>
  <div class="changelog-view">
    <div class="changelog-content">
      <div class="changelog-list">
        <ChangelogEntryCard
          v-for="(entry, idx) in changelogEntries"
          :key="idx"
          :entry="entry"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChangelogEntryCard from '../components/ChangelogEntryCard.vue'
import { changelogEntries as changelogData, type ChangelogEntry } from '../data/changelog'

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
.changelog-list :deep(.changelog-entry) {
  margin-bottom: 0;
}
.changelog-list :deep(.changelog-entry:last-child) {
  margin-bottom: 0;
}
</style>
