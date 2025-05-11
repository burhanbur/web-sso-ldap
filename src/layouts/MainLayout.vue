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
                        <span>Dasbor</span>
                    </router-link>
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
                </nav>
                <div class="user-menu">
                    <button @click="logout" class="logout-btn">
                        <font-awesome-icon icon="sign-out-alt" />
                        <span>Logout</span>
                    </button>
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
    import { ref } from 'vue';
    import { authService } from '../api/services/authService';

    const router = useRouter();
    const isMenuOpen = ref(false);

    const logout = async () => {
        const logout = await authService.logout();

        if (logout.data.success) {
            localStorage.removeItem('access_token');
            router.push('/login');
        }
    };

    const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value;
    };
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
        color: var(--text-secondary);
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

        .main-content {
            padding: 1rem;
        }
    }
</style>
<style scoped>
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