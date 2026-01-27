import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'node:fs'
import path from 'node:path'

// --- 路径配置 ---
const contentDir = path.resolve(__dirname, '../data')

// 安全检查
if (!fs.existsSync(contentDir)) {
  console.warn('注意：未找到 docs/data 目录。')
}

// 获取顶级文件夹列表
const dirs = fs.existsSync(contentDir) 
  ? fs.readdirSync(contentDir).filter((file) => {
      const filePath = path.join(contentDir, file)
      return fs.statSync(filePath).isDirectory() && !['.vitepress', 'public', 'node_modules'].includes(file)
    })
  : []

// --- 【核心新增】递归查找第一个 MD 文件的函数 ---
function findFirstMdRecursive(dirPath: string): string | null {
  if (!fs.existsSync(dirPath)) return null
  
  // 获取当前目录下所有项，并排序（保证每次顺序一致）
  const items = fs.readdirSync(dirPath).sort()

  // 1. 优先级最高：检查当前目录有没有 index.md
  if (items.includes('index.md')) {
    return path.join(dirPath, 'index.md')
  }

  // 2. 优先级第二：检查当前目录有没有其他 .md 文件
  const firstMd = items.find(file => file.endsWith('.md') && !file.startsWith('.'))
  if (firstMd) {
    return path.join(dirPath, firstMd)
  }

  // 3. 优先级第三：递归查找子目录
  // 过滤出所有子文件夹
  const subDirs = items.filter(item => {
    const fullPath = path.join(dirPath, item)
    return fs.statSync(fullPath).isDirectory() && !['.vitepress', 'public'].includes(item)
  })

  // 遍历子文件夹，看谁里面藏着 md 文件
  for (const subDir of subDirs) {
    const found = findFirstMdRecursive(path.join(dirPath, subDir))
    if (found) {
      return found // 找到了！直接返回，不再找后面的文件夹
    }
  }

  // 这里的都找完了还没找到
  return null
}

// --- 2. 智能 Nav 生成 ---
function getNav() {
  const navLinks: any[] = []
  navLinks.push({ text: '首页', link: '/' })
  
  dirs.forEach((dir) => {
    const dirAbsPath = path.join(contentDir, dir)
    let finalLink = `/${dir}/` // 默认保底链接

    // 调用递归函数查找
    const foundFilePath = findFirstMdRecursive(dirAbsPath)

    if (foundFilePath) {
      // 如果找到了文件，需要把“系统绝对路径”转换成“网页相对路径”
      // 1. 算出相对路径： D:\...\data\Java\Base\Thread.md -> Java\Base\Thread.md
      const relativePath = path.relative(contentDir, foundFilePath)
      
      // 2. 统一分隔符：Windows 是 \，网页需要 /
      const webPath = relativePath.split(path.sep).join('/')
      
      // 3. 去掉 .md 后缀，并加上开头斜杠 -> /Java/Base/Thread
      finalLink = '/' + webPath.replace(/\.md$/, '')
    }

    navLinks.push({
      text: dir.charAt(0).toUpperCase() + dir.slice(1),
      link: finalLink,
      activeMatch: `/${dir}/`
    })
  })
  return navLinks
}

// --- 3. Sidebar (保持原样：去文件夹标题) ---
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
      
      // 不写 rootGroupText，保持左侧清爽
      
      collapseDepth: 2,
      excludePattern: ['index.md', 'README.md'],
    })
  })

  return generateSidebar(sidebarOptions)
}

// --- VitePress 配置 ---
export default defineConfig({
  title: "SPY的博客",
  description: "基于 VitePress 构建",
  
  srcDir: 'data',

  themeConfig: {
    search: { provider: 'local' },
    
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