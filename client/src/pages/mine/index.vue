<template>
  <div class="page">
    <div class="profile-card">
      <div class="avatar">{{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}</div>
      <div class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</div>
    </div>

    <div class="stats-card">
      <div class="row"><span>累计做题</span><span class="num">{{ stats.totalAnswered }}</span></div>
      <div class="row"><span>总正确率</span><span class="num accent">{{ stats.accuracy }}%</span></div>
    </div>

    <div class="menu-card">
      <div class="menu-item" @click="router.push('/favorites')">⭐ 我的收藏 <span class="arrow">›</span></div>
      <div class="menu-item" @click="router.push('/calendar')">📅 练习日历 <span class="arrow">›</span></div>
    </div>

    <button class="logout" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStats } from '@/api/index'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const stats = ref({ totalAnswered: 0, accuracy: 0 })

onMounted(async () => {
  try {
    const res = await getStats()
    stats.value = res.data || { totalAnswered: 0, accuracy: 0 }
  } catch {}
})

function handleLogout() {
  if (confirm('确定退出登录？')) {
    userStore.logout()
    router.push('/home')
  }
}
</script>

<style scoped>
.page { padding: 16px; }
.profile-card { text-align: center; padding: 30px 0; }
.avatar { width: 64px; height: 64px; background: #409eff; color: #fff; font-size: 28px; border-radius: 50%; line-height: 64px; margin: 0 auto; }
.nickname { font-size: 18px; font-weight: bold; color: #333; margin-top: 8px; }
.stats-card { background: #fff; border-radius: 12px; padding: 0 16px; margin: 16px 0; }
.row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #666; }
.row:last-child { border-bottom: none; }
.num { font-weight: bold; color: #333; }
.num.accent { color: #409eff; }
.menu-card { background: #fff; border-radius: 12px; margin: 16px 0; overflow: hidden; }
.menu-item { padding: 14px 16px; font-size: 15px; color: #333; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.menu-item:last-child { border-bottom: none; }
.arrow { color: #ccc; font-size: 18px; }
.logout { width: 100%; height: 44px; background: #fff; color: #f56c6c; border: 1px solid #f56c6c; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 16px; }
</style>
