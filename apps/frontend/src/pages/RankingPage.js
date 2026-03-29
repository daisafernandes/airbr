import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LiveIndicator } from '@components/shared/LiveIndicator';
import { RankingTable } from '@components/shared/RankingTable';
import { CITIES_DATA, getUniqueStates, getUniqueRegions } from '@data/mockCities';
import { useIsMobile } from '@hooks/use-mobile';
import { ArrowDownUp, Wind } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
const REGION_LABELS = {
    Norte: 'Norte',
    Nordeste: 'Nordeste',
    'Centro-Oeste': 'Centro-Oeste',
    Sudeste: 'Sudeste',
    Sul: 'Sul',
};
export const RankingPage = () => {
    const isMobile = useIsMobile();
    const [sortMode, setSortMode] = useState('polluted');
    const [regionFilter, setRegionFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const regions = getUniqueRegions();
    const states = getUniqueStates();
    const filteredAndSorted = useMemo(() => {
        let cities = [...CITIES_DATA];
        if (regionFilter !== 'all') {
            cities = cities.filter(c => c.region === regionFilter);
        }
        if (stateFilter !== 'all') {
            cities = cities.filter(c => c.state === stateFilter);
        }
        cities.sort((a, b) => sortMode === 'polluted' ? b.aqi - a.aqi : a.aqi - b.aqi);
        return cities;
    }, [regionFilter, stateFilter, sortMode]);
    const stats = useMemo(() => {
        const compliant = CITIES_DATA.filter(c => c.omsCompliant).length;
        const avg = Math.round(CITIES_DATA.reduce((s, c) => s + c.aqi, 0) / CITIES_DATA.length);
        const worst = [...CITIES_DATA].sort((a, b) => b.aqi - a.aqi)[0];
        return { compliant, avg, worst };
    }, []);
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '20%' } }), _jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsxs("nav", { className: "flex items-center gap-1 hidden sm:flex", children: [_jsx(Link, { to: "/", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Dashboard" }), _jsx("span", { className: "px-3 py-1.5 text-xs font-body text-primary border-b border-primary font-semibold", children: "Ranking" }), _jsx(Link, { to: "/mapa-queimadas", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Mapa Queimadas" })] }), _jsx(LiveIndicator, {})] }) }), _jsxs("main", { className: "pt-20 pb-8 px-4 max-w-[1400px] mx-auto relative z-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-heading text-4xl sm:text-5xl tracking-wide text-foreground", children: "RANKING NACIONAL" }), _jsxs("p", { className: "text-sm text-muted-foreground font-body mt-1", children: ["Qualidade do ar em todas as cidades monitoradas \u00B7 ", CITIES_DATA.length, " cidades"] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6", children: [_jsxs("div", { className: "bg-card border border-border rounded p-3", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: "AQI M\u00E9dio Nacional" }), _jsx("p", { className: "font-mono font-bold text-2xl text-foreground", children: stats.avg })] }), _jsxs("div", { className: "bg-card border border-border rounded p-3", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: "Conformes OMS" }), _jsxs("p", { className: "font-mono font-bold text-2xl text-green-400", children: [stats.compliant, _jsxs("span", { className: "text-sm text-muted-foreground font-normal", children: ["/", CITIES_DATA.length] })] })] }), _jsxs("div", { className: "bg-card border border-border rounded p-3 col-span-2 sm:col-span-1", children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1", children: "Mais Polu\u00EDda" }), _jsxs("p", { className: "font-body font-semibold text-foreground", children: [stats.worst.name, _jsxs("span", { className: "text-sm text-muted-foreground font-normal ml-1.5", children: ["AQI ", stats.worst.aqi] })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4", children: [_jsxs("div", { className: "flex items-center bg-muted border border-border rounded overflow-hidden shrink-0", children: [_jsx("button", { onClick: () => setSortMode('polluted'), className: `flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${sortMode === 'polluted'
                                            ? 'bg-accent/15 text-accent border-r border-border'
                                            : 'text-muted-foreground hover:text-foreground border-r border-border'}`, children: "Mais Polu\u00EDdas" }), _jsx("button", { onClick: () => setSortMode('clean'), className: `flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${sortMode === 'clean' ? 'bg-green-500/15 text-green-400' : 'text-muted-foreground hover:text-foreground'}`, children: "Mais Limpas" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("button", { onClick: () => setRegionFilter('all'), className: `px-2.5 py-1 text-xs font-body rounded border transition-colors ${regionFilter === 'all'
                                            ? 'bg-primary/15 border-primary/40 text-primary'
                                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: "Todas" }), regions.map(r => (_jsx("button", { onClick: () => { setRegionFilter(r); setStateFilter('all'); }, className: `px-2.5 py-1 text-xs font-body rounded border transition-colors ${regionFilter === r
                                            ? 'bg-primary/15 border-primary/40 text-primary'
                                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: REGION_LABELS[r] }, r)))] }), _jsxs("select", { value: stateFilter, onChange: e => setStateFilter(e.target.value), className: "bg-muted border border-border rounded px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:ml-auto", children: [_jsx("option", { value: "all", children: "Todos os estados" }), states.map(s => (_jsx("option", { value: s, children: s }, s)))] })] }), _jsxs("div", { className: "flex items-center gap-1.5 mb-3 text-xs text-muted-foreground font-mono", children: [_jsx(ArrowDownUp, { className: "w-3.5 h-3.5" }), filteredAndSorted.length, " cidade", filteredAndSorted.length !== 1 ? 's' : '', " \u00B7", ' ', sortMode === 'polluted' ? 'Maior AQI primeiro' : 'Menor AQI primeiro'] }), filteredAndSorted.length > 0 ? (_jsx(RankingTable, { cities: filteredAndSorted, isMobile: isMobile })) : (_jsx("div", { className: "bg-card border border-border rounded p-8 text-center", children: _jsx("p", { className: "text-muted-foreground font-body", children: "Nenhuma cidade encontrada com os filtros selecionados." }) })), _jsxs("footer", { className: "mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border gap-2", children: [_jsxs("span", { className: "font-mono", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })] }), _jsx("span", { children: "Fontes: IQAir \u00B7 AQICN \u00B7 CETESB \u00B7 DATASUS \u00B7 IBGE \u00B7 Open-Meteo" })] })] })] }));
};
