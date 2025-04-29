import api from '../axios';

export const roleService = {
    getRoles: () => {
        return api.get('/roles');
    },
    createRole: (role) => {
        return api.post('/roles', role);
    },
    updateRole: (id, role) => {
        return api.put(`/roles/${id}`, role);
    },
    deleteRole: (id) => {
        return api.delete(`/roles/${id}`);
    },
    getRoleById: (id) => {
        return api.get(`/roles/${id}`);
    },
};