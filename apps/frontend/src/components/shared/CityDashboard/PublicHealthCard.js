import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (_jsx("div", { className: "bg-card border border-border rounded px-2 py-1 text-xs", children: _jsxs("span", { className: "font-mono text-foreground", children: [payload[0]?.value, " intern."] }) }));
    }
    return null;
};
export const PublicHealthCard = ({ hospitalizations, history }) => {
    const prevMonth = history[history.length - 2] ?? hospitalizations;
    const delta = hospitalizations - prevMonth;
    const isUp = delta > 0;
    const chartData = history.map((v, i) => ({ month: i + 1, value: v }));
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Activity, { className: "w-4 h-4 text-red-400" }), _jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: "SA\u00DADE P\u00DABLICA" })] }), _jsxs("div", { className: "flex items-end justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-3xl font-bold text-foreground", children: hospitalizations.toLocaleString('pt-BR') }), _jsx("p", { className: "text-[10px] text-muted-foreground font-body mt-0.5", children: "Interna\u00E7\u00F5es respirat\u00F3rias \u00B7 \u00FAltimo m\u00EAs" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-xs font-mono font-bold", style: { color: isUp ? '#ef4444' : '#4af0c4' }, children: [isUp ? '+' : '', delta] }), _jsx("p", { className: "text-[10px] text-muted-foreground font-body", children: "vs m\u00EAs ant." })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 48, children: _jsxs(BarChart, { data: chartData, margin: { top: 0, right: 0, left: 0, bottom: 0 }, children: [_jsx(Tooltip, { content: _jsx(CustomTooltip, {}), cursor: { fill: 'rgba(255,255,255,0.05)' } }), _jsx(Bar, { dataKey: "value", fill: "#ef4444", opacity: 0.6, radius: [2, 2, 0, 0] })] }) }), _jsx("p", { className: "text-[9px] text-muted-foreground font-body mt-1 text-right", children: "Dados simulados \u00B7 \u00FAltimos 12 meses" })] }));
};
