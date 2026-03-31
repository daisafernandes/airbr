import type { TFunction } from 'i18next'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import 'leaflet/dist/leaflet.css'

import type { DeforestationAlertApi, FireFocusApi } from '@app-types/airQuality.types'
import { useCities } from '@hooks/useCities'
import { useDeforestation } from '@hooks/useDeforestation'
import { getTopNearestByHaversine, haversineKm } from '@utils/geoDistance'

function escapePopupText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
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

function fireIntensityLabel(intensity: number | null, t: TFunction): string {
  if (intensity === null) return t('firemap.intensityUnknown')
  if (intensity >= 70) return t('firemap.intensityHigh')
  if (intensity >= 40) return t('firemap.intensityMedium')
  return t('firemap.intensityLow')
}

interface FireMapProps {
  showFires: boolean
  showDeforestation: boolean
  stateFilter: string
  fires?: FireFocusApi[]
  /** Opens fire detail in a modal on the parent page instead of navigating away. */
  onOpenFireDetail?: (fireId: string) => void
}

export const FireMap = ({ showFires, showDeforestation, stateFilter, fires = [], onOpenFireDetail }: FireMapProps) => {
  const { t, i18n } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fireLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const deforestLayerRef = useRef<L.LayerGroup>(L.layerGroup())

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
      const apiMun = spot.nearestMunicipalities ?? []
      const fallbackTop = getTopNearestByHaversine(spot.lat, spot.lng, cities, 3)
      const color = getFireColor(spot.intensity)
      const radius = getFireRadius(spot.intensity)
      const label = fireIntensityLabel(spot.intensity, t)
      const stateLine = spot.state
        ? `<span style="font-size:12px">${escapePopupText(t('firemap.popupState'))}: <b>${escapePopupText(spot.state)}</b></span><br/>`
        : ''

      let nearestBlock = ''
      if (apiMun.length > 0) {
        const lines = apiMun
          .slice(0, 3)
          .map(
            m =>
              `<span style="font-size:12px">· <b>${escapePopupText(m.name)}</b> (${escapePopupText(m.state)}) · ${Math.round(m.distanceKm)} km</span>`,
          )
          .join('<br/>')
        nearestBlock = `<span style="font-size:11px;color:#444">${escapePopupText(t('firemap.popupNearestIbge'))}</span><br/>${lines}<br/>`
      } else if (fallbackTop.length > 0) {
        const lines = fallbackTop
          .map(c => {
            const d = Math.round(haversineKm(spot.lat, spot.lng, c.lat, c.lng))
            return `<span style="font-size:12px">· <b>${escapePopupText(c.name)}</b> (${escapePopupText(c.state)}) · ${d} km</span>`
          })
          .join('<br/>')
        nearestBlock = `<span style="font-size:11px;color:#444">${escapePopupText(t('firemap.popupNearestMonitored'))}</span><br/>${lines}<br/>`
      }

      const biomeLine = spot.biome
        ? `<span style="font-size:11px">${escapePopupText(t('firemap.popupBiome'))}: ${escapePopupText(spot.biome)}</span><br/>`
        : ''
      const detailLink = onOpenFireDetail
        ? `<button type="button" class="airbr-fire-detail-btn" style="font-size:11px;color:#3b82f6;text-decoration:underline;display:inline-block;margin-top:6px;cursor:pointer;background:none;border:none;padding:0;font-family:inherit" data-airbr-fire-id="${escapeAttr(spot.id)}">${escapePopupText(t('firemap.viewFireDetailLink'))}</button>`
        : `<a href="/mapa-queimadas?foco=${encodeURIComponent(spot.id)}" style="font-size:11px;color:#3b82f6;text-decoration:underline;display:inline-block;margin-top:6px">${escapePopupText(t('firemap.viewFireDetailLink'))}</a>`

      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.85,
        color: '#fff',
        weight: 0.5,
        opacity: 0.6,
      })
      marker.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e;min-width:140px">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:0.05em">
              🔥 ${escapePopupText(t('firemap.popupFireTitle'))}
            </strong><br/>
            ${stateLine}
            ${nearestBlock}
            <span style="font-size:12px">${escapePopupText(t('firemap.popupIntensity'))}: <b>${escapePopupText(label)}</b></span><br/>
            ${biomeLine}
            <span style="font-size:11px;color:#666">${escapePopupText(t('firemap.popupSource'))}</span><br/>
            ${detailLink}
          </div>`,
      )

      if (onOpenFireDetail) {
        marker.on('popupopen', () => {
          const btn = marker.getPopup()?.getElement()?.querySelector('button.airbr-fire-detail-btn')
          if (!btn) return
          const id = btn.getAttribute('data-airbr-fire-id')
          if (!id) return
          const handler = (e: Event) => {
            e.preventDefault()
            onOpenFireDetail(id)
          }
          btn.addEventListener('click', handler)
          marker.once('popupremove', () => btn.removeEventListener('click', handler))
        })
      }

      marker.addTo(fireLayerRef.current)
    })

    if (showFires) fireLayerRef.current.addTo(map)
  }, [fires, showFires, cities, t, i18n.language, onOpenFireDetail])

  // Deforestation — PRODES alerts from API (same source as dashboard)
  useEffect(() => {
    deforestLayerRef.current.clearLayers()
    deforestationAlerts.forEach((alert: DeforestationAlertApi) => {
      if (alert.lat == null || alert.lng == null) return
      const nearestCity = getTopNearestByHaversine(alert.lat, alert.lng, cities, 1)[0] ?? null
      const radiusM = Math.sqrt(alert.areaHa * 10_000 / Math.PI)
      const intensity = Math.min(1, alert.areaHa / 50_000)
      const green = Math.round(180 + 75 * (1 - intensity))
      const color = `rgb(0, ${green}, 0)`
      const detectedLabel = new Date(alert.detectedAt).toLocaleDateString(i18n.language)
      const nearestLine = nearestCity
        ? `<span style="font-size:11px">${escapePopupText(t('firemap.popupDeforestNearest'))}: <b>${escapePopupText(nearestCity.name)}</b> (${escapePopupText(nearestCity.state)})</span><br/>`
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
            🌳 <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px">${escapePopupText(t('firemap.popupDeforestTitle'))} · ${escapePopupText(alert.state)}</strong><br/>
            ${alert.biome ? `<span style="font-size:11px">${escapePopupText(t('firemap.popupBiome'))}: ${escapePopupText(alert.biome)}</span><br/>` : ''}
            <span style="font-size:11px">${escapePopupText(t('firemap.popupArea'))}: <strong>${alert.areaHa.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} ha</strong></span><br/>
            <span style="font-size:10px;color:#666">${escapePopupText(t('firemap.popupReference'))}: ${escapePopupText(detectedLabel)}</span><br/>
            ${nearestLine}
            <span style="font-size:10px;color:#666">${escapePopupText(t('firemap.popupDeforestSource'))}</span>
          </div>`,
        )
        .addTo(deforestLayerRef.current)
    })
  }, [deforestationAlerts, cities, t, i18n.language])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showDeforestation) deforestLayerRef.current.addTo(map)
    else deforestLayerRef.current.remove()
  }, [showDeforestation])

  // Toggle fire layer
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showFires) fireLayerRef.current.addTo(map)
    else fireLayerRef.current.remove()
  }, [showFires])

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
