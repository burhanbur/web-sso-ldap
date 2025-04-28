import api from '../axios';

export const applicationService = {
    getApplications: () => {
        return api.get('/applications');
    }
};