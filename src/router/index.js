import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import UsersPage from '../pages/UsersPage.vue';
import ApplicationsPage from '../pages/ApplicationsPage.vue';
import RolesPage from '../pages/RolesPage.vue';
import UserRolesPage from '../pages/UserRolesPage.vue';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import PublicLayout from '../layouts/PublicLayout.vue';

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/',
        component: PublicLayout,
        children: [
            {
                path: 'login',
                name: 'login',
                component: LoginPage,
                meta: { requiresGuest: true }
            },
            {
                path: 'forgot-password',
                name: 'forgot-password',
                component: ForgotPasswordPage,
                meta: { requiresGuest: true }
            },
            {
                path: 'reset-password',
                name: 'reset-password',
                component: ResetPasswordPage,
                meta: { requiresGuest: true }
            }
        ]
    },
    {
        path: '/',
        component: AuthLayout,
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
            },
            {
                path: 'applications',
                name: 'applications',
                component: ApplicationsPage,
            },
            {
                path: 'roles',
                name: 'roles',
                component: RolesPage,
            },
            {
                path: 'user-roles',
                name: 'user-roles',
                component: UserRolesPage,
            }
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
    
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next('/login');
        } else {
            next();
        }
    } else if (to.matched.some(record => record.meta.requiresGuest)) {
        if (isAuthenticated) {
            next('/dashboard');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;