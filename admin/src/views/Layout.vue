<template>
  <el-container style="height:100vh">
    <el-aside width="220px" style="background:#304156">
      <div class="sidebar-header">📚 刷题后台</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon><span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/chapters">
          <el-icon><FolderOpened /></el-icon><span>章节管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon><span>用户管理</span>
        </el-menu-item>
        <el-sub-menu index="/questions">
          <template #title><el-icon><List /></el-icon><span>题库管理</span></template>
          <el-menu-item index="/questions">题目列表</el-menu-item>
          <el-menu-item index="/questions/create">新增题目</el-menu-item>
          <el-menu-item index="/questions/import">Word 导入</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background:#fff;border-bottom:1px solid #e6e6e6;display:flex;align-items:center;justify-content:flex-end;padding:0 20px">
        <span style="margin-right:16px;color:#666">{{ userStore.userInfo?.nickname || '管理员' }}</span>
        <el-button size="small" @click="handleLogout">退出</el-button>
      </el-header>
      <el-main style="background:#f0f2f5;padding:20px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.userInfo) userStore.fetchProfile()
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar-header {
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}
</style>
