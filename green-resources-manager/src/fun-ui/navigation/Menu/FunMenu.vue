<template>
  <ul class="fun-menu">
    <li
      v-for="item in items"
      :key="item.id || item.key"
      class="fun-menu-item-wrapper"
      :class="{ 'has-children': item.children && item.children.length > 0 }"
    >
      <!-- 可展开的菜单项 -->
      <template v-if="item.children && item.children.length > 0">
        <div
          class="fun-menu-item"
          :class="{
            active: isItemActive(item),
            expanded: isExpanded(item)
          }"
        >
          <div
            class="fun-menu-item-content"
            @click="handleItemClick(item)"
          >
            <span v-if="item.icon" class="fun-menu-icon">{{ item.icon }}</span>
            <span class="fun-menu-text">{{ item.label || item.text || item.name }}</span>
          </div>
          <span
            v-if="item.children && item.children.length > 0"
            class="fun-menu-arrow"
            :class="{ expanded: isExpanded(item) }"
            @click.stop="toggleExpand(item)"
          >
            ▶
          </span>
        </div>
        <!-- 子菜单 -->
        <ul
          class="fun-menu-submenu"
          :class="{ expanded: isExpanded(item) }"
        >
          <li
            v-for="child in item.children"
            :key="child.id || child.key"
            class="fun-menu-submenu-item"
            :class="{ active: isItemActive(child) }"
          >
            <!-- 如果子项也有子菜单，使用递归渲染 -->
            <template v-if="child.children && child.children.length > 0">
              <div
                class="fun-menu-item fun-menu-item-child"
                :class="{ active: isItemActive(child), expanded: isExpanded(child) }"
              >
                <div
                  class="fun-menu-item-content"
                  @click="handleItemClick(child)"
                >
                  <span v-if="child.icon" class="fun-menu-icon">{{ child.icon }}</span>
                  <span class="fun-menu-text">{{ child.label || child.text || child.name }}</span>
                </div>
                <span
                  class="fun-menu-arrow"
                  :class="{ expanded: isExpanded(child) }"
                  @click.stop="toggleExpand(child)"
                >
                  ▶
                </span>
              </div>
              <!-- 三级子菜单（递归） -->
              <ul
                class="fun-menu-submenu fun-menu-submenu-nested"
                :class="{ expanded: isExpanded(child) }"
              >
                <li
                  v-for="subChild in child.children"
                  :key="subChild.id || subChild.key"
                  class="fun-menu-submenu-item"
                  :class="{ active: isItemActive(subChild) }"
                  @click="handleItemClick(subChild)"
                >
                  <div class="fun-menu-item fun-menu-item-child fun-menu-item-grandchild">
                    <span v-if="subChild.icon" class="fun-menu-icon">{{ subChild.icon }}</span>
                    <span class="fun-menu-text">{{ subChild.label || subChild.text || subChild.name }}</span>
                  </div>
                </li>
              </ul>
            </template>
            <!-- 普通子菜单项 -->
            <div
              v-else
              class="fun-menu-item fun-menu-item-child"
              @click="handleItemClick(child)"
            >
              <span v-if="child.icon" class="fun-menu-icon">{{ child.icon }}</span>
              <span class="fun-menu-text">{{ child.label || child.text || child.name }}</span>
            </div>
          </li>
        </ul>
      </template>
      
      <!-- 普通菜单项（无子菜单） -->
      <div
        v-else
        class="fun-menu-item"
        :class="{ active: isItemActive(item) }"
        @click="handleItemClick(item)"
      >
        <span v-if="item.icon" class="fun-menu-icon">{{ item.icon }}</span>
        <span class="fun-menu-text">{{ item.label || item.text || item.name }}</span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface MenuItem {
  id?: string
  key?: string
  label?: string
  text?: string
  name?: string
  icon?: string
  children?: MenuItem[]
  // 自定义激活判断函数
  isActive?: (item: MenuItem) => boolean
  // 自定义数据
  [key: string]: any
}

interface Props {
  items: MenuItem[]
  activeKey?: string
  activeId?: string
  defaultExpandedKeys?: string[]
  // 自定义激活判断函数
  isItemActiveFn?: (item: MenuItem) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  defaultExpandedKeys: () => []
})

