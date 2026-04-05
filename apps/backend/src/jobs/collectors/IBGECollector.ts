import axios from 'axios'
import { prisma } from '@infrastructure/database/prisma'

/**
 * IBGE Collector — population and demographic data per municipality.
 * Uses the public IBGE API (https://servicodados.ibge.gov.br).
 * No API key required.
 *
 * Updates City.populationTotal (annual estimates), City.elderlyPct and City.childrenPct
 * (Censo 2022 age groups at municipal level when available; otherwise UF averages).
 */
const IBGE_API = 'https://servicodados.ibge.gov.br/api/v1'

/** Estimates of resident population — variable 9324, latest annual period. */
const AGREGADO_POP_ESTIMADA = 6579
const POP_VAR_ID = 9324
const POP_PERIOD = '2024'

/** Censo 2022 — population by age band (table 9514). */
const AGREGADO_CENSO_IDADE = 9514
const CENSO_PERIOD = '2022'
const CENSO_POP_VAR = 93

/** Idade — grupos 0–14 (nível 1). */
const AGE_CHILD_GROUPS = ['93070', '93084', '93085'] as const
/** Idade — 60+ (nível 1). */
const AGE_ELDER_GROUPS = [
  '93095',
  '93096',
  '93097',
  '93098',
  '49108',
  '49109',
  '60040',
  '60041',
  '6653',
] as const

const ELDERLY_PCT_BY_STATE: Record<string, number> = {
  SP: 14.2, RJ: 16.8, MG: 14.5, RS: 17.2, PR: 13.1, SC: 13.8,
  BA: 12.3, PE: 13.0, CE: 11.5, PA: 8.2, GO: 11.4, MA: 9.1,
  AM: 7.8, MT: 10.2, MS: 11.9, ES: 13.0, PB: 13.7, RN: 13.4,
  AL: 12.1, PI: 12.8, SE: 12.5, DF: 11.3, RO: 9.1, TO: 10.0,
  AC: 7.5, AP: 6.9, RR: 7.2,
}

const CHILDREN_PCT_BY_STATE: Record<string, number> = {
  SP: 18.5, RJ: 17.2, MG: 18.9, RS: 17.8, PR: 19.2, SC: 19.0,
  BA: 22.1, PE: 21.3, CE: 22.0, PA: 24.5, GO: 20.1, MA: 25.3,
  AM: 25.8, MT: 21.4, MS: 20.8, ES: 19.7, PB: 21.5, RN: 20.9,
  AL: 23.4, PI: 23.1, SE: 21.8, DF: 18.6, RO: 22.3, TO: 22.7,
  AC: 27.1, AP: 28.2, RR: 27.6,
}

interface IBGEMunicipio {
  id: number
  nome: string
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string
      }
    }
  }
}

interface IBGE9514Response {
  id: string
  variavel: string
  resultados: Array<{
    classificacoes: Array<{
      id: string
      nome: string
      categoria: Record<string, string>
    }>
    series: Array<{
      localidade: { id: string }
      serie: Record<string, string>
    }>
  }>
}

export class IBGECollector {
  name = 'IBGECollector'

  async collect(): Promise<number> {
    try {
      const cities = await prisma.city.findMany({
        select: { id: true, name: true, state: true },
      })

      const municipios = await this.fetchMunicipios()
      const municipioMap = new Map<string, number>()
      for (const m of municipios) {
        const key = `${m.nome.toLowerCase()}|${m.microrregiao.mesorregiao.UF.sigla}`
        municipioMap.set(key, m.id)
      }

      const ibgeIds = cities
        .map(city => municipioMap.get(`${city.name.toLowerCase()}|${city.state}`))
        .filter((id): id is number => id != null)

      let populationMap: Map<number, number> = new Map()
      if (ibgeIds.length > 0) {
        populationMap = await this.fetchPopulationEstimates(ibgeIds)
      }

      let agePctMap: Map<number, { childrenPct: number; elderlyPct: number }> = new Map()
      if (ibgeIds.length > 0) {
        agePctMap = await this.fetchMunicipalAgeShares(ibgeIds, populationMap)
      }

      let count = 0
      for (const city of cities) {
        const key = `${city.name.toLowerCase()}|${city.state}`
        const ibgeId = municipioMap.get(key)
        const population = ibgeId ? (populationMap.get(ibgeId) ?? null) : null

        const municipal = ibgeId ? agePctMap.get(ibgeId) : undefined
        const elderlyPct =
          municipal?.elderlyPct ?? ELDERLY_PCT_BY_STATE[city.state] ?? null
        const childrenPct =
          municipal?.childrenPct ?? CHILDREN_PCT_BY_STATE[city.state] ?? null

        await prisma.city.update({
          where: { id: city.id },
          data: {
            populationTotal: population,
            elderlyPct,
            childrenPct,
          },
        })
        count++
      }

      console.info(`[IBGE] Updated ${count} cities with population data`)
      return count
    } catch (err) {
      console.error('[IBGE] Collection failed:', err instanceof Error ? err.message : err)
      return 0
    }
  }

