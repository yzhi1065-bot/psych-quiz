<template>
  <div class="page" v-if="!token">
    <div class="login-box">
      <h1 class="title">心理刷题</h1>
      <p class="desc">心理咨询师考试备考助手</p>
      <input class="input" v-model="phone" placeholder="手机号" maxlength="11" />
      <input class="input" v-model="password" placeholder="密码" type="password" @keyup.enter="handleLogin" />
      <button class="btn-primary" @click="handleLogin" :disabled="loading">{{ loading ? '登录中...' : '登录 / 注册' }}</button>
      <p class="hint">测试账号: 13800000000 / admin123</p>
    </div>
  </div>

  <div class="page" v-else>
    <!-- 骨架屏：数据加载中 -->
    <div v-if="loadingHome" class="skeleton">
      <div class="sk-row"><div class="sk-card"><div class="sk-bar w60"></div><div class="sk-line w40"></div></div><div class="sk-card"><div class="sk-bar w60"></div><div class="sk-line w40"></div></div><div class="sk-card"><div class="sk-bar w60"></div><div class="sk-line w40"></div></div></div>
      <div class="sk-line w30" style="margin:16px 0 12px"></div>
      <div v-for="i in 5" :key="i" class="sk-chapter"><div class="sk-line w60"></div><div class="sk-line w20"></div></div>
    </div>

    <div v-else class="stats-row">
      <div class="stat-card">
        <div class="stat-num">{{ stats.totalAnswered }}</div>
        <div class="stat-label">已做题</div>
      </div>
      <div class="stat-card">
        <div class="stat-num accent">{{ stats.accuracy }}%</div>
        <div class="stat-label">正确率</div>
      </div>
      <div class="stat-card">
        <div class="stat-num warning">{{ stats.mistakeCount }}</div>
        <div class="stat-label">待复习</div>
      </div>
    </div>

    <div class="search-entry" @click="router.push('/search')">
      <span>🔍 搜题库</span>
      <span class="arrow">›</span>
    </div>

    <h3 class="section-title">章节练习</h3>
    <div class="chapter-list">
      <div class="chapter-card all" @click="router.push('/exercise/answer')">
        <div class="ch-info">
          <div class="ch-name">📚 全部章节</div>
          <div class="ch-count">{{ totalAll }} 题</div>
        </div>
        <div class="ch-meta">›</div>
      </div>
      <div class="chapter-card" v-for="ch in chapters" :key="ch.id" @click="startExercise(ch.id)">
        <div class="ch-info">
          <div class="ch-name">{{ ch.name }}</div>
          <div class="ch-count">{{ ch._count?.questions || 0 }} 题</div>
        </div>
        <div class="ch-right">
          <div class="ch-accuracy" v-if="chapterAccuracy[ch.id] !== undefined" :class="accClass(chapterAccuracy[ch.id])">
            {{ chapterAccuracy[ch.id] }}%
          </div>
          <div class="ch-meta">›</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authLogin, getChapters, getMistakes, getStats } from '@/api/index'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const token = ref(userStore.token)
const phone = ref('13800000000')
const password = ref('admin123')
const loading = ref(false)
const loadingHome = ref(true)
const chapters = ref([])
const chapterAccuracy = ref({})
const totalAll = ref(0)
function accClass(val) { return val >= 70 ? '' : val >= 40 ? 'warning' : 'danger' }
const stats = ref({ totalAnswered: 0, accuracy: 0, mistakeCount: 0 })

onMounted(() => {
  token.value = userStore.token
  if (token.value) loadData()
})

