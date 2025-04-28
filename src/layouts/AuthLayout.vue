<template>
    <div class="auth-layout">
        <header class="header">
            <div class="header-content">
                <div class="brand">
                    <img src="../assets/logo.png" alt="Logo" class="logo" />
                    <span class="brand-text">UPER IDP</span>
                </div>
                <nav class="nav-menu">
                    <router-link to="/dashboard" class="nav-item" active-class="active">
                        <font-awesome-icon icon="home" />
                        <span>Dashboard</span>
                    </router-link>
                    <router-link to="/users" class="nav-item" active-class="active">
                        <font-awesome-icon icon="users" />
                        <span>Users</span>
                    </router-link>
                    <router-link to="/applications" class="nav-item" active-class="active">
                        <font-awesome-icon icon="window-restore" />
                        <span>Applications</span>
                    </router-link>
                    <router-link to="/roles" class="nav-item" active-class="active">
                        <font-awesome-icon icon="user-shield" />
                        <span>Roles</span>
                    </router-link>
                    <router-link to="/user-roles" class="nav-item" active-class="active">
                        <font-awesome-icon icon="user-tag" />
                        <span>User Roles</span>
                    </router-link>
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
    </div>
</template>

<script setup>
    import { useRouter } from 'vue-router';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    const router = useRouter();

    const logout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
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

    @media (max-width: 768px) {
        .header {
            padding: 0 1rem;
        }

        .nav-menu {
            display: none;
        }

        .main-content {
            padding: 1rem;
        }
    }
</style>