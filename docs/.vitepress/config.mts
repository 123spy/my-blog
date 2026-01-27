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
  const sidebarOptions: any[] = []

  dirs.forEach((dir) => {
    // 这里的 title 变量其实用不到了，不过留着也不影响
    const title = dir.charAt(0).toUpperCase() + dir.slice(1);
    
    sidebarOptions.push({
      documentRootPath: 'docs/data',
      scanStartPath: dir,
      resolvePath: `/${dir}/`,
      
      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      capitalizeFirst: true,
      
      // 【关键修改】
      // 删掉了 rootGroupText 和 rootGroupLink
      // 插件就不会再给你的列表套一个“Java”或“算法”的大标题了
      // 而是直接把里面的文章列出来
      
      // 如果你希望它是扁平的（直接显示文件），保持默认即可
      // 如果侧边栏里还有子文件夹，想要折叠子文件夹，保留下面这行：
      collapseDepth: 2,

      // 依然建议排除 index.md，否则它会出现在列表里
      excludePattern: ['index.md', 'README.md'],
    })
  })

  return generateSidebar(sidebarOptions)
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