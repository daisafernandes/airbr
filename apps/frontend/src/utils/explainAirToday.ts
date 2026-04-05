import type { WindSmokeApi } from '@app-types/airQuality.types'

/** i18n keys under `cityDashboard.explainAir.<key>` */
export type ExplainAirTodayKey =
  | 'goodAir'
  | 'smokeLikely'
  | 'smokePossible'
  | 'localMixHigh'
  | 'moderateDefault'
  | 'inconclusiveNoWind'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/** Bearing from point 1 to point 2 in degrees [0, 360). */
export function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = lat1 * DEG_TO_RAD
  const φ2 = lat2 * DEG_TO_RAD
  const Δλ = (lng2 - lng1) * DEG_TO_RAD
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  let θ = Math.atan2(y, x) * RAD_TO_DEG
  θ = (θ + 360) % 360
  return θ
}

function angleDiffDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Wind is meteorological "from" direction. Smoke from fire travels roughly downwind:
 * toward (windDirection + 180)° from the fire.
 * Count fires where the city lies in a cone around that downwind direction.
 */
export function countDownwindFires(
  cityLat: number,
  cityLng: number,
  windDirectionDeg: number,
  fires: WindSmokeApi['nearbyFires'],
  coneDeg = 40,
): number {
  const downwind = (windDirectionDeg + 360) % 360
  let n = 0
  for (const f of fires) {
    const brg = bearingDeg(f.lat, f.lng, cityLat, cityLng)
    if (angleDiffDeg(brg, downwind) <= coneDeg) n += 1
  }
  return n
}

const AQI_HIGH = 100
const AQI_MODERATE_CAP = 99
const PM25_ELEVATED = 25

export interface ExplainAirTodayInput {
  aqi: number
  pm25: number | null
  cityLat: number
  cityLng: number
  windDirection: number | null
  nearbyFires: WindSmokeApi['nearbyFires']
}

/**
 * Pure heuristic for a short “why today?” line — not a health diagnosis.
 */
export function explainAirTodayKey(input: ExplainAirTodayInput): ExplainAirTodayKey {
  const { aqi, pm25, cityLat, cityLng, windDirection, nearbyFires } = input
  const highPollution = aqi >= AQI_HIGH || (pm25 != null && pm25 >= PM25_ELEVATED)

  if (aqi <= 50 && (pm25 == null || pm25 <= 15)) {
    return 'goodAir'
  }

  if (windDirection == null) {
    if (nearbyFires.length === 0) {
      return highPollution ? 'localMixHigh' : 'moderateDefault'
    }
    return 'inconclusiveNoWind'
  }

  if (nearbyFires.length === 0) {
    return highPollution ? 'localMixHigh' : 'moderateDefault'
  }

  const aligned = countDownwindFires(cityLat, cityLng, windDirection, nearbyFires)

  if (aligned >= 3 && highPollution) {
    return 'smokeLikely'
  }
  if (aligned >= 1 && highPollution) {
    return 'smokePossible'
  }
  if (highPollution && aligned === 0) {
    return 'localMixHigh'
  }

  if (aqi <= AQI_MODERATE_CAP) {
    return 'moderateDefault'
  }

  return 'localMixHigh'
}
