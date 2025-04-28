<template>
    <div class="roles-page">
        <h1>Role Management</h1>
        
        <div class="actions">
            <button @click="showCreateModal = true" class="create-btn">
                Create New Role
            </button>
        </div>

        <div class="roles-container">
            <div v-if="loading" class="loading">Loading roles...</div>
            <div v-else class="roles-grid">
                <div v-for="role in roles" :key="role.id" class="role-card">
                    <div class="role-header">
                        <h3>{{ role.name }}</h3>
                        <div class="role-actions">
                            <button @click="editRole(role)" class="edit-btn">
                                <font-awesome-icon icon="edit" />
                            </button>
                            <button @click="deleteRole(role.id)" class="delete-btn">
                                <font-awesome-icon icon="trash" />
                            </button>
                        </div>
                    </div>
                    <p class="role-description">{{ role.description }}</p>
                    <div class="role-permissions">
                        <h4>Permissions:</h4>
                        <ul>
                            <li v-for="permission in role.permissions" :key="permission.id">
                                {{ permission.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <h2>{{ isEditing ? 'Edit Role' : 'Create New Role' }}</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="name">Role Name</label>
                        <input
                            type="text"
                            id="name"
                            v-model="formData.name"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea
                            id="description"
                            v-model="formData.description"
                            required
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label>Permissions</label>
                        <div class="permissions-list">
                            <div v-for="perm in availablePermissions" :key="perm.id" class="permission-item">
                                <input
                                    type="checkbox"
                                    :id="'perm-' + perm.id"
                                    v-model="formData.permissions"
                                    :value="perm.id"
                                />
                                <label :for="'perm-' + perm.id">{{ perm.name }}</label>
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="closeModal" class="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" class="submit-btn">
                            {{ isEditing ? 'Update' : 'Create' }}
                        </button>
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
    const loading = ref(true);
    const showModal = ref(false);
    const isEditing = ref(false);
    const availablePermissions = ref([]);
    const formData = ref({
        name: '',
        description: '',
        permissions: []
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

    const fetchPermissions = async () => {
        try {
            const response = await roleService.getPermissions();
            availablePermissions.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    };

    const editRole = (role) => {
        isEditing.value = true;
        formData.value = {
            ...role,
            permissions: role.permissions.map(p => p.id)
        };
        showModal.value = true;
    };

    const deleteRole = async (roleId) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await roleService.deleteRole(roleId);
                await fetchRoles();
            } catch (error) {
                console.error('Failed to delete role:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing.value) {
                await roleService.updateRole(formData.value.id, formData.value);
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
            description: '',
            permissions: []
        };
    };

    onMounted(() => {
        fetchRoles();
        fetchPermissions();
    });
</script>

<style scoped>
    .roles-page {
        padding: 2rem;
    }

    .actions {
        margin: 2rem 0;
    }

    .create-btn {
        padding: 0.5rem 1rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .roles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
    }

    .role-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .role-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .role-actions {
        display: flex;
        gap: 0.5rem;
    }

    .edit-btn,
    .delete-btn {
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .edit-btn {
        background-color: #2196F3;
        color: white;
    }

    .delete-btn {
        background-color: #f44336;
        color: white;
    }

    .role-description {
        color: #666;
        margin-bottom: 1rem;
    }

    .role-permissions {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
    }

    .role-permissions h4 {
        margin-bottom: 0.5rem;
    }

    .role-permissions ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .role-permissions li {
        padding: 0.25rem 0;
        color: #666;
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
    }

    .form-group input[type="text"],
    .form-group textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .permissions-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
    }

    .permission-item {
        display: flex;
        align-items: center;
        padding: 0.25rem 0;
    }

    .permission-item input[type="checkbox"] {
        margin-right: 0.5rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    .cancel-btn,
    .submit-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .cancel-btn {
        background-color: #ddd;
    }

    .submit-btn {
        background-color: #4CAF50;
        color: white;
    }

    .loading {
        text-align: center;
        color: #666;
        padding: 2rem;
    }
</style>