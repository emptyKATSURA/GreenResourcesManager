import { createApp } from 'vue'
import App from './App.vue'
import './main.scss'
import { createAppRouter } from './router'
import { pinia } from './stores'
import FunUI from './fun-ui'

function initApp() {
  const router = createAppRouter()
  const app = createApp(App)
  
  app.use(pinia)
  app.use(router)
  app.use(FunUI) // 注册 Fun UI 组件库
  app.mount('#app')
}

initApp()
