import api from '../axios';

export const roleService = {
    getRoles: (params) => {
        return api.get('/roles', { params });
    },
    getEntityTypes: () => {
        return api.get('/entity-types');
    },
    getRoleTypes: () => {
        return api.get('/role-types');
    },
    getScopes: () => {
        return api.get('/scopes');
    },
    createRole: (role) => {
        return api.post('/roles', role);
    },
    updateRole: (uuid, role) => {
        return api.put(`/roles/${uuid}`, role);
    },
    deleteRole: (uuid) => {
        return api.delete(`/roles/${uuid}`);
    },
    getRoleById: (uuid) => {
        return api.get(`/roles/${uuid}`);
    },
};