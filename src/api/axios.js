import axios from 'axios';
import { authService } from './services/authService';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { successToast, errorToast, warningToast } from '@/utils/toast'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Activity tracking
const router = useRouter();
let lastActivity = Date.now();
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds
const TOKEN_REFRESH_THRESHOLD = 1 * 60 * 1000; // Refresh token 1 minutes before expiry

// Token refresh state
let isRefreshing = false;
let refreshPromise = null;
let lastTokenCheck = 0;
const TOKEN_CHECK_INTERVAL = 1 * 60 * 1000; // Check token every minute

// Track user activity
const updateActivity = () => {
    lastActivity = Date.now();
    // const formattedTime = new Date(lastActivity).toLocaleTimeString();
    // console.log('User activity updated:', formattedTime);
};

// Setup activity listeners
if (typeof window !== 'undefined') {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, updateActivity);
    });
}

// Refresh token handler
const handleTokenRefresh = async () => {
    const token = localStorage.getItem('access_token');

    if (!isRefreshing && token) {
        isRefreshing = true;
        refreshPromise = authService.refreshToken()
            .then(response => {
                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);
                return access_token;
            })
            .catch(error => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    router.push('/login');
                }
                throw error;
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

// Check token expiration
const shouldRefreshToken = () => {
    const now = Date.now();
    // Only check token expiration if enough time has passed since last check
    if (now - lastTokenCheck < TOKEN_CHECK_INTERVAL) {
        return false;
    }
    
    lastTokenCheck = now;
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp - now / 1000;
        return expiresIn < TOKEN_REFRESH_THRESHOLD;
    } catch {
        return false;
    }
};

// Check for inactivity
setInterval(() => {
    if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        localStorage.removeItem('access_token');
        router.push('/login');
    }
}, TOKEN_CHECK_INTERVAL);

// Request interceptor
api.interceptors.request.use(async config => {
    updateActivity();
    
    // Skip token check for refresh requests
    if (config.url.includes('/auth/refresh')) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }

    // Add current token to request
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if token needs refresh
    if (shouldRefreshToken()) {
        try {
            const newToken = await handleTokenRefresh();
            config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }
    
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 || 
            originalRequest._retry ||
            originalRequest.url.includes('/auth/refresh')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (originalRequest.url == '/auth/login') {
                errorToast(error.response.data.message)
            }

            const token = await handleTokenRefresh();

            if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            }
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;