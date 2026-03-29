import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRanking } from '@hooks/useRanking';
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
const RankingCard = ({ title, icon, data, loading, }) => (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [icon, _jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: title })] }) }), _jsx("div", { className: "space-y-2", children: loading
                ? Array.from({ length: 5 }).map((_, i) => (_jsxs("div", { className: "flex items-center justify-between py-1.5 px-2 rounded", children: [_jsx("div", { className: "h-4 bg-muted animate-pulse rounded w-32" }), _jsx("div", { className: "h-4 bg-muted animate-pulse rounded w-10" })] }, i)))
                : data.map((item, i) => (_jsxs("div", { className: "flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs text-muted-foreground w-4", children: i + 1 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-foreground", children: item.cityName }), _jsx("span", { className: "text-xs text-muted-foreground ml-1", children: item.state })] })] }), _jsx("span", { className: `font-mono text-sm font-medium px-2 py-0.5 rounded ${getAQIColor(item.aqi)} ${getAQIBg(item.aqi)}`, children: item.aqi })] }, item.cityId))) })] }));
export const AQISidebar = () => {
    const { data, isLoading } = useRanking();
    const mostPolluted = data?.mostPolluted.slice(0, 5) ?? [];
    const leastPolluted = data?.leastPolluted.slice(0, 5) ?? [];
    return (_jsxs("div", { className: "w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1", children: [_jsx(RankingCard, { title: "MAIS POLU\u00CDDAS", icon: _jsx(TrendingUp, { className: "w-4 h-4 text-accent" }), data: mostPolluted, loading: isLoading }), _jsx(RankingCard, { title: "AR MAIS LIMPO", icon: _jsx(TrendingDown, { className: "w-4 h-4 text-primary" }), data: leastPolluted, loading: isLoading }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "\u00CDNDICE AQI" }), _jsx("div", { className: "space-y-1.5 text-xs", children: [
                            { label: 'Bom', range: '0–50', color: 'bg-primary' },
                            { label: 'Moderado', range: '51–100', color: 'bg-yellow-400' },
                            { label: 'Ruim p/ sensíveis', range: '101–150', color: 'bg-accent' },
                            { label: 'Ruim', range: '151–200', color: 'bg-red-500' },
                            { label: 'Muito ruim', range: '201–300', color: 'bg-purple-500' },
                            { label: 'Perigoso', range: '300+', color: 'bg-rose-900' },
                        ].map(item => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-3 h-3 rounded-sm ${item.color}` }), _jsx("span", { className: "text-muted-foreground", children: item.label }), _jsx("span", { className: "font-mono text-muted-foreground ml-auto", children: item.range })] }, item.label))) }), _jsx(Link, { to: "/ranking", className: "mt-3 flex items-center justify-center w-full px-3 py-2 text-xs font-body border border-border rounded hover:bg-muted hover:text-foreground text-muted-foreground transition-colors", children: "Ver ranking completo \u2192" })] })] }));
};
