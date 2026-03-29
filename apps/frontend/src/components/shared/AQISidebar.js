import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown } from 'lucide-react';
const mostPolluted = [
    { city: 'Cubatão', state: 'SP', aqi: 156 },
    { city: 'Manaus', state: 'AM', aqi: 142 },
    { city: 'São Paulo', state: 'SP', aqi: 128 },
    { city: 'Porto Velho', state: 'RO', aqi: 119 },
    { city: 'Rio Branco', state: 'AC', aqi: 108 },
];
const cleanest = [
    { city: 'Florianópolis', state: 'SC', aqi: 18 },
    { city: 'Campos do Jordão', state: 'SP', aqi: 22 },
    { city: 'Gramado', state: 'RS', aqi: 25 },
    { city: 'Bonito', state: 'MS', aqi: 28 },
    { city: 'Chapada dos Veadeiros', state: 'GO', aqi: 31 },
];
function getAQIColor(aqi) {
    if (aqi <= 50)
        return 'text-primary';
    if (aqi <= 100)
        return 'text-yellow-400';
    if (aqi <= 150)
        return 'text-accent';
    if (aqi <= 200)
        return 'text-red-500';
    return 'text-purple-500';
}
function getAQIBg(aqi) {
    if (aqi <= 50)
        return 'bg-primary/10';
    if (aqi <= 100)
        return 'bg-yellow-400/10';
    if (aqi <= 150)
        return 'bg-accent/10';
    if (aqi <= 200)
        return 'bg-red-500/10';
    return 'bg-purple-500/10';
}
const RankingCard = ({ title, icon, data }) => (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [icon, _jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: title })] }), _jsx("div", { className: "space-y-2", children: data.map((item, i) => (_jsxs("div", { className: "flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors", style: { animationDelay: `${i * 80}ms` }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs text-muted-foreground w-4", children: i + 1 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-foreground", children: item.city }), _jsx("span", { className: "text-xs text-muted-foreground ml-1", children: item.state })] })] }), _jsx("span", { className: `font-mono text-sm font-medium px-2 py-0.5 rounded ${getAQIColor(item.aqi)} ${getAQIBg(item.aqi)}`, children: item.aqi })] }, item.city))) })] }));
export const AQISidebar = () => {
    return (_jsxs("div", { className: "w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1", children: [_jsx(RankingCard, { title: "MAIS POLU\u00CDDAS", icon: _jsx(TrendingUp, { className: "w-4 h-4 text-accent" }), data: mostPolluted }), _jsx(RankingCard, { title: "AR MAIS LIMPO", icon: _jsx(TrendingDown, { className: "w-4 h-4 text-primary" }), data: cleanest }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "\u00CDNDICE AQI" }), _jsx("div", { className: "space-y-1.5 text-xs", children: [
                            { label: 'Bom', range: '0–50', color: 'bg-primary' },
                            { label: 'Moderado', range: '51–100', color: 'bg-yellow-400' },
                            { label: 'Ruim p/ sensíveis', range: '101–150', color: 'bg-accent' },
                            { label: 'Ruim', range: '151–200', color: 'bg-red-500' },
                            { label: 'Muito ruim', range: '201–300', color: 'bg-purple-500' },
                            { label: 'Perigoso', range: '300+', color: 'bg-rose-900' },
                        ].map(item => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-3 h-3 rounded-sm ${item.color}` }), _jsx("span", { className: "text-muted-foreground", children: item.label }), _jsx("span", { className: "font-mono text-muted-foreground ml-auto", children: item.range })] }, item.label))) })] })] }));
};
