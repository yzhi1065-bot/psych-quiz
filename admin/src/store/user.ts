import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProfile } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref<any>(null)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('admin_token', t)
  }

  async function fetchProfile() {
    const res: any = await getProfile()
    userInfo.value = res.data
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
  }

  return { token, userInfo, setToken, fetchProfile, logout }
})
