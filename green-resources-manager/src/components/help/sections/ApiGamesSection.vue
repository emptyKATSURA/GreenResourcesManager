<template>
  <HelpSection 
    title="🎮 游戏管理 API" 
    subtitle="通过 HTTP API 管理游戏数据"
    intro="游戏管理 API 提供了完整的 CRUD 操作，允许您通过 HTTP 请求获取、创建、更新和删除游戏数据。">
    
    <DetailCard title="📡 API 服务器信息">
      <ul>
        <li><strong>服务器地址：</strong><code>http://127.0.0.1:8765</code></li>
        <li><strong>访问限制：</strong>仅允许本地访问（127.0.0.1）</li>
        <li><strong>数据格式：</strong>JSON</li>
        <li><strong>API 风格：</strong>RESTful</li>
      </ul>
    </DetailCard>

    <DetailCard title="📥 获取所有游戏">
      <div class="api-endpoint">
        <div class="method get">GET</div>
        <code>/api/games</code>
      </div>
      <p><strong>响应：</strong>200 OK，返回游戏数组</p>
      <pre class="code-block"><code>[
  {
    "id": "1234567890abc",
    "name": "游戏名称",
    "description": "游戏描述",
    "developer": "开发商",
    "publisher": "发行商",
    "tags": ["标签1", "标签2"],
    "executablePath": "游戏路径",
    "playTime": 3600,
    "playCount": 10,
    ...
  }
]</code></pre>
      <p class="code-label">JavaScript</p>
      <pre class="code-block"><code>const res = await fetch('http://127.0.0.1:8765/api/games')
const games = await res.json()</code></pre>
      <p class="code-label">Python</p>
      <pre class="code-block"><code>import requests
response = requests.get('http://127.0.0.1:8765/api/games')
games = response.json()</code></pre>
    </DetailCard>

    <DetailCard title="📥 获取单个游戏">
      <div class="api-endpoint">
        <div class="method get">GET</div>
        <code>/api/games/:id</code>
      </div>
      <p><strong>参数：</strong><code>id</code> - 游戏ID</p>
      <p><strong>响应：</strong>200 OK 返回游戏对象，不存在则 404</p>
      <pre class="code-block"><code>{
  "id": "1234567890abc",
  "name": "游戏名称",
  "description": "游戏描述",
  ...
}</code></pre>
      <p class="code-label">JavaScript</p>
      <pre class="code-block"><code>const res = await fetch('http://127.0.0.1:8765/api/games/1234567890abc')
const game = await res.json()</code></pre>
      <p class="code-label">Python</p>
      <pre class="code-block"><code>import requests
response = requests.get('http://127.0.0.1:8765/api/games/1234567890abc')
game = response.json()</code></pre>
    </DetailCard>

    <DetailCard title="➕ 创建游戏">
      <div class="api-endpoint">
        <div class="method post">POST</div>
        <code>/api/games</code>
      </div>
      <p><strong>请求体：</strong></p>
      <pre class="code-block"><code>{
  "name": "游戏名称",  // 必需
  "description": "游戏描述",
  "developer": "开发商",
  "publisher": "发行商",
  "tags": ["标签1", "标签2"],
  "executablePath": "游戏路径",
  "engine": "游戏引擎",
  "coverPath": "封面路径",
  ...
}</code></pre>
      <p><strong>响应：</strong>201 Created，返回创建的游戏对象</p>
      <p><strong>注意：</strong>ID 和 addedDate 会自动生成</p>
      <p class="code-label">JavaScript</p>
      <pre class="code-block"><code>const res = await fetch('http://127.0.0.1:8765/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '新游戏', developer: '开发商' })
})
const createdGame = await res.json()</code></pre>
      <p class="code-label">Python</p>
      <pre class="code-block"><code>import requests
