import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/Dashboard.vue'
import PagamentosView from '../views/Pagamentos.vue'
import ChatView from '../views/Chat_ia.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/pagamentos', component: PagamentosView },
    { path: '/chat', component: ChatView },
  ],
})

export default router