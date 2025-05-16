import api from '../axios';

export const userService = {
    getUsers: (params) => {
        return api.get('/users', { params });
    },
    getLatestUsers: () => {
        return api.get('/users?limit=5&sort=created_at,desc');
    },
    generateUsername: (name) => {
        return api.post('/users/generate-username', { 'name': name });
    },
    createUser: (user) => {
        return api.post('/users', user);
    },
    updateUser: (uuid, user) => {
        return api.put(`/users/${uuid}`, user);
    },
    deleteUser: (uuid) => {
        return api.delete(`/users/${uuid}`);
    },
    getUserById: (uuid) => {
        return api.get(`/users/${uuid}`);
    },
    updateUserStatus: (uuid, status) => {
        return api.put(`/users/${uuid}/status`, status );
    },
    importUser: (formData) => {
        return api.post('/users/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    updateMyProfile: (user) => {
        return api.post('/users/profile', user);
    },
};