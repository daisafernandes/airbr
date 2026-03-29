import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { env } from '@infrastructure/config/env'
import type { ICollector, NormalizedReading } from './ICollector'

/**
 * CETESB QUALAR collector — PM2.5/PM10/O₃/NO₂ for São Paulo state stations.
 * Requires CETESB_USERNAME and CETESB_PASSWORD env vars.
 * Gracefully skips if credentials are absent.
 *
 * API: https://qualar.cetesb.sp.gov.br/qualar/apicetesb (XML)
 */
const QUALAR_BASE = 'https://qualar.cetesb.sp.gov.br/qualar/apicetesb'

const PARAMETER_MAP: Record<string, keyof NormalizedReading> = {
  'MP2.5': 'pm25',
  MP10: 'pm10',
  O3: 'o3',
  NO2: 'no2',
  CO: 'co',
}

interface QualarStation {
  CodigoEstacao: string
  NomeEstacao: string
  Latitude?: number
  Longitude?: number
}

interface QualarReading {
  CodigoEstacao: string
  Sigla: string
  Valor?: string
  DataHora: string
}

interface QualarListStationsResponse {
  RetornoConsultaEstacoes: {
    Estacoes: { Estacao: QualarStation | QualarStation[] }
  }
}

interface QualarLastHourResponse {
  RetornoConsultaUltimaHora: {
    Dados: { Dado: QualarReading | QualarReading[] }
  }
}

export class CETESBCollector implements ICollector {
  name = 'CETESBCollector'

  private readonly parser = new XMLParser({ ignoreAttributes: false })

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    if (!env.CETESB_USERNAME || !env.CETESB_PASSWORD) {
      console.warn('[CETESB] Credentials not configured — skipping collector')
      return []
    }

    try {
      const token = await this.authenticate()
      const stations = await this.listStations(token)
      const readings = await this.fetchLastHour(token)

      return this.normalize(stations, readings)
    } catch (err) {
      console.error('[CETESB] Collection failed:', err instanceof Error ? err.message : err)
      return []
    }
  }

  private async authenticate(): Promise<string> {
    const { data } = await axios.post<string>(
      `${QUALAR_BASE}?metodo=loginUsuario`,
      {
        usuario: env.CETESB_USERNAME,
        senha: env.CETESB_PASSWORD,
      },
      { timeout: 10_000 },
    )
    const parsed = this.parser.parse(data) as { RetornoLogin: { Token: string } }
    const token = parsed.RetornoLogin?.Token
    if (!token) throw new Error('CETESB login failed — no token returned')
    return token
  }

  private async listStations(token: string): Promise<QualarStation[]> {
    const { data } = await axios.get<string>(`${QUALAR_BASE}?metodo=listarEstacoes&token=${token}`, {
      timeout: 10_000,
    })
    const parsed = this.parser.parse(data) as QualarListStationsResponse
    const raw = parsed.RetornoConsultaEstacoes?.Estacoes?.Estacao
    if (!raw) return []
    return Array.isArray(raw) ? raw : [raw]
  }

  private async fetchLastHour(token: string): Promise<QualarReading[]> {
    const { data } = await axios.get<string>(
      `${QUALAR_BASE}?metodo=consultarUltimaHora&token=${token}`,
      { timeout: 15_000 },
    )
    const parsed = this.parser.parse(data) as QualarLastHourResponse
    const raw = parsed.RetornoConsultaUltimaHora?.Dados?.Dado
    if (!raw) return []
    return Array.isArray(raw) ? raw : [raw]
  }

  private normalize(stations: QualarStation[], readings: QualarReading[]): NormalizedReading[] {
    const stationMap = new Map(stations.map(s => [s.CodigoEstacao, s]))
    const byStation = new Map<string, Partial<NormalizedReading>>()

    for (const r of readings) {
      const station = stationMap.get(r.CodigoEstacao)
      if (!station?.Latitude || !station?.Longitude) continue
      const field = PARAMETER_MAP[r.Sigla]
      if (!field) continue

      const value = parseFloat(r.Valor ?? '')
      if (isNaN(value)) continue

      if (!byStation.has(r.CodigoEstacao)) {
        byStation.set(r.CodigoEstacao, {
          lat: station.Latitude,
          lng: station.Longitude,
          timestamp: new Date(r.DataHora),
          source: 'cetesb',
        })
      }

      const entry = byStation.get(r.CodigoEstacao)!
      ;(entry as Record<string, unknown>)[field as string] = value
    }

    const results: NormalizedReading[] = []
    for (const [, entry] of byStation) {
      if (entry.lat == null || entry.lng == null) continue
      results.push({
        lat: entry.lat,
        lng: entry.lng,
        timestamp: entry.timestamp ?? new Date(),
        source: 'cetesb',
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
