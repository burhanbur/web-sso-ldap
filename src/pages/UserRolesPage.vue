<template>
    <div class="user-roles-page">
      <div class="header">
        <h1>Manajemen Peran Pengguna</h1>
        <button @click="showModal = true" class="primary-btn">
          + Tambah Peran Pengguna
        </button>
      </div>
  
      <div v-if="loading" class="loading">Loading user roles...</div>
  
      <div v-else class="user-roles-grid">
        <div v-for="userRole in userRoles" :key="userRole.id" class="user-role-card">
          <div class="user-info">
            <h3>{{ userRole.user?.full_name }}</h3>
            <p class="email">{{ userRole.user?.email }}</p>
          </div>
          <div class="role-details">
            <div class="role-info">
              <span class="label">Role:</span>
              <span class="value">{{ userRole.role?.display_name }}</span>
            </div>
            <div class="app-info">
              <span class="label">Application:</span>
              <span class="value">{{ userRole.application?.name }}</span>
            </div>
            <div v-if="userRole.entity_type" class="entity-info">
              <span class="label">Entity:</span>
              <span class="value">{{ userRole.entity_type?.name }}: {{ userRole.entity_id }}</span>
            </div>
            <div class="meta-info">
              <small>Assigned by {{ userRole.assigner?.full_name }} on {{ new Date(userRole.assigned_at).toLocaleDateString() }}</small>
            </div>
          </div>
          <div class="actions">
            <button @click="deleteUserRole(userRole.uuid)" class="action-btn delete">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h2>Assign Role to User</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label for="user_id">User</label>
              <select id="user_id" v-model="formData.user_id" required>
                <option value="">Select a user</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.full_name }} ({{ user.email }})
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="app_id">Application</label>
              <select id="app_id" v-model="formData.app_id" required>
                <option value="">Select an application</option>
                <option v-for="app in applications" :key="app.id" :value="app.id">
                  {{ app.name }}
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="role_id">Role</label>
              <select id="role_id" v-model="formData.role_id" required>
                <option value="">Select a role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.display_name }}
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="entity_type_id">Entity Type (Optional)</label>
              <select id="entity_type_id" v-model="formData.entity_type_id">
                <option value="">Select an entity type</option>
                <option v-for="type in entityTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
  
            <div class="form-group" v-if="formData.entity_type_id">
              <label for="entity_id">Entity ID</label>
              <input type="text" id="entity_id" v-model="formData.entity_id" 
                     maxlength="50" placeholder="Entity identifier" />
            </div>
  
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="secondary-btn">Cancel</button>
              <button type="submit" class="primary-btn">Assign Role</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { userRoleService } from '../api/services/userRoleService';
    import { userService } from '../api/services/userService';
    import { roleService } from '../api/services/roleService';
    import { applicationService } from '../api/services/applicationService';

    const userRoles = ref([]);
    const users = ref([]);
    const roles = ref([]);
    const applications = ref([]);
    const entityTypes = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    
    const formData = ref({
        user_id: '',
        role_id: '',
        app_id: '',
        entity_type_id: '',
        entity_id: ''
    });

    const fetchUserRoles = async () => {
        try {
            loading.value = true;
            const response = await userRoleService.getUserRoles();
            userRoles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch user roles:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userService.getUsers();
            users.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleService.getRoles();
            roles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await applicationService.getApplications();
            applications.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        }
    };

    const fetchEntityTypes = async () => {
        try {
            const response = await userRoleService.getEntityTypes();
            entityTypes.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch entity types:', error);
        }
    };

    const deleteUserRole = async (uuid) => {
        if (confirm('Are you sure you want to revoke this role from the user?')) {
            try {
                await userRoleService.deleteUserRole(uuid);
                await fetchUserRoles();
            } catch (error) {
                console.error('Failed to delete user role:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            await userRoleService.createUserRole(formData.value);
            await fetchUserRoles();
            closeModal();
        } catch (error) {
            console.error('Failed to assign role:', error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        formData.value = {
            user_id: '',
            role_id: '',
            app_id: '',
            entity_type_id: '',
            entity_id: ''
        };
    };

    onMounted(() => {
        fetchUserRoles();
        fetchUsers();
        fetchRoles();
        fetchApplications();
        fetchEntityTypes();
    });
</script>

<style scoped>
/* Layout */
.user-roles-page {
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
.user-roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card */
.user-role-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.user-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.email {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.role-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.role-info, .app-info, .entity-info {
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.value {
  font-weight: 500;
}

.meta-info {
  margin-top: 1rem;
  color: #888;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.action-btn.delete {
  background-color: #f44336;
  color: white;
}

/* Form */
.modal-form select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
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

/* Inherit other styles from UsersPage.vue */
</style>