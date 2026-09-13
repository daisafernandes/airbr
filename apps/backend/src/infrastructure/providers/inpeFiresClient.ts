import { createHash } from 'node:crypto'

import axios from 'axios'

import type { FireFocusData } from '@domain/repositories/IFireRepository'

/**
 * INPE publishes fire-focus CSV updated every ~3 hours.
 * Public WFS: https://queimadas.dgi.inpe.br/queimadas/geoserver/ows
 */
export const INPE_CSV_URL =
  'https://queimadas.dgi.inpe.br/queimadas/geoserver/ows?' +
  'service=WFS&version=2.0.0&request=GetFeature' +
  '&typeName=ms:ref_focos_qmd_24h&outputFormat=csv'

interface ParsedRow {
  lat: number
  lon: number
  data_hora_gmt: string
  estado: string
  bioma: string
  satelite: string
  frp: string
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

    const detectedAt = row.data_hora_gmt ? new Date(row.data_hora_gmt) : new Date()
    if (Number.isNaN(detectedAt.getTime())) continue

    const frp = row.frp ? parseFloat(row.frp) : null

    results.push({
      id: fireFocusId(lat, lng, detectedAt),
      lat,
      lng,
      intensity: frp !== null && !Number.isNaN(frp) ? frp : null,
      satellite: row.satelite || null,
      biome: row.bioma || null,
      state: row.estado || null,
      detectedAt,
    })
  }

  return results
}

export async function fetchINPEFires(): Promise<FireFocusData[]> {
  const { data } = await axios.get<string>(INPE_CSV_URL, {
    responseType: 'text',
    timeout: 30_000,
    headers: { Accept: 'text/csv,text/plain,*/*' },
  })

  return rowsToFireFoci(parseINPECSV(data))
}