async function loadData() {
  try {
    const [cRes, sRes, mRes] = await Promise.all([getChapters(), getStats(), getMistakes()])
    chapters.value = cRes.data || []
    totalAll.value = chapters.value.reduce((s, c) => s + (c._count?.questions || 0), 0)
    const sd = sRes.data || {}
    stats.value = {
      totalAnswered: sd.totalAnswered || 0,
      accuracy: sd.accuracy || 0,
      mistakeCount: (mRes.data || []).length,
    }
    // 构建各章节正确率映射
    if (sd.chapters) {
      const map = {}
      sd.chapters.forEach(function(c) { if (c.total > 0) map[c.chapterId] = c.accuracy })
      chapterAccuracy.value = map
    }
  } catch (e) { console.error(e) }
  finally { loadingHome.value = false }
}

async function handleLogin() {
  if (!phone.value || !password.value) return
  loading.value = true
  try {
    const res = await authLogin(phone.value, password.value)
    if ((res.code === 201 || res.code === 200) && res.data) {
      userStore.setToken(res.data.token, res.data.user)
      token.value = res.data.token
      loadData()
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function startExercise(chapterId) {
  router.push(`/exercise/answer?chapterId=${chapterId}`)
}
</script>

<style scoped>
.page { padding: 16px; min-height: 100vh; }
.login-box { max-width: 360px; margin: 60px auto 0; }
.title { font-size: 28px; font-weight: bold; color: #333; text-align: center; }
.desc { font-size: 14px; color: #999; text-align: center; margin: 8px 0 32px; }
.input { width: 100%; height: 48px; border: 1px solid #ddd; border-radius: var(--radius-md, 10px); padding: 0 14px; margin-bottom: 14px; font-size: 16px; box-sizing: border-box; outline: none; -webkit-appearance: none; }
.input:focus { border-color: #409eff; }
.btn-primary { width: 100%; height: 44px; background: #409eff; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; }
.hint { font-size: 12px; color: #bbb; text-align: center; margin-top: 12px; }
.sk-row { display: flex; gap: 8px; margin: 16px 0; }
.sk-card { flex: 1; background: #fff; border-radius: 12px; padding: 16px; }
.sk-bar { height: 28px; background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
.sk-line { height: 13px; background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-top: 4px; }
.sk-chapter { background: #fff; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; margin-bottom: 8px; }
.w60 { width: 60%; } .w40 { width: 40%; } .w30 { width: 30%; } .w20 { width: 20%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.stats-row { display: flex; gap: 8px; margin: 16px 0; }
.stat-card { flex: 1; background: var(--card-bg, #fff); border-radius: var(--radius-lg, 12px); padding: 14px 8px; text-align: center; }
@media (max-width: 360px) { .stat-card { padding: 10px 4px; } .stat-num { font-size: 22px; } }
.stat-num { font-size: 28px; font-weight: bold; color: #333; }
.stat-num.accent { color: #409eff; }
.stat-num.warning { color: #f56c6c; }
.stat-label { font-size: 13px; color: #999; margin-top: 4px; }
.search-entry { background: #fff; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; cursor: pointer; border: 1px solid #eee; color: #999; }
.search-entry:hover { border-color: #409eff; color: #409eff; }
.search-entry .arrow { font-size: 18px; color: #ccc; }
.section-title { font-size: 16px; font-weight: bold; color: #333; margin: 12px 0; }
.chapter-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-card { background: var(--card-bg, #fff); border-radius: var(--radius-md, 10px); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; min-height: 48px; -webkit-tap-highlight-color: transparent; }
.chapter-card:active { opacity: 0.8; }
.chapter-card.all .ch-name { color: #409eff; font-weight: bold; }
.ch-info { display: flex; flex-direction: column; gap: 2px; }
.ch-name { font-size: 15px; color: #333; }
.ch-count { font-size: 12px; color: #999; }
.ch-right { display: flex; align-items: center; gap: 8px; }
.ch-accuracy { font-size: 14px; font-weight: bold; background: #f0f9eb; color: #67c23a; padding: 2px 10px; border-radius: 10px; }
.ch-accuracy.warning { background: #fdf6ec; color: #e6a23c; }
.ch-accuracy.danger { background: #fef0f0; color: #f56c6c; }
.ch-meta { font-size: 18px; color: #ccc; }
</style>
