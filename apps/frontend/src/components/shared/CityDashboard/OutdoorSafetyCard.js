import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sun, Wind, Flower2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UV_LEVELS, POLLEN_LEVELS } from '@utils/aqiInfo';
function getSafetyLabel(score) {
    if (score >= 8)
        return { label: 'Seguro', color: '#4af0c4' };
    if (score >= 6)
        return { label: 'Moderado', color: '#facc15' };
    if (score >= 4)
        return { label: 'Atenção', color: '#ff9f4a' };
    if (score >= 2)
        return { label: 'Perigoso', color: '#ef4444' };
    return { label: 'Crítico', color: '#a855f7' };
}
function getUVLabel(uv) {
    if (uv <= 2)
        return 'Baixo';
    if (uv <= 5)
        return 'Moderado';
    if (uv <= 7)
        return 'Alto';
    if (uv <= 10)
        return 'Muito Alto';
    return 'Extremo';
}
function getPollenLabel(level) {
    if (level <= 2)
        return 'Baixo';
    if (level <= 5)
        return 'Moderado';
    if (level <= 7)
        return 'Alto';
    return 'Muito Alto';
}
const MetricRow = ({ icon, label, value, sublabel, barFill, color, tooltip }) => (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [icon, _jsx("span", { children: label }), tooltip && (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("button", { className: "text-muted-foreground/50 hover:text-muted-foreground transition-colors", children: _jsx(Info, { className: "w-3 h-3" }) }) }), _jsx(TooltipContent, { side: "top", className: "max-w-[220px] p-3", children: tooltip })] }))] }), _jsxs("span", { className: "font-mono text-sm font-bold", style: { color }, children: [value, " ", _jsx("span", { className: "text-[10px] font-normal text-muted-foreground", children: sublabel })] })] }), _jsx("div", { className: "w-full h-1 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${barFill}%`, background: color } }) })] }));
const UVTooltip = () => (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: "\u00CDndice UV" }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: "Mede a intensidade da radia\u00E7\u00E3o ultravioleta solar. Valores altos aumentam o risco de queimaduras e danos \u00E0 pele." }), _jsx("div", { className: "space-y-0.5 pt-0.5", children: UV_LEVELS.map(level => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: level.color } }), _jsx("span", { className: "text-[10px] font-body", style: { color: level.color }, children: level.label }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["\u2014 ", level.recommendation] })] }, level.label))) })] }));
const PollenTooltip = () => (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: "N\u00EDvel de P\u00F3len" }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: "Concentra\u00E7\u00E3o de gr\u00E3os de p\u00F3len no ar. Pode desencadear alergias respirat\u00F3rias e agravar asma." }), _jsx("div", { className: "space-y-0.5 pt-0.5", children: POLLEN_LEVELS.map(level => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: level.color } }), _jsx("span", { className: "text-[10px] font-body", style: { color: level.color }, children: level.label }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["\u2014 ", level.recommendation] })] }, level.label))) })] }));
export const OutdoorSafetyCard = ({ score, uvIndex, pollenLevel, aqi }) => {
    const { label, color } = getSafetyLabel(score);
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "SEGURAN\u00C7A AO AR LIVRE" }), _jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "font-mono text-4xl font-bold", style: { color }, children: score.toFixed(1) }), _jsx("span", { className: "text-[9px] text-muted-foreground font-mono uppercase tracking-wider", children: "/ 10" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-body font-bold px-3 py-1 rounded-full uppercase tracking-wide", style: { background: `${color}20`, color }, children: label }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-body", children: "\u00CDndice composto: AQI + UV + P\u00F3len" })] })] }), _jsxs("div", { className: "space-y-2.5", children: [_jsx(MetricRow, { icon: _jsx(Wind, { className: "w-3.5 h-3.5" }), label: "Qualidade do ar", value: aqi, sublabel: "AQI", barFill: Math.min((aqi / 300) * 100, 100), color: aqi <= 50 ? '#4af0c4' : aqi <= 100 ? '#facc15' : aqi <= 150 ? '#ff9f4a' : '#ef4444' }), _jsx(MetricRow, { icon: _jsx(Sun, { className: "w-3.5 h-3.5" }), label: "\u00CDndice UV", value: uvIndex, sublabel: getUVLabel(uvIndex), barFill: (uvIndex / 11) * 100, color: uvIndex <= 2 ? '#4af0c4' : uvIndex <= 5 ? '#facc15' : uvIndex <= 7 ? '#ff9f4a' : '#ef4444', tooltip: _jsx(UVTooltip, {}) }), _jsx(MetricRow, { icon: _jsx(Flower2, { className: "w-3.5 h-3.5" }), label: "P\u00F3len", value: pollenLevel, sublabel: getPollenLabel(pollenLevel), barFill: (pollenLevel / 10) * 100, color: pollenLevel <= 2 ? '#4af0c4' : pollenLevel <= 5 ? '#facc15' : '#ff9f4a', tooltip: _jsx(PollenTooltip, {}) })] })] }));
};
