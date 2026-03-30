import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/** Stable empty list to avoid remounting the map when wind-smoke is still loading */
export const EMPTY_NEARBY_FIRES: Array<{ lat: number; lng: number }> = []

interface SmokeSourceCardProps {
  lat: number
  lng: number
  /** Degrees; null when not available from observations */
  windDirection: number | null
  /** km/h; null when not available */
  windSpeed: number | null
  /** Optional label from API (e.g. N, NE); falls back to local compass when direction is set */
  windCompassLabel?: string | null
  nearbyFires: Array<{ lat: number; lng: number }>
}

export const SmokeSourceCard = ({
  lat,
  lng,
  windDirection,
  windSpeed,
  windCompassLabel,
  nearbyFires,
}: SmokeSourceCardProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const el = mapRef.current
    if (!el) return

    const map = L.map(el, {
      center: [lat, lng],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map)

    L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: '#4af0c4',
      fillOpacity: 0.9,
      color: '#4af0c4',
      weight: 2,
      opacity: 0.6,
    }).addTo(map)

    nearbyFires.forEach(fire => {
      L.circleMarker([fire.lat, fire.lng], {
        radius: 5,
        fillColor: '#ff4500',
        fillOpacity: 0.8,
        color: '#ff6a00',
        weight: 1.5,
      }).addTo(map)
    })

    if (windDirection != null) {
      const rad = (windDirection - 90) * (Math.PI / 180)
      const arrowLen = 0.8
      const endLat = lat + arrowLen * Math.cos(windDirection * (Math.PI / 180)) * -1
      const endLng = lng + arrowLen * Math.sin(windDirection * (Math.PI / 180))

      L.polyline([[lat, lng], [endLat, endLng]], {
        color: '#facc15',
        weight: 2,
        opacity: 0.8,
        dashArray: '4 3',
      }).addTo(map)

      const arrowSize = 0.15
      const perpRad = rad + Math.PI / 2
      const tipLat = endLat
      const tipLng = endLng
      const left = [tipLat - arrowSize * Math.cos(perpRad), tipLng - arrowSize * Math.sin(perpRad)] as [number, number]
      const right = [tipLat + arrowSize * Math.cos(perpRad), tipLng + arrowSize * Math.sin(perpRad)] as [number, number]
      const tip = [tipLat + arrowSize * 1.5 * Math.cos(rad), tipLng + arrowSize * 1.5 * Math.sin(rad)] as [number, number]

      L.polygon([left, right, tip], {
        color: '#facc15',
        fillColor: '#facc15',
        fillOpacity: 0.9,
        weight: 1,
      }).addTo(map)
    }

    return () => {
      map.remove()
    }
  }, [lat, lng, windDirection, nearbyFires])

  const compassLabel = (deg: number): string => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(deg / 45) % 8] ?? 'N'
  }

  let windLine: string | null = null
  if (windDirection != null || windSpeed != null || windCompassLabel) {
    const parts: string[] = []
    if (windCompassLabel) parts.push(windCompassLabel)
    else if (windDirection != null) parts.push(compassLabel(windDirection))
    if (windSpeed != null) parts.push(`${windSpeed.toFixed(1)} km/h`)
    else if (windDirection != null || windCompassLabel) parts.push('— km/h')
    windLine = parts.join(' · ')
  }

  const hasFires = nearbyFires.length > 0

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-1">{t('cityDashboard.smokeSource')}</h3>
      <div className="space-y-2 mb-2">
        <p className="text-xs text-muted-foreground font-body">
          {t('cityDashboard.wind')}:{' '}
          <span className="font-mono text-foreground">
            {windLine ?? t('cityDashboard.windUnavailable')}
          </span>
        </p>
        {hasFires ? (
          <p className="text-xs text-muted-foreground font-body">
            {t('cityDashboard.fireFociNearby')}:{' '}
            <span className="font-mono text-accent">{nearbyFires.length}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{t('cityDashboard.noNearbyFires')}</p>
        )}
      </div>
      <div className="rounded overflow-hidden border border-border/50" style={{ height: 130 }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#4af0c4]" /> {t('cityDashboard.cityMarker')}
        </span>
        {hasFires && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff4500]" /> {t('cityDashboard.fireFocusMarker')}
          </span>
        )}
        {windDirection != null && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-yellow-400 opacity-80" /> {t('cityDashboard.windArrow')}
          </span>
        )}
      </div>
    </div>
  )
}
