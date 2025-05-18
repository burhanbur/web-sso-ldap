import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../api/services/authService';

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
import { errorToast } from '@/utils/toast';

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
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('access_token');

    // Handle routes that require authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            return next('/login');
        }
        
        // For protected routes, check admin status
        authService.me()
            .then(response => {
                const currentUser = response.data.data;
                
                // Check if user is admin
                let isAdmin = false;
                if (currentUser && currentUser.app_access) {
                    const ssoApp = currentUser.app_access.find(app => (app.code === 'SSO' || app.code === 'sso'));
                    if (ssoApp) {
                        isAdmin = ssoApp.roles.some(role => role.code === 'admin');
                    }
                }
                
                // Check if route requires admin privileges
                if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
                    next('/dashboard');
                } else {
                    next();
                }
            })
            .catch(error => {
                errorToast(error);
                // If there's an error fetching user data, redirect to login
                // localStorage.removeItem('access_token');
                next('/dashboard');
                // next('/login');
            });
    } 
    // Handle guest-only routes
    else if (to.matched.some(record => record.meta.requiresGuest)) {
        if (isAuthenticated) {
            next('/dashboard');
        } else {
            next();
        }
    }
    // For routes with no restrictions
    else {
        next();
    }
});

export default router;