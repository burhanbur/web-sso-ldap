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
    <div v-if="users.length === 0 && !loading" class="text-center"><h3>Tidak ada data yang ditemukan.</h3></div>
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
          <strong style="color: var(--text-primary)">Aplikasi: </strong>
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
              <label for="full_name">Nama Lengkap</label>
              <input 
                type="text" 
                id="full_name" 
                placeholder="Nama lengkap pengguna" 
                v-model="formData.full_name" 
                required 
                @input="onFullNameInput"
              />
            </div>

            <div v-if="!isEditing">
              <div class="form-group">
                <label for="type">Tipe Pengguna</label>
                <select id="type" v-model="formData.type" required @input="onFullNameInput">
                  <option value="">Pilih Tipe Pengguna</option>
                  <option value="staff">Staf</option>
                  <option value="student">Mahasiswa</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="username">Username</label>
              <div class="username-input-group">
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Username pengguna" 
                  v-model="formData.username" 
                  :readonly="!isEditingUsername" 
                  required 
                  class="form-control"
                />
                <button 
                  v-if="!isEditing"
                  type="button" 
                  class="btn-generate" 
                  @click="autoGenerateUsername" 
                  title="Generate username"
                  :disabled="isEditingUsername"
                  aria-label="Generate username"
                >
                  <font-awesome-icon icon="sync" />
                </button>
                <button 
                  type="button" 
                  class="btn-edit" 
                  :class="{ 'active': isEditingUsername }"
                  @click="toggleEditUsername" 
                  title="Edit username"
                  aria-label="Toggle username edit"
                >
                  <font-awesome-icon icon="edit" />
                </button>
              </div>
              <small class="form-text text-muted">{{ isEditing ? 'Klik ikon edit untuk mengubah username' : 'Username akan digenerate otomatis, atau klik ikon edit untuk custom' }}</small>
            </div>

            <div class="form-group">
              <label for="code">Nomor Induk</label>
              <input type="text" id="code" placeholder="Nomor induk pengguna" v-model="formData.code" required />
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
            
            <div class="akses-wrapper">
              <label><strong>Akses Pengguna</strong></label>

              <div
                v-for="(access, index) in formData.app_access"
                :key="index"
                class="akses-row"
              >
              <div class="akses-grid">
                <div class="form-group">
                  <label>Aplikasi</label>
                  <select v-model="access.app_id">
                    <option value="">Pilih Aplikasi</option>
                    <option v-for="app in availableApps" :key="app.id" :value="app.id">
                      {{ app.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Peran</label>
                  <select v-model="access.role_id">
                    <option value="">Pilih Peran</option>
                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                      {{ role.display_name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Jenis Entitas</label>
                  <select v-model="access.entity_type_id">
                    <option value="">Pilih Jenis Entitas</option>
                    <option v-for="type in availableEntityTypes" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Kode Entitas</label>
                  <input
                    type="text"
                    v-model="access.entity_id"
                    placeholder="Misal: 55201"
                  />
                </div>

                <div class="form-group btn-wrapper">
                  <label>&nbsp;</label>
                  <button type="button" @click="removeUserRole(index)" class="btn-delete">
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </div>
              </div>

              <div style="margin-top: 10px">
                <button type="button" @click="addUserRole" class="btn-add">
                  <font-awesome-icon icon="plus" />
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; {{ isEditing ? 'Ubah' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Import Pengguna -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h2 class="modal-title">Impor Pengguna</h2>
          <button type="button" class="modal-close" @click="closeModal">
            <span>&times;</span>
          </button>
        </div>

        <form @submit.prevent="importUser" class="modal-form">
          <div class="modal-body">
            <div class="form-group file-upload">
              <label for="file">File Excel</label>

              <!-- buatkan link download template di sini `public/template.xlsx` -->
              <a 
                href="/template.xlsx" 
                download 
                class="btn-download-template"
              >
                📥 Download Template Excel
              </a>
              
              <div class="custom-file-input">
                <input
                  type="file"
                  id="file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  @change="onFileChange"
                  required
                />
                <span class="file-label">
                  <font-awesome-icon icon="file-upload" class="upload-icon" />
                  {{ fileName }}
                </span>
              </div>

              <div v-if="previewData.length > 0" class="excel-preview">
                <h4>Pratinjau Data</h4>
                <table>
                  <thead>
                    <tr>
                      <th v-for="(header, idx) in previewData[0]" :key="idx">{{ header }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in previewData.slice(1)" :key="i">
                      <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted, watch } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { authService } from '../api/services/authService';
    import { userService } from '../api/services/userService';
    import { useAuthStore } from '@/stores/auth';
    import { applicationService } from '../api/services/applicationService';
    import { roleService } from '../api/services/roleService';
    import debounce from 'lodash/debounce';
    import defaultAvatar from '../assets/img/default.png';
    import Swal from 'sweetalert2';
    import { successToast, errorToast, warningToast } from '@/utils/toast'
    import * as XLSX from 'xlsx'

    const props = defineProps({
      showModal: Boolean,
      editData: Object,
    });

    const router = useRouter();
    const authStore = useAuthStore();

    let availableApps = reactive([]);
    let availableRoles = reactive([]);
    let availableEntityTypes = reactive([]);

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
    const showImportModal = ref(false);

    const isEditing = ref(false);
    const isEditingUsername = ref(false);

    const showPassword = ref(false);
    const showPasswordConfirmation = ref(false);

    const file = ref(null);
    const fileName = ref('Pilih file Excel...');
    const previewData = ref([]);

    const onFileChange = async (e) => {
      const uploadFile = e.target.files[0]
      if (!uploadFile) return

      file.value = uploadFile;
      fileName.value = uploadFile ? uploadFile.name : 'Pilih file Excel...'

      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        previewData.value = jsonData
      }

      reader.readAsArrayBuffer(uploadFile)
    }

    const importUser = async () => {
      if (!file.value) {
        warningToast('Silakan pilih file Excel terlebih dahulu.')
        return
      }

      const formData = new FormData()
      formData.append('file', file.value)

      try {
        const response = await userService.importUser(formData);

        // Optionally reset
        file.value = null
        fileName.value = 'Pilih file Excel...'
        previewData.value = []
    
        await fetchUsers();

        successToast(response.data.message || 'Impor data pengguna berhasil.');
      } catch (error) {
        errorToast(error);
      }
    }

    const statusOptions = [
      { label: 'Aktif', value: 'Aktif' },
      { label: 'Tidak Aktif', value: 'Tidak Aktif' },
    ];

    let formData = reactive({
      type: '',
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
      app_access: [{ app_id: '', role_id: '', entity_type_id: '', entity_id: '' }],
    })

    let formDataChangePassword = reactive({
      password: '',
      password_confirmation: ''
    })

    watch(showCreateModal, (newVal) => {
      if (newVal) {
        showModal.value = true;
        showCreateModal.value = true;
        isEditing.value = false;
        resetFormData();
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

        return response;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message
          
        errorToast(message);
      } finally {
        loading.value = false;
      }
    }

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
          const response = await authStore.impersonateUser(user.uuid);

          if (response) {
            successToast('Berhasil masuk sebagai impersonasi pengguna.');

            router.push('/dashboard');
          } else {
            errorToast('Gagal masuk sebagai impersonasi pengguna.');
          }
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Gagal melakukan impersonasi pengguna.'

          errorToast(message)
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
        const params = {
          limit: 100,
        }

        const response = await roleService.getRoles(params);
        availableRoles = response.data.data;
      } catch (error) {
        errorToast(error);
      }
    }

    const fetchApps = async () => {
      try {
        const params = {
          limit: 100,
        }

        const response = await applicationService.getApplications(params);
        availableApps = response.data.data;
      } catch (error) {
        errorToast(error);
      }
    }

    const fetchEntityTypes = async () => {
      try {
        const response = await roleService.getEntityTypes();
        availableEntityTypes = response.data.data;
      } catch (error) {
        errorToast(error);
      }
    }

    const autoGenerateUsername = async () => {
      if (!formData.full_name) {
        errorToast('Silakan isi nama lengkap dan tipe pengguna terlebih dahulu.');
        return;
      }
      
      try {
        const response = await userService.generateUsername(formData.full_name, formData.type);
        formData.username = response.data.data;
      } catch (error) {
        errorToast(error);
      }
    }

    // Debounced function for handling full name input
    const debouncedGenerateUsername = debounce(async () => {
      if (formData.full_name && !isEditingUsername.value && !isEditing.value) {
        await autoGenerateUsername();
      }
    }, 500);

    // Handle full name input with debounce
    const onFullNameInput = () => {
      debouncedGenerateUsername();
    };

    // Load data if in edit mode
    watch(() => props.editData, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        Object.assign(formData, newVal);
      } else {
        isEditing.value = false;
        formData
      }
    }, { immediate: true });

    // Reset form when modal is closed
    watch(() => props.showModal, (isOpen) => {
      if (!isOpen) {
        if (!isEditing.value) {
          formData
        }
        isEditingUsername.value = false;
      }
    }, { immediate: true });

    const toggleEditUsername = () => {
      isEditingUsername.value = !isEditingUsername.value;
      
      // If turning off edit mode and we're in create mode, regenerate username
      if (!isEditingUsername.value && !isEditing.value && formData.full_name) {
        autoGenerateUsername();
      }
    };

    const editUser = (user) => {
      loadUserData(user);
      isEditing.value = true;
      showModal.value = true;
      showEditModal.value = true;
      showModal.value = true;
    }

    const loadUserData = (user) => {
      formData.id = user.id
      formData.uuid = user.uuid
      formData.username = user.username
      formData.code = user.code
      formData.full_name = user.full_name
      formData.nickname = user.nickname
      formData.email = user.email
      formData.alt_email = user.alt_email
      formData.join_date = user.join_date
      formData.title = user.title
      formData.status = user.status

      const mappedUserRoles = [];

      user.app_access.forEach(app => {
        const appRef = availableApps.find(a => a.code === app.code);

        app.roles.forEach(role => {
          const roleRef = availableRoles.find(r => r.name === role.code);
          const entityTypeRef = availableEntityTypes.find(e => e.code === role.entity.type);

          mappedUserRoles.push({
            app_id: appRef?.id ?? null,
            role_id: roleRef?.id ?? null,
            entity_type_id: entityTypeRef?.id ?? null,
            entity_id: role.entity.id ?? null
          });
        });
      });

      formData.app_access = mappedUserRoles ?? []
    }

    const changePasswordUser = (user) => {
      showChangePasswordModal.value = true;
      formDataChangePassword = {
        username: user.username,
        password: '',
        password_confirmation: ''
      }
    }

    const toggleStatus = async (user) => {
      try {
        let newStatus = user.status == 'Aktif' ? 'Tidak Aktif' : 'Aktif';
        await userService.updateUserStatus(user.uuid, { status: newStatus });
        user.status = newStatus

        successToast(`Status pengguna ${user.full_name} diubah menjadi ${newStatus}.`);
      } catch (error) {
        errorToast(error);
      }
    }

    const handleSubmit = async () => {
      try {
        let response;
        if (isEditing.value) {
          response = await userService.updateUser(formData.uuid, formData);
        } else {
          response = await userService.createUser(formData);
        }

        await fetchUsers();
        closeModal();
        successToast(response.data?.message);
      } catch (error) {
        errorToast(error);
      }
    }

    const handleChangePassword = async () => {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: `Password pengguna akan diganti!`,
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
            formDataChangePassword.username, 
            formDataChangePassword.password, 
            formDataChangePassword.password_confirmation
          );
          
          successToast(response.data?.message);
          closeChangePasswordModal();
        } catch (error) {
          errorToast(error.response.data.message);
        }
      }
    }

    const closeChangePasswordModal = () => {
      showChangePasswordModal.value = false;
      formDataChangePassword = {
        password: '',
        password_confirmation: ''
      }
    }

    const closeModal = () => {
      showModal.value = false;
      showCreateModal.value = false;
      showEditModal.value = false;
      showImportModal.value = false;

      isEditing.value = false;
      isEditingUsername.value = false;
      resetFormData();
    }

    const addUserRole = () => {
      formData.app_access.push({
        app_id: '',
        role_id: '',
        entity_type_id: '',
        entity_id: ''
      })
    }

    const removeUserRole = (index) => {
      formData.app_access.splice(index, 1)
    }

    const resetFormData = async () => {
      formData.username = ''
      formData.code = ''
      formData.full_name = ''
      formData.nickname = ''
      formData.email = ''
      formData.alt_email = ''
      formData.join_date = ''
      formData.title = ''
      formData.status = 'Aktif'
      formData.password = ''
      formData.password_confirmation = ''
      formData.app_access = [{ app_id: '', role_id: '', entity_type_id: '', entity_id: '' }]
    }
    
    /* start: filter, search and pagination */
    const debouncedFetchUsers = debounce(() => {
      currentPage.value = 1;
      fetchUsers();
    }, 300);

    const handleSearch = () => {
      debouncedFetchUsers();
    }

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
    }
    /* end: filter, search and pagination */

    onMounted(async () => {
      const resp = await fetchUsers();

      if (resp && resp.data.success) {
        fetchRoles();
        fetchApps();
        fetchEntityTypes();
      }
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
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.apps {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  color: var(--text-secondary);
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
  color: var(--text-primary);
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

.akses-wrapper {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.akses-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: var(--bg-secondary);
}

.akses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
}

.btn-wrapper {
  display: flex;
  align-items: flex-end;
}

.btn-add,
.btn-delete {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background-color: #dc3545;
}

.btn-add:hover {
  background-color: #0056b3;
}

.btn-delete:hover {
  background-color: #b02a37;
}

/* Style for read-only inputs in form-group */
.form-group input[readonly] {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  color: #6c757d;
  cursor: not-allowed;
}

/* Username input group styling */
.username-input-group {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.username-input-group input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* Button base styles */
.username-input-group button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: auto;
  border: 1px solid #ced4da;
  background-color: #e9ecef;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Generate button styling */
.username-input-group .btn-generate {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

/* Edit button styling */
.username-input-group .btn-edit {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

/* Active state for edit button */
.username-input-group .btn-edit.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

/* Hover states */
.username-input-group .btn-generate:hover,
.username-input-group .btn-edit:hover {
  background-color: #dde2e6;
}

.username-input-group .btn-edit.active:hover {
  background-color: #0069d9;
}

/* Disabled state */
.username-input-group button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.username-input-group button {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
}

.username-input-group .btn-generate,
.username-input-group .btn-edit {
  width: 40px;
}

/* Ensure input and buttons have consistent height */
.username-input-group input,
.username-input-group button {
  height: 38px;
}

/* Responsive adjustments for small screens */
@media (max-width: 576px) {
  .username-input-group button {
    padding: 0.25rem 0.5rem;
  }
}

.excel-preview {
  margin-top: 1rem;
  overflow-x: auto;
}

.excel-preview table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.excel-preview th,
.excel-preview td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>