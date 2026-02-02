<template>
  <div class="sponsor-view">
    <div class="sponsor-content">
      <h2 class="sponsor-title">感谢支持</h2>
      <p class="sponsor-desc">如果您觉得本应用对您有帮助，欢迎通过以下方式支持项目持续开发。</p>

      <!-- 微信赞助码 -->
      <section class="sponsor-section">
        <h3 class="section-title">微信赞赏</h3>
        <p class="section-desc">扫码赞赏，感谢您的支持</p>
        <div class="qrcode-wrap">
          <img
            src="/imgs/wechat-sponsor.jpg"
            alt="微信赞赏码"
            class="qrcode-img"
            @error="onWechatImgError"
          />
          <p v-if="wechatImgError" class="qrcode-tip">请将微信赞赏码图片放到 <code>public/imgs/wechat-sponsor.png</code></p>
        </div>
      </section>

      <!-- 游戏宣传 -->
      <section class="sponsor-section game-promo">
        <h3 class="section-title">我的游戏</h3>
        <a
          v-if="gameLink"
          :href="gameLink"
          target="_blank"
          rel="noopener noreferrer"
          class="game-card"
        >
          <img
            :src="gameCover"
            alt="游戏封面"
            class="game-cover"
            @error="onGameCoverError"
          />
          <div class="game-info">
            <h4 class="game-name">{{ gameName }}</h4>
            <p class="game-desc">{{ gameDesc }}</p>
            <span class="game-link-text">去看看 →</span>
          </div>
        </a>
        <div v-else class="game-card game-card--placeholder">
          <img
            :src="gameCover"
            alt="游戏封面"
            class="game-cover"
            @error="onGameCoverError"
          />
          <div class="game-info">
            <h4 class="game-name">{{ gameName }}</h4>
            <p class="game-desc">{{ gameDesc }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 微信赞赏码图片加载失败时隐藏占位提示（若图片存在则不显示）
const wechatImgError = ref(false)
function onWechatImgError() {
  wechatImgError.value = true
}

// 游戏宣传：修改以下内容即可
const gameName = ref('帽子与软泥')
const gameDesc = ref('一款轻松休闲的小游戏，欢迎试玩。')
const gameLink = ref('') // 填游戏链接，如 Steam/itch 地址，留空则不显示“去看看”
const gameCover = ref('/hat-soft.png') // 游戏封面图，可改为 public 下其他路径

function onGameCoverError() {
  gameCover.value = '/default-game.png'
}
</script>

<style scoped>
.sponsor-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}
.sponsor-content {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}
.sponsor-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}
.sponsor-desc {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.sponsor-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}
.sponsor-section:last-child {
  margin-bottom: 0;
}
.section-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.section-desc {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.qrcode-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}
.qrcode-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  background: #fff;
  border-radius: var(--radius-sm);
  padding: 8px;
  box-sizing: border-box;
}
.qrcode-tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.qrcode-tip code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  font-size: 0.8rem;
}

.game-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
a.game-card:hover {
  border-color: var(--color-primary, #0ea5e9);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
}
.game-cover {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.game-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-xs);
}
.game-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.game-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
.game-link-text {
  margin-top: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--color-primary, #0ea5e9);
}
.game-card--placeholder {
  cursor: default;
  pointer-events: none;
}
.game-card--placeholder .game-link-text {
  display: none;
}
</style>
