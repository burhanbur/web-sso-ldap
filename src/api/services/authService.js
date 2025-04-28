import api from '../axios';

export const authService = {
    login: (username, password) => {
        return api.post('/auth/login', { username, password });
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
    refreshToken: () => {
        return api.post('/auth/refresh');
    }
};