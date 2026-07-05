<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cards" :key="item.label">
        <el-card shadow="hover">
          <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <el-card>
          <template #header>题型分布</template>
          <div class="bar-chart">
            <div class="bar-row" v-for="item in typeStats" :key="item.label">
              <span class="bar-label">{{ item.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
              </div>
              <span class="bar-value">{{ item.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>各章节题量</template>
          <div class="bar-chart compact">
            <div class="bar-row" v-for="ch in chapterStats" :key="ch.id">
              <span class="bar-label">{{ ch.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: ch.pct + '%' }"></div>
              </div>
              <span class="bar-value">{{ ch.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top:20px">
      <template #header>快速入口</template>
      <el-button type="primary" @click="$router.push('/questions/create')">新增题目</el-button>
      <el-button type="success" @click="$router.push('/questions/import')" style="margin-left:12px">Word 导入</el-button>
      <el-button @click="$router.push('/chapters')" style="margin-left:12px">管理章节</el-button>
      <el-button @click="$router.push('/users')" style="margin-left:12px">用户管理</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getQuestions } from '@/api/question'
import { getChapters } from '@/api/chapter'
import { getUsers } from '@/api/user'

const cards = ref([
  { label: '总题目数', value: '...', color: '#409eff' },
  { label: '总章节数', value: '...', color: '#67c23a' },
  { label: '注册用户', value: '...', color: '#e6a23c' },
  { label: '总做题数', value: '...', color: '#f56c6c' },
])

const typeStats = ref([
  { label: '单选题', count: 0, pct: 0, color: '#409eff' },
  { label: '多选题', count: 0, pct: 0, color: '#e6a23c' },
  { label: '判断题', count: 0, pct: 0, color: '#67c23a' },
])

const chapterStats = ref<any[]>([])

onMounted(async () => {
  try {
    const [qRes, cRes, uRes]: any[] = await Promise.all([
      getQuestions({ page: 1, pageSize: 1 }),
      getChapters(),
      getUsers(1, 1),
    ])
    const total = qRes.data.total || 0
    cards.value[0].value = total
    cards.value[1].value = cRes.data?.length || 0
    cards.value[2].value = uRes.data?.total || 0

    // 各题型数量
    const [sRes, mRes, jRes]: any[] = await Promise.all([
      getQuestions({ type: 1, pageSize: 1 }),
      getQuestions({ type: 2, pageSize: 1 }),
      getQuestions({ type: 3, pageSize: 1 }),
    ])
    const s = sRes.data.total || 0
    const m = mRes.data.total || 0
    const j = jRes.data.total || 0
    const maxT = Math.max(s, m, j, 1)
    typeStats.value = [
      { label: '单选题', count: s, pct: Math.round(s / maxT * 100), color: '#409eff' },
      { label: '多选题', count: m, pct: Math.round(m / maxT * 100), color: '#e6a23c' },
      { label: '判断题', count: j, pct: Math.round(j / maxT * 100), color: '#67c23a' },
    ]

    // 各章节题量
    const chs = cRes.data || []
    const maxCh = Math.max(...chs.map((c: any) => c._count?.questions || 0), 1)
    chapterStats.value = chs.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      count: ch._count?.questions || 0,
      pct: Math.round((ch._count?.questions || 0) / maxCh * 100),
    }))
  } catch {}
})
</script>

<style scoped>
.stat-value { font-size: 32px; font-weight: bold; }
.stat-label { font-size: 14px; color: #999; margin-top: 4px; }
.bar-chart { padding: 4px 0; }
.bar-chart.compact .bar-row { margin-bottom: 4px; }
.bar-row { display: flex; align-items: center; margin-bottom: 10px; gap: 8px; }
.bar-label { width: 80px; font-size: 13px; color: #666; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-track { flex: 1; height: 16px; background: #f0f2f5; border-radius: 8px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 8px; transition: width .5s; }
.bar-value { width: 40px; text-align: right; font-size: 13px; color: #333; font-weight: bold; }
</style>
