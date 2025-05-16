import { ref, computed, onMounted } from 'vue';
import { authService } from '../api/services/authService';

const currentUser = ref([]);
const authToken = ref(localStorage.getItem('access_token') || null);

export function useAuth() {
    const isAdmin = computed(() => {
        if (!currentUser.value || !currentUser.value.app_access) return false;
        
        const ssoApp = currentUser.value.app_access.find(app => app.code === 'SSO');
        if (!ssoApp) return false;
        
        return ssoApp.roles.some(role => role.code === 'admin');
    })

    const setUser = async () => {
        const response = await authService.me();
        currentUser.value = response.data.data;
    }

    return {
        user: currentUser,
        token: authToken,
        isAdmin: isAdmin.value,
        setUser,
    }
}