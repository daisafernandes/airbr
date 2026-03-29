import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOMSCompliance } from '@hooks/useOMSCompliance';
const OMS_LIMIT = 5;
function getPM25Color(pm25) {
    if (pm25 <= OMS_LIMIT)
        return '#4af0c4';
    if (pm25 <= 15)
        return '#facc15';
    if (pm25 <= 35)
        return '#ff9f4a';
    return '#ef4444';
}
export const OMSCompliancePanel = () => {
    const { data, isLoading } = useOMSCompliance();
    const { t } = useTranslation();
    const nonCompliant = data?.cities.filter(c => !c.compliant).slice(0, 10) ?? [];
    const compliantPct = data?.compliantPct ?? 0;
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-heading text-xl tracking-wide text-foreground", children: t('oms.compliance') }), _jsxs("p", { className: "text-xs text-muted-foreground font-body mt-0.5", children: [t('oms.limit'), ": ", OMS_LIMIT, " \u00B5g/m\u00B3 \u00B7 ", t('oms.monitoredCities')] })] }), !isLoading && data && (_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-mono text-2xl font-bold", style: { color: compliantPct >= 50 ? '#4af0c4' : '#ef4444' }, children: [compliantPct, "%"] }), _jsx("p", { className: "text-[10px] text-muted-foreground font-mono", children: t('oms.withinLimit') })] }))] }), !isLoading && data && (_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "w-full h-2 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all", style: {
                                width: `${compliantPct}%`,
                                background: compliantPct >= 50 ? '#4af0c4' : '#ff9f4a',
                            } }) }), _jsxs("div", { className: "flex justify-between mt-1 text-[10px] text-muted-foreground font-mono", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-3 h-3 text-green-400" }), data.cities.filter(c => c.compliant).length, " ", t('oms.compliant')] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ShieldAlert, { className: "w-3 h-3 text-red-400" }), data.cities.filter(c => !c.compliant).length, " ", t('oms.aboveLimit')] })] })] })), isLoading ? (_jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: "h-8 bg-muted animate-pulse rounded" }, i))) })) : nonCompliant.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2", children: t('oms.highestConcentrations') }), _jsx("div", { className: "space-y-1.5", children: nonCompliant.map((city, i) => {
                            const color = getPM25Color(city.pm25);
                            const barWidth = Math.min((city.pm25 / 50) * 100, 100);
                            return (_jsxs(Link, { to: `/cidade/${city.cityId}`, className: "flex items-center gap-2 group hover:bg-muted/40 rounded px-2 py-1 transition-colors", children: [_jsx("span", { className: "text-[10px] font-mono text-muted-foreground w-4 text-right shrink-0", children: i + 1 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-0.5", children: [_jsxs("span", { className: "text-xs font-body text-foreground truncate group-hover:text-primary transition-colors", children: [city.cityName, _jsxs("span", { className: "text-muted-foreground ml-1 text-[10px]", children: ["\u00B7 ", city.state] })] }), _jsxs("span", { className: "font-mono text-xs font-bold ml-2 shrink-0", style: { color }, children: [city.pm25.toFixed(1), " \u00B5g/m\u00B3"] })] }), _jsx("div", { className: "w-full h-1 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${barWidth}%`, background: color } }) })] })] }, city.cityId));
                        }) })] })) : data && data.cities.length > 0 ? (_jsxs("div", { className: "flex items-center gap-2 text-sm text-green-400 font-body py-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4" }), t('oms.allCompliant')] })) : (_jsx("p", { className: "text-xs text-muted-foreground font-body text-center py-4", children: t('oms.noData') })), _jsx("p", { className: "text-[9px] text-muted-foreground font-mono mt-3 text-right", children: t('oms.footer', { limit: OMS_LIMIT }) })] }));
};
