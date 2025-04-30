<template>
    <div class="dashboard">
      <header class="dashboard-header">
        <h2>📊 Selamat datang di Central Authentication Universitas Pertamina</h2>
      </header>
  
      <section class="dashboard-section">
        <h2>🚀 Aplikasi Klien</h2>
        <div v-if="loadingApps" class="loading spinner-container"><div class="spinner"></div></div>
        <div v-else class="applications-grid">
          <div v-for="app in applications" :key="app.id" class="app-card">
            <h3>
              <router-link :to="`/applications/${app.login_url}`">{{ app.name }}</router-link>
            </h3>
            <p>{{ app.description }}</p>
          </div>
        </div>
      </section>
  
      <section class="dashboard-section">
        <h2>🧑‍💻 Pengguna Terbaru</h2>
        <div v-if="loadingUsers" class="loading spinner-container"><div class="spinner"></div></div>
        <div v-else class="users-list">
          <div v-for="user in latestUsers" :key="user.id" class="user-item">
            <div class="user-info">
              <span class="user-name">{{ user.full_name }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  font-size: 1rem;
  color: #666;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.dashboard-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #222;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.app-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.app-card p {
  color: #666;
  font-size: 0.95rem;
}

.users-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  background: #fafafa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f0f0f0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
}

.user-email {
  font-size: 0.85rem;
  color: #888;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1rem;
  color: #777;
}
</style>