<template>
  <div class="layout-page">
    <div class="header-page">
      <h1>Manajemen Pengguna</h1>
      <div class="header-button">
        <button @click="showImportModal = true" class="import-btn">
          <font-awesome-icon icon="upload" />
        </button>
        <button @click="showCreateModal = true" class="create-btn">
          <font-awesome-icon icon="user-plus" />
        </button>
      </div>
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

      <select id="sort" class="toolbar-select" v-model="sortSelection" @change="handleSortSelection">
        <option value="full_name,asc">Nama Lengkap (A-Z)</option>
        <option value="full_name,desc">Nama Lengkap (Z-A)</option>
        <option value="username,asc">Username (A-Z)</option>
        <option value="username,desc">Username (Z-A)</option>
        <option value="code,asc">Kode Pengguna (A-Z)</option>
        <option value="code,desc">Kode Pengguna (Z-A)</option>
        <option value="created_at,desc">Terbaru</option>
        <option value="created_at,asc">Terlama</option>
      </select>
    </div>

    <div v-if="loading" class="loading spinner-container"><div class="spinner"></div></div>
    <div v-if="users.length === 0 && !loading" class="text-center">Tidak ada data yang ditemukan.</div>
    <div v-else class="layout-grid">
      <div v-for="user in users" :key="user.id" class="card">
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
            <div v-if="user.app_access.length === 0"><small>Belum ada akses ke aplikasi klien</small></div>
            <span v-for="app in user.app_access" :key="app.id" class="app-badge">
              {{ app.code }}
            </span>
          </div>
        </div>

        <div class="user-bottom">
          <div class="status-toggle">
            <label class="switch">
              <input type="checkbox" :checked="user.status == 'Aktif' ? true : false" @change="toggleStatus(user)" />
              <span class="slider"></span>
            </label>
            <span class="status-text">{{ user.status == 'Aktif' ? 'Aktif' : 'Tidak Aktif' }}</span>
          </div>

          <div class="data-actions">
            <button @click="impersonateUser(user)" class="action-btn dark">
              <font-awesome-icon icon="user-secret" />
            </button>
            <button @click="changePasswordUser(user)" class="action-btn warning">
              <font-awesome-icon icon="unlock" />
            </button>
            <button @click="showUser(user)" class="action-btn show">
              <font-awesome-icon icon="search" />
            </button>
            <button @click="editUser(user)" class="action-btn edit">
              <font-awesome-icon icon="edit" />
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

    <!-- Modal Change Password -->
    <div v-if="showChangePasswordModal" class="modal-overlay">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2 class="modal-title">Ubah Password Pengguna</h2>
          <button type="button" class="modal-close" @click="closeChangePasswordModal">
            <span>&times;</span>
          </button>
        </div>

        <form @submit.prevent="handleChangePassword" class="modal-form">
          <div class="modal-body">
            <div class="form-group password-group">
              <label for="password">Password Baru</label>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                placeholder="Password baru pengguna" 
                v-model="formDataChangePassword.password" required 
              />
              <button 
                type="button"
                class="toggle-password" 
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
              </button>
            </div>
            <div class="form-group password-group">
              <label for="password_confirmation">Konfirmasi Password</label>
              <input 
                :type="showPasswordConfirmation ? 'text' : 'password'" 
                id="password_confirmation" 
                placeholder="Konfirmasi password baru pengguna" 
                v-model="formDataChangePassword.password_confirmation" required 
              />
              <button 
                type="button"
                class="toggle-password"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
                :title="showPasswordConfirmation ? 'Hide password' : 'Show password'"
              >
                <font-awesome-icon :icon="showPasswordConfirmation ? 'eye-slash' : 'eye'" />
              </button>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeChangePasswordModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? 'Ubah Pengguna' : 'Tambah Pengguna Baru' }}</h2>
          <button type="button" class="modal-close" @click="closeModal">
            <span>&times;</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="modal-body">
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
              <div class="form-group password-group">
                <label for="password">{{ isEditing ? 'Password Baru (Opsional)' : 'Password' }}</label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  placeholder="Password pengguna" 
                  v-model="formData.password" :required="!isEditing" 
                />
                <button 
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                >
                  <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
                </button>
              </div>

              <div class="form-group password-group" v-if="!isEditing">
                <label for="password_confirmation">Konfirmasi Password</label>
                <input 
                  :type="showPasswordConfirmation ? 'text' : 'password'" 
                  id="password_confirmation" 
                  placeholder="Konfirmasi password pengguna" 
                  v-model="formData.password_confirmation" :required="!isEditing" 
                />
                <button 
                  type="button"
                  class="toggle-password"
                  @click="showPasswordConfirmation = !showPasswordConfirmation"
                  :title="showPasswordConfirmation ? 'Hide password' : 'Show password'"
                >
                  <font-awesome-icon :icon="showPasswordConfirmation ? 'eye-slash' : 'eye'" />
                </button>
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
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; {{ isEditing ? 'Ubah' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { authService } from '../api/services/authService';
    import { userService } from '../api/services/userService';
    import { roleService } from '../api/services/roleService';
    import debounce from 'lodash/debounce';
    import defaultAvatar from '../assets/img/default.png';
    import Swal from 'sweetalert2';
    import { successToast, errorToast } from '@/utils/toast'

    const availableRoles = ref([]);
    const users = ref([]);
    const totalUsers = ref(0);

    const search = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(15);
    // const totalPages = computed(() => Math.ceil(totalUsers.value / perPage.value));
    const sortSelection = ref('full_name,asc')

    const loading = ref(true);
    const showModal = ref(false);
    const showChangePasswordModal = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const isEditing = ref(false);

    const showPassword = ref(false);
    const showPasswordConfirmation = ref(false);

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

    const formDataChangePassword = ref({
        password: '',
        password_confirmation: ''
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
              limit: perPage.value,
              sort: sortSelection.value
            }

            const response = await userService.getUsers(params);

            users.value = response.data.data;
            totalUsers.value = response.data.pagination.total;
            currentPage.value = response.data.pagination.current_page;
            lastPage.value = response.data.pagination.last_page;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            errorToast(error);
        } finally {
            loading.value = false;
        }
    };

    const impersonateUser = async (user) => {
        const result = await Swal.fire({
          title: 'Konfirmasi',
          text: `Anda akan masuk sebagai pengguna ini?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, masuk!',
          cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                // const response = await authService.impersonateUser(user.uuid);
                // window.location.href = response.data.redirect_url;
                // TODO
                successToast('Berhasil masuk sebagai pengguna!');
            } catch (error) {
                errorToast(error);
            }
        }
    }

    const showUser = async (user) => {
        const result = await Swal.fire({
          title: 'Detail Pengguna',
          html: `<strong>Nama:</strong> ${user.full_name}<br>
                 <strong>Nomor Induk:</strong> ${user.code}<br>
                 <strong>Username:</strong> ${user.username}<br>
                 <strong>Nama Panggilan:</strong> ${user.nickname}<br>
                 <strong>Email:</strong> ${user.email}<br>
                 <strong>Status:</strong> ${user.status}`,
          icon: 'info',
          showCloseButton: true,
          confirmButtonText: 'Tutup'
        });
    }

    const fetchRoles = async () => {
        try {
            const response = await roleService.getRoles();
            availableRoles.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            errorToast(error);
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

    const changePasswordUser = (user) => {
        showChangePasswordModal.value = true;
        formDataChangePassword.value = {
          username: user.username,
          password: '',
          password_confirmation: ''
        };
    };

    const toggleStatus = async (user) => {
        try {
            let status = user.status == 'Aktif' ? 'Tidak Aktif' : 'Aktif';
            await userService.updateUserStatus(user.uuid, { status: status });
            user.status = status;
        } catch (error) {
            console.error('Failed to update user status:', error);
            errorToast(error);
        }
    };

    const handleSubmit = async () => {
        try {
            let response;
            if (isEditing.value) {
                response = await userService.updateUser(formData.value.uuid, formData.value);
            } else {
                response = await userService.createUser(formData.value);
            }
            await fetchUsers();
            closeModal();
            successToast(response.data?.message);
        } catch (error) {
            console.error('Failed to save user:', error);
            errorToast(error);
        }
    };

    const handleChangePassword = async () => {
        const result = await Swal.fire({
          title: 'Konfirmasi',
          text: `Password user akan diganti!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, ganti!',
          cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
          try {
            const response = await authService.changeUserPassword(
              formDataChangePassword.value.username, 
              formDataChangePassword.value.password, 
              formDataChangePassword.value.password_confirmation
            );
            
            successToast(response.data?.message);
            closeChangePasswordModal();
          } catch (error) {
            errorToast(error.response.data.message);
          }
        }
    };

    const closeChangePasswordModal = () => {
        showChangePasswordModal.value = false;
        formDataChangePassword.value = {
            password: '',
            password_confirmation: ''
        };
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
    
    // Handle Search (Debounced)
    const debouncedFetchUsers = debounce(() => {
        currentPage.value = 1;
        fetchUsers();
    }, 300);

    const handleSearch = () => {
        debouncedFetchUsers();
    };

    watch(statusFilter, (newStatus) => {
      handleFilter(newStatus)
    })

    const handleFilter = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const handleSortSelection = () => {
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

    const handleLimitChange = () => {
        currentPage.value = 1;
        fetchUsers();
    };

    onMounted(() => {
      fetchUsers();
    });
</script>

<style scoped>
.user-top {
  display: flex;
  gap: 1rem;
}

.user-mid {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #000000;
}

.user-bottom {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.password-group {
  position: relative;
}

.password-group input {
  padding-right: 40px;
  height: 40px;
  line-height: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(0%);
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  z-index: 2;
}

.toggle-password:hover {
  color: var(--text-secondary); 
}

.toggle-password:focus {
  outline: none;
}

</style>