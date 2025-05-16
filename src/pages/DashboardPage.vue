<template>
    <div class="dashboard">
      <header class="dashboard-header">
        <h2>📊 Selamat datang di Central Authentication Universitas Pertamina</h2>
      </header>
  
      <section class="dashboard-section">
        <h2>✨&nbsp; Aplikasi yang Anda Gunakan</h2>
        <div v-if="loadingApps" class="loading spinner-container"><div class="spinner"></div></div>
        <div v-if="applications.length === 0 && !loadingApps" class="text-center"><h3>Tidak ada data yang ditemukan.</h3></div>
        <div v-else class="layout-grid">
          <div v-for="app in applications" :key="app.id" class="card">
            <a style="color: inherit;" :href="app.login_url" target="_blank">
              <div class="app-content">
                <img :src="/*app.image ||*/ '/favicon.png'" :alt="app.name" class="app-logo" />
                  <div class="app-info">
                    <h3>{{ app.name }}</h3>
                    <p class="code">{{ app.code }}</p>
                    <div class="badges">
                      <span class="badge platform">{{ app.platform_type }}</span>
                      <span class="badge visibility">{{ app.visibility }}</span>
                      <span :class="['badge', 'status', app.is_active ? 'active' : 'inactive']">
                        {{ app.is_active ? 'Aktif' : 'Tidak Aktif' }}
                      </span>
                    </div>
                  </div>
              </div>

              <div class="app-description">
                <p class="description">{{ app.description || 'Tidak ada deskripsi' }}</p>
              </div>
            </a>
          </div>
        </div>
      </section>
  
      <!-- <section class="dashboard-section">
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
      </section> -->
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
        const response = await applicationService.getMyApplications();
        applications.value = response.data.data;
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

.app-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-logo {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  object-fit: contain;
  background: #f0f0f0;
  padding: 0.5rem;
}

.app-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.code {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.2rem;
  font-family: monospace;
}

.description {
  margin-top: 0.5rem;
  color: #555;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.badge.platform {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge.visibility {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.badge.status {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge.status.inactive {
  background-color: #fafafa;
  color: #616161;
}

.app-urls {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-bottom {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.url {
  color: #2196f3;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.url:hover {
  text-decoration: underline;
}
</style>