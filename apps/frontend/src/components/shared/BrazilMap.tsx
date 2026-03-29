import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapCity {
  name: string
  state: string
  lat: number
  lng: number
  aqi: number
}

const CITIES_DATA: MapCity[] = [
  { name: 'São Paulo', state: 'SP', lat: -23.55, lng: -46.63, aqi: 128 },
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.91, lng: -43.17, aqi: 85 },
  { name: 'Belo Horizonte', state: 'MG', lat: -19.92, lng: -43.94, aqi: 72 },
  { name: 'Brasília', state: 'DF', lat: -15.79, lng: -47.88, aqi: 45 },
  { name: 'Salvador', state: 'BA', lat: -12.97, lng: -38.51, aqi: 52 },
  { name: 'Fortaleza', state: 'CE', lat: -3.72, lng: -38.53, aqi: 61 },
  { name: 'Curitiba', state: 'PR', lat: -25.43, lng: -49.27, aqi: 38 },
  { name: 'Manaus', state: 'AM', lat: -3.12, lng: -60.02, aqi: 142 },
  { name: 'Recife', state: 'PE', lat: -8.05, lng: -34.87, aqi: 67 },
  { name: 'Porto Alegre', state: 'RS', lat: -30.03, lng: -51.23, aqi: 42 },
  { name: 'Belém', state: 'PA', lat: -1.46, lng: -48.50, aqi: 95 },
  { name: 'Goiânia', state: 'GO', lat: -16.68, lng: -49.25, aqi: 58 },
  { name: 'Cubatão', state: 'SP', lat: -23.88, lng: -46.42, aqi: 156 },
  { name: 'Porto Velho', state: 'RO', lat: -8.76, lng: -63.90, aqi: 119 },
  { name: 'Rio Branco', state: 'AC', lat: -9.97, lng: -67.81, aqi: 108 },
  { name: 'Florianópolis', state: 'SC', lat: -27.59, lng: -48.55, aqi: 18 },
  { name: 'Campo Grande', state: 'MS', lat: -20.44, lng: -54.65, aqi: 48 },
  { name: 'Cuiabá', state: 'MT', lat: -15.60, lng: -56.10, aqi: 89 },
  { name: 'Natal', state: 'RN', lat: -5.79, lng: -35.21, aqi: 44 },
  { name: 'São Luís', state: 'MA', lat: -2.53, lng: -44.28, aqi: 76 },
  { name: 'Maceió', state: 'AL', lat: -9.67, lng: -35.74, aqi: 55 },
  { name: 'Teresina', state: 'PI', lat: -5.09, lng: -42.80, aqi: 82 },
  { name: 'Palmas', state: 'TO', lat: -10.18, lng: -48.33, aqi: 91 },
  { name: 'Macapá', state: 'AP', lat: 0.03, lng: -51.07, aqi: 63 },
  { name: 'Boa Vista', state: 'RR', lat: 2.82, lng: -60.67, aqi: 37 },
]

const FIRE_SPOTS = [
  { lat: -8.5, lng: -63.0 },
  { lat: -10.2, lng: -48.5 },
  { lat: -12.5, lng: -55.0 },
  { lat: -7.0, lng: -49.0 },
  { lat: -15.5, lng: -47.0 },
  { lat: -3.5, lng: -55.0 },
  { lat: -9.0, lng: -67.5 },
  { lat: -13.0, lng: -50.0 },
]

const DEFORESTATION_SPOTS = [
  { lat: -3.0, lng: -59.0, radius: 50000 },
  { lat: -5.5, lng: -55.0, radius: 40000 },
  { lat: -8.0, lng: -63.5, radius: 35000 },
  { lat: -4.0, lng: -49.5, radius: 30000 },
  { lat: -10.0, lng: -56.0, radius: 38000 },
]

function getAQIFillColor(aqi: number): string {
  if (aqi <= 50) return '#4af0c4'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#ff9f4a'
  if (aqi <= 200) return '#ef4444'
  return '#a855f7'
}

function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Bom'
  if (aqi <= 100) return 'Moderado'
  if (aqi <= 150) return 'Ruim p/ sensíveis'
  if (aqi <= 200) return 'Ruim'
  return 'Muito ruim'
}

interface BrazilMapProps {
  selectedCity: string | null
  showFires: boolean
  showDeforestation: boolean
}

export const BrazilMap = ({ selectedCity, showFires, showDeforestation }: BrazilMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fireLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const deforestLayerRef = useRef<L.LayerGroup>(L.layerGroup())

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

    CITIES_DATA.forEach(city => {
      const color = getAQIFillColor(city.aqi)
      const radius = Math.max(6, city.aqi / 12)
      L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.75,
        color,
        weight: 1,
        opacity: 0.4,
      })
        .bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.05em">
              ${city.name}, ${city.state}
            </strong><br/>
            <span style="font-family:'DM Mono',monospace;font-size:20px;color:${color}">
              AQI ${city.aqi}
            </span><br/>
            <span style="font-size:12px">${getAQILabel(city.aqi)}</span>
          </div>`
        )
        .addTo(map)
    })

    FIRE_SPOTS.forEach(spot => {
      L.circleMarker([spot.lat, spot.lng], {
        radius: 5,
        fillColor: '#ff4500',
        fillOpacity: 0.7,
        color: '#ff6a00',
        weight: 2,
        opacity: 0.5,
      })
        .bindPopup('<span style="font-family:\'DM Sans\',sans-serif;color:#0a0f1e">🔥 Foco de queimada</span>')
        .addTo(fireLayerRef.current)
    })

    DEFORESTATION_SPOTS.forEach(spot => {
      L.circle([spot.lat, spot.lng], {
        radius: spot.radius,
        fillColor: '#22c55e',
        fillOpacity: 0.15,
        color: '#22c55e',
        weight: 1,
        opacity: 0.3,
        dashArray: '4 4',
      })
        .bindPopup('<span style="font-family:\'DM Sans\',sans-serif;color:#0a0f1e">🌳 Área de desmatamento detectado</span>')
        .addTo(deforestLayerRef.current)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showFires) {
      fireLayerRef.current.addTo(map)
    } else {
      fireLayerRef.current.remove()
    }
  }, [showFires])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showDeforestation) {
      deforestLayerRef.current.addTo(map)
    } else {
      deforestLayerRef.current.remove()
    }
  }, [showDeforestation])

  useEffect(() => {
    if (!selectedCity || !mapInstanceRef.current) return
    const city = CITIES_DATA.find(c => c.name === selectedCity)
    if (city) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.5 })
    }
  }, [selectedCity])

  return (
    <div className="flex-1 rounded border border-border overflow-hidden relative">
      <div ref={mapRef} className="w-full" style={{ minHeight: 'calc(100vh - 140px)' }} />
    </div>
  )
}
