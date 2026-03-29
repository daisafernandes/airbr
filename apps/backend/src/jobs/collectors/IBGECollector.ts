import axios from 'axios'

import { prisma } from '@infrastructure/database/prisma'

/**
 * IBGE Collector — population and demographic data per municipality.
 * Uses the public IBGE API (https://servicodados.ibge.gov.br).
 * No API key required.
 *
 * Updates City.populationTotal, City.elderlyPct and City.childrenPct.
 */
const IBGE_API = 'https://servicodados.ibge.gov.br/api/v1'

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

interface IBGEPopulacaoResult {
  id: string
  localidade: {
    id: string
    nome: string
  }
  res: Array<{
    id: string
    res: Array<{ id: string; res: Array<{ id: string; res: unknown }> }>
  }>
}

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
        populationMap = await this.fetchPopulation(ibgeIds)
      }

      let count = 0
      for (const city of cities) {
        const key = `${city.name.toLowerCase()}|${city.state}`
        const ibgeId = municipioMap.get(key)
        const population = ibgeId ? (populationMap.get(ibgeId) ?? null) : null

        await prisma.city.update({
          where: { id: city.id },
          data: {
            populationTotal: population,
            elderlyPct: ELDERLY_PCT_BY_STATE[city.state] ?? null,
            childrenPct: CHILDREN_PCT_BY_STATE[city.state] ?? null,
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

  private async fetchPopulation(ids: number[]): Promise<Map<number, number>> {
    const idString = ids.slice(0, 200).join('|')
    try {
      const { data } = await axios.get<IBGEPopulacaoResult[]>(
        `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2022/variaveis/93`,
        {
          params: { localidades: `N6[${idString}]` },
          timeout: 20_000,
        },
      )

      const result = new Map<number, number>()
      for (const item of data ?? []) {
        for (const loc of item.res ?? []) {
          const pop = parseInt(String(loc.res), 10)
          if (!isNaN(pop)) result.set(parseInt(item.localidade.id, 10), pop)
        }
      }
      return result
    } catch {
      return new Map()
    }
  }
}
