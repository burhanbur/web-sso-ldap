import api from '../axios';

export const applicationService = {
    getApplications: () => {
        return api.get('/applications');
    },
    createApplication: (application) => {
        return api.post('/applications', application);
    },
    updateApplication: (id, application) => {
        return api.put(`/applications/${id}`, application);
    },
    deleteApplication: (id) => {
        return api.delete(`/applications/${id}`);
    },
    getApplicationById: (id) => {
        return api.get(`/applications/${id}`);
    },
};