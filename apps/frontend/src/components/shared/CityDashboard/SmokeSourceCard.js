import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
export const SmokeSourceCard = ({ lat, lng, windDirection, windSpeed, nearbyFires }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const { t } = useTranslation();
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current)
            return;
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
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        L.circleMarker([lat, lng], {
            radius: 7,
            fillColor: '#4af0c4',
            fillOpacity: 0.9,
            color: '#4af0c4',
            weight: 2,
            opacity: 0.6,
        }).addTo(map);
        nearbyFires.forEach(fire => {
            L.circleMarker([fire.lat, fire.lng], {
                radius: 5,
                fillColor: '#ff4500',
                fillOpacity: 0.8,
                color: '#ff6a00',
                weight: 1.5,
            }).addTo(map);
        });
        const rad = (windDirection - 90) * (Math.PI / 180);
        const arrowLen = 0.8;
        const endLat = lat + arrowLen * Math.cos((windDirection) * Math.PI / 180) * -1;
        const endLng = lng + arrowLen * Math.sin((windDirection) * Math.PI / 180);
        L.polyline([[lat, lng], [endLat, endLng]], {
            color: '#facc15',
            weight: 2,
            opacity: 0.8,
            dashArray: '4 3',
        }).addTo(map);
        const arrowSize = 0.15;
        const perpRad = rad + Math.PI / 2;
        const tipLat = endLat;
        const tipLng = endLng;
        const left = [tipLat - arrowSize * Math.cos(perpRad), tipLng - arrowSize * Math.sin(perpRad)];
        const right = [tipLat + arrowSize * Math.cos(perpRad), tipLng + arrowSize * Math.sin(perpRad)];
        const tip = [tipLat + arrowSize * 1.5 * Math.cos(rad), tipLng + arrowSize * 1.5 * Math.sin(rad)];
        L.polygon([left, right, tip], {
            color: '#facc15',
            fillColor: '#facc15',
            fillOpacity: 0.9,
            weight: 1,
        }).addTo(map);
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [lat, lng, windDirection, nearbyFires]);
    const compassLabel = (deg) => {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[Math.round(deg / 45) % 8] ?? 'N';
    };
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-1", children: t('cityDashboard.smokeSource') }), _jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [t('cityDashboard.wind'), ": ", _jsxs("span", { className: "font-mono text-foreground", children: [compassLabel(windDirection), " \u00B7 ", windSpeed, " km/h"] })] }), _jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [t('cityDashboard.fireFoci'), ": ", _jsx("span", { className: "font-mono text-accent", children: nearbyFires.length })] })] }), _jsx("div", { className: "rounded overflow-hidden border border-border/50", style: { height: 130 }, children: _jsx("div", { ref: mapRef, className: "w-full h-full" }) }), _jsxs("div", { className: "flex items-center gap-3 mt-2 text-[10px] text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-[#4af0c4]" }), " ", t('cityDashboard.cityMarker')] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-[#ff4500]" }), " ", t('cityDashboard.fireFocusMarker')] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "inline-block w-3 h-0.5 bg-yellow-400 opacity-80" }), " ", t('cityDashboard.windArrow')] })] })] }));
};
