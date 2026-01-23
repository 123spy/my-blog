<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { ref, computed, watch } from 'vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData() // 获取当前页面的配置数据

const isSidebarHidden = ref(false)

// --- 核心逻辑：判断按钮是否应该显示 ---
const showButton = computed(() => {
  // 1. 如果是首页 (layout: 'home')，不显示按钮
  if (frontmatter.value.layout === 'home') {
    return false
  }
  
  // 2. 如果文章显式配置了 sidebar: false，也不显示按钮
  if (frontmatter.value.sidebar === false) {
    return false
  }
  
  // 其他情况显示
  return true
})

// --- 切换侧边栏逻辑 ---
const toggleSidebar = () => {
  isSidebarHidden.value = !isSidebarHidden.value
  updateBodyClass()
}

// 辅助函数：更新 body 的类名
const updateBodyClass = () => {
  if (isSidebarHidden.value) {
    document.body.classList.add('hide-sidebar')
  } else {
    document.body.classList.remove('hide-sidebar')
  }
}

// 监听：如果切换了页面（比如从有侧边栏的页去了首页），我们要重置状态
// 防止你把侧边栏关了，回到首页发现样式乱了，或者再进文章页侧边栏还是关的
watch(
  () => frontmatter.value.layout,
  () => {
    isSidebarHidden.value = false
    document.body.classList.remove('hide-sidebar')
  }
)
</script>

<template>
  <Layout />

  <button 
    v-if="showButton"
    class="sidebar-toggle-btn" 
    @click="toggleSidebar"
    title="切换侧边栏"
  >
    <svg v-if="isSidebarHidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="M15 9l-3 3 3 3"></path></svg>
  </button>
</template>

<style scoped>
.sidebar-toggle-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sidebar-toggle-btn:hover {
  transform: scale(1.1);
  background-color: var(--vp-c-brand-dark);
}

@media (max-width: 960px) {
  .sidebar-toggle-btn {
    display: none;
  }
}
</style>