import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/css/dark-theme.css'
import './assets/css/dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './plugins/fontawesome'
import { useThemeStore } from './stores/theme'
import 'sweetalert2/dist/sweetalert2.min.css'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

const pinia = createPinia()
const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.component('multiselect', Multiselect)
app.use(pinia)
app.use(router)

// Initialize theme
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
