<template>
  <HelpSection 
    title="🔌 API 手册" 
    subtitle="通过 HTTP API 访问应用数据，支持脚本批处理"
    intro="应用提供了 RESTful API 接口，允许您通过 HTTP 请求访问和管理应用数据。API 服务器默认运行在 http://127.0.0.1:8765，仅允许本地访问。">
    
    <DetailCard title="📡 API 服务器信息">
      <ul>
        <li><strong>服务器地址：</strong><code>http://127.0.0.1:8765</code></li>
        <li><strong>访问限制：</strong>仅允许本地访问（127.0.0.1）</li>
        <li><strong>数据格式：</strong>JSON</li>
        <li><strong>API 风格：</strong>RESTful</li>
      </ul>
    </DetailCard>

    <DetailCard title="📚 API 模块">
      <p>当前可用的 API 模块：</p>
      <ul>
        <li><strong>🎮 游戏管理 API：</strong>提供游戏的增删改查功能</li>
        <li><em>更多 API 模块正在开发中...</em></li>
      </ul>
      <p>请在左侧导航栏中选择具体的 API 模块查看详细文档。</p>
    </DetailCard>

    <DetailCard title="🎮 游戏管理 API（概览）">
      <p>游戏管理 API 提供了完整的 CRUD 操作：</p>
      <ul>
        <li><strong>GET /api/games</strong> - 获取所有游戏</li>
        <li><strong>GET /api/games/:id</strong> - 获取单个游戏</li>
        <li><strong>POST /api/games</strong> - 创建游戏</li>
        <li><strong>PUT /api/games/:id</strong> - 更新游戏</li>
        <li><strong>DELETE /api/games/:id</strong> - 删除游戏</li>
      </ul>
      <p>详细文档请查看左侧导航栏中的 <strong>API 手册 > 游戏</strong>。</p>
    </DetailCard>

    <DetailCard title="⚠️ 错误处理">
      <p>API 使用标准的 HTTP 状态码：</p>
      <ul>
        <li><strong>200 OK：</strong>请求成功</li>
        <li><strong>201 Created：</strong>资源创建成功</li>
        <li><strong>204 No Content：</strong>删除成功（无响应体）</li>
        <li><strong>400 Bad Request：</strong>请求参数错误</li>
        <li><strong>404 Not Found：</strong>资源不存在</li>
        <li><strong>500 Internal Server Error：</strong>服务器内部错误</li>
      </ul>
      <p>错误响应格式：</p>
      <pre class="code-block"><code>{
  "error": "错误信息"
}</code></pre>
    </DetailCard>

    <DetailCard title="🔒 安全说明">
      <ul>
        <li>API 服务器仅监听本地地址（127.0.0.1），外部无法访问</li>
        <li>所有操作都会直接修改应用数据文件，请谨慎使用</li>
        <li>建议在批处理脚本中添加错误处理逻辑</li>
        <li>建议定期备份 SaveData 文件夹</li>
      </ul>
    </DetailCard>
  </HelpSection>
</template>

<script setup lang="ts">
import HelpSection from '../HelpSection.vue'
import DetailCard from '../../DetailCard.vue'
</script>

<style scoped>
.api-endpoint {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.method {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 60px;
  text-align: center;
}

.method.get {
  background: #10b981;
  color: white;
}

.method.post {
  background: #3b82f6;
  color: white;
}

.method.put {
  background: #f59e0b;
  color: white;
}

.method.delete {
  background: #ef4444;
  color: white;
}

.code-block {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.code-block code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary);
}

h4 {
  margin: 24px 0 12px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

h4:first-child {
  margin-top: 0;
}

code {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--accent-color);
}
</style>
