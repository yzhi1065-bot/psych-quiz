<template>
  <div class="page">
    <h3 class="title">收藏题目</h3>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="favorites.length === 0" class="empty">还没有收藏题目，答题时点⭐收藏吧</div>
    <div v-else class="list">
      <div class="card" v-for="item in favorites" :key="item.id">
        <span class="tag">{{ {1:'单选',2:'多选',3:'判断'}[item.question.type] }}</span>
        <div class="content">{{ item.question.content }}</div>
        <div class="answer-line">答案: <span class="ans">{{ item.question.answer }}</span></div>
        <button class="btn-unfav" @click="unfav(item.question.id)">取消收藏</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFavorites, removeFavorite } from '@/api/index'

const favorites = ref([])
const loading = ref(true)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await getFavorites()
    favorites.value = res.data || []
  } catch {}
  finally { loading.value = false }
}

async function unfav(qid) {
  await removeFavorite(qid)
  load()
}
</script>

<style scoped>
.page { padding: 16px; }
.title { font-size: 16px; color: #333; margin-bottom: 12px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.list { display: flex; flex-direction: column; gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; }
.tag { font-size: 12px; background: #ecf5ff; color: #409eff; padding: 2px 8px; border-radius: 4px; }
.content { font-size: 15px; color: #333; margin: 8px 0; }
.answer-line { font-size: 13px; color: #666; }
.ans { color: #409eff; font-weight: bold; }
.btn-unfav { width: 100%; height: 36px; border: 1px solid #f56c6c; border-radius: 18px; background: #fff; color: #f56c6c; font-size: 14px; margin-top: 8px; cursor: pointer; }
</style>
