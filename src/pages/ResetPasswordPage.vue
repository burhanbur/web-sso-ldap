<template>
    <div class="login-container">
        <div class="login-image">
            <div class="image-wrapper">
                <img src="../assets/img/up.jpg" alt="Background" />
                <div class="overlay"></div>
            </div>
        </div>
        
        <div class="login-form-container">
            <div class="login-form-wrapper">
                <div class="logo-container">
                    <img src="../assets/logo.png" alt="Logo" class="logo" />
                </div>
                <h1>Reset Password</h1>
                
                <form @submit.prevent="handleResetPassword" class="login-form">
                    <div class="form-group">
                        <input 
                            type="email" 
                            id="email" 
                            v-model="email" 
                            placeholder="Email"
                            required
                            readonly
                        />
                    </div>

                    <div class="form-group password-group">
                        <input 
                            :type="showPassword ? 'text' : 'password'"
                            id="password" 
                            v-model="password" 
                            placeholder="Password Baru"
                            required
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
                        <input 
                            :type="showPassword ? 'text' : 'password'"
                            id="password_confirmation" 
                            v-model="passwordConfirmation" 
                            placeholder="Konfirmasi Password Baru"
                            required
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

                    <button type="submit" :disabled="loading || !isValid" class="submit-btn">
                        {{ loading ? 'Resetting...' : 'Reset Password' }}
                    </button>

                    <div class="back-to-login">
                        <router-link to="/login" class="back-link">Kembali ke Login</router-link>
                    </div>
                </form>

                <div v-if="message" class="message" :class="{ 'success': isSuccess }">
                    {{ message }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { authService } from '../api/services/authService';
    import { successToast, errorToast, warningToast } from '@/utils/toast'

    const router = useRouter();
    const route = useRoute();
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');
    const loading = ref(false);
    const message = ref('');
    const isSuccess = ref(false);
    const showPassword = ref(false);
    const token = ref('');

    const isValid = computed(() => {
        return email.value && 
               password.value && 
               passwordConfirmation.value && 
               password.value === passwordConfirmation.value;
    });

    onMounted(() => {
        // Get email and token from URL query parameters
        const queryEmail = route.query.email;
        const queryToken = route.query.token;
        
        if (queryEmail) {
            email.value = decodeURIComponent(queryEmail);
        }
        
        if (queryToken) {
            token.value = queryToken;
        } else {
            // Redirect to forgot password if no token is present
            router.push('/forgot-password');
        }
    });

    const handleResetPassword = async () => {
        if (!isValid.value) {
            message.value = 'Passwords do not match';
            isSuccess.value = false;
            return;
        }

        message.value = '';
        loading.value = true;
        
        try {
            const reset = await authService.resetPassword(email.value, password.value, passwordConfirmation.value, token.value);
            isSuccess.value = reset.data.success;
            message.value = reset.data.message;
            
            if (isSuccess.value) {
                sessionStorage.setItem('successMsg', message.value);
                successToast(message.value);
                router.push('/login');
            }
        } catch (error) {
            console.error('Reset password failed:', error);
            isSuccess.value = false;
            message.value = error.response?.data?.message || 'Failed to reset password. Please try again.';
        } finally {
            loading.value = false;
        }
    };
</script>

<style scoped>
    .login-container {
        display: flex;
        min-height: 100vh;
        width: 100vw;
        background-color: var(--background);
    }

    .login-image {
        position: relative;
        width: 55%;
        overflow: hidden;
    }

    .image-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
    }

    .login-form-container {
        width: 45%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--background);
        padding: 2rem;
    }

    .login-form-wrapper {
        width: 100%;
        max-width: 420px;
        padding: 2rem;
    }

    .logo-container {
        text-align: center;
        margin-bottom: 2rem;
    }

    .logo {
        max-width: 200px;
        height: auto;
    }

    h1 {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 30px;
        font-weight: 500;
        letter-spacing: 1px;
        text-align: center;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        position: relative;
    }

    .form-group input {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 14px;
        background-color: var(--background);
    }

    .form-group input::placeholder {
        color: var(--text-muted);
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--primary);
    }

    .form-group.password-group {
        position: relative;
    }

    .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
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

    .password-group input {
        padding-right: 40px;
    }

    .submit-btn {
        width: 100%;
        padding: 12px;
        background-color: var(--primary);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
    }

    .submit-btn:active:not(:disabled) {
        transform: translateY(0);
    }

    .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .back-to-login {
        text-align: center;
    }

    .back-link {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--text-secondary);
    }

    .message {
        margin-top: 20px;
        padding: 12px;
        border-radius: 4px;
        font-size: 13px;
        text-align: center;
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--error);
    }

    .message.success {
        background-color: rgba(40, 167, 69, 0.1);
        color: var(--success);
    }

    @media (max-width: 1200px) {
        .login-image {
            width: 50%;
        }
        
        .login-form-container {
            width: 50%;
        }
    }

    @media (max-width: 768px) {
        .login-container {
            flex-direction: column;
        }

        .login-image {
            width: 100%;
            height: 280px;
        }

        .login-form-container {
            width: 100%;
            padding: 2rem 1.5rem;
        }

        .login-form-wrapper {
            padding: 0;
        }
    }
</style>