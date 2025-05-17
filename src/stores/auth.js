// stores/auth.js
import { defineStore } from 'pinia';
import { authService } from '../api/services/authService';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  // State
  state: () => ({
    user: null,
    isLoading: false,
    isUserLoaded: false,
    loadError: null,
    refreshPromise: null,
    isRefreshing: false
  }),

  // Getters
  getters: {
    isAuthenticated: (state) => !!state.user || !!localStorage.getItem('access_token'),
    isAdmin: (state) => {
      if (!state.user || !state.user.app_access) return false;
      
      const ssoApp = state.user.app_access.find(app => app.code === 'SSO');
      if (!ssoApp) return false;
      
      return ssoApp.roles.some(role => role.code === 'admin');
    },
    fullName: (state) => state.user?.name || '',
    email: (state) => state.user?.email || '',
    roles: (state) => {
      if (!state.user || !state.user.app_access) return [];
      
      // Mengumpulkan semua role dari semua aplikasi
      return state.user.app_access.reduce((roles, app) => {
        return [...roles, ...(app.roles || [])];
      }, []);
    }
  },

  // Actions
  actions: {
    // Mengambil data user
    async fetchUserData(force = false) {
      // Jika data sudah ada dan tidak dipaksa refresh, gunakan data yang sudah ada
      if (this.isUserLoaded && !force) {
        return this.user;
      }
      
      // Jika sedang loading, jangan mulai request baru
      if (this.isLoading) {
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!this.isLoading) {
              clearInterval(checkInterval);
              if (this.loadError) {
                reject(this.loadError);
              } else {
                resolve(this.user);
              }
            }
          }, 100);
        });
      }
      
      // Mulai request baru
      this.isLoading = true;
      this.loadError = null;
      
      try {
        const response = await authService.me();
        this.user = response.data.data;
        this.isUserLoaded = true;
        return this.user;
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.loadError = error;
        
        // Logout jika error 401 (token tidak valid)
        if (error.response?.status === 401) {
          this.clearSession();
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Cek dan refresh token jika perlu
    async checkAndRefreshToken() {
      const token = localStorage.getItem('access_token');
      
      // Cek apakah token sudah expired
      const isTokenExpired = () => {
        if (!token) return true;
        
        try {
          // Parse token untuk mendapatkan payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Cek apakah token memiliki exp claim
          if (!payload || !payload.exp) return false;
          
          // Bandingkan waktu expired dengan waktu sekarang (dalam detik)
          // dengan buffer 60 detik
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp < (currentTime + 60);
        } catch (error) {
          console.error('Error parsing token:', error);
          return true; // Anggap expired jika format token tidak valid
        }
      };
      
      // Refresh token jika expired dan belum dalam proses refresh
      if (!this.isRefreshing && token && isTokenExpired()) {
        this.isRefreshing = true;
        
        try {
          const response = await authService.refreshToken();
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          return access_token;
        } catch (error) {
          if (error.response?.status === 401) {
            this.clearSession();
            router.push('/login');
          }
          throw error;
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      }
      
      return token;
    },
    
    // Login
    async login(credentials) {
      try {
        const response = await authService.login(credentials);
        const { access_token } = response.data;
        
        localStorage.setItem('access_token', access_token);
        
        // Fetch user data setelah login
        await this.fetchUserData(true);
        
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    // Logout
    async logout() {
      try {
        await authService.logout();
        this.clearSession();
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        // Tetap clear session meskipun API logout gagal
        this.clearSession();
        throw error;
      }
    },
    
    // Clear session data
    clearSession() {
      this.user = null;
      this.isUserLoaded = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('impersonated_by');
    },
    
    // Impersonate user (untuk fitur admin)
    async impersonateUser(userId) {
      try {
        const response = await authService.impersonate(userId);
        const { access_token } = response.data;
        
        // Simpan token admin asli untuk kembali nanti
        localStorage.setItem('impersonated_by', localStorage.getItem('access_token'));
        localStorage.setItem('access_token', access_token);
        
        // Refresh user data
        await this.fetchUserData(true);
        
        return true;
      } catch (error) {
        console.error('Impersonation error:', error);
        throw error;
      }
    },
    
    // Berhenti impersonate
    async stopImpersonating() {
      const originalToken = localStorage.getItem('impersonated_by');
      
      if (originalToken) {
        localStorage.setItem('access_token', originalToken);
        localStorage.removeItem('impersonated_by');
        
        // Refresh user data
        await this.fetchUserData(true);
        
        return true;
      }
      
      return false;
    }
  }
});