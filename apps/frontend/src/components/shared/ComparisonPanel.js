import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AQIGauge } from './CityDashboard/AQIGauge';
import { OmsComplianceBadge } from '@components/ui/OmsComplianceBadge';
import { cn } from '@/lib/utils';
function getBarColor(ratio) {
    if (ratio <= 0.5)
        return '#4af0c4';
    if (ratio <= 1.0)
        return '#facc15';
    if (ratio <= 1.5)
        return '#ff9f4a';
    if (ratio <= 2.0)
        return '#ef4444';
    return '#a855f7';
}
function getAQIColor(aqi) {
    if (aqi <= 50)
        return '#4af0c4';
    if (aqi <= 100)
        return '#facc15';
    if (aqi <= 150)
        return '#ff9f4a';
    if (aqi <= 200)
        return '#ef4444';
    return '#a855f7';
}
const CityColumn = ({ city }) => (_jsxs("div", { className: "flex-1 min-w-0 flex flex-col items-center gap-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-heading text-xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-xs font-mono text-muted-foreground uppercase tracking-widest mt-0.5", children: [city.state, " \u00B7 ", city.region] })] }), _jsx(AQIGauge, { aqi: city.aqi, label: city.aqiLabel }), _jsx(OmsComplianceBadge, { compliant: city.omsCompliant }), _jsx("div", { className: "w-full space-y-2", children: city.pollutants.map(p => {
                const ratio = p.value / p.whoLimit;
                const color = getBarColor(ratio);
                return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-[10px] font-mono", children: [_jsx("span", { className: "text-muted-foreground uppercase", children: p.label }), _jsxs("span", { style: { color }, children: [p.value, " ", p.unit] })] }), _jsx("div", { className: "w-full h-1.5 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${Math.min((ratio / 2) * 100, 100)}%`, background: color } }) })] }, p.key));
            }) }), _jsxs("div", { className: "w-full bg-muted/40 border border-border/50 rounded p-3 space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-xs font-mono", children: [_jsx("span", { className: "text-muted-foreground", children: "Seguran\u00E7a outdoor" }), _jsxs("span", { className: "text-foreground font-semibold", children: [city.outdoorSafetyScore, "/10"] })] }), _jsxs("div", { className: "flex justify-between text-xs font-mono", children: [_jsx("span", { className: "text-muted-foreground", children: "\u00CDndice UV" }), _jsx("span", { className: "text-foreground", children: city.uvIndex })] }), _jsxs("div", { className: "flex justify-between text-xs font-mono", children: [_jsx("span", { className: "text-muted-foreground", children: "P\u00F3len" }), _jsxs("span", { className: "text-foreground", children: [city.pollenLevel, "/10"] })] }), _jsxs("div", { className: "flex justify-between text-xs font-mono", children: [_jsx("span", { className: "text-muted-foreground", children: "Hospitaliza\u00E7\u00F5es" }), _jsx("span", { className: "text-foreground", children: city.hospitalizations })] })] })] }));
export const ComparisonPanel = ({ cityA, cityB, className }) => {
    const colorA = getAQIColor(cityA.aqi);
    const colorB = getAQIColor(cityB.aqi);
    const winner = cityA.aqi <= cityB.aqi ? cityA : cityB;
    return (_jsxs("div", { className: cn('bg-card border border-border rounded p-4 space-y-4', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-heading text-xl tracking-wide text-foreground", children: "COMPARAR CIDADES" }), _jsxs("div", { className: "text-xs font-mono text-muted-foreground text-right", children: ["Ar mais limpo:", ' ', _jsx("span", { className: "font-semibold", style: { color: winner === cityA ? colorA : colorB }, children: winner.name })] })] }), _jsxs("div", { className: "flex gap-4 relative", children: [_jsx(CityColumn, { city: cityA }), _jsxs("div", { className: "flex-shrink-0 flex flex-col items-center justify-center gap-2 py-4", children: [_jsx("div", { className: "w-px flex-1 bg-border" }), _jsx("span", { className: "text-xs font-mono text-muted-foreground px-1", children: "VS" }), _jsx("div", { className: "w-px flex-1 bg-border" })] }), _jsx(CityColumn, { city: cityB })] })] }));
};
