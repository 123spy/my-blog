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
  const sidebar = {}

  dirs.forEach((dir) => {
    const title = dir.charAt(0).toUpperCase() + dir.slice(1);
    
    // 生成子菜单项
    const items = generateSidebar({
      documentRootPath: 'docs/data',
      scanStartPath: dir,
      // resolvePath: `/${dir}/`, // 这行删掉，不需要了
      
      // 【关键修复】手动加上路径前缀！
      // 这样插件生成的链接就会是 "/Java/文件" 而不是 "/文件"
      basePath: `/${dir}/`, 

      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      excludePattern: ['index.md', 'README.md'], 
    })

    // 组装侧边栏
    sidebar[`/${dir}/`] = [
      {
        text: title,
        // 强制指向该目录下的 index 文件
        link: `/${dir}/`, 
        items: items,
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