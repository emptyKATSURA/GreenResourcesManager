const fs = require('fs')
const path = require('path')

const helpSiteDir = path.join(__dirname, '..', 'help-site')
const oldPath = path.join(helpSiteDir, 'help-index.html')
const newPath = path.join(helpSiteDir, 'index.html')

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath)
  console.log('✅ 已将 help-index.html 重命名为 index.html')
} else {
  console.log('⚠️  未找到 help-index.html')
}
