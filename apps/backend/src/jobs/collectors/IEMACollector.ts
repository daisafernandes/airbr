import axios from 'axios'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { env } from '@infrastructure/config/env'
import type { ICollector, NormalizedReading } from './ICollector'

/**
 * IEMA (Instituto Estadual de Meio Ambiente e Recursos Hídricos — ES) collector.
 * Covers 82 monitoring localities across 11 states via the MONITORAR public platform.
 * Requires IEMA_API_KEY env var (free registration at https://monitorar.iema.es.gov.br/).
 * Gracefully skips if the key is absent.
 *
 * API base: https://monitorar.iema.es.gov.br/api/v1
 */
const IEMA_BASE = 'https://monitorar.iema.es.gov.br/api/v1'

const PARAMETER_MAP: Record<string, keyof NormalizedReading> = {
  MP2_5: 'pm25',
  MP10: 'pm10',
  O3: 'o3',
  NO2: 'no2',
  CO: 'co',
}

interface IEMAStation {
  id: string
  nome: string
  municipio: string
  estado: string
  latitude: number
  longitude: number
  ativo: boolean
}

interface IEMAReading {
  estacaoId: string
  parametro: string
  valor: number | null
  dataHora: string
  unidade: string
}

interface IEMAStationsResponse {
  data: IEMAStation[]
}

interface IEMAReadingsResponse {
  data: IEMAReading[]
}

export class IEMACollector implements ICollector {
  name = 'IEMACollector'

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    if (!env.IEMA_API_KEY) {
      console.warn('[IEMA] API key not configured — skipping collector')
      return []
    }

    try {
      const stations = await this.fetchStations()
      const readings = await this.fetchCurrentReadings()
      return this.normalize(stations, readings)
    } catch (err) {
      console.error('[IEMA] Collection failed:', err instanceof Error ? err.message : err)
      return []
    }
  }

  private async fetchStations(): Promise<IEMAStation[]> {
    const { data } = await axios.get<IEMAStationsResponse>(`${IEMA_BASE}/estacoes`, {
      headers: { Authorization: `Bearer ${env.IEMA_API_KEY}` },
      timeout: 15_000,
      params: { ativo: true },
    })
    return data.data.filter(s => s.latitude != null && s.longitude != null)
  }

  private async fetchCurrentReadings(): Promise<IEMAReading[]> {
    const { data } = await axios.get<IEMAReadingsResponse>(`${IEMA_BASE}/medicoes/atual`, {
      headers: { Authorization: `Bearer ${env.IEMA_API_KEY}` },
      timeout: 15_000,
    })
    return data.data
  }

  private normalize(stations: IEMAStation[], readings: IEMAReading[]): NormalizedReading[] {
    const stationMap = new Map(stations.map(s => [s.id, s]))
    const byStation = new Map<string, Partial<NormalizedReading>>()

    for (const r of readings) {
      const station = stationMap.get(r.estacaoId)
      if (!station || r.valor == null) continue

      const field = PARAMETER_MAP[r.parametro]
      if (!field) continue

      if (!byStation.has(r.estacaoId)) {
        byStation.set(r.estacaoId, {
          lat: station.latitude,
          lng: station.longitude,
          timestamp: new Date(r.dataHora),
          source: 'iema',
        })
      }

      const entry = byStation.get(r.estacaoId)!
      ;(entry as Record<string, unknown>)[field as string] = r.valor
    }

    const results: NormalizedReading[] = []
    for (const [, entry] of byStation) {
      if (entry.lat == null || entry.lng == null) continue
      results.push({
        lat: entry.lat,
        lng: entry.lng,
        timestamp: entry.timestamp ?? new Date(),
        source: 'iema',
        pm25: (entry as Record<string, unknown>).pm25 as number | null | undefined,
        pm10: (entry as Record<string, unknown>).pm10 as number | null | undefined,
        o3: (entry as Record<string, unknown>).o3 as number | null | undefined,
        no2: (entry as Record<string, unknown>).no2 as number | null | undefined,
        co: (entry as Record<string, unknown>).co as number | null | undefined,
      })
    }

    return results
  }
}
