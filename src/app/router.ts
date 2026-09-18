import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/verspakketten/views/HomeView.vue'),
  },
  {
    path: '/verspakketten',
    name: 'verspakketten',
    component: () => import('@/features/verspakketten/views/VerspakkettenOverzichtView.vue'),
    meta: { titel: 'Verspakketten' },
  },
  {
    path: '/verspakketten/toevoegen',
    name: 'verspakket-toevoegen',
    component: () => import('@/features/verspakketten/views/VerspakketToevoegenView.vue'),
    meta: { titel: 'Verspakket toevoegen' },
  },
  {
    path: '/verspakketten/importeren',
    name: 'verspakket-importeren',
    component: () => import('@/features/verspakketten/views/VerspakketImporterenView.vue'),
    meta: { titel: 'Verspakket importeren' },
  },
  {
    path: '/verspakketten/:id/bewerken',
    name: 'verspakket-bewerken',
    component: () => import('@/features/verspakketten/views/VerspakketBewerkenView.vue'),
    meta: { titel: 'Verspakket bewerken' },
  },
  {
    path: '/verspakketten/:id',
    name: 'verspakket-detail',
    component: () => import('@/features/verspakketten/views/VerspakketDetailView.vue'),
    meta: { titel: 'Verspakket' },
  },
  {
    path: '/supermarkten',
    name: 'supermarkten',
    component: () => import('@/features/supermarkten/views/SupermarktenView.vue'),
    meta: { titel: 'Supermarkten' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'niet-gevonden',
    component: () => import('@/app/NotFoundView.vue'),
    meta: { titel: 'Pagina niet gevonden' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const titel = typeof to.meta.titel === 'string' ? to.meta.titel : null
  document.title = titel === null ? 'Lutra' : `${titel} · Lutra`
})
