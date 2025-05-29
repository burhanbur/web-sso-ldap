<template>    <div class="dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-title">
            <h2>📊 Selamat datang di Central Authentication Universitas Pertamina</h2>
          </div>          
          <div class="header-actions">
            <div class="notification-wrapper">
              <button @click="toggleNotifications" class="notification-button" :class="{ 'has-unread': hasUnreadNotifications }">
                <font-awesome-icon icon="bell" size="lg" />
                <span v-if="unreadCount" class="notification-badge">{{ unreadCount }}</span>
              </button>
              <div v-if="showNotifications" class="notification-dropdown">
                <div class="notification-header">
                  <h3>Notifikasi</h3>
                  <button v-if="notifications.length > 0" @click="markAllAsRead" class="mark-all-read">
                    <font-awesome-icon icon="check-double" />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                </div>
                <div class="notification-list" v-if="notifications.length > 0">
                  <div v-for="notification in notifications" 
                       :key="notification.id" 
                       class="notification-item"
                       :class="{ 'unread': !notification.read_at }">
                    <div class="notification-content" @click="readNotification(notification)">
                      <p class="notification-text">{{ notification.content }}</p>
                      <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                    </div>
                    <button @click.stop="deleteNotification(notification.uuid)" class="delete-notification" title="Hapus notifikasi">
                      <font-awesome-icon icon="trash" size="sm" />
                    </button>
                  </div>
                </div>
                <div v-else class="empty-notifications">
                  <font-awesome-icon icon="inbox" />
                  <div class="empty-text">
                    <p>Belum ada notifikasi</p>
                    <span>Notifikasi baru akan muncul di sini</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
  
      <section class="dashboard-section">
        <h2>🌎&nbsp; Aplikasi yang Anda Gunakan</h2>
        <div v-if="loadingApps" class="loading spinner-container"><div class="spinner"></div></div>
        <div v-if="applications.length === 0 && !loadingApps" class="text-center"><h3>Tidak ada data yang ditemukan.</h3></div>
        <div v-else class="layout-grid">
          <div v-for="app in applications" :key="app.id">
            <a style="color: inherit;" :href="app.login_url" target="_blank">
              <div class="card">
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { applicationService } from '../api/services/applicationService';
import { userService } from '../api/services/userService';
import { notificationService } from '../api/services/notificationService';
import { errorToast } from '@/utils/toast';

const applications = ref([]);
const latestUsers = ref([]);
const notifications = ref([]);
const showNotifications = ref(false);
const loadingApps = ref(true);
const loadingUsers = ref(true);

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(notification => !notification.read_at);
});

const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read_at).length;
});

const fetchApplications = async () => {
  try {
    const response = await applicationService.getMyApplications();
    applications.value = response.data.data;
  } catch (error) {
    errorToast(error)
    console.error('Failed to fetch applications:', error);
  } finally {
    loadingApps.value = false;
  }
}

const fetchLatestUsers = async () => {
    try {
        const response = await userService.getLatestUsers();
        latestUsers.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch latest users:', error);
    } finally {
        loadingUsers.value = false;
    }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    fetchNotifications();
  }
};

const fetchNotifications = async () => {
  try {
    const response = await notificationService.getNotifications();
    notifications.value = response.data.data;
  } catch (error) {
    errorToast(error);
  }
};

const readNotification = async (notification) => {
  if (!notification.read_at) {
    try {
      await notificationService.updateReadStatus(notification.uuid);
      notification.read_at = new Date().toISOString();
    } catch (error) {
      errorToast(error);
    }
  }
};

const markAllAsRead = async () => {
  try {
    await notificationService.readAllNotification();
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      read_at: notification.read_at || new Date().toISOString()
    }));
  } catch (error) {
    errorToast(error);
  }
};

const deleteNotification = async (uuid) => {
  try {
    await notificationService.deleteNotification(uuid);
    notifications.value = notifications.value.filter(n => n.uuid !== uuid);
  } catch (error) {
    errorToast(error);
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now - date) / 1000; // difference in seconds

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
  
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Close notifications when clicking outside
const handleClickOutside = (event) => {
  const notificationWrapper = document.querySelector('.notification-wrapper');
  if (notificationWrapper && !notificationWrapper.contains(event.target)) {
    showNotifications.value = false;
  }
};

onMounted(() => {
    fetchApplications();
    // fetchLatestUsers();
    document.addEventListener('click', handleClickOutside);
    fetchNotifications(); // Initial fetch
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.25rem 1rem 2rem 1rem;
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
}

.dashboard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--header-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-title {
  flex: 1;
}

.header-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-wrapper {
  position: relative;
}

.notification-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: none;
  padding: 10px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  color: #64748b;
  transition: all 0.2s ease;
}

.notification-button:hover {
  color: #333;
}

.notification-button:hover {
  background: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
}

.notification-button.has-unread {
  background: #e3f2fd;
  color: #2196f3;
}

.notification-button.has-unread:hover {
  background: #bbdefb;
  color: #1976d2;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 0.75rem;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  font-weight: 600;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 12px);
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  border: 1px solid #e5e7eb;
  animation: slideDown 0.2s ease-out;
  transform-origin: top right;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.notification-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.mark-all-read {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.mark-all-read:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.notification-list {
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.notification-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.notification-item {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #f0f9ff;
  position: relative;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #2196f3;
  border-radius: 0 4px 4px 0;
}

.notification-item.unread:hover {
  background: #e0f2fe;
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin: 0;
  font-size: 0.9375rem;
  color: #1e293b;
  line-height: 1.5;
  font-weight: 400;
}

.notification-time {
  display: block;
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 6px;
  font-weight: 500;
}

.delete-notification {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-top: -4px;
}

.notification-item:hover .delete-notification {
  opacity: 1;
}

.delete-notification:hover {
  background: #fef2f2;
  color: #ef4444;
}

.empty-notifications {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-notifications i {
  font-size: 2.5rem;
  color: #10b981;
  background: #f0fdf4;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.empty-notifications .empty-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-notifications p {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #475569;
}

.empty-notifications span {
  font-size: 0.875rem;
  color: #94a3b8;
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

.theme-switch {
  margin-right: 1rem;
}

.theme-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: none;
  padding: 10px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  color: #64748b;
  transition: all 0.2s ease;
}

.theme-button:hover {
  background: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
}

.dark .theme-button {
  background: #374151;
  color: #94a3b8;
}

.dark .theme-button:hover {
  background: #4b5563;
  color: #e2e8f0;
}

.dark .card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.dark .notification-dropdown {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.dark .notification-header {
  background: var(--notification-bg);
  border-color: var(--border-color);
}

.dark .notification-item {
  border-color: var(--border-color);
}

.dark .notification-item:hover {
  background: var(--hover-bg);
}

.dark .notification-item.unread {
  background: #1e293b;
}

.dark .notification-item.unread:hover {
  background: #2d3748;
}

.dark .notification-text {
  color: #e2e8f0;
}

.dark .notification-time {
  color: #94a3b8;
}

.dark .empty-notifications {
  color: #94a3b8;
}

.dark .empty-notifications p {
  color: #e2e8f0;
}

.dark .empty-notifications span {
  color: #94a3b8;
}
</style>