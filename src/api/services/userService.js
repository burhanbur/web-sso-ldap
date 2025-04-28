import api from '../axios';

export const userService = {
    getUsers: () => {
        return api.get('/users');
    },
    getLatestUsers: () => {
        return api.get('/users?limit=5&sort=created_at,desc');
    }
};