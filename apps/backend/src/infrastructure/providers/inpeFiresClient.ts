import { createHash } from 'node:crypto'

import axios from 'axios'

import type { FireFocusData } from '@domain/repositories/IFireRepository'

/**
 * INPE publishes fire-focus CSV files in its open-data server.
 * Official index: https://www.terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_downloads/dados-abertos/index.html
 */
export const INPE_DAILY_CSV_BASE_URL =
  'https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/Brasil'

interface ParsedRow {
  lat: number
  lon: number
  data_hora_gmt: string
  data?: string
  estado: string
  bioma: string
  satelite: string
  frp: string
}

const STATE_NAME_TO_UF: Record<string, string> = {
  ACRE: 'AC',
  ALAGOAS: 'AL',
  AMAPA: 'AP',
  AMAZONAS: 'AM',
  BAHIA: 'BA',
  CEARA: 'CE',
  'DISTRITO FEDERAL': 'DF',
  'ESPIRITO SANTO': 'ES',
  GOIAS: 'GO',
  MARANHAO: 'MA',
  'MATO GROSSO': 'MT',
  'MATO GROSSO DO SUL': 'MS',
  'MINAS GERAIS': 'MG',
  PARA: 'PA',
  PARAIBA: 'PB',
  PARANA: 'PR',
  PERNAMBUCO: 'PE',
  PIAUI: 'PI',
  'RIO DE JANEIRO': 'RJ',
  'RIO GRANDE DO NORTE': 'RN',
  'RIO GRANDE DO SUL': 'RS',
  RONDONIA: 'RO',
  RORAIMA: 'RR',
  'SANTA CATARINA': 'SC',
  'SAO PAULO': 'SP',
  SERGIPE: 'SE',
  TOCANTINS: 'TO',
}

function normalizeText(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

export function normalizeState(value: string): string | null {
  const normalized = normalizeText(value)
  if (/^[A-Z]{2}$/.test(normalized)) return normalized
  return STATE_NAME_TO_UF[normalized] ?? (value.trim() || null)
}

function formatINPEDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function recentDailyUrls(days: number): string[] {
  const urls: string[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    urls.push(`${INPE_DAILY_CSV_BASE_URL}/focos_diario_br_${formatINPEDate(date)}.csv`)
  }

  return urls
}

function parseINPEDate(value: string): Date {
  const normalized = value.trim()
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalized)
  return new Date(hasTimezone ? normalized : `${normalized.replace(' ', 'T')}Z`)
}

/** Handles quoted fields and commas within values */
export function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

export function parseINPECSV(raw: string): ParsedRow[] {
  const lines = raw.trim().split('\n')
  if (lines.length < 2) return []

  const firstLine = lines[0]
  if (!firstLine) return []

  const headers = firstLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const values = splitCSVLine(line)
    if (values.length !== headers.length) continue

    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? ''
    })

    rows.push(obj as unknown as ParsedRow)
  }

  return rows
}

export function fireFocusId(lat: number, lng: number, detectedAt: Date): string {
  return createHash('sha256')
    .update(`${lat.toFixed(5)}:${lng.toFixed(5)}:${detectedAt.toISOString()}`)
    .digest('hex')
    .slice(0, 24)
}

export function rowsToFireFoci(rows: ParsedRow[]): FireFocusData[] {
  const results: FireFocusData[] = []

  for (const row of rows) {
    const lat = parseFloat(String(row.lat))
    const lng = parseFloat(String(row.lon))
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue

    const detectedAtValue = row.data_hora_gmt || row.data
    const detectedAt = detectedAtValue ? parseINPEDate(detectedAtValue) : new Date()
    if (Number.isNaN(detectedAt.getTime())) continue

    const frp = row.frp ? parseFloat(row.frp) : null

    results.push({
      id: fireFocusId(lat, lng, detectedAt),
      lat,
      lng,
      intensity: frp !== null && !Number.isNaN(frp) ? frp : null,
      satellite: row.satelite || null,
      biome: row.bioma || null,
      state: row.estado ? normalizeState(row.estado) : null,
      detectedAt,
    })
  }

  return results
}

export async function fetchINPEFires(): Promise<FireFocusData[]> {
  const results = await Promise.allSettled(
    recentDailyUrls(3).map((url) =>
      axios.get<string>(url, {
        responseType: 'text',
        timeout: 30_000,
        headers: { Accept: 'text/csv,text/plain,*/*' },
      }),
    ),
  )

  return results.flatMap((result) => {
    if (result.status === 'rejected') return []
    return rowsToFireFoci(parseINPECSV(result.value.data))
  })
}
