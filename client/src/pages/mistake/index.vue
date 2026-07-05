<template>
  <div class="page">
    <div class="filter-bar">
      <select v-model="chapterFilter" @change="loadMistakes">
        <option :value="undefined">全部章节</option>
        <option v-for="c in chapters" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div v-if="!loading && mistakes.length > 0" class="toolbar">
      <span class="count">共 {{ mistakes.length }} 道错题</span>
      <button class="btn-clear-all" @click="clearAll">清空全部</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="mistakes.length === 0" class="empty">暂无错题，继续保持！</div>

    <div v-else class="list">
      <div class="card" v-for="item in mistakes" :key="item.id">
        <div class="card-header">
          <span class="tag">{{ {1:'单选',2:'多选',3:'判断'}[item.question.type] }}</span>
          <button class="btn-del" @click="removeOne(item)">删除</button>
        </div>
        <div class="content">{{ item.question.content }}</div>

        <div class="options" v-if="item.question.options?.length">
          <div v-for="opt in item.question.options" :key="opt.label" class="opt" :class="{ correct: item.question.answer.includes(opt.label) }">
            {{ opt.label }}. {{ opt.content }}
          </div>
        </div>

        <div class="answer-line">正确答案: <span class="ans">{{ item.question.answer }}</span></div>
        <div v-if="item.question.analysis" class="analysis">{{ item.question.analysis }}</div>

        <button class="btn-retry" @click="retry(item)">重做此题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMistakes, submitAnswer as apiSubmit, removeMistake, clearAllMistakes, getChapters } from '@/api/index'

const mistakes = ref([])
const chapters = ref([])
const loading = ref(true)
const chapterFilter = ref(undefined)

onMounted(async () => {
  try {
    const cRes = await getChapters()
    chapters.value = cRes.data || []
  } catch {}
  loadMistakes()
})

async function loadMistakes() {
  loading.value = true
  try {
    const res = await getMistakes(chapterFilter.value)
    mistakes.value = res.data || []
  } catch {}
  finally { loading.value = false }
}

async function retry(item) {
  await apiSubmit(item.question.id, '__retry__')
  loadMistakes()
}

async function removeOne(item) {
  try {
    await removeMistake(item.question.id)
    mistakes.value = mistakes.value.filter(m => m.id !== item.id)
  } catch {}
}

async function clearAll() {
  if (!confirm('确定清空全部错题吗？')) return
  try {
    await clearAllMistakes()
    mistakes.value = []
  } catch {}
}
</script>

<style scoped>
.page { padding: 16px; }
.filter-bar { margin-bottom: 12px; }
.filter-bar select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px; }
.count { font-size: 14px; color: #999; }
.btn-clear-all { background: #fff; border: 1px solid #f56c6c; color: #f56c6c; border-radius: 6px; padding: 6px 14px; font-size: 13px; cursor: pointer; }
.btn-clear-all:hover { background: #fef0f0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.btn-del { background: none; border: none; color: #bbb; font-size: 13px; cursor: pointer; padding: 2px 6px; }
.btn-del:hover { color: #f56c6c; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.list { display: flex; flex-direction: column; gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; }
.tag { font-size: 12px; background: #fef0f0; color: #f56c6c; padding: 2px 8px; border-radius: 4px; }
.content { font-size: 15px; color: #333; margin: 8px 0; }
.opt { padding: 6px 8px; border: 1px solid #eee; border-radius: 4px; margin-top: 4px; font-size: 14px; }
.opt.correct { border-color: #67c23a; background: #f0f9eb; }
.answer-line { font-size: 13px; color: #666; margin-top: 8px; }
.ans { color: #f56c6c; font-weight: bold; }
.analysis { font-size: 13px; color: #666; margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 6px; }
.btn-retry { width: 100%; height: 36px; border: 1px solid #409eff; border-radius: 18px; background: #fff; color: #409eff; font-size: 14px; margin-top: 8px; cursor: pointer; }
</style>
