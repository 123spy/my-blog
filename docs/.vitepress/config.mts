import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'node:fs'
import path from 'node:path'

// 【修改点 1】路径修正
// 原本是指向 '../'，现在改成指向 '../data'
const contentDir = path.resolve(__dirname, '../data')

// 增加一个安全检查：如果 data 目录不存在，防止报错
if (!fs.existsSync(contentDir)) {
  console.warn('注意：未找到 docs/data 目录，请确保已创建。')
}

// 【修改点 1】扫描列表
// 使用新的 contentDir (即 docs/data) 进行扫描
const dirs = fs.existsSync(contentDir) 
  ? fs.readdirSync(contentDir).filter((file) => {
      const filePath = path.join(contentDir, file)
      return fs.statSync(filePath).isDirectory() && !['.vitepress', 'public', 'node_modules'].includes(file)
    })
  : []

// --- 2. 自动生成 Nav (逻辑保持不变) ---
function getNav() {
  const navLinks: any[] = []
  navLinks.push({ text: '首页', link: '/' })
  
  dirs.forEach((dir) => {
    navLinks.push({
      text: dir.charAt(0).toUpperCase() + dir.slice(1),
      link: `/${dir}/`,
      activeMatch: `/${dir}/`
    })
  })
  return navLinks
}

// --- 3. 自动生成 Sidebar (微调路径) ---
function getSidebar() {
  // 1. 定义一个对象，而不是数组
  const sidebar = {}

  dirs.forEach((dir) => {
    const title = dir.charAt(0).toUpperCase() + dir.slice(1);
    
    // 2. 让插件只负责扫描“子文件列表”
    // 注意：这里我们不再传 rootGroupText 等参数，因为我们要在下面手动加
    const items = generateSidebar({
      documentRootPath: 'docs/data',
      scanStartPath: dir,
      resolvePath: `/${dir}/`,
      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      // 排除 index.md，因为它将作为父级标题的点击链接
      excludePattern: ['index.md', 'README.md'], 
    })

    // 3. 手动组装侧边栏结构
    // 这种写法下，link 是我们硬编码的字符串，插件干涉不了，绝对不会错
    sidebar[`/${dir}/`] = [
      {
        text: title,           // 父级标题
        link: `/${dir}/`,      // 【关键】强制指定为 /Java/ 这样的绝对路径
        items: items,          // 放入插件扫出来的子文件
        collapsed: false
      }
    ]
  })

  return sidebar
}

// --- VitePress 配置 ---
export default defineConfig({
  title: "SPY的博客",
  description: "基于 VitePress 构建",

  // 【修改点 1】告诉 VitePress 所有的 .md 文章都在 data 文件夹里
  srcDir: 'data',

  themeConfig: {
    search: { provider: 'local' },
    
    // 【修改点 2】右侧目录 (Outline) 设置
    outline: {
      // 1. 显示二级(h2)和三级(h3)标题
      level: [2, 3], 
      // 2. 将 "On this page" 的文字设为空字符串（即隐藏）
      label: '' 
    },

    nav: getNav(),
    sidebar: getSidebar() as any, 

    socialLinks: [
      { icon: 'github', link: 'https://github.com/123spy' }
    ]
  }
})