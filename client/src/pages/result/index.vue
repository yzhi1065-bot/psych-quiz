<template>
  <div class="page">
    <div class="top-bar">
      <button class="back-btn" @click="router.push('/exercise')">‹ 返回</button>
      <span class="top-title">练习结果</span>
      <span></span>
    </div>

    <h1 class="title">{{ isExam ? '模拟考试完成！' : '练习完成！' }}</h1>

    <div class="stats-card">
      <div class="stat-row"><span>总题数</span><span class="bold">{{ total }}</span></div>
      <div class="stat-row"><span>正确</span><span class="green">{{ correct }}</span></div>
      <div class="stat-row"><span>错误</span><span class="red">{{ total - correct }}</span></div>
      <div class="stat-row"><span>正确率</span><span class="blue">{{ accuracy }}%</span></div>
      <div v-if="isExam" class="stat-row"><span>用时</span><span class="bold">{{ timeStr }}</span></div>
    </div>

    <button class="btn" @click="router.push('/mistake')">查看错题</button>
    <button class="btn outline" @click="router.push('/home')">返回首页</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const total = ref(Number(route.query.total) || 0)
const correct = ref(Number(route.query.correct) || 0)
const isExam = ref(route.query.exam === '1')
const seconds = ref(Number(route.query.time) || 0)
const accuracy = computed(() => total.value > 0 ? Math.round(correct.value / total.value * 100) : 0)
const timeStr = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return m + '分' + s + '秒'
})
// 没有数据时跳回首页
if (total.value === 0 && correct.value === 0) {
  router.replace('/home')
}
</script>

<style scoped>
.page { padding: 0 16px 16px; text-align: center; }
.top-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-bottom: 20px; border-bottom: 1px solid #eee; }
.back-btn { background: none; border: none; font-size: 16px; color: #409eff; cursor: pointer; padding: 4px 8px; }
.top-title { font-size: 14px; color: #999; }
.exam-badge { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 12px; padding: 2px 10px; border-radius: 10px; margin-bottom: 12px; }
.title { font-size: 24px; color: #333; margin-bottom: 24px; }
.stats-card { background: #fff; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 16px; }
.stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.stat-row:last-child { border-bottom: none; }
.bold { font-weight: bold; color: #333; }
.green { font-weight: bold; color: #67c23a; }
.red { font-weight: bold; color: #f56c6c; }
.blue { font-weight: bold; color: #409eff; }
.btn { width: 100%; height: 44px; border-radius: 8px; font-size: 16px; border: none; cursor: pointer; margin-top: 8px; background: #409eff; color: #fff; }
.btn.outline { background: #fff; color: #409eff; border: 1px solid #409eff; }
</style>
