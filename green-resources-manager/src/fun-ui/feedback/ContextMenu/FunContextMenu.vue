<!-- 右键菜单组件 -->
<template>
  <div 
    v-if="visible" 
    class="fun-context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div 
      v-for="item in menuItems" 
      :key="item.key"
      class="fun-context-item-wrapper"
      @mouseenter="handleItemHover(item, $event)"
      @mouseleave="handleItemLeave(item)"
    >
      <div 
        class="fun-context-item" 
        :class="{ 'has-submenu': item.children && item.children.length > 0 }"
        @click="handleItemClick(item)"
      >
        <span class="fun-context-icon">{{ item.icon }}</span>
        <span class="fun-context-label">{{ item.label }}</span>
        <span v-if="item.children && item.children.length > 0" class="fun-context-arrow">▶</span>
      </div>
      <!-- 二级菜单 -->
      <div 
        v-if="item.children && item.children.length > 0 && hoveredSubmenu === item.key"
        class="fun-context-submenu"
        :style="getSubmenuStyle()"
        @mouseenter="keepSubmenuOpen(item.key)"
        @mouseleave="handleSubmenuLeave(item.key)"
        @click.stop
      >
        <div 
          v-for="subItem in item.children"
          :key="subItem.key"
          class="fun-context-item"
          @click="handleItemClick(subItem)"
        >
          <span class="fun-context-icon">{{ subItem.icon }}</span>
          <span class="fun-context-label">{{ subItem.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

export interface ContextMenuItem {
  key: string
  icon: string
  label: string
  class?: string
  children?: ContextMenuItem[]
}

interface Position {
  x: number
  y: number
}

interface Props {
  /** 是否显示菜单 */
  visible?: boolean
  /** 菜单位置 */
  position?: Position
  /** 菜单项列表 */
  menuItems?: ContextMenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  position: () => ({ x: 0, y: 0 }),
  menuItems: () => []
})

const emit = defineEmits<{
  'item-click': [item: ContextMenuItem]
}>()

const hoveredSubmenu = ref<string | null>(null)
const submenuPosition = ref<Position>({ x: 0, y: 0 })
const submenuTimeout = ref<number | null>(null)

function handleItemClick(item: ContextMenuItem) {
  // 如果有子菜单，不触发点击事件
  if (item.children && item.children.length > 0) {
    return
  }
  emit('item-click', item)
}

function handleItemHover(item: ContextMenuItem, event: MouseEvent) {
  if (item.children && item.children.length > 0) {
    // 清除之前的延迟关闭
    if (submenuTimeout.value !== null) {
      clearTimeout(submenuTimeout.value)
      submenuTimeout.value = null
    }
    
    hoveredSubmenu.value = item.key
    // 计算子菜单位置（在右侧显示）
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    submenuPosition.value = {
      x: rect.right + 4,
      y: rect.top
    }
  }
}

function handleItemLeave(item: ContextMenuItem) {
  // 延迟隐藏，避免鼠标移动到子菜单时立即关闭
  if (item.children && item.children.length > 0) {
    submenuTimeout.value = window.setTimeout(() => {
      // 检查鼠标是否在子菜单上
      if (hoveredSubmenu.value === item.key) {
        hoveredSubmenu.value = null
      }
    }, 150)
  }
}

function keepSubmenuOpen(key: string) {
  // 鼠标进入子菜单时，保持打开状态
  if (submenuTimeout.value !== null) {
    clearTimeout(submenuTimeout.value)
    submenuTimeout.value = null
  }
  hoveredSubmenu.value = key
}

function handleSubmenuLeave(key: string) {
  // 鼠标离开子菜单时，延迟关闭
  submenuTimeout.value = window.setTimeout(() => {
    if (hoveredSubmenu.value === key) {
      hoveredSubmenu.value = null
    }
  }, 150)
}

function getSubmenuStyle() {
  return {
    left: submenuPosition.value.x + 'px',
    top: submenuPosition.value.y + 'px'
  }
}

// 监听 visible 变化，当菜单关闭时重置二级菜单状态
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // 菜单关闭时，重置二级菜单状态
    hoveredSubmenu.value = null
    // 清理定时器
    if (submenuTimeout.value !== null) {
      clearTimeout(submenuTimeout.value)
      submenuTimeout.value = null
    }
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  if (submenuTimeout.value !== null) {
    clearTimeout(submenuTimeout.value)
  }
})
</script>

<style scoped lang="scss">
.fun-context-menu {
  position: fixed;
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow-medium, rgba(0, 0, 0, 0.15));
  z-index: 1001;
  min-width: 150px;
  overflow: visible;
  transition: background-color 0.3s ease;
}

.fun-context-item-wrapper {
  position: relative;
}

.fun-context-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--text-primary, rgba(0, 0, 0, 0.9));
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative;
}

.fun-context-item.has-submenu {
  padding-right: 24px;
}

.fun-context-item:hover {
  background: var(--bg-tertiary, rgba(0, 0, 0, 0.05));
}

.fun-context-label {
  flex: 1;
}

.fun-context-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.fun-context-arrow {
  font-size: 0.75rem;
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
  margin-left: auto;
  flex-shrink: 0;
}

.fun-context-submenu {
  position: fixed;
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow-medium, rgba(0, 0, 0, 0.15));
  z-index: 1002;
  min-width: 150px;
  overflow: hidden;
  transition: background-color 0.3s ease;
  margin-left: 4px;
}
</style>
