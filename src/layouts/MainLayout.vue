<template>
    <div class="layout">
        <nav class="navbar">
            <router-link to="/dashboard">Dashboard</router-link>
            <router-link to="/users">Users</router-link>
            <router-link to="/applications">Applications</router-link>
            <router-link to="/roles">Roles</router-link>
            <router-link to="/user-roles">User Roles</router-link>
            <button @click="logout">Logout</button>
        </nav>
        <main class="content">
            <router-view></router-view>
        </main>
    </div>
</template>

<script setup>
    import { useRouter } from 'vue-router';

    const router = useRouter();

    const logout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };
</script>

<style scoped>
    .layout {
        min-height: 100vh;
    }

    .navbar {
        padding: 1rem;
        background-color: #f8f9fa;
        display: flex;
        gap: 1rem;
    }

    .content {
        padding: 2rem;
    }
</style>