<template>
    <div class="auth-layout">
        <header class="header">
            <div class="header-content">
                <div class="brand">
                    <img src="../assets/logo.png" alt="Logo" class="logo" />
                    <span class="brand-text">CENTRAL</span>
                </div>
                <button class="hamburger-btn" @click="toggleMenu" aria-label="Toggle menu">
                    <font-awesome-icon :icon="isMenuOpen ? 'times' : 'bars'" />
                </button>

                <nav class="nav-menu" :class="{ 'nav-menu-open': isMenuOpen }">
                    <router-link to="/dashboard" class="nav-item" active-class="active">
                        <font-awesome-icon icon="home" />
                        <span>Beranda</span>
                    </router-link>

                    <template v-if="isAdminUser">
                        <router-link to="/users" class="nav-item" active-class="active">
                            <font-awesome-icon icon="users" />
                            <span>Pengguna</span>
                        </router-link>
                        <router-link to="/applications" class="nav-item" active-class="active">
                            <font-awesome-icon icon="window-restore" />
                            <span>Aplikasi Klien</span>
                        </router-link>
                        <router-link to="/roles" class="nav-item" active-class="active">
                            <font-awesome-icon icon="user-shield" />
                            <span>Peran</span>
                        </router-link>
                        <!-- <router-link to="/user-roles" class="nav-item" active-class="active">
                            <font-awesome-icon icon="user-tag" />
                            <span>Peran Pengguna</span>
                        </router-link> -->                    
                    </template>
                </nav>

                <div class="right-section">
                    <div class="theme-switch">
                        <button @click.stop="themeStore.toggleTheme()" class="theme-button" :title="themeStore.isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'">
                            <font-awesome-icon :icon="themeStore.isDark ? 'sun' : 'moon'" size="lg" />
                        </button>
                    </div>

                    <div class="user-menu" @click="toggleUserMenu">
                        <button class="user-menu-btn">
                            <font-awesome-icon icon="user-circle" /> &nbsp; {{ name ? name : 'Pengguna' }}
                        </button>
                        <div v-if="showUserMenu" class="user-dropdown">
                            <button v-if="isImpersonating" class="dropdown-item" @click="leaveImpersonation">
                                <font-awesome-icon icon="user-secret" /> &nbsp; Keluar Impersonasi
                            </button>
                            <router-link to="/profile" class="dropdown-item" active-class="active"><font-awesome-icon icon="user" /> &nbsp; Profil</router-link>
                            <button @click.stop="logout" class="dropdown-item logout"><font-awesome-icon icon="sign-out-alt" /> &nbsp; Keluar</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        
        <main class="main-content">
            <div class="content-wrapper">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>
        </main>

        <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 Universitas Pertamina. All rights reserved.</p>
        </div>
        </footer>
    </div>
</template>

<script setup>    
    import { useRouter } from 'vue-router';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
    import { authService } from '../api/services/authService';
    import { useThemeStore } from '../stores/theme';
    import { useAuthStore } from '@/stores/auth';
    import { successToast, errorToast, warningToast } from '@/utils/toast'

    const router = useRouter();
    const themeStore = useThemeStore();
    const authStore = useAuthStore();

    // Data user
    const userData = ref(null);
    const isLoading = ref(true);

    // Fetch data user
    const fetchUserData = async () => {
        isLoading.value = true;
        try {
            const response = await authService.me();
            userData.value = response.data.data;
        } catch (error) {
            errorToast(error);
        } finally {
            isLoading.value = false;
        }
    };

    const isMenuOpen = ref(false);
    const showUserMenu = ref(false);
    const isImpersonating = computed(() => authStore.isImpersonating);
    const name = computed(() => authStore.fullName);
    const isAdminUser = computed(() => authStore.isAdmin);

    const logout = async () => {
        await authStore.logout();
    }

    const leaveImpersonation = async () => {
        try {
            const response = await authStore.stopImpersonating();

            if (response) {
                successToast('Berhasil keluar impersonasi pengguna.');
                router.push('/profile');
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Gagal keluar impersonasi pengguna. Silakan coba lagi nanti.'

            errorToast(message)
        }
    }

    const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value;
    }

    const toggleUserMenu = () => {
        showUserMenu.value = !showUserMenu.value;
    }

    const closeUserMenu = (e) => {
        const menu = e.target.closest('.user-menu')
        if (!menu) showUserMenu.value = false
    }

    onMounted(() => {
        document.addEventListener('click', closeUserMenu)
        fetchUserData();
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', closeUserMenu)
    })
</script>

<style scoped>
    .auth-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--background);
    }

    .header {
        background-color: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 0 2rem;
        height: 64px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
    }

    .header-content {
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .logo {
        height: 40px;
        width: auto;
    }

    .brand-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .nav-menu {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        color: var(--text-primary);
        text-decoration: none;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .nav-item:hover {
        background-color: var(--hover);
        color: var(--text-primary);
    }

    .nav-item.active {
        background-color: var(--primary);
        color: white;
    }

    .logout-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    }

    .logout-btn:hover {
        background-color: var(--error);
        color: white;
        border-color: var(--error);
    }

    .main-content {
        margin-top: 64px;
        padding: 2rem;
        flex: 1;
    }

    .content-wrapper {
        max-width: 1400px;
        margin: 0 auto;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .hamburger-btn {
        display: none;
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .theme-switch {
        margin: 0;
        display: flex;
        align-items: center;
    }

    .theme-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--hover);
        border: none;
        padding: 8px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s ease;
    }

    .theme-button:hover {
        background: var(--hover-dark);
        color: var(--text-primary);
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        .header {
            padding: 0 1rem;
        }

        .header-content {
            position: relative;
        }

        .hamburger-btn {
            display: block;
            order: 1;
        }

        .brand {
            order: 0;
        }

        .nav-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background-color: var(--surface);
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
            visibility: hidden;
        }

        .nav-menu.nav-menu-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }

        .nav-item {
            width: 100%;
            padding: 1rem;
        }

        .user-menu {
            order: 2;
            margin-left: auto;
        }

        .theme-switch {
            order: 1;
            margin-right: 0;
            margin-left: 1rem;
        }

        .main-content {
            padding: 1rem;
        }

        .right-section {
            gap: 0.25rem;
        }
    }

    .user-menu {
      position: relative;
    }

    .user-menu-btn {
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 1.0rem;
      cursor: pointer;
    }

    .user-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      /* background: var(--text-primary); */
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 999;
      display: flex;
      flex-direction: column;
      min-width: 200px;
    }

    .dropdown-item {
      padding: 1rem 1rem;
      text-align: left;
      background: var(--surface);
      border: none;
      color: var(--text-primary);
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: var(--hover);
    }

    .dropdown-item.logout {
      color: var(--error);
    }

    .footer {
        background-color: var(--surface);
        border-top: 1px solid var(--border);
        padding: 1rem 2rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        text-align: center;
    }

    .footer a {
        color: var(--primary);
        text-decoration: none;
    }

    .footer a:hover {
        text-decoration: underline;
    }

    .footer-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
</style>