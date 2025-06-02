import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import MainLayout from '../layouts/MainLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import UsersPage from '../pages/UsersPage.vue';
import ApplicationsPage from '../pages/ApplicationsPage.vue';
import RolesPage from '../pages/RolesPage.vue';
import UserRolesPage from '../pages/UserRolesPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue';

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'login',
                component: LoginPage,
            },
            {
                path: 'forgot-password',
                name: 'forgot-password',
                component: ForgotPasswordPage,
            },
            {
                path: 'reset-password',
                name: 'reset-password',
                component: ResetPasswordPage,
            }
        ],
        meta: { requiresGuest: true }
    },
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: DashboardPage,
            },
            {
                path: 'users',
                name: 'users',
                component: UsersPage,
                meta: { requiresAdmin: true }
            },
            {
                path: 'applications',
                name: 'applications',
                component: ApplicationsPage,
                meta: { requiresAdmin: true }
            },
            {
                path: 'roles',
                name: 'roles',
                component: RolesPage,
                meta: { requiresAdmin: true }
            },
            {
                path: 'profile',
                name: 'profile',
                component: ProfilePage,
            },
            // {
            //     path: 'user-roles',
            //     name: 'user-roles',
            //     component: UserRolesPage,
            // }
        ],
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const isGuestRoute = to.matched.some(record => record.meta.requiresGuest);
    
    if (!isGuestRoute && !authStore.isUserLoaded) {
        try {
            await authStore.fetchUserData();
        } catch (error) {
            console.log('Failed to fetch user data:', error);
        }
    }

    const isAuthenticated = authStore.isAuthenticated;

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            return next('/login');
        }

        if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
            return next('/dashboard');
        }
        
        return next();
    } 
    
    if (to.matched.some(record => record.meta.requiresGuest)) {
        if (isAuthenticated || authStore.isUserLoaded) {
            return next('/dashboard');
        }
        return next();
    }
    
    return next();
});

export default router;