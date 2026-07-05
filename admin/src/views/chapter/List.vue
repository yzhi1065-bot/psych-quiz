<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>章节管理</span>
          <el-button type="primary" size="small" @click="showDialog(null)">+ 新增章节</el-button>
        </div>
      </template>
      <el-table :data="chapters" v-loading="loading" row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="章节名称" />
        <el-table-column label="子章节">
          <template #default="{ row }">
            <span v-if="row.children?.length">{{ row.children.map(c => c.name).join(', ') }}</span>
            <span v-else style="color:#999">—</span>
          </template>
        </el-table-column>
        <el-table-column label="题目数">
          <template #default="{ row }">{{ row._count?.questions || 0 }}</template>
        </el-table-column>
        <el-table-column label="排序" width="80">
          <template #default="{ row }">{{ row.sortOrder }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="showDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑章节' : '新增章节'" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="章节名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getChapters, createChapter, updateChapter, deleteChapter } from '@/api/chapter'

const loading = ref(false)
const chapters = ref<any[]>([])
const dialogVisible = ref(false)
const editing = ref<any>(null)
const saving = ref(false)
const formRef = ref()
const form = ref({ name: '', sortOrder: 1 })
const rules = { name: [{ required: true, message: '请输入章节名' }] }

async function loadData() {
  loading.value = true
  try {
    const res: any = await getChapters(true)
    chapters.value = res.data
  } finally { loading.value = false }
}

function showDialog(row: any) {
  editing.value = row
  form.value = row ? { name: row.name, sortOrder: row.sortOrder } : { name: '', sortOrder: 1 }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (editing.value) {
      await updateChapter(editing.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createChapter(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e: any) { ElMessage.error(e?.message || '操作失败') }
  finally { saving.value = false }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除"${row.name}"？如有题目则无法删除`)
    await deleteChapter(row.id)
    ElMessage.success('已删除')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
