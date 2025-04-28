<template>
    <div class="dashboard">
        <h1>Dashboard</h1>
        
        <section class="applications-section">
            <h2>Applications</h2>
            <div v-if="loadingApps" class="loading">Loading applications...</div>
            <div v-else class="applications-grid">
                <div v-for="app in applications" :key="app.id" class="app-card">
                    <h3>{{ app.name }}</h3>
                    <p>{{ app.description }}</p>
                </div>
            </div>
        </section>

        <section class="users-section">
            <h2>Latest Users</h2>
            <div v-if="loadingUsers" class="loading">Loading users...</div>
            <div v-else class="users-list">
                <div v-for="user in latestUsers" :key="user.id" class="user-item">
                    <span>{{ user.full_name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applicationService } from '../api/services/applicationService';
import { userService } from '../api/services/userService';

const applications = ref([]);
const latestUsers = ref([]);
const loadingApps = ref(true);
const loadingUsers = ref(true);

const fetchApplications = async () => {
    try {
        const response = await applicationService.getApplications();
        applications.value = response.data.data;
        console.log(applications);
    } catch (error) {
        console.error('Failed to fetch applications:', error);
    } finally {
        loadingApps.value = false;
    }
};

const fetchLatestUsers = async () => {
    try {
        const response = await userService.getLatestUsers();
        latestUsers.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch latest users:', error);
    } finally {
        loadingUsers.value = false;
    }
};

onMounted(() => {
    fetchApplications();
    fetchLatestUsers();
});
</script>

<style scoped>
.dashboard {
    padding: 1rem;
}

.applications-section,
.users-section {
    margin-bottom: 2rem;
}

.applications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.app-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.users-list {
    margin-top: 1rem;
}

.user-item {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-email {
    color: #666;
}

.loading {
    padding: 1rem;
    color: #666;
}
</style>