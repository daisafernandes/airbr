import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { getCityByName, getAQIColor } from '@data/mockCities';
import { X } from 'lucide-react';
import { CitySearchBar } from './CitySearchBar';
import { OmsComplianceBadge } from './OmsComplianceBadge';
function MiniGauge({ aqi, label }) {
    const color = getAQIColor(aqi);
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
    const max = Math.max(valueA, valueB, limit) * 1.2;
    const colorA = valueA > limit ? '#ef4444' : '#4af0c4';
    const colorB = valueB > limit ? '#ef4444' : '#facc15';
    return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-[10px] font-mono text-muted-foreground", children: [_jsx("span", { className: "uppercase tracking-wider", children: label }), _jsxs("span", { className: "text-[9px]", children: ["OMS: ", limit, " ", unit] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-10 text-right font-mono text-xs", style: { color: colorA }, children: valueA }), _jsx("div", { className: "flex-1 h-2 bg-border rounded-full overflow-hidden relative", children: _jsx("div", { className: "absolute left-0 top-0 h-full rounded-full", style: { width: `${(valueA / max) * 100}%`, background: colorA, opacity: 0.7 } }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-10 text-right font-mono text-xs", style: { color: colorB }, children: valueB }), _jsx("div", { className: "flex-1 h-2 bg-border rounded-full overflow-hidden relative", children: _jsx("div", { className: "absolute left-0 top-0 h-full rounded-full", style: { width: `${(valueB / max) * 100}%`, background: colorB, opacity: 0.7 } }) })] })] }));
}
export const ComparisonPanel = ({ cityA, cityB, onChangeCityA, onChangeCityB, onClose }) => {
    const dataA = cityA ? getCityByName(cityA) : null;
    const dataB = cityB ? getCityByName(cityB) : null;
    return (_jsxs("div", { className: "w-[360px] flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] space-y-3 animate-fade-in", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-heading text-xl tracking-wide text-foreground", children: "COMPARAR CIDADES" }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-primary uppercase tracking-wider mb-1.5", children: "Cidade A" }), _jsx(CitySearchBar, { onSelect: onChangeCityA, placeholder: "Selecionar..." })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1.5", children: "Cidade B" }), _jsx(CitySearchBar, { onSelect: onChangeCityB, placeholder: "Selecionar..." })] })] })] }), (dataA || dataB) && (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "\u00CDNDICE DE QUALIDADE DO AR" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "flex flex-col items-center gap-2", children: dataA ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground text-center truncate w-full", children: dataA.name }), _jsx(MiniGauge, { aqi: dataA.aqi, label: dataA.aqiLabel }), _jsx(OmsComplianceBadge, { compliant: dataA.omsCompliant, size: "md" })] })) : (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Selecione a cidade A" }) })) }), _jsx("div", { className: "flex flex-col items-center gap-2", children: dataB ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground text-center truncate w-full", children: dataB.name }), _jsx(MiniGauge, { aqi: dataB.aqi, label: dataB.aqiLabel }), _jsx(OmsComplianceBadge, { compliant: dataB.omsCompliant, size: "md" })] })) : (_jsx("div", { className: "h-32 flex items-center justify-center", children: _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Selecione a cidade B" }) })) })] })] })), dataA && dataB && (_jsxs("div", { className: "bg-card border border-border rounded p-4 space-y-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: "POLUENTES" }), _jsxs("div", { className: "flex items-center gap-4 text-[10px] font-mono", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-1.5 rounded-full bg-primary inline-block" }), dataA.name] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-1.5 rounded-full bg-yellow-400 inline-block" }), dataB.name] })] }), dataA.pollutants.map(pA => {
                        const pB = dataB.pollutants.find(p => p.key === pA.key);
                        if (!pB)
                            return null;
                        return (_jsx(PollutantBar, { label: pA.label, valueA: pA.value, valueB: pB.value, unit: pA.unit, limit: pA.whoLimit }, pA.key));
                    })] })), dataA && dataB && (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "SEGURAN\u00C7A AO AR LIVRE" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [dataA, dataB].map((city, i) => {
                            const scoreColor = city.outdoorSafetyScore >= 7 ? '#4af0c4' : city.outdoorSafetyScore >= 4 ? '#facc15' : '#ef4444';
                            return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground text-center truncate w-full", children: city.name }), _jsxs("span", { className: "font-mono font-bold text-3xl", style: { color: scoreColor }, children: [city.outdoorSafetyScore, _jsx("span", { className: "text-sm text-muted-foreground", children: "/10" })] }), _jsxs("div", { className: "text-xs text-muted-foreground text-center space-y-0.5", children: [_jsxs("p", { children: ["UV: ", city.uvIndex] }), _jsxs("p", { children: ["P\u00F3len: ", city.pollenLevel, "/10"] })] })] }, i));
                        }) })] }))] }));
};
