import axios from 'axios'

import type { ICollector, NormalizedReading } from './ICollector'

/**
 * INPE publishes fire-focus CSV data updated every 3 hours.
 * Public endpoint: https://queimadas.dgi.inpe.br/queimadas/geoserver/ows
 * Columns (WFS CSV): FID, lat, lon, data_hora_gmt, pais, estado, municipio,
 *   bioma, satelite, frp (fire radiative power as intensity proxy)
 */
const INPE_CSV_URL =
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

function parseCSV(raw: string): ParsedRow[] {
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

/** Handles quoted fields and commas within values */
function splitCSVLine(line: string): string[] {
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

export class INPEFiresCollector implements ICollector {
  name = 'INPEFiresCollector'

  async collect(): Promise<NormalizedReading[]> {
    let csvText: string

    try {
      const { data } = await axios.get<string>(INPE_CSV_URL, {
        responseType: 'text',
        timeout: 30_000,
        headers: { Accept: 'text/csv,text/plain,*/*' },
      })
      csvText = data
    } catch (err) {
      console.error('[INPE] Failed to fetch CSV:', err instanceof Error ? err.message : err)
      return []
    }

    const rows = parseCSV(csvText)
    const results: NormalizedReading[] = []

    for (const row of rows) {
      const lat = parseFloat(String(row.lat))
      const lng = parseFloat(String(row.lon))
      if (isNaN(lat) || isNaN(lng)) continue

      const detectedAt = row.data_hora_gmt ? new Date(row.data_hora_gmt) : new Date()
      if (isNaN(detectedAt.getTime())) continue

      const frp = row.frp ? parseFloat(row.frp) : null

      results.push({
        lat,
        lng,
        timestamp: detectedAt,
        source: 'inpe',
        intensity: frp !== null && !isNaN(frp) ? frp : null,
        satellite: row.satelite || null,
        biome: row.bioma || null,
        state: row.estado || null,
      })
    }

    console.info(`[INPE] Parsed ${results.length} fire foci`)
    return results
  }
}
