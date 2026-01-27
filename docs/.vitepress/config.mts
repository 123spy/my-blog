import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'node:fs'
import path from 'node:path'

// --- 路径修正 ---
// 指向 docs/data 目录
const contentDir = path.resolve(__dirname, '../data')

// 安全检查
if (!fs.existsSync(contentDir)) {
  console.warn('注意：未找到 docs/data 目录。')
}

// --- 1. 获取所有顶级文件夹列表 ---
const dirs = fs.existsSync(contentDir) 
  ? fs.readdirSync(contentDir).filter((file) => {
      const filePath = path.join(contentDir, file)
      return fs.statSync(filePath).isDirectory() && !['.vitepress', 'public', 'node_modules'].includes(file)
    })
  : []

// --- 2. 【核心修改】智能 Nav 生成 ---
function getNav() {
  const navLinks: any[] = []
  navLinks.push({ text: '首页', link: '/' })
  
  dirs.forEach((dir) => {
    const dirPath = path.join(contentDir, dir)
    let finalLink = `/${dir}/` // 默认链接（后备方案）

    // 只有当文件夹存在时才进行检测
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)

      // 策略 A: 优先查找 index.md
      if (files.includes('index.md')) {
        finalLink = `/${dir}/`
      } 
      // 策略 B: 如果没有 index.md，查找第一个 .md 文件
      else {
        // 过滤出 .md 文件，且排除以点开头的隐藏文件
        const firstMdFile = files.find(file => file.endsWith('.md') && !file.startsWith('.'))
        
        if (firstMdFile) {
          // 去掉后缀名 .md，拼接成完整路径
          // 比如找到了 'Thread.md'，链接变成 '/Java/Thread'
          const fileName = firstMdFile.replace(/\.md$/, '')
          finalLink = `/${dir}/${fileName}`
        }
      }
    }

    navLinks.push({
      text: dir.charAt(0).toUpperCase() + dir.slice(1),
      link: finalLink,           // <--- 这里使用了我们计算出来的智能链接
      activeMatch: `/${dir}/`    // <--- 保持高亮匹配逻辑不变（只要在这个目录下都高亮）
    })
  })
  return navLinks
}

// --- 3. Sidebar (保持你刚才要求的：去掉文件夹标题) ---
function getSidebar() {
  const sidebarOptions: any[] = []

  dirs.forEach((dir) => {
    sidebarOptions.push({
      documentRootPath: 'docs/data',
      scanStartPath: dir,
      resolvePath: `/${dir}/`,
      
      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      capitalizeFirst: true,
      
      // 【保持空着】不要加 rootGroupText，这样就不会显示左侧的大标题
      
      // 依然建议折叠子文件夹
      collapseDepth: 2,
      
      // 排除掉 index.md，防止侧边栏重复显示
      excludePattern: ['index.md', 'README.md'],
    })
  })

  return generateSidebar(sidebarOptions)
}

// --- VitePress 配置 ---
export default defineConfig({
  title: "SPY的博客",
  description: "基于 VitePress 构建",
  
  // 源代码目录
  srcDir: 'data',

  themeConfig: {
    search: { provider: 'local' },
    
    // 右侧大纲设置
    outline: {
      level: [2, 3], 
      label: ' ' 
    },

    nav: getNav(),
    sidebar: getSidebar() as any, 

    socialLinks: [
      { icon: 'github', link: 'https://github.com/123spy' }
    ]
  }
})