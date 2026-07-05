import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
        { path: 'chapters', name: 'Chapters', component: () => import('@/views/chapter/List.vue') },
        { path: 'questions', name: 'Questions', component: () => import('@/views/question/List.vue') },
        { path: 'questions/create', name: 'QuestionCreate', component: () => import('@/views/question/Edit.vue') },
        { path: 'questions/:id/edit', name: 'QuestionEdit', component: () => import('@/views/question/Edit.vue') },
        { path: 'questions/import', name: 'QuestionImport', component: () => import('@/views/question/Import.vue') },
        { path: 'users', name: 'Users', component: () => import('@/views/user/List.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const user = useUserStore()
  if (to.name !== 'Login' && !user.token) return '/login'
})

export default router