const emit = defineEmits<{
  'item-click': [item: MenuItem]
  'update:expandedKeys': [keys: string[]]
}>()

// 展开状态管理
const expandedKeys = ref<Set<string>>(new Set(props.defaultExpandedKeys))

// 判断菜单项是否展开
const isExpanded = (item: MenuItem): boolean => {
  const key = item.id || item.key
  return key ? expandedKeys.value.has(key) : false
}

// 切换展开状态
const toggleExpand = (item: MenuItem) => {
  const key = item.id || item.key
  if (!key) return
  
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key)
  } else {
    expandedKeys.value.add(key)
  }
  
  emit('update:expandedKeys', Array.from(expandedKeys.value))
}

// 判断菜单项是否激活
const isItemActive = (item: MenuItem): boolean => {
  // 优先使用自定义的 isActive 函数
  if (item.isActive) {
    return item.isActive(item)
  }
  
  // 使用外部传入的 isItemActiveFn
  if (props.isItemActiveFn) {
    return props.isItemActiveFn(item)
  }
  
  // 默认判断：通过 activeKey 或 activeId
  const key = item.id || item.key
  if (key && (props.activeKey === key || props.activeId === key)) {
    return true
  }
  
  // 如果有子菜单，检查子菜单中是否有激活项
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isItemActive(child))
  }
  
  return false
}

// 处理菜单项点击
const handleItemClick = (item: MenuItem) => {
  // 如果有子菜单，点击时展开/折叠
  if (item.children && item.children.length > 0) {
    toggleExpand(item)
  }
  
  emit('item-click', item)
}

// 监听 activeKey 变化，自动展开包含该 key 的父菜单
watch(() => props.activeKey, (newKey) => {
  if (!newKey) return
  
  // 查找包含该 key 的父菜单并展开
  const findAndExpand = (items: MenuItem[]): boolean => {
    for (const item of items) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          const childKey = child.id || child.key
          return childKey === newKey
        })
        
        if (hasActiveChild) {
          const key = item.id || item.key
          if (key) {
            expandedKeys.value.add(key)
            emit('update:expandedKeys', Array.from(expandedKeys.value))
          }
          return true
        }
        
        if (findAndExpand(item.children)) {
          const key = item.id || item.key
          if (key) {
            expandedKeys.value.add(key)
            emit('update:expandedKeys', Array.from(expandedKeys.value))
          }
          return true
        }
      }
    }
    return false
  }
  
  findAndExpand(props.items)
}, { immediate: true })
</script>

<style scoped lang="scss">
.fun-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fun-menu-item-wrapper {
  list-style: none;
}

.fun-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  position: relative;
  
  &:hover {
    background: var(--bg-tertiary, rgba(0, 0, 0, 0.05));
  }
  
  &.active {
    background: var(--accent-color, #3b82f6);
    color: white;
    border-left-color: var(--accent-hover, #2563eb);
    
    .fun-menu-icon,
    .fun-menu-text {
      color: white;
    }
  }
}

.fun-menu-item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.fun-menu-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
  transition: color 0.3s ease;
}

.fun-menu-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary, rgba(0, 0, 0, 0.9));
  transition: color 0.3s ease;
}

.fun-menu-arrow {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
  transition: transform 0.3s ease;
  padding: 0 8px;
  user-select: none;
  
  &.expanded {
    transform: rotate(90deg);
  }
}

.fun-menu-submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  list-style: none;
  padding: 0;
  margin: 0;
  
  &.expanded {
    max-height: 500px;
  }
}

.fun-menu-submenu-item {
  list-style: none;
  
  &.active {
    .fun-menu-item {
      background: var(--accent-color, #3b82f6);
      color: white;
      
      .fun-menu-icon,
      .fun-menu-text {
        color: white;
      }
    }
  }
}

.fun-menu-item-child {
  padding-left: 48px;
  font-size: 0.9rem;
}

.fun-menu-submenu-nested {
  margin-left: 0;
}

.fun-menu-item-grandchild {
  padding-left: 72px;
  font-size: 0.85rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fun-menu-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    
    &.active {
      border-left: none;
      border-bottom-color: var(--accent-hover, #2563eb);
    }
  }
  
  .fun-menu-item-child {
    padding-left: 40px;
  }
}
</style>
