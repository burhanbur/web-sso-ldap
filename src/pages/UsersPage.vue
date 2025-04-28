<template>
    <div class="users-page">
      <div class="header">
        <h1>Manajemen Pengguna</h1>
        <button @click="showCreateModal = true" class="primary-btn">
          + Tambah Pengguna
        </button>
      </div>
  
      <div v-if="loading" class="loading">Loading users...</div>
  
      <div v-else class="users-grid">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-top">
            <img :src="user.avatar || defaultAvatar" :alt="user.full_name" class="avatar" />
            <div class="user-info">
              <h3>{{ user.full_name }}</h3>
              <p class="email">{{ user.email }}</p>
              <div class="roles">
                <span v-for="role in user.roles" :key="role.id" class="role-badge">
                  {{ role.name }}
                </span>
              </div>
            </div>
          </div>
          <div class="user-actions">
            <button @click="editUser(user)" class="action-btn edit">
              <font-awesome-icon icon="edit" />
            </button>
            <button @click="deleteUser(user.id)" class="action-btn delete">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ isEditing ? 'Edit User' : 'Create New User' }}</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label for="full_name">Full Name</label>
              <input type="text" id="full_name" v-model="formData.full_name" required />
            </div>
  
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="formData.email" required />
            </div>
  
            <div class="form-group">
              <label for="password">{{ isEditing ? 'New Password (Optional)' : 'Password' }}</label>
              <input type="password" id="password" v-model="formData.password" :required="!isEditing" />
            </div>
  
            <div class="form-group">
              <label>Roles</label>
              <div class="roles-checkboxes">
                <div v-for="role in availableRoles" :key="role.id" class="checkbox-item">
                  <input type="checkbox" :id="'role-' + role.id" v-model="formData.roles" :value="role.id" />
                  <label :for="'role-' + role.id">{{ role.name }}</label>
                </div>
              </div>
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
    import { userService } from '../api/services/userService';
    import { roleService } from '../api/services/roleService';
    import defaultAvatar from '../assets/img/default.png';

    const users = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const isEditing = ref(false);
    const availableRoles = ref([]);
    const formData = ref({
        full_name: '',
        email: '',
        password: '',
        roles: []
    });

    const fetchUsers = async () => {
        try {
            loading.value = true;
            const response = await userService.getUsers();
            users.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleService.getRoles();
            availableRoles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const editUser = (user) => {
        isEditing.value = true;
        formData.value = {
            ...user,
            password: '',
            roles: user.roles.map(r => r.id)
        };
        showModal.value = true;
    };

    const deleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId);
                await fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing.value) {
                await userService.updateUser(formData.value.id, formData.value);
            } else {
                await userService.createUser(formData.value);
            }
            await fetchUsers();
            closeModal();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        isEditing.value = false;
        formData.value = {
            full_name: '',
            email: '',
            password: '',
            roles: []
        };
    };

    onMounted(() => {
        fetchUsers();
        fetchRoles();
    });
</script>

<style scoped>
/* Layout */
.users-page {
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

/* Users grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Card */
.user-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.user-top {
  display: flex;
  gap: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
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

.roles {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.role-badge {
  background-color: #e9f5ff;
  color: #0366d6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Actions */
.user-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

.action-btn.delete {
  background-color: #f44336;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  animation: scaleIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); } to { transform: scale(1); }
}

/* Form */
.modal-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.roles-checkboxes {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem;
  background: #f9f9f9;
}

.checkbox-item {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>