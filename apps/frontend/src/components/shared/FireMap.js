import { jsx as _jsx } from "react/jsx-runtime";
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { useCities } from '@hooks/useCities';
import { GLOBAL_DEFORESTATION_AREAS } from '@data/mockCities';
function getAQIColor(aqi) {
    if (aqi <= 50)
        return '#22c55e';
    if (aqi <= 100)
        return '#eab308';
    if (aqi <= 150)
        return '#f97316';
    if (aqi <= 200)
        return '#ef4444';
    if (aqi <= 300)
        return '#a855f7';
    return '#7f1d1d';
}
function getFireColor(intensity) {
    if (intensity === null)
        return '#facc15';
    if (intensity >= 70)
        return '#ef4444';
    if (intensity >= 40)
        return '#ff9f4a';
    return '#facc15';
}
function getFireRadius(intensity) {
    if (intensity === null)
        return 5;
    if (intensity >= 70)
        return 9;
    if (intensity >= 40)
        return 7;
    return 5;
}
function getFireLabel(intensity) {
    if (intensity === null)
        return 'Não informada';
    if (intensity >= 70)
        return 'Alta';
    if (intensity >= 40)
        return 'Média';
    return 'Baixa';
}
export const FireMap = ({ showFires, showDeforestation, showStations, stateFilter, fires = [] }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fireLayerRef = useRef(L.layerGroup());
    const deforestLayerRef = useRef(L.layerGroup());
    const stationsLayerRef = useRef(L.layerGroup());
    const { data: cities = [] } = useCities();
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
        // Deforestation layer — static mock (TODO Fase 4: PRODES API)
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
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);
    // Redraw fire spots when fires data changes
    useEffect(() => {
        fireLayerRef.current.clearLayers();
        const map = mapInstanceRef.current;
        if (!map)
            return;
        fires.forEach(spot => {
            const color = getFireColor(spot.intensity);
            const radius = getFireRadius(spot.intensity);
            const label = getFireLabel(spot.intensity);
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
            ${spot.state ? `<span style="font-size:12px">Estado: <b>${spot.state}</b></span><br/>` : ''}
            <span style="font-size:12px">Intensidade: <b>${label}</b></span><br/>
            ${spot.biome ? `<span style="font-size:11px">Bioma: ${spot.biome}</span><br/>` : ''}
            <span style="font-size:11px;color:#666">Fonte: INPE/BDQueimadas</span>
          </div>`)
                .addTo(fireLayerRef.current);
        });
        if (showFires)
            fireLayerRef.current.addTo(map);
    }, [fires, showFires]);
    // Redraw stations layer when city API data loads
    useEffect(() => {
        stationsLayerRef.current.clearLayers();
        const map = mapInstanceRef.current;
        if (!map)
            return;
        cities.forEach(city => {
            const aqi = city.latestAqi?.aqi ?? 0;
            const color = getAQIColor(aqi);
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
            <span style="font-family:'DM Mono',monospace;font-size:18px;color:${color}">AQI ${aqi}</span><br/>
            <span style="font-size:11px">Estação oficial · ${city.source}</span>
          </div>`)
                .addTo(stationsLayerRef.current);
        });
        if (showStations)
            stationsLayerRef.current.addTo(map);
    }, [cities, showStations]);
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
        if (!map)
            return;
        if (!stateFilter) {
            map.flyTo([-14.24, -51.93], 4, { duration: 1.2 });
            return;
        }
        const city = cities.find(c => c.state === stateFilter);
        if (city) {
            map.flyTo([city.lat, city.lng], 7, { duration: 1.2 });
        }
    }, [stateFilter, cities]);
    return _jsx("div", { ref: mapRef, className: "w-full h-full" });
};
