import type { ICacheService } from '@domain/cache/ICacheService'
import { LiveFireRepository } from './LiveFireRepository'
import * as inpe from '@infrastructure/providers/inpeFiresClient'

jest.mock('@infrastructure/providers/inpeFiresClient', () => ({
  fetchINPEFires: jest.fn(),
  fireFocusId: jest.requireActual('@infrastructure/providers/inpeFiresClient').fireFocusId,
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

describe('LiveFireRepository', () => {
  const fetchINPEFires = inpe.fetchINPEFires as jest.MockedFunction<typeof inpe.fetchINPEFires>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads INPE once and filters by state/biome', async () => {
    const now = new Date()
    fetchINPEFires.mockResolvedValueOnce([
      {
        id: 'f1',
        lat: -10,
        lng: -50,
        intensity: 1,
        satellite: 'AQUA',
        biome: 'Amazônia',
        state: 'PA',
        detectedAt: now,
      },
      {
        id: 'f2',
        lat: -15,
        lng: -47,
        intensity: 2,
        satellite: 'TERRA',
        biome: 'Cerrado',
        state: 'GO',
        detectedAt: now,
      },
    ])

    const repo = new LiveFireRepository(new MemoryCache())

    const pa = await repo.findByState('PA')
    expect(pa).toHaveLength(1)
    expect(pa[0]?.id).toBe('f1')

    const cerrado = await repo.findByBiome('Cerrado')
    expect(cerrado).toHaveLength(1)
    expect(fetchINPEFires).toHaveBeenCalledTimes(1)

    expect(await repo.findById('f2')).toMatchObject({ state: 'GO' })
  })

  it('paginates active foci', async () => {
    const now = new Date()
    fetchINPEFires.mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, i) => ({
        id: `f${i}`,
        lat: -10 - i,
        lng: -50,
        intensity: null,
        satellite: null,
        biome: null,
        state: 'MT',
        detectedAt: new Date(now.getTime() - i * 1000),
      })),
    )

    const repo = new LiveFireRepository(new MemoryCache())
    const page = await repo.findActivePaginated({ page: 2, limit: 2 })
    expect(page.total).toBe(5)
    expect(page.data).toHaveLength(2)
  })

  it('parses sample CSV via real helper', () => {
    const csv =
      'lat,lon,data_hora_gmt,estado,bioma,satelite,frp\n' +
      '-10.5,-55.2,2024-01-01T12:00:00Z,MT,Amazônia,AQUA,12.5\n'
    const actual = jest.requireActual<typeof inpe>('@infrastructure/providers/inpeFiresClient')
    const foci = actual.rowsToFireFoci(actual.parseINPECSV(csv))
    expect(foci).toHaveLength(1)
    expect(foci[0]).toMatchObject({
      lat: -10.5,
      lng: -55.2,
      state: 'MT',
      intensity: 12.5,
    })
    expect(foci[0]?.id).toHaveLength(24)
  })
})
