<template>
  <div>
    <el-card>
      <template #header>Word 题库导入</template>

      <el-alert title="支持格式" type="info" :closable="false" style="margin-bottom:16px">
        <template #default>
          <p style="margin:4px 0">支持：单选题 / 多选题 / 判断题，自动解析选项、答案、解析。</p>
          <p style="margin:4px 0">格式示例：<strong>【单选题】题干内容</strong>，选项以 <strong>A. xxx</strong> 开头，<strong>【答案】A</strong>，<strong>【解析】xxx</strong></p>
        </template>
      </el-alert>

      <el-form :model="form" label-width="100px">
        <el-form-item label="导入到章节">
          <el-select v-model="form.chapterId" placeholder="选择目标章节" style="width:300px">
            <el-option v-for="c in chapters" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
          <span style="color:#999;margin-left:8px;font-size:12px">不选则默认导入第1章</span>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".docx"
            :on-change="handleFileChange"
          >
            <el-button type="primary" :icon="Upload">选择 Word 文件 (.docx)</el-button>
            <template #tip><div style="color:#999;font-size:12px;margin-top:4px">仅支持 .docx 格式，大小不超过 50MB</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :loading="importing" :disabled="!file" @click="handleImport">开始导入</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="result" style="margin-top:16px">
      <template #header>导入结果</template>
      <el-result :icon="result.imported > 0 ? 'success' : 'error'" :title="`成功导入 ${result.imported} 题`">
        <template #sub-title>
          <p>共解析 {{ result.total }} 题，导入 {{ result.imported }} 题，失败 {{ result.failed }} 题</p>
        </template>
        <template #extra v-if="result.errors?.length">
          <el-table :data="result.errors" max-height="300" size="small">
            <el-table-column label="错误信息">
              <template #default="{ row }">{{ row.message }}</template>
            </el-table-column>
            <el-table-column label="原始内容" min-width="200">
              <template #default="{ row }">
                <span style="color:#999;font-size:12px">{{ row.rawContent?.substring(0, 60) || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { getChapters } from '@/api/chapter'
import { importWord } from '@/api/question'

const chapters = ref<any[]>([])
const file = ref<any>(null)
const importing = ref(false)
const result = ref<any>(null)
const form = ref({ chapterId: undefined as number | undefined })

onMounted(async () => {
  try {
    const res: any = await getChapters()
    chapters.value = res.data
  } catch {}
})

function handleFileChange(uploadFile: any) {
  file.value = uploadFile.raw
  result.value = null
}

async function handleImport() {
  if (!file.value) { ElMessage.warning('请先选择文件'); return }
  importing.value = true
  result.value = null
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    const res: any = await importWord(formData, form.value.chapterId)
    result.value = res.data
    if (res.data.imported > 0) ElMessage.success(`成功导入 ${res.data.imported} 题`)
  } catch (e: any) {
    ElMessage.error(e?.message || '导入失败')
  } finally { importing.value = false }
}
</script>
