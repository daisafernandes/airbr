import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { useCity } from '@hooks/useCity';
import { CitySearchBar } from './CitySearchBar';
import { OmsComplianceBadge } from './OmsComplianceBadge';
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
function getAQILabel(aqi) {
    if (aqi <= 50)
        return 'Bom';
    if (aqi <= 100)
        return 'Moderado';
    if (aqi <= 150)
        return 'Sensíveis';
    if (aqi <= 200)
        return 'Ruim';
    if (aqi <= 300)
        return 'Muito ruim';
    return 'Perigoso';
}
function MiniGauge({ aqi }) {
    const color = getAQIColor(aqi);
    const label = getAQILabel(aqi);
    const size = 120;
    const cx = size / 2;
    const cy = size / 2 + 8;
    const r = 46;
    const startAngle = 210;
    const totalDeg = 240;
    const fillDeg = (Math.min(aqi, 500) / 500) * totalDeg;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const pointOnArc = (deg) => ({
        x: cx + r * Math.cos(toRad(deg)),
        y: cy + r * Math.sin(toRad(deg)),
    });
    const trackStart = pointOnArc(startAngle);
    const trackEnd = pointOnArc(startAngle + totalDeg);
    const fillEnd = pointOnArc(startAngle + fillDeg);
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("svg", { width: size, height: size - 8, viewBox: `0 0 ${size} ${size}`, children: [_jsx("path", { d: `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`, fill: "none", stroke: "rgba(255,255,255,0.08)", strokeWidth: 8, strokeLinecap: "round" }), fillDeg > 0 && (_jsx("path", { d: `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillDeg > 180 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`, fill: "none", stroke: color, strokeWidth: 8, strokeLinecap: "round" })), _jsx("text", { x: cx, y: cy - 2, textAnchor: "middle", dominantBaseline: "middle", fontSize: 22, fontWeight: "700", fontFamily: "'DM Mono',monospace", fill: color, children: aqi }), _jsx("text", { x: cx, y: cy + 14, textAnchor: "middle", dominantBaseline: "middle", fontSize: 9, fontFamily: "'DM Sans',sans-serif", fill: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", children: "AQI" })] }), _jsx("span", { className: "text-[10px] font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide", style: { background: `${color}20`, color }, children: label })] }));
}
function PollutantBar({ label, valueA, valueB, unit, limit }) {
    const vA = valueA ?? 0;
    const vB = valueB ?? 0;
    const max = Math.max(vA, vB, limit) * 1.2;
    const colorA = vA > limit ? '#ef4444' : '#4af0c4';
    const colorB = vB > limit ? '#ef4444' : '#facc15';
    return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-[10px] font-mono text-muted-foreground", children: [_jsx("span", { className: "uppercase tracking-wider", children: label }), _jsxs("span", { className: "text-[9px]", children: ["OMS: ", limit, " ", unit] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-10 text-right font-mono text-xs", style: { color: colorA }, children: vA > 0 ? vA.toFixed(1) : '—' }), _jsx("div", { className: "flex-1 h-2 bg-border rounded-full overflow-hidden relative", children: _jsx("div", { className: "absolute left-0 top-0 h-full rounded-full", style: { width: `${(vA / max) * 100}%`, background: colorA, opacity: 0.7 } }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-10 text-right font-mono text-xs", style: { color: colorB }, children: vB > 0 ? vB.toFixed(1) : '—' }), _jsx("div", { className: "flex-1 h-2 bg-border rounded-full overflow-hidden relative", children: _jsx("div", { className: "absolute left-0 top-0 h-full rounded-full", style: { width: `${(vB / max) * 100}%`, background: colorB, opacity: 0.7 } }) })] })] }));
}
function CityColumn({ city }) {
    const aqi = city.latestAqi?.aqi ?? 0;
    const pm25 = city.latestAqi?.pm25 ?? null;
    const omsCompliant = pm25 !== null ? pm25 <= 5 : false;
    return { city, aqi, pm25, omsCompliant };
}
export const ComparisonPanel = ({ cityA, cityB, onChangeCityA, onChangeCityB, onClose }) => {
    const { data: dataA, isLoading: loadingA } = useCity(cityA);
    const { data: dataB, isLoading: loadingB } = useCity(cityB);
    const colA = dataA ? CityColumn({ city: dataA }) : null;
    const colB = dataB ? CityColumn({ city: dataB }) : null;
    const pollutants = [
        { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', limit: 5 },
        { key: 'pm10', label: 'PM10', unit: 'µg/m³', limit: 15 },
        { key: 'no2', label: 'NO₂', unit: 'µg/m³', limit: 10 },
        { key: 'o3', label: 'O₃', unit: 'µg/m³', limit: 60 },
        { key: 'co', label: 'CO', unit: 'mg/m³', limit: 4 },
    ];
    return (_jsxs("div", { className: "w-[360px] flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] space-y-3 animate-fade-in", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-heading text-xl tracking-wide text-foreground", children: "COMPARAR CIDADES" }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-primary uppercase tracking-wider mb-1.5", children: "Cidade A" }), _jsx(CitySearchBar, { onSelect: (id) => onChangeCityA(id), placeholder: "Selecionar..." })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1.5", children: "Cidade B" }), _jsx(CitySearchBar, { onSelect: (id) => onChangeCityB(id), placeholder: "Selecionar..." })] })] })] }), (colA || colB || loadingA || loadingB) && (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "\u00CDNDICE DE QUALIDADE DO AR" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "flex flex-col items-center gap-2", children: loadingA ? (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("span", { className: "text-xs text-muted-foreground font-mono animate-pulse", children: "Carregando..." }) })) : colA ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground text-center truncate w-full", children: colA.city.name }), _jsx(MiniGauge, { aqi: colA.aqi }), _jsx(OmsComplianceBadge, { compliant: colA.omsCompliant, size: "md" })] })) : (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Selecione a cidade A" }) })) }), _jsx("div", { className: "flex flex-col items-center gap-2", children: loadingB ? (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("span", { className: "text-xs text-muted-foreground font-mono animate-pulse", children: "Carregando..." }) })) : colB ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground text-center truncate w-full", children: colB.city.name }), _jsx(MiniGauge, { aqi: colB.aqi }), _jsx(OmsComplianceBadge, { compliant: colB.omsCompliant, size: "md" })] })) : (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Selecione a cidade B" }) })) })] })] })), colA && colB && (_jsxs("div", { className: "bg-card border border-border rounded p-4 space-y-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: "POLUENTES" }), _jsxs("div", { className: "flex items-center gap-4 text-[10px] font-mono", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-1.5 rounded-full bg-primary inline-block" }), colA.city.name] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-1.5 rounded-full bg-yellow-400 inline-block" }), colB.city.name] })] }), pollutants.map(p => (_jsx(PollutantBar, { label: p.label, valueA: colA.city.latestAqi?.[p.key] ?? null, valueB: colB.city.latestAqi?.[p.key] ?? null, unit: p.unit, limit: p.limit }, p.key)))] }))] }));
};
