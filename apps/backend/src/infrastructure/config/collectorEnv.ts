import { env } from './env'

export type CollectorTokenStatus = 'set' | 'empty'

export interface CollectorEnvSummary {
  aqi: {
    openWeatherMap: CollectorTokenStatus
    aqicn: CollectorTokenStatus
    openMeteo: 'always_on'
    cetesb: CollectorTokenStatus
    iema: CollectorTokenStatus
    iat: CollectorTokenStatus
  }
  datasus: {
    /** When false, API failure yields no synthetic SIH rows (recommended for demos). */
    allowPopulationEstimateFallback: boolean
  }
}

/**
 * Summarizes which external data sources are configured (no secret values).
 * Used at startup and by validate-collectors-env script.
 */
export function getCollectorEnvSummary(): CollectorEnvSummary {
  return {
    aqi: {
      openWeatherMap: env.OWM_API_KEY?.trim() ? 'set' : 'empty',
      aqicn: env.AQICN_TOKEN?.trim() ? 'set' : 'empty',
      openMeteo: 'always_on',
      cetesb:
        env.CETESB_USERNAME?.trim() && env.CETESB_PASSWORD?.trim() ? 'set' : 'empty',
      iema: env.IEMA_API_KEY?.trim() ? 'set' : 'empty',
      iat: env.IAT_API_KEY?.trim() ? 'set' : 'empty',
    },
    datasus: {
      allowPopulationEstimateFallback: env.DATASUS_ALLOW_POPULATION_ESTIMATE,
    },
  }
}

export function formatCollectorEnvSummary(s: CollectorEnvSummary): string {
  const lines = [
    'Collectors / AQI',
    `  Open-Meteo: ${s.aqi.openMeteo} (no API key)`,
    `  OpenWeatherMap: ${s.aqi.openWeatherMap}`,
    `  AQICN: ${s.aqi.aqicn}`,
    `  CETESB: ${s.aqi.cetesb}`,
    `  IEMA: ${s.aqi.iema}`,
    `  IAT: ${s.aqi.iat}`,
    'Collectors / health',
    `  DATASUS population-estimate fallback: ${s.datasus.allowPopulationEstimateFallback ? 'on' : 'off'}`,
  ]
  return lines.join('\n')
}
