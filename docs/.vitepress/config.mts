import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'node:fs'
import path from 'node:path'

// 获取 docs 目录路径
const docsPath = path.resolve(__dirname, '../')

// --- 1. 获取所有顶级文件夹列表 ---
// 我们需要知道有哪些分类，以便为它们分别生成侧边栏
const dirs = fs.readdirSync(docsPath).filter((file) => {
  const filePath = path.join(docsPath, file)
  return fs.statSync(filePath).isDirectory() && !['.vitepress', 'public', 'node_modules'].includes(file)
})

// --- 2. 自动生成 Nav (保持不变) ---
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

// --- 3. 【核心修改】自动生成隔离的 Sidebar ---
// 我们不生成一个大 sidebar，而是生成一个数组传给插件
// 插件会根据 resolvePath 决定在哪个页面显示哪个侧边栏
function getSidebar() {
  const sidebarOptions: any[] = []

  dirs.forEach((dir) => {
    sidebarOptions.push({
      // 1. 扫描根目录设为 docs (因为我们启动是在 docs 里的)
      documentRootPath: 'docs',
      
      // 2. 【关键】只扫描当前这个文件夹 (比如 'notes')
      scanStartPath: dir,
      
      // 3. 【关键】这个侧边栏只在进入该路径时显示
      resolvePath: `/${dir}/`,
      
      // 4. 其他美化配置
      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      capitalizeFirst: true,
      
      // 5. 【关键】开启“可伸缩” (折叠)
      // true = 默认折叠，false = 默认展开
      // 如果你希望点击标题可以收缩/展开子菜单，就是这个选项
      collapsed: false, 
      
      // 6. 去掉那个烦人的 "Docs" 或文件夹名作为根标题
      // 设置为 true 会把文件夹名作为最外层标题
      // 设置为 false 会直接把文件列表展示出来 (建议 false 以减少层级)
      useTitleFromPathSegment: true 
    })
  })

  // 调用插件生成最终配置
  return generateSidebar(sidebarOptions)
}

// --- VitePress 配置 ---
export default defineConfig({
  title: "SPY的博客",
  description: "基于 VitePress 构建",

  themeConfig: {
    search: { provider: 'local' },
    nav: getNav(),
    
    // 这里调用新的函数
    sidebar: getSidebar() as any, 

    socialLinks: [
      { icon: 'github', link: 'https://github.com/123spy' }
    ]
  }
})