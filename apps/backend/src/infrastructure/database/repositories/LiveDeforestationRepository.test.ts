import type { ICacheService } from '@domain/cache/ICacheService'
import { LiveDeforestationRepository } from './LiveDeforestationRepository'
import * as prodes from '@infrastructure/providers/prodesClient'

jest.mock('@infrastructure/providers/prodesClient', () => ({
  fetchPRODESAlerts: jest.fn(),
}))

class MemoryCache implements ICacheService {
  private store = new Map<string, unknown>()

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value)
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

describe('LiveDeforestationRepository', () => {
  const fetchPRODESAlerts = prodes.fetchPRODESAlerts as jest.MockedFunction<
    typeof prodes.fetchPRODESAlerts
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads PRODES once and filters by state', async () => {
    const detectedAt = new Date()
    fetchPRODESAlerts.mockResolvedValueOnce([
      {
        id: 'd1',
        state: 'PA',
        lat: -3,
        lng: -50,
        areaHa: 100,
        biome: 'Amazônia',
        detectedAt,
        source: 'prodes',
        createdAt: detectedAt,
      },
      {
        id: 'd2',
        state: 'AM',
        lat: -4,
        lng: -60,
        areaHa: 50,
        biome: 'Amazônia',
        detectedAt,
        source: 'prodes',
        createdAt: detectedAt,
      },
    ])

    const repo = new LiveDeforestationRepository(new MemoryCache())
    const pa = await repo.findAll({ state: 'PA' })
    expect(pa).toHaveLength(1)
    expect(pa[0]?.id).toBe('d1')

    const page = await repo.findAllPaginated({ page: 1, limit: 1 })
    expect(page.total).toBe(2)
    expect(page.data).toHaveLength(1)
    expect(fetchPRODESAlerts).toHaveBeenCalledTimes(1)
  })

  it('maps GeoJSON features via real helper', () => {
    const actual = jest.requireActual<typeof prodes>('@infrastructure/providers/prodesClient')
    const alerts = actual.featuresToAlerts(
      [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-50, -3],
                [-49, -3],
                [-49, -2],
                [-50, -2],
                [-50, -3],
              ],
            ],
          },
          properties: {
            state: 'PA',
            area_km: 1.5,
            image_date: '2024-06-01',
            biome: 'Amazônia',
            year: 2024,
          },
        },
      ],
      2024,
    )

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      state: 'PA',
      areaHa: 150,
      biome: 'Amazônia',
      source: 'prodes',
    })
    // Closed ring repeats the first vertex; centroid averages all points.
    expect(alerts[0]?.lat).toBeCloseTo(-2.6, 5)
    expect(alerts[0]?.lng).toBeCloseTo(-49.6, 5)
  })
})
