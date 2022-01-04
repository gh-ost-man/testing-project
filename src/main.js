import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'mosha-vue-toastify/dist/style.css'

createApp(App).use(router).mount('#app')
