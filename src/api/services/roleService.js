import api from '../axios';

export const roleService = {
    getRoles: () => {
        return api.get('/roles');
    },
    getUserRoles: () => {
        return api.get('/user-roles');
    }
};