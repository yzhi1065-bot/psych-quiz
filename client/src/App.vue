<template>
  <div id="app-root">
    <router-view />
    <div class="bottom-nav" v-if="showNav">
      <div class="nav-item" :class="{ active: $route.path === '/home' }" @click="$router.push('/home')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7l-9-8.5a1 1 0 0 0-1.4 0l-9 8.5A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.6 7 6.6H5l7-6.6z"/></svg>
        <span>首页</span>
      </div>
      <div class="nav-item" :class="{ active: $route.path === '/exercise' }" @click="$router.push('/exercise')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13l-2 2 2 2 4-4-4-4z"/></svg>
        <span>练习</span>
      </div>
      <div class="nav-item" :class="{ active: $route.path === '/mistake' }" @click="$router.push('/mistake')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span>错题</span>
      </div>
      <div class="nav-item" :class="{ active: $route.path === '/mine' }" @click="$router.push('/mine')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span>我的</span>
      </div>
      <div class="nav-item" @click="toggleDark">{{ isDark ? '☀️' : '🌙' }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDark = ref(localStorage.getItem('dark_mode') === '1')
const hideNavPaths = ['/exercise/answer', '/result']
const showNav = computed(() => !hideNavPaths.includes(route.path))

const pageTitles = { '/home': '心理刷题', '/exercise': '章节练习', '/mistake': '错题本', '/mine': '我的', '/search': '搜题库', '/favorites': '我的收藏', '/calendar': '练习日历' }

onMounted(() => {
  if (isDark.value) document.body.classList.add('dark')
  updateTitle()
})

watch(() => route.path, updateTitle)
function updateTitle() {
  document.title = pageTitles[route.path] || '心理刷题'
}

function toggleDark() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
  localStorage.setItem('dark_mode', isDark.value ? '1' : '0')
}
</script>

<style>
:root { --bg: #f5f6fa; --card-bg: #fff; --text: #333; --text-secondary: #666; --text-muted: #999; --border: #e8e8e8; --input-bg: #fff; --nav-bg: #fff; --tag-single-bg: #ecf5ff; --tag-single-color: #409eff; --tag-multi-bg: #fdf6ec; --tag-multi-color: #e6a23c; --tag-judge-bg: #f0f9eb; --tag-judge-color: #67c23a; --btn-primary: #409eff; --link: #409eff; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 12px; --safe-bottom: env(safe-area-inset-bottom, 0px); }
@media (max-width: 360px) { :root { --radius-sm: 4px; --radius-md: 8px; --radius-lg: 10px; } }
.dark { --bg: #e8ecf1; --card-bg: #f7f8fa; --text: #222; --text-secondary: #555; --text-muted: #888; --border: #d0d4d9; --input-bg: #f0f2f5; --nav-bg: #e0e4e9; --tag-single-bg: #dce8f5; --tag-single-color: #2b6cb0; --tag-multi-bg: #f5efe0; --tag-multi-color: #b8860b; --tag-judge-bg: #e0f0e5; --tag-judge-color: #2e7d32; --btn-primary: #2b6cb0; --link: #2b6cb0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
#app-root { min-height: 100vh; padding-bottom: calc(56px + var(--safe-bottom)); }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: calc(50px + var(--safe-bottom)); padding-bottom: var(--safe-bottom); background: var(--nav-bg); border-top: 1px solid var(--border); display: flex; z-index: 100; }
.nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; color: var(--text-muted); cursor: pointer; padding: 4px 0; }
.nav-item.active { color: var(--link); }
.nav-item span { line-height: 1.2; }
</style>
