import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/CryptoDashboard.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
  ],
})