  private async fetchMunicipios(): Promise<IBGEMunicipio[]> {
    const { data } = await axios.get<IBGEMunicipio[]>(`${IBGE_API}/localidades/municipios`, {
      params: { orderBy: 'nome' },
      timeout: 20_000,
    })
    return data
  }

  /**
   * Resident population estimates (IBGE) — agregado 6579, variável 9324.
   */
  private async fetchPopulationEstimates(ids: number[]): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    const chunkSize = 50
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const idString = chunk.join(',')
      try {
        const { data } = await axios.get<
          Array<{
            resultados: Array<{
              series: Array<{
                localidade: { id: string }
                serie: Record<string, string>
              }>
            }>
          }>
        >(
          `https://servicodados.ibge.gov.br/api/v3/agregados/${AGREGADO_POP_ESTIMADA}/periodos/${POP_PERIOD}/variaveis/${POP_VAR_ID}`,
          {
            params: { localidades: `N6[${idString}]` },
            timeout: 25_000,
          },
        )

        const series = data?.[0]?.resultados?.[0]?.series ?? []
        for (const s of series) {
          const id = parseInt(s.localidade.id, 10)
          const raw = s.serie[POP_PERIOD]
          const pop = parseInt(String(raw ?? ''), 10)
          if (!isNaN(id) && !isNaN(pop)) result.set(id, pop)
        }
      } catch {
        // continue with other chunks
      }
    }
    return result
  }

  /**
   * Children (0–14) and elderly (60+) as % of estimated population, from Censo 2022 age bands.
   */
  private async fetchMunicipalAgeShares(
    ids: number[],
    populationMap: Map<number, number>,
  ): Promise<Map<number, { childrenPct: number; elderlyPct: number }>> {
    const out = new Map<number, { childrenPct: number; elderlyPct: number }>()
    const childSum = new Map<number, number>()
    const elderSum = new Map<number, number>()

    const chunkSize = 40
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      await this.accumulateAgeBandSums(chunk, AGE_CHILD_GROUPS, childSum)
      await this.accumulateAgeBandSums(chunk, AGE_ELDER_GROUPS, elderSum)
    }

    for (const id of ids) {
      const total = populationMap.get(id)
      if (total == null || total <= 0) continue

      const c = childSum.get(id) ?? 0
      const e = elderSum.get(id) ?? 0
      // Require both bands so a partial API failure falls back to UF averages instead of 0% elderly/children.
      if (c <= 0 || e <= 0) continue

      out.set(id, {
        childrenPct: Math.round((c / total) * 1000) / 10,
        elderlyPct: Math.round((e / total) * 1000) / 10,
      })
    }

    return out
  }

  private async accumulateAgeBandSums(
    ibgeIds: number[],
    ageCategoryIds: readonly string[],
    target: Map<number, number>,
  ): Promise<void> {
    const idString = ibgeIds.join(',')
    const classificacao = ageCategoryIds.join(',')
    try {
      const { data } = await axios.get<IBGE9514Response[]>(
        `https://servicodados.ibge.gov.br/api/v3/agregados/${AGREGADO_CENSO_IDADE}/periodos/${CENSO_PERIOD}/variaveis/${CENSO_POP_VAR}`,
        {
          params: {
            localidades: `N6[${idString}]`,
            classificacao: `287[${classificacao}]`,
          },
          timeout: 30_000,
        },
      )

      const blocks = data?.[0]?.resultados ?? []
      for (const block of blocks) {
        const ageEntry = block.classificacoes.find(c => c.id === '287')
        const ageKey = ageEntry ? Object.keys(ageEntry.categoria)[0] : null
        if (!ageKey) continue

        for (const s of block.series) {
          const locId = parseInt(s.localidade.id, 10)
          const raw = s.serie[CENSO_PERIOD]
          const n = parseInt(String(raw ?? ''), 10)
          if (isNaN(locId) || isNaN(n)) continue
          target.set(locId, (target.get(locId) ?? 0) + n)
        }
      }
    } catch {
      // leave sums partial; caller falls back to UF averages per city
    }
  }
}
