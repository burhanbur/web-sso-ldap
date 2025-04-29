<template>
  <div class="users-page">
    <div class="header">
      <h1>Manajemen Pengguna</h1>
      <button @click="showCreateModal = true" class="primary-btn">
        <font-awesome-icon icon="user-plus" />
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="toolbar">
      <input 
        v-model="search" 
        @input="handleSearch"
        type="text" 
        placeholder="Cari nama, nomor induk atau username..." 
        class="toolbar-input"
      />
      
      <multiselect 
        v-model="statusFilter"
        :options="statusOptions"
        :searchable="true"
        :clear-on-select="false"
        :close-on-select="true"
        placeholder="Pilih Status"
        label="label"
        track-by="value"
        class="toolbar-select"
      />
    </div>

    <div v-if="loading" class="loading">Loading users...</div>
    <div v-if="users.length === 0 && !loading" class="no-users text-center">Tidak ada pengguna ditemukan.</div>
    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-top">
          <img :src="user.avatar || defaultAvatar" :alt="user.full_name" class="avatar" />
          <div class="user-info">
            <h3>{{ user.full_name }}</h3>
            <strong>{{ user.username }} - {{ user.code }}</strong>
            <p class="email">{{ user.email }}</p>
          </div>
        </div>

        <div class="user-mid">
          <strong>Aplikasi: </strong>
          <div class="apps">
            <span v-for="app in user.app_access" :key="app.id" class="app-badge">
              {{ app.code }}
            </span>
          </div>
        </div>

        <div class="user-bottom">
          <div class="status-toggle">
            <label class="switch">
              <input type="checkbox" :checked="user.status == 'Aktif' ? true : false" @change="toggleUserStatus(user)" />
              <span class="slider"></span>
            </label>
            <span class="status-text">{{ user.status == 'Aktif' ? 'Aktif' : 'Tidak Aktif' }}</span>
          </div>

          <div class="user-actions">
            <button @click="editUser(user)" class="action-btn edit">
              <font-awesome-icon icon="edit" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <br>
    <hr>
    <br>

    <!-- Pagination -->
    <div class="pagination-container">
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

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}</h2>
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Username pengguna" v-model="formData.username" required />
          </div>

          <div class="form-group">
            <label for="code">Nomor Induk</label>
            <input type="text" id="code" placeholder="Nomor induk pengguna" v-model="formData.code" required />
          </div>

          <div class="form-group">
            <label for="full_name">Nama Lengkap</label>
            <input type="text" id="full_name" placeholder="Nama lengkap pengguna" v-model="formData.full_name" required />
          </div>

          <div class="form-group">
            <label for="nickname">Nama Panggilan</label>
            <input type="text" id="nickname" placeholder="Nama panggilan pengguna" v-model="formData.nickname" required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Email pengguna" v-model="formData.email" required />
          </div>

          <div class="form-group">
            <label for="alt_email">Email Alternatif</label>
            <input type="email" id="alt_email" placeholder="Email alternatikf pengguna (Opsional)" v-model="formData.alt_email" />
          </div>

          <div class="form-group">
            <label for="join_date">Tanggal Bergabung</label>
            <input type="date" id="join_date" v-model="formData.join_date" required />
          </div>

          <div class="form-group">
            <label for="title">Jabatan</label>
            <input type="text" id="title" placeholder="Jabatan pengguna" v-model="formData.title" required />
          </div>

          <div v-if="!isEditing">
            <div class="form-group">
              <label for="password">{{ isEditing ? 'Password Baru (Opsional)' : 'Password' }}</label>
              <input type="password" id="password" placeholder="Password pengguna" v-model="formData.password" :required="!isEditing" />
            </div>

            <div class="form-group" v-if="!isEditing">
              <label for="password_confirmation">Konfirmasi Password</label>
              <input type="password" id="password_confirmation" placeholder="Konfirmasi password pengguna" v-model="formData.password_confirmation" :required="!isEditing" />
            </div>
          </div>
          
          <!-- <div class="form-group">
            <label>Role Pengguna</label>
            <div class="roles-checkboxes">
              <div v-for="role in availableRoles" :key="role.id" class="checkbox-item">
                <input type="checkbox" :id="'role-' + role.id" v-model="formData.roles" :value="role.id" />
                <label :for="'role-' + role.id">{{ role.name }}</label>
              </div>
            </div>
          </div> -->

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="secondary-btn">Batal</button>
            <button type="submit" class="primary-btn">{{ isEditing ? 'Ubah' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { userService } from '../api/services/userService';
    import { roleService } from '../api/services/roleService';
    import debounce from 'lodash/debounce';
    import defaultAvatar from '../assets/img/default.png';

    const availableRoles = ref([]);
    const users = ref([]);
    const totalUsers = ref(0);

    const search = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(10);
    const totalPages = computed(() => Math.ceil(totalUsers.value / perPage.value));

    const loading = ref(true);
    const showModal = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const isEditing = ref(false);

    const statusOptions = [
      { label: 'Aktif', value: 'Aktif' },
      { label: 'Tidak Aktif', value: 'Tidak Aktif' },
    ];

    const formData = ref({
        username: '',
        code: '',
        full_name: '',
        nickname: '',
        email: '',
        alt_email: '',
        join_date: '',
        title: '',
        status: 'Aktif',
        password: '',
        password_confirmation: '',
        roles: []
    });

    watch(showCreateModal, (newVal) => {
        if (newVal) {
            showModal.value = true;
            showCreateModal.value = true;
            isEditing.value = false;
            formData.value = {
                username: '',
                code: '',
                full_name: '',
                nickname: '',
                email: '',
                alt_email: '',
                join_date: '',
                title: '',
                status: 'Aktif',
                password: '',
                password_confirmation: '',
                roles: []
            };
        }
    });

    const fetchUsers = async () => {
        try {
            loading.value = true;
            const params = {
              search: search.value,
              status: statusFilter.value,
              page: currentPage.value,
              limit: perPage.value
            }

            const response = await userService.getUsers(params);

            users.value = response.data.data;
            totalUsers.value = response.data.pagination.total;
            currentPage.value = response.data.pagination.current_page;
            lastPage.value = response.data.pagination.last_page;
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
        showModal.value = true;
        showEditModal.value = true;
        formData.value = {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            code: user.code,
            full_name: user.full_name,
            nickname: user.nickname,
            email: user.email,
            alt_email: user.alt_email,
            join_date: user.join_date,
            title: user.title,
            status: user.status,
        };
        showModal.value = true;
    };

    const deleteUser = async (user) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(user.uuid);
                await fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const toggleUserStatus = async (user) => {
        try {
            let status = user.status == 'Aktif' ? 'Tidak Aktif' : 'Aktif';
            await userService.updateUserStatus(user.uuid, { status: status });
            user.status = status;
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    // Handle Search (Debounced)
    const debouncedFetchUsers = debounce(() => {
        currentPage.value = 1;
        fetchUsers();
    }, 300);

    const handleSearch = () => {
        debouncedFetchUsers();
    };

    // Handle Page Change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
            fetchUsers();
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing.value) {
                await userService.updateUser(formData.value.uuid, formData.value);
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
        showCreateModal.value = false;
        showEditModal.value = false;
        isEditing.value = false;
        resetFormData();
    };

    const resetFormData = () => {
      formData.value = {
          username: '',
          code: '',
          full_name: '',
          nickname: '',
          email: '',
          alt_email: '',
          join_date: '',
          title: '',
          status: 'Aktif',
          password: '',
          password_confirmation: '',
          roles: []
      };
    };

    watch(statusFilter, (newStatus) => {
      handleFilter(newStatus)
    })

    const handleFilter = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const nextPage = () => {
      if (currentPage.value < lastPage.value) {
        currentPage.value++
        fetchUsers()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        fetchUsers()
      }
    }

    onMounted(() => {
        fetchUsers();
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
  margin-bottom: 1rem;
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

.user-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
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
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.apps {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.app-badge {
  background-color: #e9f5ff;
  color: #0366d6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;

  display: inline-flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 150px;
  word-wrap: break-word;
}

.role-badge {
  background-color: #f0f0f0;
  color: #333;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  display: inline-block;
  margin-top: 2px;
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
  padding: 1rem;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: auto;
  animation: scaleIn 0.3s ease;
}

/* Responsive adjustments */
@media screen and (max-width: 640px) {
  .modal {
    padding: 1rem;
    width: 95%;
    margin: 1rem;
  }

  .form-group {
    margin-bottom: 0.8rem;
  }

  .form-group input {
    padding: 0.5rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Make sure form elements are properly spaced and sized */
.modal-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Ensure buttons are properly sized on mobile */
.modal-actions button {
  min-width: 80px;
  padding: 0.6rem 1.2rem;
}

@media screen and (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-actions button {
    width: 100%;
  }
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* User Bottom Section */
.user-bottom {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Status text */
.status-text {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* agar tetap rapi di layar kecil */
}

.toolbar-input,
.toolbar-select {
  padding: 8px;
  border-radius: 6px;
  flex: 1 1 250px;
  min-width: 200px;
}

.toolbar-button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

.toolbar-button:hover {
  background-color: #2563eb;
}

/* Container pagination */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

/* Tombol */
.pagination-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Hover effect untuk tombol */
.pagination-button:hover {
  background-color: #0056b3;
}

/* Tombol disabled */
.pagination-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Ikon chevron */
.pagination-icon {
  font-size: 18px;
}

/* Teks Halaman */
.pagination-text {
  font-weight: 500;
  color: #333;
}

</style>