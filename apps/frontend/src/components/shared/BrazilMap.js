import { jsx as _jsx } from "react/jsx-runtime";
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { CITIES_DATA, GLOBAL_FIRE_SPOTS, GLOBAL_DEFORESTATION_AREAS, getAQIColor } from '@data/mockCities';
function getAQILabel(aqi) {
    if (aqi <= 50)
        return 'Bom';
    if (aqi <= 100)
        return 'Moderado';
    if (aqi <= 150)
        return 'Ruim p/ sensíveis';
    if (aqi <= 200)
        return 'Ruim';
    return 'Muito ruim';
}
function getFireColor(spot) {
    if (spot.intensity === 'high')
        return '#ef4444';
    if (spot.intensity === 'medium')
        return '#ff9f4a';
    return '#facc15';
}
export const BrazilMap = ({ selectedCity, showFires, showDeforestation, showStations }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fireLayerRef = useRef(L.layerGroup());
    const deforestLayerRef = useRef(L.layerGroup());
    const stationsLayerRef = useRef(L.layerGroup());
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current)
            return;
        const map = L.map(mapRef.current, {
            center: [-14.24, -51.93],
            zoom: 4,
            zoomControl: true,
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 18,
        }).addTo(map);
        // City AQI circles (always visible)
        CITIES_DATA.forEach(city => {
            const color = getAQIColor(city.aqi);
            const radius = Math.max(6, city.aqi / 12);
            L.circleMarker([city.lat, city.lng], {
                radius,
                fillColor: color,
                fillOpacity: 0.75,
                color,
                weight: 1,
                opacity: 0.4,
            })
                .bindPopup(`<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.05em">
              ${city.name}, ${city.state}
            </strong><br/>
            <span style="font-family:'DM Mono',monospace;font-size:20px;color:${color}">
              AQI ${city.aqi}
            </span><br/>
            <span style="font-size:12px">${getAQILabel(city.aqi)}</span>
          </div>`)
                .addTo(map);
        });
        // Fire spots layer
        GLOBAL_FIRE_SPOTS.forEach(spot => {
            const color = getFireColor(spot);
            L.circleMarker([spot.lat, spot.lng], {
                radius: spot.intensity === 'high' ? 8 : spot.intensity === 'medium' ? 6 : 4,
                fillColor: color,
                fillOpacity: 0.8,
                color: '#fff',
                weight: 0.5,
                opacity: 0.5,
            })
                .bindPopup(`<span style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            🔥 Foco de queimada · ${spot.intensity === 'high' ? 'Alta intensidade' : spot.intensity === 'medium' ? 'Média intensidade' : 'Baixa intensidade'}
          </span>`)
                .addTo(fireLayerRef.current);
        });
        // Deforestation layer
        GLOBAL_DEFORESTATION_AREAS.forEach(area => {
            L.circle([area.lat, area.lng], {
                radius: area.radius,
                fillColor: '#22c55e',
                fillOpacity: 0.15,
                color: '#22c55e',
                weight: 1,
                opacity: 0.3,
                dashArray: '4 4',
            })
                .bindPopup('<span style="font-family:\'DM Sans\',sans-serif;color:#0a0f1e">🌳 Área de desmatamento detectado · PRODES/INPE</span>')
                .addTo(deforestLayerRef.current);
        });
        // Official monitoring stations layer
        CITIES_DATA.forEach(city => {
            L.circleMarker([city.lat, city.lng], {
                radius: 4,
                fillColor: '#60a5fa',
                fillOpacity: 0.9,
                color: '#93c5fd',
                weight: 1.5,
                opacity: 0.7,
            })
                .bindPopup(`<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px">
              📡 Estação Oficial — ${city.name}
            </strong><br/>
            <span style="font-size:11px">CETESB/IBAMA · AQI ${city.aqi}</span>
          </div>`)
                .addTo(stationsLayerRef.current);
        });
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showFires)
            fireLayerRef.current.addTo(map);
        else
            fireLayerRef.current.remove();
    }, [showFires]);
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showDeforestation)
            deforestLayerRef.current.addTo(map);
        else
            deforestLayerRef.current.remove();
    }, [showDeforestation]);
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showStations)
            stationsLayerRef.current.addTo(map);
        else
            stationsLayerRef.current.remove();
    }, [showStations]);
    useEffect(() => {
        if (!selectedCity || !mapInstanceRef.current)
            return;
        const city = CITIES_DATA.find(c => c.name === selectedCity);
        if (city) {
            mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.5 });
        }
    }, [selectedCity]);
    return (_jsx("div", { className: "flex-1 rounded border border-border overflow-hidden relative", children: _jsx("div", { ref: mapRef, className: "w-full", style: { minHeight: 'calc(100vh - 140px)' } }) }));
};
