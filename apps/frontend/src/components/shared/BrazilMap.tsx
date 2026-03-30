import L from 'leaflet'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

import { useCities } from '@hooks/useCities'
import { useDeforestation } from '@hooks/useDeforestation'
import type { CityApiData, DeforestationAlertApi, FireFocusApi } from '@app-types/airQuality.types'

function nearestCityLabelFromSpot(
  spot: Pick<FireFocusApi, 'nearestMunicipality' | 'lat' | 'lng'>,
  cities: Array<{ name: string; lat: number; lng: number }>,
): string {
  const nm = spot.nearestMunicipality
  if (nm) return `${nm.name} (${nm.state}) · ${Math.round(nm.distanceKm)} km`
  if (cities.length === 0) return '—'
  let nearest = cities[0]!
  let minDist = (spot.lat - nearest.lat) ** 2 + (spot.lng - nearest.lng) ** 2
  for (let i = 1; i < cities.length; i++) {
    const c = cities[i]!
    const d = (spot.lat - c.lat) ** 2 + (spot.lng - c.lng) ** 2
    if (d < minDist) {
      minDist = d
      nearest = c
    }
  }
  return nearest.name
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#7f1d1d'
}

function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Bom'
  if (aqi <= 100) return 'Moderado'
  if (aqi <= 150) return 'Ruim p/ sensíveis'
  if (aqi <= 200) return 'Ruim'
  if (aqi <= 300) return 'Muito ruim'
  return 'Perigoso'
}

interface BrazilMapProps {
  selectedCityId: string | null
  showFires: boolean
  showDeforestation: boolean
  showStations: boolean
  fires?: FireFocusApi[]
}

export const BrazilMap = ({
  selectedCityId,
  showFires,
  showDeforestation,
  showStations,
  fires = [],
}: BrazilMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const cityLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const fireLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const deforestLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const stationsLayerRef = useRef<L.LayerGroup>(L.layerGroup())

  const { data: cities = [], isLoading } = useCities()
  const { data: deforestationAlerts = [] } = useDeforestation()

  // Initialise map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [-14.24, -51.93],
      zoom: 4,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map)

    cityLayerRef.current.addTo(map)
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Redraw city markers when API data arrives
  useEffect(() => {
    cityLayerRef.current.clearLayers()
    stationsLayerRef.current.clearLayers()

    cities.forEach((city: CityApiData) => {
      const aqi = city.latestAqi?.aqi ?? 0
      const color = getAQIColor(aqi)
      const radius = Math.max(6, aqi / 12)

      const cityPageUrl = `/cidade/${city.id}`

      L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.75,
        color,
        weight: 1,
        opacity: 0.4,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e;min-width:160px">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.05em">
              ${city.name}, ${city.state}
            </strong><br/>
            <span style="font-family:'DM Mono',monospace;font-size:20px;color:${color}">
              IQAr ${aqi}
            </span><br/>
            <span style="font-size:12px">${getAQILabel(aqi)}</span><br/>
            <a href="${cityPageUrl}" style="font-size:11px;color:#3b82f6;text-decoration:underline;margin-top:4px;display:inline-block">
              → Ver página completa
            </a>
          </div>`,
        )
        .addTo(cityLayerRef.current)

      // Stations layer uses same coords
      L.circleMarker([city.lat, city.lng], {
        radius: 4,
        fillColor: '#60a5fa',
        fillOpacity: 0.9,
        color: '#93c5fd',
        weight: 1.5,
        opacity: 0.7,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px">
              📡 Estação Oficial — ${city.name}
            </strong><br/>
            <span style="font-size:11px">${city.source} · IQAr ${aqi}</span>
          </div>`,
        )
        .addTo(stationsLayerRef.current)
    })
  }, [cities])

  // Redraw deforestation alerts from PRODES when data changes
  useEffect(() => {
    deforestLayerRef.current.clearLayers()
    deforestationAlerts.forEach((alert: DeforestationAlertApi) => {
      if (alert.lat == null || alert.lng == null) return
      const radiusM = Math.sqrt(alert.areaHa * 10_000 / Math.PI)
      const intensity = Math.min(1, alert.areaHa / 50_000)
      const green = Math.round(180 + 75 * (1 - intensity))
      const color = `rgb(0, ${green}, 0)`
      L.circle([alert.lat, alert.lng], {
        radius: Math.max(radiusM, 5000),
        fillColor: color,
        fillOpacity: 0.15 + 0.25 * intensity,
        color,
        weight: 1,
        opacity: 0.4,
        dashArray: '4 4',
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            🌳 <strong>Desmatamento · ${alert.state}</strong><br/>
            ${alert.biome ? `Bioma: ${alert.biome}<br/>` : ''}
            Área: <strong>${alert.areaHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ha</strong><br/>
            <span style="font-size:10px;color:#666">Fonte: PRODES/INPE</span>
          </div>`,
        )
        .addTo(deforestLayerRef.current)
    })
  }, [deforestationAlerts])

  // Redraw fire spots when fires prop changes
  useEffect(() => {
    fireLayerRef.current.clearLayers()
    fires.forEach(spot => {
      const intensity = spot.intensity ?? 0
      const color = intensity >= 70 ? '#ef4444' : intensity >= 40 ? '#ff9f4a' : '#facc15'
      const radius = intensity >= 70 ? 8 : intensity >= 40 ? 6 : 4
      const label = intensity >= 70 ? 'Alta intensidade' : intensity >= 40 ? 'Média intensidade' : 'Baixa intensidade'
      L.circleMarker([spot.lat, spot.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.8,
        color: '#fff',
        weight: 0.5,
        opacity: 0.5,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            🔥 Foco de queimada${spot.state ? ` · ${spot.state}` : ''} · ${label}<br/>
            <span style="font-size:11px">📍 Cidade mais próxima: <strong>${nearestCityLabelFromSpot(spot, cities)}</strong></span>
          </div>`,
        )
        .addTo(fireLayerRef.current)
    })
  }, [fires, cities])

  // Toggle layer visibility
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

  // Fly to selected city
  useEffect(() => {
    if (!selectedCityId || !mapInstanceRef.current) return
    const city = cities.find(c => c.id === selectedCityId)
    if (city) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.5 })
    }
  }, [selectedCityId, cities])

  return (
    <div className="flex-1 rounded border border-border overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/40 pointer-events-none">
          <span className="text-xs font-mono text-muted-foreground animate-pulse">Carregando cidades...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full" style={{ minHeight: 'calc(100vh - 140px)' }} />
    </div>
  )
}
