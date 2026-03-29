import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (_jsxs("div", { className: "bg-card border border-border rounded px-2 py-1.5 text-xs", children: [_jsx("p", { className: "text-muted-foreground", children: label }), _jsxs("p", { className: "font-mono font-bold text-foreground", children: ["AQI ", payload[0]?.value] })] }));
    }
    return null;
};
export const AQIHistoryChart = ({ history, hideTitleBar = false }) => {
    return (_jsxs("div", { className: hideTitleBar ? '' : 'bg-card border border-border rounded p-4', children: [!hideTitleBar && _jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "HIST\u00D3RICO 7 DIAS" }), _jsx(ResponsiveContainer, { width: "100%", height: 100, children: _jsxs(AreaChart, { data: history, margin: { top: 4, right: 4, left: -28, bottom: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "aqiGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#4af0c4", stopOpacity: 0.25 }), _jsx("stop", { offset: "95%", stopColor: "#4af0c4", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "day", tick: { fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }, axisLine: false, tickLine: false, domain: ['auto', 'auto'] }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Area, { type: "monotone", dataKey: "aqi", stroke: "#4af0c4", strokeWidth: 2, fill: "url(#aqiGrad)", dot: { r: 3, fill: '#4af0c4', strokeWidth: 0 }, activeDot: { r: 4, fill: '#4af0c4' } })] }) })] }));
};
