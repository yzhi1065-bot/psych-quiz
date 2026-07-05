import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: () => import('@/pages/home/index.vue') },
  { path: '/exercise', name: 'Exercise', component: () => import('@/pages/exercise/index.vue') },
  { path: '/exercise/answer', name: 'Answer', component: () => import('@/pages/exercise/answer.vue'), props: route => ({ chapterId: Number(route.query.chapterId) }) },
  { path: '/result', name: 'Result', component: () => import('@/pages/result/index.vue') },
  { path: '/mistake', name: 'Mistake', component: () => import('@/pages/mistake/index.vue') },
  { path: '/favorites', name: 'Favorites', component: () => import('@/pages/favorites/index.vue') },
  { path: '/search', name: 'Search', component: () => import('@/pages/search/index.vue') },
  { path: '/calendar', name: 'Calendar', component: () => import('@/pages/calendar/index.vue') },
  { path: '/mine', name: 'Mine', component: () => import('@/pages/mine/index.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
