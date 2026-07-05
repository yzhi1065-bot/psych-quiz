<template>
  <div>
    <el-card>
      <template #header>用户管理</template>
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="totalAnswered" label="做题数" width="80" />
        <el-table-column label="正确率" width="80">
          <template #default="{ row }">{{ row.accuracy }}%</template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top:16px;justify-content:center"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers } from '@/api/user'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers(page.value, pageSize.value)
    list.value = res.data.list
    total.value = res.data.total
  } catch {}
  finally { loading.value = false }
}

onMounted(loadData)
</script>
