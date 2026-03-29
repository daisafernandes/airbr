import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AQI_BANDS } from '@utils/aqiInfo';
function getAQIColor(aqi) {
    if (aqi <= 50)
        return '#4af0c4';
    if (aqi <= 100)
        return '#facc15';
    if (aqi <= 150)
        return '#ff9f4a';
    if (aqi <= 200)
        return '#ef4444';
    if (aqi <= 300)
        return '#a855f7';
    return '#be123c';
}
export const AQIGauge = ({ aqi, label }) => {
    const size = 180;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const r = 72;
    // Arc spans 240° — from 210° to 30° (going clockwise through the top)
    const startAngle = 210;
    const totalDeg = 240;
    const clampedAqi = Math.min(aqi, 500);
    const fillDeg = (clampedAqi / 500) * totalDeg;
    const color = getAQIColor(aqi);
    const toRad = (deg) => (deg * Math.PI) / 180;
    const pointOnArc = (deg) => ({
        x: cx + r * Math.cos(toRad(deg)),
        y: cy + r * Math.sin(toRad(deg)),
    });
    const arcPath = (deg, stroke, opacity = 1) => {
        const start = pointOnArc(startAngle);
        const end = pointOnArc(startAngle + deg);
        const largeArc = deg > 180 ? 1 : 0;
        return (_jsx("path", { d: `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`, fill: "none", stroke: stroke, strokeWidth: 10, strokeLinecap: "round", opacity: opacity }));
    };
    // Tick marks at major levels: 0, 100, 200, 300, 400, 500
    const ticks = [0, 100, 200, 300, 400, 500].map(val => {
        const deg = startAngle + (val / 500) * totalDeg;
        const inner = { x: cx + (r - 7) * Math.cos(toRad(deg)), y: cy + (r - 7) * Math.sin(toRad(deg)) };
        const outer = { x: cx + (r + 2) * Math.cos(toRad(deg)), y: cy + (r + 2) * Math.sin(toRad(deg)) };
        return { inner, outer, val };
    });
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("svg", { width: size, height: size - 10, viewBox: `0 0 ${size} ${size}`, children: [_jsx("defs", { children: _jsxs("filter", { id: "glow", children: [_jsx("feGaussianBlur", { stdDeviation: "3", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }) }), arcPath(totalDeg, 'rgba(255,255,255,0.08)'), fillDeg > 0 && (_jsx("path", { d: (() => {
                            const start = pointOnArc(startAngle);
                            const end = pointOnArc(startAngle + fillDeg);
                            const largeArc = fillDeg > 180 ? 1 : 0;
                            return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
                        })(), fill: "none", stroke: color, strokeWidth: 10, strokeLinecap: "round", filter: "url(#glow)" })), ticks.map(({ inner, outer, val }) => (_jsx("line", { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, stroke: "rgba(255,255,255,0.3)", strokeWidth: 1.5 }, val))), _jsx("text", { x: cx, y: cy - 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: 38, fontWeight: "700", fontFamily: "'DM Mono', monospace", fill: color, children: aqi }), _jsx("text", { x: cx, y: cy + 26, textAnchor: "middle", dominantBaseline: "middle", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fill: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", children: "AQI" })] }), _jsx("span", { className: "mt-1 text-xs font-body font-semibold px-3 py-1 rounded-full tracking-wide uppercase", style: { background: `${color}20`, color }, children: label }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("button", { className: "mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors", children: [_jsx(Info, { className: "w-3 h-3" }), "O que \u00E9 AQI?"] }) }), _jsxs(TooltipContent, { side: "bottom", className: "max-w-[260px] p-3 space-y-2", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: "\u00CDndice de Qualidade do Ar (AQI)" }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: "Escala de 0 a 500 que resume a concentra\u00E7\u00E3o dos principais poluentes. Quanto maior, pior a qualidade do ar." }), _jsx("div", { className: "space-y-1 pt-1", children: AQI_BANDS.map(band => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full shrink-0", style: { background: band.color } }), _jsxs("span", { className: "text-[10px] font-mono", style: { color: band.color }, children: [band.min, "\u2013", band.max === 500 ? '500+' : band.max] }), _jsx("span", { className: "text-[10px] text-muted-foreground", children: band.label })] }, band.label))) }), _jsx(Link, { to: "/guia", className: "text-[10px] text-primary hover:underline block pt-1", children: "Ver guia completo \u2192" })] })] })] }));
};
