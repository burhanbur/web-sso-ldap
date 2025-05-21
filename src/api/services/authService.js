import api from '../axios';

export const authService = {
    login: (username, password) => {
        return api.post('/auth/login', { username, password });
    },
    logout: () => {
        return api.post('/auth/logout');
    },
    forgotPassword: (email) => {
        return api.post('/auth/password/forgot', { email });
    },
    resetPassword: (email, password, password_confirmation, token) => {
        return api.post('/auth/password/reset', {
            email,
            password,
            password_confirmation,
            token
        });
    },
    changeUserPassword: (username, password, password_confirmation) => {
        return api.post('/auth/password/change', {
            username,
            password,
            password_confirmation
        });
    },
    changeMyPassword: (username, password, password_confirmation) => {
        return api.post('/auth/me/password/change', {
            password,
            password,
            password_confirmation
        });
    },
    updateMyProfile: (user) => {
        return api.post('/auth/me/profiles', user);
    },
    refreshToken: () => {
        return api.post('/auth/refresh');
    },
    me: () => {
        return api.get('/auth/me');
    },
    startImpersonateUser: (uuid) => {
        return api.post(`/auth/impersonate/start/${uuid}`);
    },
    leaveImpersonateUser: () => {
        return api.post('/auth/impersonate/leave');
    }
};