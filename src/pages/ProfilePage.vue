<template>
  <div class="layout-page">
    <div class="header-page">
      <h1 class="page-title">Profil Pengguna</h1>
    </div>
    
    <div class="profile-container">
      <!-- Kartu Profil Utama -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img :src="defaultAvatar" alt="Avatar" class="avatar">
            <div class="status-indicator" :class="{ 'active': user.status === 'Aktif' }"></div>
          </div>
          <div class="profile-name-section">
            <h2 class="profile-name">{{ user.full_name }}</h2>
            <span class="profile-title">{{ user.title || 'Pengguna' }}</span>
          </div>
        </div>
        
        <div class="profile-body">
          <div class="profile-section">
            <h3 class="section-title">Informasi Akun</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nama Panggilan</div>
                <div class="info-value">{{ user.nickname }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Kode Pengguna</div>
                <div class="info-value">{{ user.code }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Username</div>
                <div class="info-value">{{ user.username }}</div>
              </div>
              <!-- <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge" :class="statusClass">
                    {{ formattedStatus }}
                  </span>
                </div>
              </div> -->
            </div>
          </div>
          
          <div class="profile-section">
            <h3 class="section-title">Kontak</h3>
            <div class="contact-info-grid">
              <div class="contact-info-item">
                <div class="contact-info-label">Email Utama</div>
                <div class="contact-info-value">
                  <a :href="`mailto:${user.email}`" class="email-link">{{ user.email }}</a>
                </div>
              </div>
              <div class="contact-info-item" v-if="user.alt_email">
                <div class="contact-info-label">Email Alternatif</div>
                <div class="contact-info-value">
                  <a :href="`mailto:${user.alt_email}`" class="email-link">{{ user.alt_email ?? '-' }}</a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <h3 class="section-title">Akses Aplikasi</h3>
            <div class="app-access-container">
              <div v-if="user.app_access.length === 0" class="no-access">
                <span>Belum ada akses ke aplikasi klien</span>
              </div>
              <div v-else class="app-badges">
                <span v-for="app in user.app_access" :key="app.id" class="app-badge">
                  {{ app.code }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-footer">
          <button class="btn-profile btn-warning" @click="changePassword(user)">
            <font-awesome-icon icon="unlock" />&nbsp; Ubah Kata Sandi
          </button>
          <button class="btn-profile btn-primary" @click="editProfile(user)">
            <font-awesome-icon icon="edit" />&nbsp; Edit Profil
          </button>
        </div>
      </div>

      <!-- Kartu Statistik -->
      <div class="stats-card">
        <h3 class="stats-title">Statistik Akun</h3>
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-value">{{ user.app_access.length }}</div>
            <div class="stat-label">Aplikasi</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.status === 'Aktif' ? 'Aktif' : 'Tidak Aktif' }}</div>
            <div class="stat-label">Status</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Change Password -->
    <div v-if="showChangePasswordModal" class="modal-overlay">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2 class="modal-title">Ubah Password Pengguna</h2>
          <button type="button" class="modal-close" @click="closeModal">
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
            <button type="button" @click="closeModal" class="btn btn-secondary">Batal</button>
            <button type="submit" class="btn btn-success"><font-awesome-icon icon="save" />&nbsp; Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Edit Profile -->
     <div v-if="showEditModal" class="modal-overlay">
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
              />
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
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { authService } from '../api/services/authService';
  import { userService } from '../api/services/userService';
  import debounce from 'lodash/debounce';
  import defaultAvatar from '../assets/img/default.png';
  import Swal from 'sweetalert2';
  import { successToast, errorToast, warningToast } from '@/utils/toast';
  
  const isEditing = ref(false);
  const showEditModal = ref(false);

  const showChangePasswordModal = ref(false);
  const showPassword = ref(false);
  const showPasswordConfirmation = ref(false);
  const user = ref({
    code: '',
    username: '',
    full_name: '',
    nickname: '',
    email: '',
    alt_email: '',
    title: '',
    status: '',
    app_access: []
  });

  let formData = reactive({
    full_name: '',
    nickname: '',
    email: '',
    alt_email: '',
  })

  let formDataChangePassword = reactive({
    password: '',
    password_confirmation: ''
  })

  const loadUserData = (user) => {
    formData.full_name = user.full_name
    formData.nickname = user.nickname
    formData.email = user.email
    formData.alt_email = user.alt_email
  }
  
  const statusClass = computed(() => {
    switch(user.value.status) {
      case 'Aktif': return 'status-active';
      case 'Tidak Aktif': return 'status-inactive';
      default: return '';
    }
  })
  
  const formattedStatus = computed(() => {
    switch(user.value.status) {
      case 'Aktif': return 'Aktif';
      case 'Tidak Aktif': return 'Tidak Aktif';
      default: return user.value.status;
    }
  })
  
  const fetchUser = async () => {
    try {
      const response = await authService.me();
      user.value.code = response.data.data.code;
      user.value.username = response.data.data.username;
      user.value.full_name = response.data.data.full_name;
      user.value.nickname = response.data.data.nickname;
      user.value.email = response.data.data.email;
      user.value.alt_email = response.data.data.alt_email;
      user.value.title = response.data.data.title;
      user.value.status = response.data.data.status;
      user.value.app_access = response.data.data.app_access;
    } catch (error) {
      errorToast('Gagal memuat profil. Silakan coba lagi.');
    }
  }
  
  const editProfile = (user) => {
    loadUserData(user);
    isEditing.value = true;
    showEditModal.value = true;
  }
  
  const changePassword = (user) => {
    showChangePasswordModal.value = true;
    formDataChangePassword = {
      username: user.username,
      password: '',
      password_confirmation: ''
    }
  }

  const handleChangePassword = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Password Anda akan diganti!`,
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
        closeModal();
      } catch (error) {
        errorToast(error.response.data.message);
      }
    }
  }

  const handleSubmit = async () => {
    try {
      let response;
      response = await authService.updateMyProfile(formData);

      await fetchUser();
      closeModal();
      successToast(response.data?.message);
    } catch (error) {
      errorToast(error);
    }
  }

  const closeModal = () => {
    showChangePasswordModal.value = false;
    showEditModal.value = false;
    isEditing.value = false;
  }
  
  onMounted(() => {
    fetchUser();
  });
</script>

<style scoped>
.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card, .stats-card {
  background-color: var(--profile-bg-main);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--profile-bg-top-bottom);
  border-bottom: 1px solid #eaeaea;
}

.avatar-container {
  position: relative;
  margin-right: 1.5rem;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid #fff;
}

.status-indicator.active {
  background-color: #28a745;
}

.profile-name-section {
  flex: 1;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.3rem;
  color: var(--text-primary);
}

.profile-title {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Profile Body */
.profile-body {
  padding: 1.5rem;
  background-color: var(--profile-bg-main);
}

.profile-section {
  margin-bottom: 1.8rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaeaea;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  margin-bottom: 0.8rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--profile-text-label);
  margin-bottom: 0.3rem;
}

.info-value {
  font-weight: 500;
  color: var(--profile-text-value);
}

.contact-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.contact-info-item {
  margin-bottom: 0.8rem;
}

.contact-info-label {
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.contact-info-value {
  font-weight: 500;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-inactive {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.email-link {
  color: #007bff;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

/* App Access */
.app-access-container {
  margin-top: 0.5rem;
}

.no-access {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
}

.app-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-badge {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  background-color: #f1f8ff;
  color: #0366d6;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dcebff;
}

/* Profile Footer */
.profile-footer {
  display: flex;
  padding: 1rem 1.5rem;
  background-color: var(--profile-bg-top-bottom);
  border-top: 1px solid #eaeaea;
  gap: 1rem;
}

.btn-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.9rem;
}

.btn-profile i {
  margin-right: 0.5rem;
}

/* Stats Card */
.stats-card {
  padding: 1.5rem;
  height: fit-content;
}

.stats-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaeaea;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background-color: var(--profile-bg-top-bottom);
  border-radius: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--profile-stat-value);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--profile-text-label);
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

/* Responsive Breakpoints */
@media (max-width: 992px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .stats-card {
    margin-top: 0;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-container {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .profile-footer {
    flex-direction: column;
  }
  
  .btn-profile {
    width: 100%;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>