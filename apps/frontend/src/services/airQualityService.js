import { api } from './api';
export const airQualityService = {
    getCities() {
        return api.get('/cities').then(r => r.data);
    },
    getCity(id) {
        return api.get(`/cities/${id}`).then(r => r.data);
    },
    getCityHistory(id, period = '7d') {
        return api.get(`/cities/${id}/history`, { params: { period } }).then(r => r.data);
    },
    getFires(filters) {
        return api.get('/fires', { params: filters }).then(r => r.data);
    },
    getRanking(filters) {
        return api.get('/cities/ranking', { params: filters }).then(r => r.data);
    },
    searchCities(q) {
        return api.get('/cities/search', { params: { q } }).then(r => r.data);
    },
    getNearbyCities(lat, lng, radiusKm = 100) {
        return api
            .get('/cities/nearby', { params: { lat, lng, radius: radiusKm } })
            .then(r => r.data);
    },
};
