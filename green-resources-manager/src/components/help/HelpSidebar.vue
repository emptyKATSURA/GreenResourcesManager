<template>
  <div class="help-sidebar">
    <div class="sidebar-header">
      <h2>📚 帮助中心</h2>
    </div>
    <nav class="sidebar-nav">
      <FunMenu
        :items="menuItems"
        :active-key="activeSection"
        :default-expanded-keys="['user-manual']"
        :is-item-active-fn="isItemActive"
        @item-click="handleMenuClick"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FunMenu from '../../fun-ui/navigation/Menu/FunMenu.vue'
import type { MenuItem } from '../../fun-ui/navigation/Menu/FunMenu.vue'

interface Props {
  activeSection: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'section-change': [section: string]
}>()

// 菜单项配置
const menuItems: MenuItem[] = [
  {
    id: 'user-manual',
    icon: '📖',
    label: '用户手册',
    children: [
      { id: 'intro', icon: '🏠', label: '简介' },
      { id: 'general', icon: '🛠️', label: '通用管理' },
      { id: 'game', icon: '🎮', label: '游戏管理' },
      { id: 'image', icon: '🖼️', label: '图片管理' },
      { id: 'video', icon: '🎬', label: '视频管理' },
      { id: 'novel', icon: '📚', label: '小说管理' },
      { id: 'website', icon: '🌐', label: '网站收藏' },
      { id: 'audio', icon: '🎵', label: '音频管理' },
      { id: 'faq', icon: '❓', label: '常见问题' },

    ]
  },
  {
    id: 'api',
    icon: '🔌',
    label: 'API 手册',
    children: [
      { id: 'api-games', icon: '🎮', label: '游戏' }
    ]
  },
  { id: 'workshop', icon: '🎨', label: '创意工坊手册' },
  { id: 'support', icon: '💬', label: '客服&问题反馈' },
  { id: 'about', icon: 'ℹ️', label: '关于我们' },
]

// 自定义激活判断函数
const isItemActive = (item: MenuItem): boolean => {
  // 如果是用户手册（父级），检查子菜单中是否有激活项
  if (item.id === 'user-manual' && item.children) {
    return item.children.some(child => props.activeSection === child.id)
  }
  
  // 如果是 API 相关的菜单项（父级）
  if (item.id === 'api' && item.children) {
    return props.activeSection === 'api' || 
           props.activeSection === 'api-games' ||
           item.children.some(subChild => props.activeSection === subChild.id)
  }
  
  // 其他菜单项直接比较
  return props.activeSection === item.id
}

// 处理菜单项点击
const handleMenuClick = (item: MenuItem) => {
  if (item.id) {
    // 如果是用户手册（父级菜单），点击时不切换 section，只展开/折叠
    // 实际的内容切换由 FunMenu 组件内部处理（点击子菜单项时）
    if (item.id !== 'user-manual') {
      emit('section-change', item.id)
    }
  }
}
</script>

<style scoped>
.help-sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.sidebar-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-nav {
    padding: 0;
  }
}
</style>

