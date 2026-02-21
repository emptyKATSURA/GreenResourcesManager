import { createApp } from 'vue'
import HelpView from './pages/HelpView.vue'
import './main.scss'
import FunUI from './fun-ui'

function initHelpApp() {
  const app = createApp(HelpView)
  
  app.use(FunUI) // 注册 Fun UI 组件库
  app.mount('#help-app')
}

initHelpApp()