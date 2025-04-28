<template>
    <div class="applications-page">
        <h1>Application Management</h1>
        
        <div class="applications-container">
            <div v-if="loading" class="loading">Loading applications...</div>
            <div v-else>
                <div class="applications-grid">
                    <div v-for="app in applications" :key="app.id" class="app-card">
                        <div class="app-header">
                            <h3>{{ app.name }}</h3>
                            <div class="app-actions">
                                <button @click="editApplication(app)">Edit</button>
                                <button @click="deleteApplication(app.id)" class="delete">Delete</button>
                            </div>
                        </div>
                        <p class="app-description">{{ app.description }}</p>
                        <div class="app-details">
                            <span class="app-url">URL: {{ app.url }}</span>
                            <span class="app-status" :class="app.status">Status: {{ app.status }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { applicationService } from '../api/services/applicationService';

    const applications = ref([]);
    const loading = ref(true);

    const fetchApplications = async () => {
        try {
            const response = await applicationService.getApplications();
            applications.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            loading.value = false;
        }
    };

    const editApplication = (app) => {
        // Implement edit functionality
        console.log('Edit application:', app);
    };

    const deleteApplication = async (appId) => {
        if (confirm('Are you sure you want to delete this application?')) {
            // Implement delete functionality
            console.log('Delete application:', appId);
        }
    };

    onMounted(() => {
        fetchApplications();
    });
</script>

<style scoped>
    .applications-page {
        padding: 1rem;
    }

    .applications-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .app-card {
        padding: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .app-actions {
        display: flex;
        gap: 0.5rem;
    }

    .app-actions button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        background-color: var(--primary);
        color: white;
    }

    .app-actions button:hover {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
    }

    .app-actions button:active {
        transform: translateY(0);
    }

    .app-actions button.delete {
        background-color: #dc3545;
        color: white;
    }

    .app-description {
        color: #666;
        margin-bottom: 1rem;
    }

    .app-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .app-status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
    }

    .app-status.active {
        background-color: #28a745;
        color: white;
    }

    .app-status.inactive {
        background-color: #dc3545;
        color: white;
    }

    .loading {
        padding: 1rem;
        color: #666;
    }
</style>