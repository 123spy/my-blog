// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue' // <--- 1. 引入新组件
import './custom.css'

export default {
  extends: DefaultTheme,
  // 2. 覆盖默认的 Layout
  Layout: Layout 
}