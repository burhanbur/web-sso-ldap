<template>
  <div class="layout-page">
    <div class="header-page">
      <h1>Manajemen Peran</h1>
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
        placeholder="Cari nama peran..." 
        class="toolbar-input"
      />

      <select id="sort" class="toolbar-select" v-model="sortSelection" @change="handleSortSelection">
        <option value="display_name,asc">Peran (A-Z)</option>
        <option value="display_name,desc">Peran (Z-A)</option>
        <option value="created_at,desc">Terbaru</option>
        <option value="created_at,asc">Terlama</option>
      </select>
    </div>

    <div v-if="loading" class="loading spinner-container"><div class="spinner"></div></div>
    <div v-if="roles.length === 0 && !loading" class="text-center">Tidak ada data yang ditemukan.</div>
    <div v-else class="layout-grid">
      <div v-for="role in roles" :key="role.id" class="card">
        <div class="role-info">
          <h3>{{ role.display_name }}</h3>
          <p class="code">{{ role.name }}</p>
          <p class="description">{{ role.description || 'No description' }}</p>
          <div class="tags">
            <span class="tag">{{ role.role_type?.name || 'Unknown Type' }}</span>
            <span class="tag">{{ role.scope_type?.name || 'Unknown Scope' }}</span>
          </div>
        </div>

        <div class="data-actions">
          <button @click="editRole(role)" class="action-btn edit">
            <font-awesome-icon icon="edit" />
          </button>
          <button @click="deleteRole(role.uuid)" class="action-btn delete">
            <font-awesome-icon icon="trash" />
          </button>
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
      <div class="modal modal-md">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Ubah Peran' : 'Tambah Peran' }}</h2>
          <button type="button" class="modal-close" @click="closeModal">
            <span>&times;</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="modal-body">
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
              <select id="role_type_id" v-model="formData.role_type_id">
                <option value="">Select a role type</option>
                <option v-for="type in roleTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="scope_type_id">Scope Type</label>
              <select id="scope_type_id" v-model="formData.scope_type_id">
                <option value="">Select a scope type</option>
                <option v-for="scope in scopeTypes" :key="scope.id" :value="scope.id">
                  {{ scope.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; {{ isEditing ? 'Ubah' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { roleService } from '../api/services/roleService';
    import debounce from 'lodash/debounce';
    import Swal from 'sweetalert2';
    import { successToast, errorToast } from '@/utils/toast'

    const roles = ref([]);
    const totalRoles = ref(0);

    const entityTypes = ref([]);
    const roleTypes = ref([]);
    const scopeTypes = ref([]);

    const search = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(15);
    const sortSelection = ref('display_name,asc')

    const loading = ref(true);
    const showModal = ref(false);
    const showCreateModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({
        name: '',
        display_name: '',
        description: '',
        role_type_id: '',
        scope_type_id: ''
    });

    watch(showCreateModal, (newVal) => {
        if (newVal) {
          showCreateModal.value = true;
          showModal.value = false;
          isEditing.value = false;
          formData
        }
    });

    const fetchRoles = async () => {
        try {
            loading.value = true;
            const params = {
              search: search.value,
              status: statusFilter.value,
              page: currentPage.value,
              limit: perPage.value,
              sort: sortSelection.value
            }

            const response = await roleService.getRoles(params);

            roles.value = response.data.data;
            totalRoles.value = response.data.pagination.total;
            currentPage.value = response.data.pagination.current_page;
            lastPage.value = response.data.pagination.last_page;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            errorToast(error);
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
            errorToast(error);
        }
    };

    const fetchScopeTypes = async () => {
        try {
            const response = await roleService.getScopes();
            console.log(response.data);
            scopeTypes.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch scope types:', error);
            errorToast(error);
        }
    };

    const editRole = (role) => {
      isEditing.value = true;
      // formData.value = { ...role };
      formData.value = {
        name: role.name,
        display_name: role.display_name,
        description: role.description,
        role_type_id: role.role_type_id || role.role_type?.id || '',
        scope_type_id: role.scope_type_id || role.scope_type?.id || '',
        uuid: role.uuid
      };
      showModal.value = true;
    };

    const deleteRole = async (uuid) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
              const response = await roleService.deleteRole(uuid);
              await fetchRoles();
              successToast(response.data.message);
            } catch (error) {
              console.error('Failed to delete role:', error);
              errorToast(error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
          let response;
            if (isEditing.value) {
                response = await roleService.updateRole(formData.value.uuid, formData.value);
            } else {
                response = await roleService.createRole(formData.value);
            }
            await fetchRoles();
            closeModal();
            successToast(response.data.message);
        } catch (error) {
            console.error('Failed to save role:', error);
            errorToast(error);
        }
    };

    const closeModal = () => {
        showModal.value = false;
        showCreateModal.value = false;
        isEditing.value = false;
        formData.value = {
            name: '',
            display_name: '',
            description: '',
            role_type_id: '',
            scope_type_id: ''
        };
    };

    // Handle Search (Debounced)
    const debouncedFetch = debounce(() => {
        currentPage.value = 1;
        fetchRoles();
    }, 300);

    const handleSearch = () => {
        debouncedFetch();
    };

    watch(statusFilter, (newStatus) => {
      handleFilter(newStatus)
    })

    const handleFilter = () => {
      currentPage.value = 1
      fetchRoles()
    }

    const handleSortSelection = () => {
      fetchRoles()
    } 

    const nextPage = () => {
      if (currentPage.value < lastPage.value) {
        currentPage.value++
        fetchRoles()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        fetchRoles()
      }
    }

    const handleLimitChange = () => {
        currentPage.value = 1;
        fetchRoles();
    };

    onMounted(() => {
        fetchRoles();
        fetchRoleTypes();
        fetchScopeTypes();
    });
</script>

<style scoped>
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
</style>