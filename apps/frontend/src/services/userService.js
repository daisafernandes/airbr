import { api } from './api';
export const userService = {
    create: async (payload) => {
        const { data } = await api.post('/users', payload);
        return data;
    },
    getById: async (id) => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    },
};
