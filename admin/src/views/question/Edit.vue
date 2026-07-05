<template>
  <el-card>
    <template #header>{{ isEdit ? '编辑题目' : '新增题目' }}</template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="题型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :value="1">单选题</el-radio>
          <el-radio :value="2">多选题</el-radio>
          <el-radio :value="3">判断题</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="所属章节" prop="chapterId">
        <el-select v-model="form.chapterId" style="width:100%">
          <el-option v-for="c in chapters" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度">
        <el-radio-group v-model="form.difficulty">
          <el-radio :value="1">易</el-radio>
          <el-radio :value="2">中</el-radio>
          <el-radio :value="3">难</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="题干" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="4" />
      </el-form-item>

      <!-- 单选题/多选题选项 -->
      <template v-if="form.type !== 3">
        <div v-for="(opt, i) in form.options" :key="i" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <el-tag type="info">{{ opt.label }}</el-tag>
          <el-input v-model="opt.content" placeholder="选项内容" style="flex:1" />
          <el-button v-if="form.options.length > 2" size="small" type="danger" :icon="Delete" @click="form.options.splice(i,1)" circle />
        </div>
        <el-button size="small" @click="addOption">+ 添加选项</el-button>
      </template>

      <el-form-item label="答案" prop="answer" style="margin-top:16px">
        <template v-if="form.type === 1">
          <el-radio-group v-model="form.answer">
            <el-radio v-for="opt in form.options" :key="opt.label" :value="opt.label">{{ opt.label }}</el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="form.type === 2">
          <el-checkbox-group v-model="multiAnswer">
            <el-checkbox v-for="opt in form.options" :key="opt.label" :label="opt.label" :value="opt.label">{{ opt.label }}</el-checkbox>
          </el-checkbox-group>
        </template>
        <template v-else>
          <el-radio-group v-model="form.answer">
            <el-radio value="正确">正确</el-radio>
            <el-radio value="错误">错误</el-radio>
          </el-radio-group>
        </template>
      </el-form-item>

      <el-form-item label="解析">
        <el-input v-model="form.analysis" type="textarea" :rows="3" placeholder="选填" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getChapters } from '@/api/chapter'
import { getQuestion, createQuestion, updateQuestion } from '@/api/question'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const saving = ref(false)
const chapters = ref<any[]>([])

const form = reactive({
  type: 1,
  chapterId: undefined as number | undefined,
  content: '',
  answer: '',
  analysis: '',
  difficulty: 1,
  options: [
    { label: 'A', content: '' },
    { label: 'B', content: '' },
    { label: 'C', content: '' },
    { label: 'D', content: '' },
  ],
})

const multiAnswer = computed({
  get: () => form.answer ? form.answer.split(',') : [],
  set: (val: string[]) => { form.answer = val.sort().join(',') },
})

const labels = ['A', 'B', 'C', 'D', 'E', 'F']

function addOption() {
  const next = labels[form.options.length]
  if (next) form.options.push({ label: next, content: '' })
}

const rules = {
  type: [{ required: true }],
  chapterId: [{ required: true, message: '请选择章节' }],
  content: [{ required: true, message: '请输入题干' }],
  answer: [{ required: true, message: '请选择正确答案' }],
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isEdit.value) {
      await updateQuestion(+route.params.id, form)
      ElMessage.success('更新成功')
    } else {
      await createQuestion(form)
      ElMessage.success('创建成功')
    }
    router.push('/questions')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally { saving.value = false }
}

onMounted(async () => {
  try {
    const cRes: any = await getChapters()
    chapters.value = cRes.data
  } catch {}

  if (isEdit.value) {
    try {
      const res: any = await getQuestion(+route.params.id)
      Object.assign(form, res.data)
      // 确保 options 的 label 保留
      if (res.data.options) {
        form.options = res.data.options.map((o: any) => ({ label: o.label, content: o.content }))
      }
    } catch {
      ElMessage.error('题目不存在')
      router.push('/questions')
    }
  }
})
</script>
