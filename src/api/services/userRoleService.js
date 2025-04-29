import axios from '../axios';

export const userRoleService = {
    getUserRoles() {
        return axios.get('/user-roles');
    },

    createUserRole(data) {
        return axios.post('/user-roles', data);
    },

    deleteUserRole(uuid) {
        return axios.delete(`/user-roles/${uuid}`);
    },

    getEntityTypes() {
        return axios.get('/entity-types');
    }
};