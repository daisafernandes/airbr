import { api } from './api'
import type {
  CityApiData,
  AqiReadingApi,
  FireFocusApi,
  RankingResponse,
  NearbyCityApi,
  HistoryPeriod,
  FireFilters,
  RankingFilters,
  WindSmokeApi,
  OutdoorSafetyApi,
  HealthDataApi,
  DeforestationAlertApi,
  DeforestationFilters,
  OMSComplianceApi,
} from '@app-types/airQuality.types'

export const airQualityService = {
  getCities(): Promise<CityApiData[]> {
    return api.get<CityApiData[]>('/cities').then(r => r.data)
  },

  getCity(id: string): Promise<CityApiData> {
    return api.get<CityApiData>(`/cities/${id}`).then(r => r.data)
  },

  getCityHistory(id: string, period: HistoryPeriod = '7d'): Promise<AqiReadingApi[]> {
    return api.get<AqiReadingApi[]>(`/cities/${id}/history`, { params: { period } }).then(r => r.data)
  },

  getFires(filters?: FireFilters): Promise<FireFocusApi[]> {
    return api.get<FireFocusApi[]>('/fires', { params: filters }).then(r => r.data)
  },

  getRanking(filters?: RankingFilters): Promise<RankingResponse> {
    return api.get<RankingResponse>('/cities/ranking', { params: filters }).then(r => r.data)
  },

  searchCities(q: string): Promise<CityApiData[]> {
    return api.get<CityApiData[]>('/cities/search', { params: { q } }).then(r => r.data)
  },

  getNearbyCities(lat: number, lng: number, radiusKm = 100): Promise<NearbyCityApi[]> {
    return api
      .get<NearbyCityApi[]>('/cities/nearby', { params: { lat, lng, radius: radiusKm } })
      .then(r => r.data)
  },

  getWindSmoke(cityId: string): Promise<WindSmokeApi> {
    return api.get<WindSmokeApi>(`/cities/${cityId}/wind-smoke`).then(r => r.data)
  },

  getOutdoorSafety(cityId: string): Promise<OutdoorSafetyApi> {
    return api.get<OutdoorSafetyApi>(`/cities/${cityId}/outdoor-safety`).then(r => r.data)
  },

  getHealthData(cityId: string): Promise<HealthDataApi> {
    return api.get<HealthDataApi>(`/cities/${cityId}/health`).then(r => r.data)
  },

  getDeforestation(filters?: DeforestationFilters): Promise<DeforestationAlertApi[]> {
    return api.get<DeforestationAlertApi[]>('/deforestation', { params: filters }).then(r => r.data)
  },

  getOMSCompliance(): Promise<OMSComplianceApi> {
    return api.get<OMSComplianceApi>('/cities/oms-compliance').then(r => r.data)
  },
}
