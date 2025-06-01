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
    <div v-if="applications.length === 0 && !loading" class="text-center"><h3>Tidak ada data yang ditemukan.</h3></div>
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
                {{ app.is_active ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </div>
          </div>
        </div>
        <div class="app-description">
          <p class="description">{{ app.description || 'Tidak ada deskripsi' }}</p>
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
            <button @click="showClientIdAndSecret(app)" class="action-btn dark">
              <font-awesome-icon icon="key" />
            </button>
            <button @click="showUserApplication(app)" class="action-btn warning">
              <font-awesome-icon icon="users" />
            </button>
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

    <!-- Modal Create/Update -->
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
              <label for="code">Kode</label>
              <input type="text" id="code" v-model="formData.code" required maxlength="50" 
                    :disabled="isEditing" :readonly="isEditing" placeholder="unique-app-code" />
            </div>
  
            <div class="form-group">
              <label for="name">Nama Aplikasi</label>
              <input type="text" id="name" v-model="formData.name" required maxlength="255" 
                    placeholder="Application Name" />
            </div>
  
            <div class="form-group">
              <label for="alias">Alias (Optional)</label>
              <input type="text" id="alias" v-model="formData.alias" maxlength="50" 
                    placeholder="Short name or alias" />
            </div>
  
            <div class="form-group">
              <label for="description">Deskripsi (Optional)</label>
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
              <label for="platform_type">Tipe Platform</label>
              <select id="platform_type" v-model="formData.platform_type" required>
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="Desktop">Desktop</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="visibility">Visibilitas</label>
              <select id="visibility" v-model="formData.visibility" required>
                <option value="Internal">Internal</option>
                <option value="Public">Public</option>
              </select>
            </div>
  
            <div class="form-group file-upload">
              <label for="image">Logo (Optional)</label>
              
              <div class="custom-file-input">
                <input type="file" id="image" @change="handleImageUpload" accept="image/png,image/jpeg,image/jpg" />
                
                <span class="file-label">
                  <font-awesome-icon icon="file-upload" class="upload-icon" />
                  {{ fileName }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" /> &nbsp;{{ isEditing ? 'Ubah' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pengguna Application -->
    <div v-if="showUserAppModal" class="modal-overlay">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h2 class="modal-title">Pengguna Aplikasi {{ appOpen }}</h2>
          <button type="button" class="modal-close" @click="closeModal">
            <span>&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Search Bar -->
          <div class="search-container mb-3">
            <input
              type="text"
              v-model="searchUserApp"
              placeholder="Cari pengguna..."
              class="form-control"
            />
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 10px;">No</th>
                <th class="text-center">Kode</th>
                <th class="text-center">Username</th>
                <th class="text-center">Nama Lengkap</th>
                <th class="text-center">Peran</th>
                <th class="text-center">#</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center">
                  <div class="loading spinner-container"><div class="spinner"></div></div>
                </td>
              </tr>
              <tr v-else-if="usersApp.length === 0">
                <td colspan="6" class="text-center">Tidak ada data yang ditemukan.</td>
              </tr>
              <template v-else>
                <template v-for="(group, groupIndex) in groupedUsers" :key="group.key">
                  <tr v-for="(user, userIndex) in group.items" :key="user.uuid">
                    <!-- Kolom No, Code, Username, Full Name dengan rowspan -->
                    <td v-if="userIndex === 0" :rowspan="group.items.length" class="text-center">{{ groupIndex + 1 }}</td>
                    <td v-if="userIndex === 0" :rowspan="group.items.length" class="text-center">{{ user.code }}</td>
                    <td v-if="userIndex === 0" :rowspan="group.items.length" class="text-center">{{ user.username }}</td>
                    <td v-if="userIndex === 0" :rowspan="group.items.length" class="text-center">{{ user.full_name }}</td>
                    
                    <!-- Kolom yang selalu muncul di setiap baris -->
                    <td class="text-center">{{ user.role }}</td>
                    <td class="text-center">
                      <button class="btn btn-danger" @click="removeUserApp(user.uuid)">
                        <font-awesome-icon icon="trash" />
                      </button>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination-container">
            <div class="per-page-select">
              <select v-model="perPageUserApp" @change="handleLimitChangeUserApp">
                <option :value="15">15</option>
                <option :value="30">30</option>
                <option :value="60">60</option>
                <option :value="-1">Semua</option>
              </select>
            </div>

            <button 
              class="pagination-button" 
              @click="prevPageUserApp" 
              :disabled="currentPageUserApp === 1"
            >
              <font-awesome-icon class="pagination-icon" icon="chevron-left" />
            </button>

            <span class="pagination-text">Halaman {{ currentPageUserApp }} / {{ lastPageUserApp }}</span>

            <button 
              class="pagination-button" 
              @click="nextPageUserApp" 
              :disabled="currentPageUserApp === lastPageUserApp"
            >
              <font-awesome-icon class="pagination-icon" icon="chevron-right" />
            </button>
          </div>

        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Client Credentials Modal -->
    <ClientCredentialsModal
      v-if="showCredentialsModal"
      :appId="selectedApp?.uuid"
      :clientId="selectedApp?.client_id"
      :clientSecret="selectedApp?.client_secret"
      @close="showCredentialsModal = false"
    />
  </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted, watch } from 'vue';
    import { applicationService } from '../api/services/applicationService';
    import { userRoleService } from '../api/services/userRoleService';
    import debounce from 'lodash/debounce';
    import Swal from 'sweetalert2';
    import { successToast, errorToast } from '@/utils/toast'
    import ClientCredentialsModal from '../components/modals/ClientCredentialsModal.vue';

    const applications = ref([]);
    const totalApplications = ref(0);
    const usersApp = ref([]);
    const appOpen = ref('');
    
    const showCredentialsModal = ref(false);
    const selectedApp = ref(null);

    const search = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(15);
    const sortSelection = ref('name,asc')

    const loading = ref(true);
    const showModal = ref(false);
    const showCreateModal = ref(false);
    const showUserAppModal = ref(false);
    const isEditing = ref(false);

    const searchUserApp = ref('');
    const currentPageUserApp = ref(1);
    const lastPageUserApp = ref(1);
    const perPageUserApp = ref(15);

    const groupAllUsers = computed(() => {
      if (!usersApp.value || usersApp.value.length === 0) return [];

      // Filter berdasarkan pencarian jika ada
      const filteredUsers = searchUserApp.value 
        ? usersApp.value.filter(user => 
            user.code.toLowerCase().includes(searchUserApp.value.toLowerCase()) ||
            user.username.toLowerCase().includes(searchUserApp.value.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchUserApp.value.toLowerCase()) ||
            user.role.toLowerCase().includes(searchUserApp.value.toLowerCase())
          )
        : usersApp.value;
      
      // Mengelompokkan pengguna berdasarkan code, username, dan full_name
      const groups = {};
      
      filteredUsers.forEach(user => {
        // Membuat kunci unik dari kombinasi ketiga kolom
        const key = `${user.code}-${user.username}-${user.full_name}`;
        
        if (!groups[key]) {
          groups[key] = {
            key,
            items: []
          };
        }
        
        groups[key].items.push(user);
      });
      
      // Mengubah objek groups menjadi array
      return Object.values(groups);
    });

    const statusOptions = [
      { label: 'Aktif', value: '1' },
      { label: 'Tidak Aktif', value: '0' },
    ];

    let formData = reactive({
      code: '',
      name: '',
      alias: '',
      description: '',
      base_url: '',
      login_url: '',
      platform_type: 'Web',
      visibility: 'Internal',
      is_active: 1,
      image: ''
    })

    watch(showCreateModal, (newVal) => {
      if (newVal) {
        showCreateModal.value = true;
        showModal.value = false;
        isEditing.value = false;
        formData
      }
    })

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
          errorToast(error);
      } finally {
          loading.value = false;
      }
    }

    const fileName = ref('Pilih logo...');
    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        formData.image = file;
        fileName.value = file ? file.name : 'Pilih logo...'
      }
    }

    const editApplication = (app) => {
      loadData(app);
      isEditing.value = true;
      showModal.value = true;
    }

    const showUserApplication = async (app) => {
      const uuid = app.uuid
      const response = await applicationService.getUserApplication(uuid);
      usersApp.value = response.data.data;
      showUserAppModal.value = true;
      appOpen.value = app.name;
    }

    const loadData = (app) => {
      formData.id = app.id
      formData.uuid = app.uuid
      formData.code = app.code
      formData.name = app.name
      formData.alias = app.alias
      formData.description = app.description
      formData.base_url = app.base_url
      formData.login_url = app.login_url
      formData.platform_type = app.platform_type
      formData.visibility = app.visibility
      formData.is_active = app.is_active
      formData.image = app.image
    }

    const toggleStatus = async (app) => {
      const original = app.is_active
      app.is_active = !original

      try {
        await applicationService.updateStatus(app.uuid);
        successToast(`Status aplikasi diubah menjadi ${app.is_active ? 'Aktif' : 'Tidak Aktif'}`);
      } catch (error) {
        app.is_active = original
        errorToast(error);
      }
    }

    const deleteApplication = async (uuid) => {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah yakin ingin menghapus data ini?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, yakin!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {          
          const response = await applicationService.deleteApplication(uuid);
          await fetchApplications();
          successToast(response.data.message)
        } catch (error) {
          errorToast(error.response.data.message);
        }
      }
    }

    const handleSubmit = async () => {
      try {
        let data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        let response;
        if (isEditing.value) {
            response = await applicationService.updateApplication(formData.uuid, data);
        } else {
            response = await applicationService.createApplication(data);
        }
        await fetchApplications();
        closeModal();
        successToast(response.data.message);
      } catch (error) {
          errorToast(error);
      }
    }

    const removeUserApp = async (uuid) => {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: `Anda akan menghapus peran pengguna ini?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });
      
      if (result.isConfirmed) {
        try {
          const response = await userRoleService.deleteUserRole(uuid);
          usersApp.value = response.data.data;
          successToast(response.data.message)
        } catch (error) {
          errorToast(error.response.data.message);
        }
      }
    }

    const showClientIdAndSecret = (app) => {
      selectedApp.value = app;
      showCredentialsModal.value = true;
    }

    const closeModal = () => {
      showModal.value = false;
      showCreateModal.value = false;
      showUserAppModal.value = false;
      showCredentialsModal.value = false;
      selectedApp.value = null;
      isEditing.value = false;
      fileName.value = 'Pilih logo...';
      resetFormData();
    }

    // Handle Search (Debounced)
    const debouncedFetchData = debounce(() => {
      currentPage.value = 1;
      fetchApplications();
    }, 300);

    const handleSearch = () => {
      debouncedFetchData();
    }

    const resetFormData = () => {      
      formData.code = ''
      formData.name = ''
      formData.alias = ''
      formData.description = ''
      formData.base_url = ''
      formData.login_url = ''
      formData.platform_type = 'Web'
      formData.visibility = 'Internal'
      formData.is_active = true
      formData.image = null
    }

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
    }

    // modal
    // Total halaman berdasarkan perPage
    const totalPages = computed(() => {
      if (perPageUserApp.value === -1) return 1;
      const totalGroups = groupAllUsers.value.length;
      return Math.max(1, Math.ceil(totalGroups / perPageUserApp.value));
    });

    // Update lastPageUserApp setiap kali totalPages berubah
    watch(totalPages, (newValue) => {
      lastPageUserApp.value = newValue;
      // Pastikan currentPage tidak melebihi lastPage
      if (currentPageUserApp.value > lastPageUserApp.value) {
        currentPageUserApp.value = lastPageUserApp.value;
      }
    });

    // Data yang ditampilkan sesuai pagination
    const groupedUsers = computed(() => {
      // Jika menampilkan semua data
      if (perPageUserApp.value === -1) return groupAllUsers.value;
      
      const startIndex = (currentPageUserApp.value - 1) * perPageUserApp.value;
      const endIndex = startIndex + perPageUserApp.value;
      
      return groupAllUsers.value.slice(startIndex, endIndex);
    });

    // Fungsi untuk navigasi pagination
    const nextPageUserApp = () => {
      if (currentPageUserApp.value < lastPageUserApp.value) {
        currentPageUserApp.value++;
      }
    };

    const prevPageUserApp = () => {
      if (currentPageUserApp.value > 1) {
        currentPageUserApp.value--;
      }
    };

    const handleLimitChangeUserApp = () => {
      // Reset ke halaman pertama saat mengubah jumlah item per halaman
      currentPageUserApp.value = 1;
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
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.2rem;
  font-family: monospace;
}

.description {
  margin-top: 0.5rem;
  color: var(--text-color);
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