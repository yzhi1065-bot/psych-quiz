<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">管理后台登录</h2>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" style="width:100%" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-hint">测试账号: 13800000000 / admin123</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({ phone: '13800000000', password: 'admin123' })
const rules = {
  phone: [{ required: true, message: '请输入手机号' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res: any = await login(form)
    userStore.setToken(res.data.token)
    await userStore.fetchProfile()
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card { width: 400px; }
.login-title { text-align: center; margin-bottom: 24px; color: #333; }
.login-hint { text-align: center; color: #999; font-size: 12px; margin-top: 8px; }
</style>
