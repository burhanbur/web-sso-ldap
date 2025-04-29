<template>
    <div class="roles-page">
      <div class="header">
        <h1>Manajemen Peran</h1>
        <button @click="showModal = true" class="primary-btn">
          + Tambah Peran
        </button>
      </div>
  
      <div v-if="loading" class="loading">Loading roles...</div>
  
      <div v-else class="roles-grid">
        <div v-for="role in roles" :key="role.id" class="role-card">
          <div class="role-info">
            <h3>{{ role.display_name }}</h3>
            <p class="code">{{ role.name }}</p>
            <p class="description">{{ role.description || 'No description' }}</p>
            <div class="tags">
              <span class="tag">{{ role.role_type?.name || 'Unknown Type' }}</span>
              <span class="tag">{{ role.scope_type?.name || 'Unknown Scope' }}</span>
            </div>
          </div>
          <div class="role-actions">
            <button @click="editRole(role)" class="action-btn edit">
              <font-awesome-icon icon="edit" />
            </button>
            <button @click="deleteRole(role.uuid)" class="action-btn delete">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ isEditing ? 'Edit Role' : 'Create New Role' }}</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label for="name">System Name</label>
              <input type="text" id="name" v-model="formData.name" required maxlength="255" 
                     :disabled="isEditing" placeholder="role-system-name" />
            </div>
  
            <div class="form-group">
              <label for="display_name">Display Name</label>
              <input type="text" id="display_name" v-model="formData.display_name" required maxlength="255" 
                     placeholder="Role Display Name" />
            </div>
  
            <div class="form-group">
              <label for="description">Description (Optional)</label>
              <textarea id="description" v-model="formData.description" rows="3" 
                        placeholder="Role description"></textarea>
            </div>
  
            <div class="form-group">
              <label for="role_type_id">Role Type</label>
              <select id="role_type_id" v-model="formData.role_type_id" required>
                <option value="">Select a role type</option>
                <option v-for="type in roleTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="scope_type_id">Scope Type</label>
              <select id="scope_type_id" v-model="formData.scope_type_id" required>
                <option value="">Select a scope type</option>
                <option v-for="scope in scopeTypes" :key="scope.id" :value="scope.id">
                  {{ scope.name }}
                </option>
              </select>
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
    import { roleService } from '../api/services/roleService';

    const roles = ref([]);
    const roleTypes = ref([]);
    const scopeTypes = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({
        name: '',
        display_name: '',
        description: '',
        role_type_id: '',
        scope_type_id: ''
    });

    const fetchRoles = async () => {
        try {
            loading.value = true;
            const response = await roleService.getRoles();
            roles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchRoleTypes = async () => {
        try {
            const response = await roleService.getRoleTypes();
            roleTypes.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch role types:', error);
        }
    };

    const fetchScopeTypes = async () => {
        try {
            const response = await roleService.getScopeTypes();
            scopeTypes.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch scope types:', error);
        }
    };

    const editRole = (role) => {
        isEditing.value = true;
        formData.value = { ...role };
        showModal.value = true;
    };

    const deleteRole = async (uuid) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await roleService.deleteRole(uuid);
                await fetchRoles();
            } catch (error) {
                console.error('Failed to delete role:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing.value) {
                await roleService.updateRole(formData.value.uuid, formData.value);
            } else {
                await roleService.createRole(formData.value);
            }
            await fetchRoles();
            closeModal();
        } catch (error) {
            console.error('Failed to save role:', error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        isEditing.value = false;
        formData.value = {
            name: '',
            display_name: '',
            description: '',
            role_type_id: '',
            scope_type_id: ''
        };
    };

    onMounted(() => {
        fetchRoles();
        fetchRoleTypes();
        fetchScopeTypes();
    });
</script>

<style scoped>
/* Layout */
.roles-page {
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
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card */
.role-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.role-info h3 {
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Actions */
.role-actions {
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

.action-btn.delete {
  background-color: #f44336;
  color: white;
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