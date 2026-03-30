import L from 'leaflet'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

import type { CityApiData, DeforestationAlertApi, FireFocusApi } from '@app-types/airQuality.types'
import { useCities } from '@hooks/useCities'
import { useDeforestation } from '@hooks/useDeforestation'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNearestCity(lat: number, lng: number, cities: CityApiData[]): CityApiData | null {
  if (cities.length === 0) return null
  let nearest: CityApiData = cities[0]!
  let best = haversineKm(lat, lng, nearest.lat, nearest.lng)
  for (let i = 1; i < cities.length; i++) {
    const c = cities[i]!
    const d = haversineKm(lat, lng, c.lat, c.lng)
    if (d < best) {
      best = d
      nearest = c
    }
  }
  return nearest
}

function escapePopupText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#7f1d1d'
}

function getFireColor(intensity: number | null): string {
  if (intensity === null) return '#facc15'
  if (intensity >= 70) return '#ef4444'
  if (intensity >= 40) return '#ff9f4a'
  return '#facc15'
}

function getFireRadius(intensity: number | null): number {
  if (intensity === null) return 5
  if (intensity >= 70) return 9
  if (intensity >= 40) return 7
  return 5
}

function getFireLabel(intensity: number | null): string {
  if (intensity === null) return 'Não informada'
  if (intensity >= 70) return 'Alta'
  if (intensity >= 40) return 'Média'
  return 'Baixa'
}

interface FireMapProps {
  showFires: boolean
  showDeforestation: boolean
  showStations: boolean
  stateFilter: string
  fires?: FireFocusApi[]
}

export const FireMap = ({ showFires, showDeforestation, showStations, stateFilter, fires = [] }: FireMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fireLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const deforestLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const stationsLayerRef = useRef<L.LayerGroup>(L.layerGroup())

  const { data: cities = [] } = useCities()
  const { data: deforestationAlerts = [] } = useDeforestation(
    stateFilter ? { state: stateFilter } : undefined,
  )

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

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Redraw fire spots when fires data changes
  useEffect(() => {
    fireLayerRef.current.clearLayers()
    const map = mapInstanceRef.current
    if (!map) return

    fires.forEach(spot => {
      const nearestCity = getNearestCity(spot.lat, spot.lng, cities)
      const color = getFireColor(spot.intensity)
      const radius = getFireRadius(spot.intensity)
      const label = getFireLabel(spot.intensity)
      const stateLine = spot.state
        ? `<span style="font-size:12px">Estado: <b>${escapePopupText(spot.state)}</b></span><br/>`
        : ''
      const nearestLine = nearestCity
        ? `<span style="font-size:12px">Cidade próxima: <b>${escapePopupText(nearestCity.name)}</b></span><br/>`
        : ''
      const biomeLine = spot.biome
        ? `<span style="font-size:11px">Bioma: ${escapePopupText(spot.biome)}</span><br/>`
        : ''
      L.circleMarker([spot.lat, spot.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.85,
        color: '#fff',
        weight: 0.5,
        opacity: 0.6,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e;min-width:140px">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:0.05em">
              🔥 Foco de Queimada
            </strong><br/>
            ${stateLine}
            ${nearestLine}
            <span style="font-size:12px">Intensidade: <b>${label}</b></span><br/>
            ${biomeLine}
            <span style="font-size:11px;color:#666">Fonte: INPE/BDQueimadas</span>
          </div>`,
        )
        .addTo(fireLayerRef.current)
    })

    if (showFires) fireLayerRef.current.addTo(map)
  }, [fires, showFires, cities])

  // Deforestation — PRODES alerts from API (same source as dashboard)
  useEffect(() => {
    deforestLayerRef.current.clearLayers()
    deforestationAlerts.forEach((alert: DeforestationAlertApi) => {
      if (alert.lat == null || alert.lng == null) return
      const nearestCity = getNearestCity(alert.lat, alert.lng, cities)
      const radiusM = Math.sqrt(alert.areaHa * 10_000 / Math.PI)
      const intensity = Math.min(1, alert.areaHa / 50_000)
      const green = Math.round(180 + 75 * (1 - intensity))
      const color = `rgb(0, ${green}, 0)`
      const detectedLabel = new Date(alert.detectedAt).toLocaleDateString('pt-BR')
      const nearestLine = nearestCity
        ? `<span style="font-size:11px">Cidade próxima: <b>${escapePopupText(nearestCity.name)}</b> (${escapePopupText(nearestCity.state)})</span><br/>`
        : ''
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
            🌳 <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px">Desmatamento · ${escapePopupText(alert.state)}</strong><br/>
            ${alert.biome ? `<span style="font-size:11px">Bioma: ${escapePopupText(alert.biome)}</span><br/>` : ''}
            <span style="font-size:11px">Área: <strong>${alert.areaHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ha</strong></span><br/>
            <span style="font-size:10px;color:#666">Referência: ${escapePopupText(detectedLabel)}</span><br/>
            ${nearestLine}
            <span style="font-size:10px;color:#666">Fonte: PRODES/INPE</span>
          </div>`,
        )
        .addTo(deforestLayerRef.current)
    })
  }, [deforestationAlerts, cities])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showDeforestation) deforestLayerRef.current.addTo(map)
    else deforestLayerRef.current.remove()
  }, [showDeforestation])

  // Redraw stations layer when city API data loads
  useEffect(() => {
    stationsLayerRef.current.clearLayers()
    const map = mapInstanceRef.current
    if (!map) return

    cities.forEach(city => {
      const aqi = city.latestAqi?.aqi ?? 0
      const color = getAQIColor(aqi)
      L.circleMarker([city.lat, city.lng], {
        radius: 5,
        fillColor: color,
        fillOpacity: 0.8,
        color: '#fff',
        weight: 1,
        opacity: 0.5,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:15px">${city.name}, ${city.state}</strong><br/>
            <span style="font-family:'DM Mono',monospace;font-size:18px;color:${color}">AQI ${aqi}</span><br/>
            <span style="font-size:11px">Estação oficial · ${city.source}</span>
          </div>`,
        )
        .addTo(stationsLayerRef.current)
    })

    if (showStations) stationsLayerRef.current.addTo(map)
  }, [cities, showStations])

  // Toggle fire layer
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showFires) fireLayerRef.current.addTo(map)
    else fireLayerRef.current.remove()
  }, [showFires])

  // Toggle stations layer
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showStations) stationsLayerRef.current.addTo(map)
    else stationsLayerRef.current.remove()
  }, [showStations])

  // Fly to state when filter changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!stateFilter) {
      map.flyTo([-14.24, -51.93], 4, { duration: 1.2 })
      return
    }
    const city = cities.find(c => c.state === stateFilter)
    if (city) {
      map.flyTo([city.lat, city.lng], 7, { duration: 1.2 })
    }
  }, [stateFilter, cities])

  return <div ref={mapRef} className="w-full h-full" />
}
