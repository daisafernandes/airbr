import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CITIES_DATA } from '@data/mockCities'

interface FireMapProps {
  showFires?: boolean
  showDeforestation?: boolean
  showStations?: boolean
  stateFilter?: string
}

function getFireColor(intensity: 'low' | 'medium' | 'high'): string {
  if (intensity === 'high') return '#ef4444'
  if (intensity === 'medium') return '#f97316'
  return '#facc15'
}

export const FireMap = ({ showFires = true, showDeforestation = true, showStations = false, stateFilter }: FireMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fireLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const deforestLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const stationsLayerRef = useRef<L.LayerGroup>(L.layerGroup())

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [-14.24, -51.93],
      zoom: 4,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)

    const cities = stateFilter ? CITIES_DATA.filter(c => c.state === stateFilter) : CITIES_DATA

    cities.forEach(city => {
      city.nearbyFires.forEach(spot => {
        const color = getFireColor(spot.intensity)
        const radius = spot.intensity === 'high' ? 8 : spot.intensity === 'medium' ? 6 : 4
        L.circleMarker([spot.lat, spot.lng], {
          radius,
          fillColor: color,
          fillOpacity: 0.8,
          color,
          weight: 1.5,
          opacity: 0.6,
        })
          .bindPopup(
            `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
              <strong>🔥 Foco de queimada</strong><br/>
              <span style="font-size:11px">Intensidade: <b>${spot.intensity === 'high' ? 'Alta' : spot.intensity === 'medium' ? 'Média' : 'Baixa'}</b></span><br/>
              <span style="font-size:11px">Próximo a: ${city.name}, ${city.state}</span>
            </div>`
          )
          .addTo(fireLayerRef.current)
      })

      city.deforestationAreas.forEach(area => {
        L.circle([area.lat, area.lng], {
          radius: area.radius,
          fillColor: '#22c55e',
          fillOpacity: 0.12,
          color: '#22c55e',
          weight: 1,
          opacity: 0.3,
          dashArray: '4 4',
        })
          .bindPopup(
            `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
              <strong>🌳 Área de desmatamento detectado</strong><br/>
              <span style="font-size:11px">Região de ${city.name}, ${city.state}</span>
            </div>`
          )
          .addTo(deforestLayerRef.current)
      })
    })

    // Mock official monitoring stations
    CITIES_DATA.forEach(city => {
      L.circleMarker([city.lat, city.lng], {
        radius: 5,
        fillColor: '#818cf8',
        fillOpacity: 0.7,
        color: '#818cf8',
        weight: 1.5,
        opacity: 0.5,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong>📡 Estação oficial</strong><br/>
            <span style="font-size:12px">${city.name}, ${city.state}</span><br/>
            <span style="font-size:11px;font-family:'DM Mono',monospace">AQI ${city.aqi}</span>
          </div>`
        )
        .addTo(stationsLayerRef.current)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [stateFilter])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showFires) fireLayerRef.current.addTo(map)
    else fireLayerRef.current.remove()
  }, [showFires])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showDeforestation) deforestLayerRef.current.addTo(map)
    else deforestLayerRef.current.remove()
  }, [showDeforestation])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showStations) stationsLayerRef.current.addTo(map)
    else stationsLayerRef.current.remove()
  }, [showStations])

  return (
    <div className="w-full h-full rounded border border-border overflow-hidden relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} />
      <div className="absolute bottom-4 left-4 z-[400] bg-card/90 backdrop-blur border border-border rounded p-2.5 flex flex-col gap-1.5">
        {showFires && (
          <>
            <div className="flex items-center gap-2 text-[10px] font-mono text-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              Alta intensidade
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              Média intensidade
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#facc15]" />
              Baixa intensidade
            </div>
          </>
        )}
        {showDeforestation && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-foreground">
            <span className="inline-block w-3 h-3 rounded border border-green-500/60 bg-green-500/20" />
            Desmatamento
          </div>
        )}
        {showStations && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-foreground">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-400" />
            Estação oficial
          </div>
        )}
      </div>
    </div>
  )
}
