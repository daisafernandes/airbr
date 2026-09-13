import * as path from 'node:path'

import { JsonMunicipalityRepository } from './JsonMunicipalityRepository'

const geoPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'municipalities-geo.json')

describe('JsonMunicipalityRepository', () => {
  const repo = new JsonMunicipalityRepository(geoPath)

  it('findNearest returns a municipality near São Paulo', async () => {
    const nearest = await repo.findNearest(-23.5505, -46.6333)
    expect(nearest).not.toBeNull()
    expect(nearest?.state).toBe('SP')
    expect(nearest?.distanceKm).toBeLessThan(20)
  })

  it('findNearestBatch returns up to 3 per point in input order', async () => {
    const batch = await repo.findNearestBatch([
      { lat: -23.5505, lng: -46.6333 },
      { lat: -22.9068, lng: -43.1729 },
    ])
    expect(batch).toHaveLength(2)
    expect(batch[0]).toHaveLength(3)
    expect(batch[1]).toHaveLength(3)
    expect(batch[0]![0]!.distanceKm).toBeLessThanOrEqual(batch[0]![1]!.distanceKm)
    expect(batch[0]![0]!.state).toBe('SP')
    expect(batch[1]![0]!.state).toBe('RJ')
  })

  it('findNearestBatch returns empty for empty input', async () => {
    await expect(repo.findNearestBatch([])).resolves.toEqual([])
  })
})
