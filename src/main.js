import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './plugins/fontawesome'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.component('multiselect', Multiselect)
app.use(router)
app.use(VueSweetalert2)

app.mount('#app')
