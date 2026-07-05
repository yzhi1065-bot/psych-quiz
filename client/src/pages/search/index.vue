<template>
  <div class="page">
    <div class="search-bar">
      <input v-model="keyword" placeholder="搜索题干关键词..." class="search-input" @keyup.enter="doSearch" />
      <button class="search-btn" @click="doSearch">搜索</button>
    </div>

    <div v-if="loading" class="loading">搜索中...</div>
    <div v-else-if="results.length > 0" class="results">
      <div class="result-count">找到 {{ results.length }} 题</div>
      <div class="card" v-for="q in results" :key="q.id">
        <span class="tag">{{ {1:'单选',2:'多选',3:'判断'}[q.type] }}</span>
        <span class="ch-tag">{{ q.chapter?.name }}</span>
        <div class="content" v-html="highlight(q.content)"></div>
        <div class="answer-line">答案: <span class="ans">{{ q.answer }}</span></div>
      </div>
    </div>
    <div v-else-if="searched" class="empty">未找到相关题目</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getQuestions } from '@/api/index'

const keyword = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  loading.value = true
  searched.value = true
  try {
    const res = await getQuestions({ keyword: kw, pageSize: 100 })
    results.value = res.data?.list || []
  } catch {}
  finally { loading.value = false }
}

function highlight(text) {
  if (!keyword.value) return text
  const kw = keyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(kw, 'gi'), (m) => `<mark style="background:#fdf6ec;padding:0 2px">${m}</mark>`)
}
</script>

<style scoped>
.page { padding: 16px; }
.search-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.search-input { flex: 1; height: 44px; border: 1px solid #ddd; border-radius: 8px; padding: 0 12px; font-size: 15px; outline: none; }
.search-input:focus { border-color: #409eff; }
.search-btn { height: 44px; background: #409eff; color: #fff; border: none; border-radius: 8px; padding: 0 20px; font-size: 15px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.result-count { font-size: 13px; color: #999; margin-bottom: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.tag { font-size: 12px; background: #ecf5ff; color: #409eff; padding: 2px 8px; border-radius: 4px; margin-right: 4px; }
.ch-tag { font-size: 12px; background: #f0f9eb; color: #67c23a; padding: 2px 8px; border-radius: 4px; }
.content { font-size: 15px; color: #333; margin: 8px 0; line-height: 1.5; }
.answer-line { font-size: 13px; color: #666; }
.ans { color: #409eff; font-weight: bold; }
</style>