new_game = {'name': '新游戏', 'developer': '开发商'}
response = requests.post('http://127.0.0.1:8765/api/games', json=new_game)
created_game = response.json()</code></pre>
    </DetailCard>

    <DetailCard title="✏️ 更新游戏">
      <div class="api-endpoint">
        <div class="method put">PUT</div>
        <code>/api/games/:id</code>
      </div>
      <p><strong>参数：</strong><code>id</code> - 游戏ID</p>
      <p><strong>请求体：</strong>要更新的字段（JSON 对象，只需传要修改的字段）</p>
      <pre class="code-block"><code>{
  "name": "更新后的游戏名",
  "description": "更新后的描述",
  ...
}</code></pre>
      <p><strong>响应：</strong>200 OK，返回更新后的游戏对象</p>
      <p><strong>注意：</strong>ID 和 addedDate 字段不允许修改</p>
      <p class="code-label">JavaScript</p>
      <pre class="code-block"><code>const res = await fetch('http://127.0.0.1:8765/api/games/1234567890abc', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '更新后的游戏名' })
})
const updatedGame = await res.json()</code></pre>
      <p class="code-label">Python</p>
      <pre class="code-block"><code>import requests
update_data = {'name': '更新后的游戏名'}
response = requests.put('http://127.0.0.1:8765/api/games/1234567890abc', json=update_data)
updated_game = response.json()</code></pre>
    </DetailCard>

    <DetailCard title="🗑️ 删除游戏">
      <div class="api-endpoint">
        <div class="method delete">DELETE</div>
        <code>/api/games/:id</code>
      </div>
      <p><strong>参数：</strong><code>id</code> - 游戏ID</p>
      <p><strong>响应：</strong>204 No Content（成功）或 404 Not Found（不存在）</p>
      <p><strong>注意：</strong>删除操作不会删除本地游戏文件，仅移除管理器中的引用</p>
      <p class="code-label">JavaScript</p>
      <pre class="code-block"><code>await fetch('http://127.0.0.1:8765/api/games/1234567890abc', { method: 'DELETE' })
// 成功返回 204，无响应体</code></pre>
      <p class="code-label">Python</p>
      <pre class="code-block"><code>import requests
response = requests.delete('http://127.0.0.1:8765/api/games/1234567890abc')
# 成功返回 204，无响应体</code></pre>
    </DetailCard>

    <DetailCard title="📊 游戏数据字段说明">
      <p>游戏对象包含以下字段：</p>
      <ul>
        <li><code>id</code> - 游戏唯一标识符（自动生成，不可修改）</li>
        <li><code>name</code> - 游戏名称（必需）</li>
        <li><code>description</code> - 游戏描述</li>
        <li><code>developer</code> - 开发商</li>
        <li><code>publisher</code> - 发行商</li>
        <li><code>tags</code> - 标签数组</li>
        <li><code>engine</code> - 游戏引擎</li>
        <li><code>executablePath</code> - 游戏可执行文件路径</li>
        <li><code>coverPath</code> - 封面图片路径</li>
        <li><code>folderSize</code> - 文件夹大小（字节）</li>
        <li><code>playTime</code> - 游戏时长（秒）</li>
        <li><code>playCount</code> - 游戏次数</li>
        <li><code>lastPlayed</code> - 最后游玩时间（ISO 字符串）</li>
        <li><code>firstPlayed</code> - 首次游玩时间（ISO 字符串）</li>
        <li><code>addedDate</code> - 添加日期（自动生成，不可修改）</li>
        <li><code>fileExists</code> - 文件是否存在</li>
        <li><code>isArchive</code> - 是否为压缩包</li>
        <li><code>rating</code> - 评分</li>
        <li><code>comment</code> - 评论</li>
        <li><code>isFavorite</code> - 是否收藏</li>
      </ul>
    </DetailCard>

    <DetailCard title="⚠️ 错误处理">
      <p>API 使用标准的 HTTP 状态码：</p>
      <ul>
        <li><strong>200 OK：</strong>请求成功</li>
        <li><strong>201 Created：</strong>资源创建成功</li>
        <li><strong>204 No Content：</strong>删除成功（无响应体）</li>
        <li><strong>400 Bad Request：</strong>请求参数错误（如缺少必需字段）</li>
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
        <li>删除游戏不会删除本地文件，仅移除管理器中的引用</li>
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

.code-label {
  margin: 16px 0 4px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
}

.code-label:first-of-type {
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
