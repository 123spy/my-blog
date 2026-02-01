import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'node:fs'
import path from 'node:path'

// --- 路径配置 ---
const contentDir = path.resolve(__dirname, '../data')
const dirs = fs.existsSync(contentDir) 
  ? fs.readdirSync(contentDir).filter((file) => {
      const filePath = path.join(contentDir, file)
      return fs.statSync(filePath).isDirectory() && !['.vitepress', 'public', 'node_modules'].includes(file)
    })
  : []

function findFirstMdRecursive(dirPath: string): string | null {
  if (!fs.existsSync(dirPath)) return null
  const items = fs.readdirSync(dirPath).sort()
  if (items.includes('index.md')) return path.join(dirPath, 'index.md')
  const firstMd = items.find(file => file.endsWith('.md') && !file.startsWith('.'))
  if (firstMd) return path.join(dirPath, firstMd)
  const subDirs = items.filter(item => {
    const fullPath = path.join(dirPath, item)
    return fs.statSync(fullPath).isDirectory() && !['.vitepress', 'public'].includes(item)
  })
  for (const subDir of subDirs) {
    const found = findFirstMdRecursive(path.join(dirPath, subDir))
    if (found) return found
  }
  return null
}

function getNav() {
  const navLinks: any[] = []
  navLinks.push({ text: '首页', link: '/' })
  dirs.forEach((dir) => {
    const dirAbsPath = path.join(contentDir, dir)
    let finalLink = `/${dir}/` 
    const foundFilePath = findFirstMdRecursive(dirAbsPath)
    if (foundFilePath) {
      const relativePath = path.relative(contentDir, foundFilePath)
      const webPath = relativePath.split(path.sep).join('/')
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
      collapseDepth: 2,
      excludePattern: ['index.md', 'README.md'],
    })
  })
  return generateSidebar(sidebarOptions)
}

export default defineConfig({
  title: "SPY的博客",
  description: "基于 VitePress 构建",
  srcDir: 'data',
  themeConfig: {
    search: { provider: 'local' },
    
    // 【恢复部分】
    outline: {
      level: [2, 3], 
      label: '本文目录', // 重新显示标题，有助于校准
      offset: 80        // 保持 80 偏移
    },

    nav: getNav(),
    sidebar: getSidebar() as any, 
    socialLinks: [{ icon: 'github', link: 'https://github.com/123spy' }]
  }
})