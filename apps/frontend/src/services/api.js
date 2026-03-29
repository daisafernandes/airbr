import axios from 'axios';
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('@airbr:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(response => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('@airbr:token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
