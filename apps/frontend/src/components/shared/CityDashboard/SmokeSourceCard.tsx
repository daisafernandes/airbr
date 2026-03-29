import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface SmokeSourceCardProps {
  lat: number
  lng: number
  windDirection: number
  windSpeed: number
  nearbyFires: Array<{ lat: number; lng: number }>
}

export const SmokeSourceCard = ({ lat, lng, windDirection, windSpeed, nearbyFires }: SmokeSourceCardProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
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

    // City center marker
    L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: '#4af0c4',
      fillOpacity: 0.9,
      color: '#4af0c4',
      weight: 2,
      opacity: 0.6,
    }).addTo(map)

    // Nearby fire markers
    nearbyFires.forEach(fire => {
      L.circleMarker([fire.lat, fire.lng], {
        radius: 5,
        fillColor: '#ff4500',
        fillOpacity: 0.8,
        color: '#ff6a00',
        weight: 1.5,
      }).addTo(map)
    })

    // Wind direction arrow using L.Polyline
    const rad = (windDirection - 90) * (Math.PI / 180)
    const arrowLen = 0.8
    const endLat = lat + arrowLen * Math.cos((windDirection) * Math.PI / 180) * -1
    const endLng = lng + arrowLen * Math.sin((windDirection) * Math.PI / 180)

    L.polyline([[lat, lng], [endLat, endLng]], {
      color: '#facc15',
      weight: 2,
      opacity: 0.8,
      dashArray: '4 3',
    }).addTo(map)

    // Arrowhead
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

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [lat, lng, windDirection, nearbyFires])

  const compassLabel = (deg: number): string => {
    const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']
    return dirs[Math.round(deg / 45) % 8]
  }

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-1">DE ONDE VEM A FUMAÇA?</h3>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-muted-foreground font-body">
          Vento: <span className="font-mono text-foreground">{compassLabel(windDirection)} · {windSpeed} km/h</span>
        </span>
        <span className="text-xs text-muted-foreground font-body">
          Focos: <span className="font-mono text-accent">{nearbyFires.length}</span>
        </span>
      </div>
      <div className="rounded overflow-hidden border border-border/50" style={{ height: 130 }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#4af0c4]" /> Cidade
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ff4500]" /> Foco de queimada
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-yellow-400 opacity-80" /> Vento
        </span>
      </div>
    </div>
  )
}
