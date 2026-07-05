<template>
  <div class="page">
    <div class="chapter-list">
      <div class="chapter-card all" @click="router.push('/exercise/answer')">
        <div class="ch-name">📚 全部章节</div>
        <div class="ch-meta">{{ totalAll }} 题 ›</div>
      </div>
      <div class="divider">按章节</div>
      <div class="chapter-card" v-for="ch in chapters" :key="ch.id" @click="startExercise(ch.id)">
        <div class="ch-name">{{ ch.name }}</div>
        <div class="ch-meta">{{ ch._count?.questions || 0 }} 题 ›</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getChapters } from '@/api/index'

const router = useRouter()
const chapters = ref([])
const totalAll = ref(0)

onMounted(async () => {
  try {
    const res = await getChapters()
    chapters.value = res.data || []
    totalAll.value = chapters.value.reduce((s, c) => s + (c._count?.questions || 0), 0)
  } catch (e) { console.error(e) }
})

function startExercise(chapterId) {
  router.push(`/exercise/answer?chapterId=${chapterId}`)
}
</script>

<style scoped>
.page { padding: 16px; }
.chapter-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-card { background: #fff; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.chapter-card:hover { background: #f8f9ff; }
.ch-name { font-size: 15px; color: #333; }
.ch-meta { font-size: 13px; color: #999; }
.chapter-card.all .ch-name { color: #409eff; }
.divider { font-size: 13px; color: #bbb; padding: 8px 0 4px; }
</style>
