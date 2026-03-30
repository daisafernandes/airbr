/**
 * Downloads municipal seats (lat/lng) from kelvins/Municipios-Brasileiros (IBGE codes)
 * and writes apps/backend/data/municipalities-geo.json for seeding.
 *
 * Source: https://github.com/kelvins/Municipios-Brasileiros (MIT)
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

const SOURCE_URL =
  'https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/master/json/municipios.json'

const UF_CODE_TO_SIGLA: Record<number, string> = {
  11: 'RO',
  12: 'AC',
  13: 'AM',
  14: 'RR',
  15: 'PA',
  16: 'AP',
  17: 'TO',
  21: 'MA',
  22: 'PI',
  23: 'CE',
  24: 'RN',
  25: 'PB',
  26: 'PE',
  27: 'AL',
  28: 'SE',
  29: 'BA',
  31: 'MG',
  32: 'ES',
  33: 'RJ',
  35: 'SP',
  41: 'PR',
  42: 'SC',
  43: 'RS',
  50: 'MS',
  51: 'MT',
  52: 'GO',
  53: 'DF',
}

const NORTE = new Set(['RO', 'AC', 'AM', 'RR', 'PA', 'AP', 'TO'])
const NORDESTE = new Set(['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'])
const CENTRO = new Set(['GO', 'MT', 'MS', 'DF'])
const SUDESTE = new Set(['MG', 'ES', 'RJ', 'SP'])
const SUL = new Set(['PR', 'SC', 'RS'])

function regionForUf(uf: string): string {
  if (NORTE.has(uf)) return 'Norte'
  if (NORDESTE.has(uf)) return 'Nordeste'
  if (CENTRO.has(uf)) return 'Centro-Oeste'
  if (SUDESTE.has(uf)) return 'Sudeste'
  if (SUL.has(uf)) return 'Sul'
  return 'Centro-Oeste'
}

type KelvinRow = {
  codigo_ibge: number
  nome: string
  latitude: number
  longitude: number
  codigo_uf: number
}

type OutRow = {
  ibgeCode: number
  name: string
  state: string
  region: string
  lat: number
  lng: number
}

async function main() {
  console.warn('Fetching municipalities JSON...')
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = (await res.json()) as KelvinRow[]

  const out: OutRow[] = []
  for (const r of raw) {
    const uf = UF_CODE_TO_SIGLA[r.codigo_uf]
    if (!uf) {
      console.warn(`Skip unknown UF code ${r.codigo_uf} for ${r.nome}`)
      continue
    }
    out.push({
      ibgeCode: r.codigo_ibge,
      name: r.nome,
      state: uf,
      region: regionForUf(uf),
      lat: r.latitude,
      lng: r.longitude,
    })
  }

  const outPath = path.join(__dirname, '../data/municipalities-geo.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 0), 'utf8')
  console.warn(`Wrote ${out.length} municipalities → ${outPath}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
