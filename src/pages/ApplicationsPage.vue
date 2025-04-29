<template>
    <div class="applications-page">
      <div class="header">
        <h1>Manajemen Aplikasi Klien</h1>
        <button @click="showModal = true" class="primary-btn">
          + Tambah Aplikasi
        </button>
      </div>
  
      <div v-if="loading" class="loading">Loading applications...</div>
  
      <div v-else class="applications-grid">
        <div v-for="app in applications" :key="app.id" class="app-card">
          <div class="app-content">
            <img :src="/*app.image ||*/ '/favicon.png'" :alt="app.name" class="app-logo" />
            <div class="app-info">
              <h3>{{ app.name }}</h3>
              <p class="code">{{ app.code }}</p>
              <p class="description">{{ app.description || 'No description' }}</p>
              <div class="badges">
                <span class="badge platform">{{ app.platform_type }}</span>
                <span class="badge visibility">{{ app.visibility }}</span>
                <span :class="['badge', 'status', app.is_active ? 'active' : 'inactive']">
                  {{ app.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          <div class="app-urls">
            <a :href="app.base_url" target="_blank" class="url">{{ app.base_url }}</a>
            <!-- <a :href="app.login_url" target="_blank" class="url">{{ app.login_url }}</a> -->
          </div>
          <div class="app-actions">
            <button @click="editApplication(app)" class="action-btn edit">
              <font-awesome-icon icon="edit" />
            </button>
            <button @click="toggleStatus(app)" class="action-btn" :class="app.is_active ? 'deactivate' : 'activate'">
              <font-awesome-icon :icon="app.is_active ? 'ban' : 'check'" />
            </button>
            <button @click="deleteApplication(app.uuid)" class="action-btn delete">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ isEditing ? 'Edit Application' : 'Create New Application' }}</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label for="code">Code</label>
              <input type="text" id="code" v-model="formData.code" required maxlength="50" 
                     :disabled="isEditing" placeholder="unique-app-code" />
            </div>
  
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" v-model="formData.name" required maxlength="255" 
                     placeholder="Application Name" />
            </div>
  
            <div class="form-group">
              <label for="alias">Alias (Optional)</label>
              <input type="text" id="alias" v-model="formData.alias" maxlength="50" 
                     placeholder="Short name or alias" />
            </div>
  
            <div class="form-group">
              <label for="description">Description (Optional)</label>
              <textarea id="description" v-model="formData.description" rows="3" 
                        placeholder="Application description"></textarea>
            </div>
  
            <div class="form-group">
              <label for="base_url">Base URL</label>
              <input type="url" id="base_url" v-model="formData.base_url" required 
                     placeholder="https://example.com" />
            </div>
  
            <div class="form-group">
              <label for="login_url">Login URL</label>
              <input type="url" id="login_url" v-model="formData.login_url" required 
                     placeholder="https://example.com/login" />
            </div>
  
            <div class="form-group">
              <label for="platform_type">Platform Type</label>
              <select id="platform_type" v-model="formData.platform_type" required>
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="Desktop">Desktop</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="visibility">Visibility</label>
              <select id="visibility" v-model="formData.visibility" required>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="image">Logo (Optional)</label>
              <input type="file" id="image" @change="handleImageUpload" accept="image/png,image/jpeg,image/jpg" />
            </div>
  
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" v-model="formData.is_active" />
                Active
              </label>
            </div>
  
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="secondary-btn">Cancel</button>
              <button type="submit" class="primary-btn">{{ isEditing ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { applicationService } from '../api/services/applicationService';

    const applications = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({
        code: '',
        name: '',
        alias: '',
        description: '',
        base_url: '',
        login_url: '',
        platform_type: 'Web',
        visibility: 'Public',
        is_active: true,
        image: null
    });

    const fetchApplications = async () => {
        try {
            loading.value = true;
            const response = await applicationService.getApplications();
            applications.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            loading.value = false;
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            formData.value.image = file;
        }
    };

    const editApplication = (app) => {
        isEditing.value = true;
        formData.value = {
            ...app,
            image: null // Reset image since we don't want to send the URL back
        };
        showModal.value = true;
    };

    const toggleStatus = async (app) => {
        try {
            await applicationService.updateStatus(app.uuid);
            await fetchApplications();
        } catch (error) {
            console.error('Failed to toggle application status:', error);
        }
    };

    const deleteApplication = async (uuid) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await applicationService.deleteApplication(uuid);
                await fetchApplications();
            } catch (error) {
                console.error('Failed to delete application:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            Object.keys(formData.value).forEach(key => {
                if (formData.value[key] !== null) {
                    data.append(key, formData.value[key]);
                }
            });

            if (isEditing.value) {
                await applicationService.updateApplication(formData.value.uuid, data);
            } else {
                await applicationService.createApplication(data);
            }
            await fetchApplications();
            closeModal();
        } catch (error) {
            console.error('Failed to save application:', error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        isEditing.value = false;
        formData.value = {
            code: '',
            name: '',
            alias: '',
            description: '',
            base_url: '',
            login_url: '',
            platform_type: 'Web',
            visibility: 'Public',
            is_active: true,
            image: null
        };
    };

    onMounted(() => {
        fetchApplications();
    });
</script>

<style scoped>
/* Layout */
.applications-page {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Grid */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card */
.app-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.app-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-logo {
  width: 60px;
  height: 60px;
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

/* Actions */
.app-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.action-btn.edit {
  background-color: #2196F3;
  color: white;
}

.action-btn.activate {
  background-color: #4CAF50;
  color: white;
}

.action-btn.deactivate {
  background-color: #FFC107;
  color: white;
}

.action-btn.delete {
  background-color: #f44336;
  color: white;
}

/* Button */
.primary-btn, .secondary-btn {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.primary-btn {
  background-color: #4CAF50;
  color: white;
}

.primary-btn:hover {
  background-color: #45A049;
}

.secondary-btn {
  background-color: #ddd;
  color: #333;
}

.secondary-btn:hover {
  background-color: #ccc;
}

/* Form */
.modal-form textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.modal-form select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* Inherit other styles from UsersPage.vue */
</style>