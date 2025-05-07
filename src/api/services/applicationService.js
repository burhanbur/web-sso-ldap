import api from '../axios';

export const applicationService = {
    getApplications: () => {
        return api.get('/applications');
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
    updateUserStatus: (uuid, status) => {
        return api.put(`/applications/${uuid}/status`, status );
    },
};