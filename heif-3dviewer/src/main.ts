
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './routes'
import Tres from '@tresjs/core'

const app=createApp(App)
app.use(router)
app.use(Tres)
app.mount('#app')
