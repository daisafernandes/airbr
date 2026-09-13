import { citySlug, foldAscii, haversineKm } from './geo'

describe('geo utils', () => {
  it('citySlug builds stable name-state ids', () => {
    expect(citySlug('São Paulo', 'SP')).toBe('sao-paulo-sp')
    expect(citySlug('Rio de Janeiro', 'RJ')).toBe('rio-de-janeiro-rj')
    expect(citySlug('Jaboatão dos Guararapes', 'PE')).toBe('jaboatao-dos-guararapes-pe')
  })

  it('foldAscii strips accents for search', () => {
    expect(foldAscii('São Paulo')).toBe('sao paulo')
    expect(foldAscii('Maceió')).toBe('maceio')
  })

  it('haversineKm returns ~0 for same point', () => {
    expect(haversineKm(-23.55, -46.63, -23.55, -46.63)).toBeCloseTo(0, 5)
  })

  it('haversineKm approximates known SP–Santos distance', () => {
    // São Paulo ↔ Santos ≈ 55–65 km depending on exact points
    const km = haversineKm(-23.5505, -46.6333, -23.9608, -46.3336)
    expect(km).toBeGreaterThan(50)
    expect(km).toBeLessThan(70)
  })
})
