<template>
    <div class="layout-page">
      <div class="header-page">
        <h1>Manajemen Aplikasi Klien</h1>
        <button @click="showCreateModal = true" class="create-btn">
          <font-awesome-icon icon="plus" />
        </button>
      </div>
      
      <!-- Search and Filter -->
      <div class="toolbar">
        <input 
          v-model="search" 
          @input="handleSearch"
          type="text" 
          placeholder="Cari nama aplikasi ..." 
          class="toolbar-input"
        />
        
        <!-- <multiselect 
          v-model="statusFilter"
          :options="statusOptions"
          :searchable="true"
          :clear-on-select="false"
          :close-on-select="true"
          placeholder="Pilih Status"
          label="label"
          track-by="value"
          class="toolbar-select"
        /> -->

        <select id="sort" class="toolbar-select" v-model="sortSelection" @change="handleSortSelection">
          <option value="name,asc">Nama Aplikasi (A-Z)</option>
          <option value="name,desc">Nama Aplikasi (Z-A)</option>
          <option value="code,asc">Kode (A-Z)</option>
          <option value="code,desc">Kode (Z-A)</option>
          <option value="is_active,asc">Status (Z-A)</option>
          <option value="is_active,desc">Status (Z-A)</option>
          <option value="created_at,desc">Terbaru</option>
          <option value="created_at,asc">Terlama</option>
        </select>
      </div>
  
      <div v-if="loading" class="loading spinner-container"><div class="spinner"></div></div>
      <div v-if="applications.length === 0 && !loading" class="text-center">Tidak ada data yang ditemukan.</div>
      <div v-else class="layout-grid">
        <div v-for="app in applications" :key="app.id" class="card">
          <div class="app-content">
            <img :src="/*app.image ||*/ '/favicon.png'" :alt="app.name" class="app-logo" />
            <div class="app-info">
              <h3>{{ app.name }}</h3>
              <p class="code">{{ app.code }}</p>
              <div class="badges">
                <span class="badge platform">{{ app.platform_type }}</span>
                <span class="badge visibility">{{ app.visibility }}</span>
                <span :class="['badge', 'status', app.is_active ? 'active' : 'inactive']">
                  {{ app.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          <div class="app-description">
            <p class="description">{{ app.description || 'No description' }}</p>
          </div>
          <div class="app-urls">
            <a :href="app.base_url" target="_blank" class="url">{{ app.base_url }}</a>
            <!-- <a :href="app.login_url" target="_blank" class="url">{{ app.login_url }}</a> -->
          </div>
          
          <div class="app-bottom">
            <div class="status-toggle">
              <label class="switch">
                <input type="checkbox" :checked="app.is_active ? true : false" @change="toggleStatus(app)" />
                <span class="slider"></span>
              </label>
              <span class="status-text">{{ app.is_active ? 'Aktif' : 'Tidak Aktif' }}</span>
            </div>

            <div class="data-actions">
              <button @click="editApplication(app)" class="action-btn edit">
                <font-awesome-icon icon="edit" />
              </button>
              <button @click="deleteApplication(app.uuid)" class="action-btn delete">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <br>

      <!-- Pagination -->
    <div class="pagination-container">
      <div class="per-page-select">
        <select v-model="perPage" @change="handleLimitChange">
          <option :value="9">9</option>
          <option :value="15">15</option>
          <option :value="30">30</option>
          <option :value="60">60</option>
          <option :value="-1">Semua</option>
        </select>
      </div>

      <button 
        class="pagination-button" 
        @click="prevPage" 
        :disabled="currentPage === 1"
      >
        <font-awesome-icon class="pagination-icon" icon="chevron-left" />
      </button>

      <span class="pagination-text">Halaman {{ currentPage }} / {{ lastPage }}</span>

      <button 
        class="pagination-button" 
        @click="nextPage" 
        :disabled="currentPage === lastPage"
      >
        <font-awesome-icon class="pagination-icon" icon="chevron-right" />
      </button>
    </div>
  
      <!-- Modal -->
      <div v-if="showModal || showCreateModal" class="modal-overlay">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Ubah Aplikasi' : 'Tambah Aplikasi' }}</h2>
            <button type="button" class="modal-close" @click="closeModal">
              <span>&times;</span>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="modal-body">
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
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
              <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" /> &nbsp;{{ isEditing ? 'Ubah' : 'Simpan' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { applicationService } from '../api/services/applicationService';
    import debounce from 'lodash/debounce';
    import Swal from 'sweetalert2';
    import { successToast, errorToast } from '@/utils/toast'

    const applications = ref([]);
    const totalApplications = ref(0);

    const search = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(15);
    const sortSelection = ref('name,asc')

    const loading = ref(true);
    const showModal = ref(false);
    const showCreateModal = ref(false);
    const isEditing = ref(false);

    const statusOptions = [
      { label: 'Aktif', value: '1' },
      { label: 'Tidak Aktif', value: '0' },
    ];

    const formData = ref({
        code: '',
        name: '',
        alias: '',
        description: '',
        base_url: '',
        login_url: '',
        platform_type: 'Web',
        visibility: 'Public',
        is_active: 1,
        image: null
    });

    watch(showCreateModal, (newVal) => {
        if (newVal) {
          showCreateModal.value = true;
          showModal.value = false;
          isEditing.value = false;
          formData
        }
    });

    const fetchApplications = async () => {
        try {
            loading.value = true;
            const params = {
              search: search.value,
              is_active: statusFilter.value.value,
              page: currentPage.value,
              limit: perPage.value,
              sort: sortSelection.value
            }

            const response = await applicationService.getApplications(params);
            applications.value = response.data.data;

            totalApplications.value = response.data.pagination.total;
            currentPage.value = response.data.pagination.current_page;
            lastPage.value = response.data.pagination.last_page;
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            errorToast(error);
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
            image: null
        };
        showModal.value = true;
    };

    const toggleStatus = async (app) => {
        try {
            await applicationService.updateStatus(app.uuid);
            await fetchApplications();
        } catch (error) {
            console.error('Failed to toggle application status:', error);
            errorToast(error);
        }
    };

    const deleteApplication = async (uuid) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                const response = await applicationService.deleteApplication(uuid);
                await fetchApplications();
                successToast(response.data.message)
            } catch (error) {
                console.error('Failed to delete application:', error);
                errorToast(error);
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

            let response;
            if (isEditing.value) {
                response = await applicationService.updateApplication(formData.value.uuid, data);
            } else {
                response = await applicationService.createApplication(data);
            }
            await fetchApplications();
            closeModal();
            successToast(response.data.message);
        } catch (error) {
            console.error('Failed to save application:', error);
            errorToast(error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        showCreateModal.value = false;
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

    // Handle Search (Debounced)
    const debouncedFetchData = debounce(() => {
        currentPage.value = 1;
        fetchApplications();
    }, 300);

    const handleSearch = () => {
        debouncedFetchData();
    };

    const resetFormData = () => {
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

    watch(statusFilter, (newStatus) => {
      handleFilter(newStatus)
    })

    const handleFilter = () => {
      currentPage.value = 1
      fetchApplications()
    }

    const handleSortSelection = () => {
      fetchApplications()
    } 

    const nextPage = () => {
      if (currentPage.value < lastPage.value) {
        currentPage.value++
        fetchApplications()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        fetchApplications()
      }
    }

    const handleLimitChange = () => {
        currentPage.value = 1;
        fetchApplications();
    };

    onMounted(() => {
        fetchApplications();
    });
</script>

<style scoped>
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