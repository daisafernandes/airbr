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
    getWindSmoke(cityId) {
        return api.get(`/cities/${cityId}/wind-smoke`).then(r => r.data);
    },
    getOutdoorSafety(cityId) {
        return api.get(`/cities/${cityId}/outdoor-safety`).then(r => r.data);
    },
    getHealthData(cityId) {
        return api.get(`/cities/${cityId}/health`).then(r => r.data);
    },
    getDeforestation(filters) {
        return api.get('/deforestation', { params: filters }).then(r => r.data);
    },
    getOMSCompliance() {
        return api.get('/cities/oms-compliance').then(r => r.data);
    },
};
