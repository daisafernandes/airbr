import axios from 'axios'

import type { AqiReadingData, HistoryPeriod } from '@domain/repositories/IAqiRepository'

const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const REQUEST_TIMEOUT_MS = 12_000

export interface OpenMeteoAirQualityCurrent {
  us_aqi?: number
  pm10?: number
  pm2_5?: number
  carbon_monoxide?: number
  nitrogen_dioxide?: number
  ozone?: number
  uv_index?: number
  grass_pollen?: number
  birch_pollen?: number
  ragweed_pollen?: number
  alder_pollen?: number
  mugwort_pollen?: number
  olive_pollen?: number
}

interface OpenMeteoAirQualityCurrentResponse {
  current?: OpenMeteoAirQualityCurrent
}

interface OpenMeteoWeatherCurrentResponse {
  current?: {
    wind_direction_10m?: number
    wind_speed_10m?: number
    temperature_2m?: number
    relative_humidity_2m?: number
    surface_pressure?: number
  }
}

interface OpenMeteoHourlyAirResponse {
  hourly?: {
    time?: string[]
    us_aqi?: (number | null)[]
    pm2_5?: (number | null)[]
    pm10?: (number | null)[]
    ozone?: (number | null)[]
    nitrogen_dioxide?: (number | null)[]
    carbon_monoxide?: (number | null)[]
  }
}

const PERIOD_TO_DAYS: Record<HistoryPeriod, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '1y': 365,
}

const CURRENT_AQ_VARS = [
  'us_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'ozone',
  'uv_index',
  'grass_pollen',
  'birch_pollen',
  'ragweed_pollen',
  'alder_pollen',
  'mugwort_pollen',
  'olive_pollen',
].join(',')

const CURRENT_WX_VARS = [
  'wind_direction_10m',
  'wind_speed_10m',
  'temperature_2m',
  'relative_humidity_2m',
  'surface_pressure',
].join(',')

const HISTORY_HOURLY_VARS = [
  'us_aqi',
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'carbon_monoxide',
].join(',')

/** Sum of pollen species (grains/m³) → 0–10 index (aligned with OutdoorSafetyService). */
export function pollenGrainsToIndex(c: OpenMeteoAirQualityCurrent | undefined): number | null {
  if (!c) return null
  const keys = [
    'grass_pollen',
    'birch_pollen',
    'ragweed_pollen',
    'alder_pollen',
    'mugwort_pollen',
    'olive_pollen',
  ] as const
  let sum = 0
  for (const k of keys) {
    const v = c[k]
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) sum += v
  }
  if (sum <= 0) return null
  const idx = Math.min(10, Math.round((sum / 40) * 10) / 10)
  return idx > 0 ? idx : null
}

function readingId(cityId: string, timestamp: Date): string {
  return `${cityId}:${timestamp.toISOString()}`
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function emptyReading(cityId: string, timestamp: Date): Omit<AqiReadingData, 'aqi'> & { aqi: number } {
  return {
    id: readingId(cityId, timestamp),
    cityId,
    aqi: 0,
    pm25: null,
    pm10: null,
    o3: null,
    no2: null,
    co: null,
    uv: null,
    pollen: null,
    windDirection: null,
    windSpeed: null,
    temperature: null,
    humidity: null,
    pressure: null,
    timestamp,
    source: 'open-meteo',
  }
}

export async function fetchOpenMeteoCurrent(
  cityId: string,
  lat: number,
  lng: number,
): Promise<AqiReadingData | null> {
  const [aqRes, wxRes] = await Promise.all([
    axios.get<OpenMeteoAirQualityCurrentResponse>(AIR_QUALITY_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        current: CURRENT_AQ_VARS,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }),
    axios.get<OpenMeteoWeatherCurrentResponse>(WEATHER_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        current: CURRENT_WX_VARS,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }),
  ])

  const c = aqRes.data.current
  if (!c || c.us_aqi == null || !Number.isFinite(c.us_aqi)) return null

  const w = wxRes.data.current
  const timestamp = new Date()

  return {
    ...emptyReading(cityId, timestamp),
    aqi: c.us_aqi,
    pm25: c.pm2_5 ?? null,
    pm10: c.pm10 ?? null,
    o3: c.ozone ?? null,
    no2: c.nitrogen_dioxide ?? null,
    co: c.carbon_monoxide ?? null,
    uv: c.uv_index ?? null,
    pollen: pollenGrainsToIndex(c),
    windDirection: w?.wind_direction_10m ?? null,
    windSpeed: w?.wind_speed_10m ?? null,
    temperature: w?.temperature_2m ?? null,
    humidity: w?.relative_humidity_2m ?? null,
    pressure: w?.surface_pressure ?? null,
  }
}

export async function fetchOpenMeteoHistory(
  cityId: string,
  lat: number,
  lng: number,
  period: HistoryPeriod,
): Promise<AqiReadingData[]> {
  const days = PERIOD_TO_DAYS[period]
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

  const { data } = await axios.get<OpenMeteoHourlyAirResponse>(AIR_QUALITY_URL, {
    params: {
      latitude: lat,
      longitude: lng,
      hourly: HISTORY_HOURLY_VARS,
      start_date: toIsoDate(start),
      end_date: toIsoDate(end),
      timezone: 'auto',
      forecast_days: 0,
    },
    timeout: REQUEST_TIMEOUT_MS,
  })

  const times = data.hourly?.time ?? []
  const sinceMs = end.getTime() - days * 24 * 60 * 60 * 1000
  const readings: AqiReadingData[] = []

  for (let i = 0; i < times.length; i++) {
    const timeStr = times[i]
    if (!timeStr) continue
    const timestamp = new Date(timeStr)
    if (Number.isNaN(timestamp.getTime()) || timestamp.getTime() < sinceMs) continue

    const aqi = data.hourly?.us_aqi?.[i]
    if (typeof aqi !== 'number' || !Number.isFinite(aqi)) continue

    const numOrNull = (v: number | null | undefined): number | null =>
      typeof v === 'number' && Number.isFinite(v) ? v : null

    readings.push({
      ...emptyReading(cityId, timestamp),
      aqi,
      pm25: numOrNull(data.hourly?.pm2_5?.[i]),
      pm10: numOrNull(data.hourly?.pm10?.[i]),
      o3: numOrNull(data.hourly?.ozone?.[i]),
      no2: numOrNull(data.hourly?.nitrogen_dioxide?.[i]),
      co: numOrNull(data.hourly?.carbon_monoxide?.[i]),
    })
  }

  return readings
}

export interface OpenMeteoForecastHour {
  time: string
  aqi: number | null
}

export async function fetchOpenMeteoForecast(
  lat: number,
  lng: number,
  forecastDays = 2,
): Promise<OpenMeteoForecastHour[]> {
  const { data } = await axios.get<OpenMeteoHourlyAirResponse>(AIR_QUALITY_URL, {
    params: {
      latitude: lat,
      longitude: lng,
      hourly: 'us_aqi',
      forecast_days: forecastDays,
      timezone: 'auto',
    },
    timeout: REQUEST_TIMEOUT_MS,
  })

  const times = data.hourly?.time ?? []
  const aqis = data.hourly?.us_aqi ?? []

  return times.map((time, i) => ({
    time,
    aqi: typeof aqis[i] === 'number' && Number.isFinite(aqis[i] as number) ? (aqis[i] as number) : null,
  }))
}
