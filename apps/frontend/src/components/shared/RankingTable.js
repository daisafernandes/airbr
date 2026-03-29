import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OmsComplianceBadge } from './OmsComplianceBadge';
import { getAQILabel } from '@utils/aqiInfo';
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
export const RankingTable = ({ cities, onCityClick, isMobile = false }) => {
    const { t } = useTranslation();
    if (isMobile) {
        return (_jsx("div", { className: "space-y-2", children: cities.map((city, idx) => {
                const aqi = city.latestAqi?.aqi ?? 0;
                const color = getAQIColor(aqi);
                const pm25 = city.latestAqi?.pm25 ?? null;
                const omsCompliant = pm25 !== null ? pm25 <= 5 : false;
                return (_jsxs("button", { onClick: () => onCityClick?.(city.id), className: "w-full bg-card border border-border rounded p-3 flex items-center gap-3 hover:border-primary/30 transition-colors text-left", children: [_jsxs("span", { className: "w-7 text-center font-mono text-sm text-muted-foreground shrink-0", children: ["#", idx + 1] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-body font-semibold text-foreground text-sm truncate", children: city.name }), _jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [city.state, " \u00B7 ", city.region] })] }), _jsxs("div", { className: "flex flex-col items-end gap-1 shrink-0", children: [_jsx("span", { className: "font-mono font-bold text-base", style: { color }, children: aqi }), _jsx(OmsComplianceBadge, { compliant: omsCompliant })] })] }, city.id));
            }) }));
    }
    return (_jsx("div", { className: "overflow-x-auto rounded border border-border", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted/60 border-b border-border", children: [_jsx("th", { className: "text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider w-12", children: "#" }), _jsx("th", { className: "text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: t('ranking.city') }), _jsx("th", { className: "text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: t('ranking.state') }), _jsx("th", { className: "text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: t('ranking.region') }), _jsx("th", { className: "text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: t('ranking.aqi') }), _jsx("th", { className: "text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: "PM2.5" }), _jsx("th", { className: "text-center px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider", children: "OMS" })] }) }), _jsx("tbody", { children: cities.map((city, idx) => {
                        const aqi = city.latestAqi?.aqi ?? 0;
                        const color = getAQIColor(aqi);
                        const pm25 = city.latestAqi?.pm25 ?? null;
                        const omsCompliant = pm25 !== null ? pm25 <= 5 : false;
                        return (_jsxs("tr", { onClick: () => onCityClick?.(city.id), className: `border-b border-border/50 transition-colors ${onCityClick ? 'cursor-pointer hover:bg-muted/40' : ''}`, children: [_jsx("td", { className: "px-4 py-3 font-mono text-muted-foreground", children: idx + 1 }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-3 h-3 text-muted-foreground shrink-0" }), _jsx(Link, { to: `/cidade/${city.id}`, className: "font-body font-medium text-foreground hover:text-primary transition-colors", onClick: e => e.stopPropagation(), children: city.name })] }) }), _jsx("td", { className: "px-4 py-3 font-mono text-sm text-muted-foreground", children: city.state }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-xs font-body text-muted-foreground", children: city.region }) }), _jsxs("td", { className: "px-4 py-3 text-right", children: [_jsx("span", { className: "font-mono font-bold text-base", style: { color }, children: aqi }), _jsx("span", { className: "text-xs text-muted-foreground ml-1 hidden xl:inline", children: getAQILabel(aqi, t) })] }), _jsx("td", { className: "px-4 py-3 text-right font-mono text-sm text-foreground", children: pm25 !== null ? `${pm25.toFixed(1)} µg/m³` : '—' }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx(OmsComplianceBadge, { compliant: omsCompliant }) })] }, city.id));
                    }) })] }) }));
};
