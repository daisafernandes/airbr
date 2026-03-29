import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OmsComplianceBadge } from '@components/ui/OmsComplianceBadge';
import { useIsMobile } from '@hooks/use-mobile';
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
export const RankingTable = ({ cities, className }) => {
    const [sortKey, setSortKey] = useState('aqi');
    const [sortDir, setSortDir] = useState('desc');
    const isMobile = useIsMobile();
    const handleSort = (key) => {
        if (key === sortKey) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        }
        else {
            setSortKey(key);
            setSortDir(key === 'aqi' ? 'desc' : 'asc');
        }
    };
    const sorted = [...cities].sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'aqi')
            cmp = a.aqi - b.aqi;
        else if (sortKey === 'name')
            cmp = a.name.localeCompare(b.name);
        else if (sortKey === 'state')
            cmp = a.state.localeCompare(b.state);
        else if (sortKey === 'region')
            cmp = a.region.localeCompare(b.region);
        return sortDir === 'asc' ? cmp : -cmp;
    });
    const SortIcon = ({ k }) => {
        if (k !== sortKey)
            return _jsx(ArrowUpDown, { className: "w-3 h-3 opacity-40" });
        return sortDir === 'asc' ? _jsx(ArrowUp, { className: "w-3 h-3" }) : _jsx(ArrowDown, { className: "w-3 h-3" });
    };
    const SortBtn = ({ k, label }) => (_jsxs("button", { onClick: () => handleSort(k), className: cn('flex items-center gap-1 text-xs font-mono uppercase tracking-wider transition-colors', k === sortKey ? 'text-primary' : 'text-muted-foreground hover:text-foreground'), children: [label, _jsx(SortIcon, { k: k })] }));
    if (isMobile) {
        return (_jsx("div", { className: cn('space-y-2', className), children: sorted.map((city, idx) => {
                const color = getAQIColor(city.aqi);
                return (_jsxs("div", { className: "bg-card border border-border rounded p-3 flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-mono font-bold text-muted-foreground w-7 text-right flex-shrink-0", children: idx + 1 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-body font-semibold text-foreground text-sm", children: city.name }), _jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [city.state, " \u00B7 ", city.region] })] }), _jsx(OmsComplianceBadge, { compliant: city.omsCompliant, size: "sm", className: "mt-1" })] }), _jsxs("div", { className: "flex-shrink-0 text-right", children: [_jsx("span", { className: "font-mono text-2xl font-bold leading-none", style: { color }, children: city.aqi }), _jsx("p", { className: "text-[9px] font-mono text-muted-foreground mt-0.5", children: "AQI" })] })] }, city.name));
            }) }));
    }
    return (_jsx("div", { className: cn('bg-card border border-border rounded overflow-hidden', className), children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border bg-muted/40", children: [_jsx("th", { className: "px-4 py-3 text-left w-12", children: _jsx("span", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground", children: "#" }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsx(SortBtn, { k: "name", label: "Cidade" }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsx(SortBtn, { k: "state", label: "Estado" }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsx(SortBtn, { k: "region", label: "Regi\u00E3o" }) }), _jsx("th", { className: "px-4 py-3 text-right", children: _jsx(SortBtn, { k: "aqi", label: "AQI" }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsx("span", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground", children: "PM2.5" }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsx("span", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground", children: "OMS" }) })] }) }), _jsx("tbody", { children: sorted.map((city, idx) => {
                        const color = getAQIColor(city.aqi);
                        const pm25 = city.pollutants.find(p => p.key === 'pm25');
                        return (_jsxs("tr", { className: "border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0", children: [_jsx("td", { className: "px-4 py-3 font-mono text-muted-foreground text-sm", children: idx + 1 }), _jsx("td", { className: "px-4 py-3 font-body font-semibold text-foreground", children: city.name }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: city.state }), _jsx("td", { className: "px-4 py-3 font-body text-xs text-muted-foreground", children: city.region }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("span", { className: "font-mono font-bold text-lg leading-none", style: { color }, children: city.aqi }) }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: pm25 ? `${pm25.value} µg/m³` : '—' }), _jsx("td", { className: "px-4 py-3", children: _jsx(OmsComplianceBadge, { compliant: city.omsCompliant, size: "sm" }) })] }, city.name));
                    }) })] }) }));
};
