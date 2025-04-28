<template>
    <div class="user-roles-page">
        <h1>User Role Management</h1>
        
        <div class="user-roles-container">
            <div v-if="loading" class="loading">Loading user roles...</div>
            <table v-else class="user-roles-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="userRole in userRoles" :key="userRole.id">
                        <td>{{ userRole.user.full_name }}</td>
                        <td>{{ userRole.user.email }}</td>
                        <td>
                            <span v-for="role in userRole.roles" 
                                :key="role.id"
                                class="role-badge">
                                {{ role.name }}
                            </span>
                        </td>
                        <td class="actions">
                            <button @click="manageRoles(userRole)">Manage Roles</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { roleService } from '../api/services/roleService';

    const userRoles = ref([]);
    const loading = ref(true);

    const fetchUserRoles = async () => {
        try {
            const response = await roleService.getUserRoles();
            userRoles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch user roles:', error);
        } finally {
            loading.value = false;
        }
    };

    const manageRoles = (userRole) => {
        // Implement role management functionality
        console.log('Manage roles for user:', userRole);
    };

    onMounted(() => {
        fetchUserRoles();
    });
</script>

<style scoped>
    .user-roles-page {
        padding: 1rem;
    }

    .user-roles-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    .user-roles-table th,
    .user-roles-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    .user-roles-table th {
        background-color: #f8f9fa;
        font-weight: 600;
    }

    .role-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        margin: 0.25rem;
        background-color: #e9ecef;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .actions button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background-color: #007bff;
        color: white;
        cursor: pointer;
    }

    .loading {
        padding: 1rem;
        color: #666;
    }
</style>