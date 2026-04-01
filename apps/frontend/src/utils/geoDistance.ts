const EARTH_RADIUS_KM = 6371

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Closest `n` items by great-circle distance (km). */
export function getTopNearestByHaversine<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  items: T[],
  n: number,
): T[] {
  if (items.length === 0 || n <= 0) return []
  const scored = items.map(item => ({
    item,
    d: haversineKm(lat, lng, item.lat, item.lng),
  }))
  scored.sort((a, b) => a.d - b.d)
  return scored.slice(0, n).map(s => s.item)
}
