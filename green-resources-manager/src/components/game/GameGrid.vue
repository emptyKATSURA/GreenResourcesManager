<template>
  <FunGrid
    v-if="games.length > 0"
    mode="auto-fill"
    :scale="scale"
    :baseWidth="baseWidth"
    :minScaledWidth="100"
    gap="20px"
    padding="10px 20px"
    :singleColumnOnMobile="true"
    :customStyle="customLayoutStyle"
  >
    <MediaCard 
      v-for="game in games" 
      :key="game.id" 
      :item="game" 
      type="game"
      :scale="scale"
      :is-running="isGameRunning(game)" 
      :is-electron-environment="isElectronEnvironment"
      :file-exists="game.fileExists" 
      @click="$emit('game-click', game)"
      @contextmenu="$emit('game-contextmenu', $event, game)" 
      @action="$emit('game-action', game)" 
    />
  </FunGrid>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue'
import MediaCard from '../MediaCard.vue'
import FunGrid from '../../fun-ui/layout/Grid/FunGrid.vue'
import type { Game } from '../../types/game'

export default defineComponent({
  name: 'GameGrid',
  components: {
    MediaCard,
    FunGrid
  },
  props: {
    games: {
      type: Array as PropType<Game[]>,
      required: true,
      default: () => []
    },
    isGameRunning: {
      type: Function,
      required: true
    },
    isElectronEnvironment: {
      type: Boolean,
      default: false
    },
    scale: {
      type: Number,
      default: 100
    },
    layoutStyles: {
      type: Object,
      required: false
    },
    baseWidth: {
      type: Number,
      default: 400
    }
  },
  emits: ['game-click', 'game-contextmenu', 'game-action'],
  setup(props) {
    // 从 layoutStyles 中提取额外的样式（如 justifyContent）
    const customLayoutStyle = computed(() => {
      if (!props.layoutStyles) return undefined
      
      const custom: Record<string, string> = {}
      if (props.layoutStyles.justifyContent) {
        custom.justifyContent = props.layoutStyles.justifyContent
      }
      return Object.keys(custom).length > 0 ? custom : undefined
    })
    
    return {
      customLayoutStyle
    }
  }
})
</script>

<style scoped>
/* 样式已迁移到 FunGrid 组件 */
</style>

