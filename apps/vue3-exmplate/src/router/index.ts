import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   // 可选歌手和歌曲
    //   path: '/music',
    //   name: 'music',
    //   component: () => import('../views/MusicView.vue'),
    // },
    // {
    //   path: '/media',
    //   name: 'media',
    //   component: () => import('../views/MediaView.vue'),
    // },
  ],
})

export default router
