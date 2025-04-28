<template>
    <div class="users-page">
        <h1>User Management</h1>
        
        <div class="actions">
            <button @click="showCreateModal = true" class="create-btn">
                Create New User
            </button>
        </div>

        <div class="users-container">
            <div v-if="loading" class="loading">Loading users...</div>
            <div v-else class="users-grid">
                <div v-for="user in users" :key="user.id" class="user-card">
                    <div class="user-avatar">
                        <img :src="user.avatar || defaultAvatar" :alt="user.full_name" />
                    </div>
                    <div class="user-info">
                        <h3>{{ user.full_name }}</h3>
                        <p class="user-email">{{ user.email }}</p>
                        <div class="user-roles">
                            <span v-for="role in user.roles" :key="role.id" class="role-badge">
                                {{ role.name }}
                            </span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button @click="editUser(user)" class="edit-btn">
                            <font-awesome-icon icon="edit" />
                        </button>
                        <button @click="deleteUser(user.id)" class="delete-btn">
                            <font-awesome-icon icon="trash" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <h2>{{ isEditing ? 'Edit User' : 'Create New User' }}</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input
                            type="text"
                            id="full_name"
                            v-model="formData.full_name"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            v-model="formData.email"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">
                            {{ isEditing ? 'New Password (leave blank to keep current)' : 'Password' }}
                        </label>
                        <input
                            type="password"
                            id="password"
                            v-model="formData.password"
                            :required="!isEditing"
                        />
                    </div>

                    <div class="form-group">
                        <label>Roles</label>
                        <div class="roles-list">
                            <div v-for="role in availableRoles" :key="role.id" class="role-item">
                                <input
                                    type="checkbox"
                                    :id="'role-' + role.id"
                                    v-model="formData.roles"
                                    :value="role.id"
                                />
                                <label :for="'role-' + role.id">{{ role.name }}</label>
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
    .users-page {
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

    .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
    }

    .user-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: flex-start;
    }

    .user-avatar {
        width: 60px;
        height: 60px;
        margin-right: 1rem;
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }

    .user-info {
        flex: 1;
    }

    .user-email {
        color: #666;
        margin: 0.5rem 0;
    }

    .user-roles {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .role-badge {
        background-color: #e9ecef;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        color: #666;
    }

    .user-actions {
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
    .form-group input[type="email"],
    .form-group input[type="password"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .roles-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
    }

    .role-item {
        display: flex;
        align-items: center;
        padding: 0.25rem 0;
    }

    .role-item input[type="checkbox"] {
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