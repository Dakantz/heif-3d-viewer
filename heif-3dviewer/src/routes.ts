import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import IndexView from './views/Index.vue'
import SharingView from './views/Sharing.vue'

const routes = [
    { path: '/', component: IndexView },
    { path: '/shared/:share_id', component: SharingView },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})