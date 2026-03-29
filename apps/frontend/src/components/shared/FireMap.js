import { jsx as _jsx } from "react/jsx-runtime";
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { GLOBAL_FIRE_SPOTS, GLOBAL_DEFORESTATION_AREAS, CITIES_DATA, getAQIColor } from '@data/mockCities';
function getFireColor(spot) {
    if (spot.intensity === 'high')
        return '#ef4444';
    if (spot.intensity === 'medium')
        return '#ff9f4a';
    return '#facc15';
}
function getFireRadius(spot) {
    if (spot.intensity === 'high')
        return 9;
    if (spot.intensity === 'medium')
        return 7;
    return 5;
}
export const FireMap = ({ showFires, showDeforestation, showStations, stateFilter, periodDays }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fireLayerRef = useRef(L.layerGroup());
    const deforestLayerRef = useRef(L.layerGroup());
    const stationsLayerRef = useRef(L.layerGroup());
    // Initialise map once
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
        // Populate fire spots layer
        GLOBAL_FIRE_SPOTS.forEach(spot => {
            const color = getFireColor(spot);
            const radius = getFireRadius(spot);
            L.circleMarker([spot.lat, spot.lng], {
                radius,
                fillColor: color,
                fillOpacity: 0.85,
                color: '#fff',
                weight: 0.5,
                opacity: 0.6,
            })
                .bindPopup(`<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e;min-width:140px">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:0.05em">
              🔥 Foco de Queimada
            </strong><br/>
            <span style="font-size:12px">Intensidade: <b>${spot.intensity === 'high' ? 'Alta' : spot.intensity === 'medium' ? 'Média' : 'Baixa'}</b></span><br/>
            <span style="font-size:11px;color:#666">Fonte: INPE/BDQueimadas</span>
          </div>`)
                .addTo(fireLayerRef.current);
        });
        // Populate deforestation layer
        GLOBAL_DEFORESTATION_AREAS.forEach(area => {
            L.circle([area.lat, area.lng], {
                radius: area.radius,
                fillColor: '#22c55e',
                fillOpacity: 0.12,
                color: '#22c55e',
                weight: 1.5,
                opacity: 0.4,
                dashArray: '5 5',
            })
                .bindPopup(`<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:14px">🌳 Área Desmatada</strong><br/>
            <span style="font-size:11px">Fonte: PRODES/INPE</span>
          </div>`)
                .addTo(deforestLayerRef.current);
        });
        // Populate monitoring stations (city markers)
        CITIES_DATA.forEach(city => {
            const color = getAQIColor(city.aqi);
            L.circleMarker([city.lat, city.lng], {
                radius: 5,
                fillColor: color,
                fillOpacity: 0.8,
                color: '#fff',
                weight: 1,
                opacity: 0.5,
            })
                .bindPopup(`<div style="font-family:'DM Sans',sans-serif;color:#0a0f1e">
            <strong style="font-family:'Bebas Neue',sans-serif;font-size:15px">${city.name}, ${city.state}</strong><br/>
            <span style="font-family:'DM Mono',monospace;font-size:18px;color:${color}">AQI ${city.aqi}</span><br/>
            <span style="font-size:11px">Estação oficial · CETESB/IBAMA</span>
          </div>`)
                .addTo(stationsLayerRef.current);
        });
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);
    // Toggle fire layer
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showFires)
            fireLayerRef.current.addTo(map);
        else
            fireLayerRef.current.remove();
    }, [showFires]);
    // Toggle deforestation layer
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showDeforestation)
            deforestLayerRef.current.addTo(map);
        else
            deforestLayerRef.current.remove();
    }, [showDeforestation]);
    // Toggle stations layer
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (showStations)
            stationsLayerRef.current.addTo(map);
        else
            stationsLayerRef.current.remove();
    }, [showStations]);
    // Fly to state when filter changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !stateFilter)
            return;
        const city = CITIES_DATA.find(c => c.state === stateFilter);
        if (city) {
            map.flyTo([city.lat, city.lng], 7, { duration: 1.2 });
        }
        else {
            map.flyTo([-14.24, -51.93], 4, { duration: 1.2 });
        }
    }, [stateFilter]);
    return (_jsx("div", { ref: mapRef, className: "w-full h-full" }));
};
