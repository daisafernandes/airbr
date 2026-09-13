import * as path from 'node:path'

import { JsonCityRepository } from './JsonCityRepository'

const citiesPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'cities.json')

describe('JsonCityRepository', () => {
  const repo = new JsonCityRepository(citiesPath)

  it('loads cities with slug ids', async () => {
    const all = await repo.findAll()
    expect(all.length).toBeGreaterThan(40)

    const sp = all.find(c => c.name === 'São Paulo' && c.state === 'SP')
    expect(sp).toMatchObject({
      id: 'sao-paulo-sp',
      region: 'Sudeste',
      source: 'json',
      populationTotal: null,
    })
  })

  it('findById returns city by slug', async () => {
    const city = await repo.findById('curitiba-pr')
    expect(city?.name).toBe('Curitiba')
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByName is accent-insensitive and limited', async () => {
    const hits = await repo.findByName('sao')
    expect(hits.some(c => c.id === 'sao-paulo-sp')).toBe(true)
    expect(hits.length).toBeLessThanOrEqual(20)
  })

  it('findAllPaginated slices deterministically', async () => {
    const page1 = await repo.findAllPaginated({ page: 1, limit: 10 })
    const page2 = await repo.findAllPaginated({ page: 2, limit: 10 })
    expect(page1.data).toHaveLength(10)
    expect(page1.total).toBeGreaterThan(10)
    expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id)
  })

  it('findNearby uses Haversine within radius', async () => {
    // Near São Paulo center
    const nearby = await repo.findNearby(-23.5505, -46.6333, 30)
    expect(nearby.some(c => c.id === 'sao-paulo-sp')).toBe(true)
    expect(nearby[0]?.distanceKm).toBeLessThanOrEqual(nearby.at(-1)?.distanceKm ?? Infinity)
    for (const c of nearby) {
      expect(c.distanceKm).toBeLessThanOrEqual(30)
    }
  })
})
