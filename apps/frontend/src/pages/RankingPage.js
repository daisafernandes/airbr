import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCities } from '@hooks/useCities';
import { useIsMobile } from '@hooks/use-mobile';
import { LiveIndicator } from '@components/shared/LiveIndicator';
import { OMSCompliancePanel } from '@components/shared/OMSCompliancePanel';
import { RankingTable } from '@components/shared/RankingTable';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { formatDateTime } from '@utils/formatters';
const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
export const RankingPage = () => {
    const isMobile = useIsMobile();
    const [sortMode, setSortMode] = useState('polluted');
    const [regionFilter, setRegionFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const { t } = useTranslation();
    const { data: cities = [], isLoading } = useCities();
    const states = useMemo(() => {
        const set = new Set(cities.map(c => c.state));
        return Array.from(set).sort();
    }, [cities]);
    const filteredAndSorted = useMemo(() => {
        let list = [...cities];
        if (regionFilter !== 'all') {
            list = list.filter(c => c.region === regionFilter);
        }
        if (stateFilter !== 'all') {
            list = list.filter(c => c.state === stateFilter);
        }
        list.sort((a, b) => {
            const aAqi = a.latestAqi?.aqi ?? 0;
            const bAqi = b.latestAqi?.aqi ?? 0;
            return sortMode === 'polluted' ? bAqi - aAqi : aAqi - bAqi;
        });
        return list;
    }, [cities, regionFilter, stateFilter, sortMode]);
    const stats = useMemo(() => {
        if (!cities.length)
            return null;
        const withAqi = cities.filter(c => c.latestAqi);
        const avg = withAqi.length
            ? Math.round(withAqi.reduce((s, c) => s + (c.latestAqi?.aqi ?? 0), 0) / withAqi.length)
            : 0;
        const compliant = withAqi.filter(c => (c.latestAqi?.pm25 ?? 9999) <= 5).length;
        const worst = [...withAqi].sort((a, b) => (b.latestAqi?.aqi ?? 0) - (a.latestAqi?.aqi ?? 0))[0];
        return { avg, compliant, total: cities.length, worst };
    }, [cities]);
    const lastUpdate = formatDateTime(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '20%' } }), _jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsxs("nav", { className: "hidden sm:flex items-center gap-1", children: [_jsx(Link, { to: "/", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: t('nav.dashboard') }), _jsx("span", { className: "px-3 py-1.5 text-xs font-body text-primary border-b border-primary font-semibold", children: t('nav.ranking') }), _jsx(Link, { to: "/mapa-queimadas", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: t('nav.fireMap') }), _jsx(Link, { to: "/guia", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: t('nav.guide') })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LanguageSelector, {}), _jsx(LiveIndicator, {})] })] }) }), _jsxs("main", { className: "pt-20 pb-8 px-4 max-w-[1400px] mx-auto relative z-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-heading text-4xl sm:text-5xl tracking-wide text-foreground", children: t('ranking.title') }), _jsxs("p", { className: "text-sm text-muted-foreground font-body mt-1", children: [t('ranking.subtitle'), stats && ` · ${stats.total} ${t('ranking.city', { count: stats.total }).replace(/\d+ /, '')}`] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6", children: [_jsxs("div", { className: "bg-card border border-border rounded p-3", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: t('ranking.avgAqi') }), isLoading ? (_jsx("div", { className: "h-8 bg-muted animate-pulse rounded w-16" })) : (_jsx("p", { className: "font-mono font-bold text-2xl text-foreground", children: stats?.avg ?? '—' }))] }), _jsxs("div", { className: "bg-card border border-border rounded p-3", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: t('ranking.omsCompliant') }), isLoading ? (_jsx("div", { className: "h-8 bg-muted animate-pulse rounded w-20" })) : (_jsxs("p", { className: "font-mono font-bold text-2xl text-green-400", children: [stats?.compliant ?? '—', _jsxs("span", { className: "text-sm text-muted-foreground font-normal", children: ["/", stats?.total ?? '—'] })] }))] }), _jsxs("div", { className: "bg-card border border-border rounded p-3 col-span-2 sm:col-span-1", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: t('ranking.mostPolluted') }), isLoading ? (_jsx("div", { className: "h-6 bg-muted animate-pulse rounded w-32" })) : (_jsxs("p", { className: "font-body font-semibold text-foreground", children: [stats?.worst?.name ?? '—', stats?.worst && (_jsxs("span", { className: "text-sm text-muted-foreground font-normal ml-1.5", children: ["AQI ", stats.worst.latestAqi?.aqi] }))] }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4", children: [_jsxs("div", { className: "flex items-center bg-muted border border-border rounded overflow-hidden shrink-0", children: [_jsx("button", { onClick: () => setSortMode('polluted'), className: `flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${sortMode === 'polluted'
                                            ? 'bg-accent/15 text-accent border-r border-border'
                                            : 'text-muted-foreground hover:text-foreground border-r border-border'}`, children: t('ranking.morePolluted') }), _jsx("button", { onClick: () => setSortMode('clean'), className: `flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${sortMode === 'clean' ? 'bg-green-500/15 text-green-400' : 'text-muted-foreground hover:text-foreground'}`, children: t('ranking.cleanerAir') })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("button", { onClick: () => setRegionFilter('all'), className: `px-2.5 py-1 text-xs font-body rounded border transition-colors ${regionFilter === 'all'
                                            ? 'bg-primary/15 border-primary/40 text-primary'
                                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: t('ranking.all') }), REGIONS.map(r => (_jsx("button", { onClick: () => { setRegionFilter(r); setStateFilter('all'); }, className: `px-2.5 py-1 text-xs font-body rounded border transition-colors ${regionFilter === r
                                            ? 'bg-primary/15 border-primary/40 text-primary'
                                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: r }, r)))] }), _jsxs("select", { value: stateFilter, onChange: e => setStateFilter(e.target.value), className: "bg-muted border border-border rounded px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:ml-auto", children: [_jsx("option", { value: "all", children: t('ranking.allStates') }), states.map(s => (_jsx("option", { value: s, children: s }, s)))] })] }), _jsxs("div", { className: "flex items-center gap-1.5 mb-3 text-xs text-muted-foreground font-mono", children: [_jsx(ArrowDownUp, { className: "w-3.5 h-3.5" }), filteredAndSorted.length, " ", filteredAndSorted.length !== 1 ? t('ranking.city', { count: 2 }) : t('ranking.city', { count: 1 }), " \u00B7", ' ', sortMode === 'polluted' ? t('ranking.mostPollutedFirst') : t('ranking.leastPollutedFirst')] }), isLoading ? (_jsx("div", { className: "space-y-2", children: Array.from({ length: 8 }).map((_, i) => (_jsx("div", { className: "bg-card border border-border rounded p-3 h-14 animate-pulse" }, i))) })) : filteredAndSorted.length > 0 ? (_jsx(RankingTable, { cities: filteredAndSorted, isMobile: isMobile })) : (_jsx("div", { className: "bg-card border border-border rounded p-8 text-center", children: _jsx("p", { className: "text-muted-foreground font-body", children: t('ranking.noResults') }) })), _jsx("div", { className: "mt-8", children: _jsx(OMSCompliancePanel, {}) }), _jsxs("footer", { className: "mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border gap-2", children: [_jsxs("span", { className: "font-mono", children: [t('common.lastUpdate'), ": ", lastUpdate] }), _jsxs("span", { children: [t('common.sources'), ": IQAir \u00B7 AQICN \u00B7 CETESB \u00B7 DATASUS \u00B7 IBGE \u00B7 Open-Meteo"] })] })] })] }));
};
