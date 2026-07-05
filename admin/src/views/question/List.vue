<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <span>题目列表</span>
          <div>
            <el-button size="small" @click="$router.push('/questions/create')">+ 新增</el-button>
            <el-button size="small" type="success" @click="$router.push('/questions/import')">Word 导入</el-button>
          </div>
        </div>
      </template>

      <el-form :model="filter" layout="inline" style="margin-bottom:16px">
        <el-form-item label="章节">
          <el-select v-model="filter.chapterId" clearable placeholder="全部章节" style="width:160px">
            <el-option v-for="c in chapters" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="filter.type" clearable placeholder="全部题型" style="width:120px">
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="判断题" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filter.keyword" placeholder="题干关键词" clearable style="width:200px" @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="题型" width="80">
          <template #default="{ row }">{{ { 1:'单选', 2:'多选', 3:'判断' }[row.type] }}</template>
        </el-table-column>
        <el-table-column label="章节" width="120">
          <template #default="{ row }">{{ row.chapter?.name }}</template>
        </el-table-column>
        <el-table-column label="题干" min-width="300">
          <template #default="{ row }">
            <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:400px">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column label="答案" width="100">
          <template #default="{ row }">{{ row.type === 3 ? (row.answer === '正确' ? '✓' : '✗') : row.answer }}</template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="70">
          <template #default="{ row }">{{ ['','易','中','难'][row.difficulty] }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/questions/${row.id}/edit`)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="filter.page"
        v-model:page-size="filter.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top:16px;justify-content:center"
        @change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuestions, deleteQuestion } from '@/api/question'
import { getChapters } from '@/api/chapter'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const chapters = ref<any[]>([])
const filter = reactive({ chapterId: undefined, type: undefined, keyword: '', page: 1, pageSize: 20 })

function resetFilter() {
  filter.chapterId = undefined
  filter.type = undefined
  filter.keyword = ''
  filter.page = 1
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await getQuestions(filter)
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该题目？')
    await deleteQuestion(row.id)
    ElMessage.success('已删除')
    loadData()
  } catch {}
}

onMounted(async () => {
  try {
    const cRes: any = await getChapters()
    chapters.value = cRes.data
  } catch {}
  loadData()
})
</script>
