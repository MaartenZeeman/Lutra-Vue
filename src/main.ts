import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'

import App from '@/app/App.vue'
import { router } from '@/app/router'
import '@/shared/styles/base.css'

createApp(App).use(router).mount('#app')

registerSW({ immediate: true })
