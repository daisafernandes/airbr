import axios from 'axios'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { env } from '@infrastructure/config/env'
import type { ICollector, NormalizedReading } from './ICollector'

/**
 * IAT (Instituto Água e Terra — Paraná) collector.
 * Covers the RMAQA (Rede de Monitoramento da Qualidade do Ar da Região
 * Metropolitana de Curitiba): Curitiba, Araucária, São José dos Pinhais,
 * Campo Largo, Pinhais and surrounding municipalities.
 *
 * Public API — no key required. IAT_API_KEY env var is optional and used
 * only to access higher-rate endpoints if the institute provides them.
 *
 * API base: https://www.iat.pr.gov.br/api/qualidadear/v1
 * Docs: https://www.iat.pr.gov.br/Pagina/Qualidade-do-ar-RMAQA
 */
const IAT_BASE = 'https://www.iat.pr.gov.br/api/qualidadear/v1'

/** IAT IQA breakpoints → unified 0–500 AQI scale */
const IQA_TO_AQI: [number, number, number, number][] = [
  [0, 40, 0, 50],
  [41, 80, 51, 100],
  [81, 120, 101, 150],
  [121, 200, 151, 200],
  [201, 300, 201, 300],
  [301, Infinity, 301, 500],
]

function iqaToAqi(iqa: number): number {
  for (const [iqaLow, iqaHigh, aqiLow, aqiHigh] of IQA_TO_AQI) {
    if (iqa >= iqaLow && iqa <= iqaHigh) {
      return Math.round(((aqiHigh - aqiLow) / (iqaHigh - iqaLow)) * (iqa - iqaLow) + aqiLow)
    }
  }
  return 500
}

interface IATStation {
  id: string
  nome: string
  municipio: string
  latitude: number
  longitude: number
  ativa: boolean
}

interface IATReading {
  estacaoId: string
  iqa: number | null
  pm25: number | null
  pm10: number | null
  o3: number | null
  no2: number | null
  co: number | null
  dataHora: string
}

interface IATStationsResponse {
  estacoes: IATStation[]
}

interface IATReadingsResponse {
  medicoes: IATReading[]
}

export class IATCollector implements ICollector {
  name = 'IATCollector'

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    try {
      const stations = await this.fetchStations()
      const readings = await this.fetchCurrentReadings()
      return this.normalize(stations, readings)
    } catch (err) {
      console.error('[IAT] Collection failed:', err instanceof Error ? err.message : err)
      return []
    }
  }

  private buildHeaders(): Record<string, string> {
    if (env.IAT_API_KEY) {
      return { Authorization: `Bearer ${env.IAT_API_KEY}` }
    }
    return {}
  }

  private async fetchStations(): Promise<IATStation[]> {
    const { data } = await axios.get<IATStationsResponse>(`${IAT_BASE}/estacoes`, {
      headers: this.buildHeaders(),
      timeout: 15_000,
    })
    return data.estacoes.filter(s => s.ativa && s.latitude != null && s.longitude != null)
  }

  private async fetchCurrentReadings(): Promise<IATReading[]> {
    const { data } = await axios.get<IATReadingsResponse>(`${IAT_BASE}/medicoes/atual`, {
      headers: this.buildHeaders(),
      timeout: 15_000,
    })
    return data.medicoes
  }

  private normalize(stations: IATStation[], readings: IATReading[]): NormalizedReading[] {
    const stationMap = new Map(stations.map(s => [s.id, s]))
    const results: NormalizedReading[] = []

    for (const r of readings) {
      const station = stationMap.get(r.estacaoId)
      if (!station) continue

      const aqi = r.iqa != null ? iqaToAqi(r.iqa) : null

      results.push({
        lat: station.latitude,
        lng: station.longitude,
        timestamp: new Date(r.dataHora),
        source: 'iat',
        aqi,
        pm25: r.pm25,
        pm10: r.pm10,
        o3: r.o3,
        no2: r.no2,
        co: r.co,
      })
    }

    return results
  }
}
