import api from '../axios';

export const applicationService = {
    getApplications: (params) => {
        return api.get('/applications', { params });
    },
    createApplication: (application) => {
        return api.post('/applications', application);
    },
    updateApplication: (uuid, application) => {
        return api.put(`/applications/${uuid}`, application);
    },
    deleteApplication: (uuid) => {
        return api.delete(`/applications/${uuid}`);
    },
    getApplicationById: (uuid) => {
        return api.get(`/applications/${uuid}`);
    },
    updateStatus: (uuid, status) => {
        return api.put(`/applications/${uuid}/status`, status );
    },
    getUserApplication: (uuid) => {
        return api.get(`/applications/${uuid}/users`);
    },
    getMyApplications: () => {
        return api.get(`/auth/me/applications`);
    }
};