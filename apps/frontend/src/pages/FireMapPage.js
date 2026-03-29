import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trees, Radio, SlidersHorizontal, Wind } from 'lucide-react';
import { FireMap } from '@components/shared/FireMap';
import { LiveIndicator } from '@components/shared/LiveIndicator';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, } from '@components/ui/drawer';
import { useFires } from '@hooks/useFires';
import { useCities } from '@hooks/useCities';
import { useIsMobile } from '@hooks/use-mobile';
const PERIOD_LABELS = {
    hoje: 'Hoje',
    '7d': '7 dias',
    '30d': '30 dias',
};
function ImpactCard({ fireCount, affectedCities, loading, }) {
    return (_jsx("div", { className: "bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Flame, { className: "w-4 h-4 text-accent mt-0.5 shrink-0" }), loading ? (_jsx("div", { className: "h-4 bg-muted animate-pulse rounded w-48" })) : (_jsxs("p", { className: "text-xs font-body text-foreground leading-snug", children: [_jsx("span", { className: "font-mono font-bold text-accent", children: fireCount }), " focos ativos est\u00E3o afetando a qualidade do ar em", ' ', _jsx("span", { className: "font-mono font-bold text-foreground", children: affectedCities }), " cidades"] }))] }) }));
}
function FilterControls({ stateFilter, onStateChange, period, onPeriodChange, showFires, onToggleFires, showDeforestation, onToggleDeforestation, showStations, onToggleStations, states, }) {
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2", children: "Per\u00EDodo" }), _jsx("div", { className: "flex gap-1.5", children: ['hoje', '7d', '30d'].map(p => (_jsx("button", { onClick: () => onPeriodChange(p), className: `px-3 py-1.5 text-xs font-body rounded border transition-colors ${period === p
                                ? 'bg-primary/15 border-primary/40 text-primary'
                                : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: PERIOD_LABELS[p] }, p))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2", children: "Estado" }), _jsxs("select", { value: stateFilter, onChange: e => onStateChange(e.target.value), className: "w-full bg-muted border border-border rounded px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary", children: [_jsx("option", { value: "", children: "Todo o Brasil" }), states.map(s => (_jsx("option", { value: s, children: s }, s)))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2", children: "Camadas" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: onToggleFires, className: `w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${showFires
                                    ? 'bg-accent/15 border-accent/40 text-accent'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Flame, { className: "w-3.5 h-3.5" }), "Focos de Queimada", showFires && _jsx("span", { className: "ml-auto text-[9px] font-mono bg-accent/20 px-1.5 py-0.5 rounded", children: "ON" })] }), _jsxs("button", { onClick: onToggleDeforestation, className: `w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${showDeforestation
                                    ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Trees, { className: "w-3.5 h-3.5" }), "Desmatamento (PRODES)", showDeforestation && _jsx("span", { className: "ml-auto text-[9px] font-mono bg-green-500/20 px-1.5 py-0.5 rounded", children: "ON" })] }), _jsxs("button", { onClick: onToggleStations, className: `w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${showStations
                                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Radio, { className: "w-3.5 h-3.5" }), "Esta\u00E7\u00F5es Oficiais", showStations && _jsx("span", { className: "ml-auto text-[9px] font-mono bg-blue-500/20 px-1.5 py-0.5 rounded", children: "ON" })] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2", children: "Intensidade dos focos" }), _jsx("div", { className: "space-y-1.5", children: [
                            { label: 'Alta', color: '#ef4444' },
                            { label: 'Média', color: '#ff9f4a' },
                            { label: 'Baixa', color: '#facc15' },
                        ].map(({ label, color }) => (_jsxs("div", { className: "flex items-center gap-2 text-xs font-body text-muted-foreground", children: [_jsx("span", { className: "w-3 h-3 rounded-full shrink-0", style: { background: color } }), label] }, label))) })] })] }));
}
export const FireMapPage = () => {
    const isMobile = useIsMobile();
    const [showFires, setShowFires] = useState(true);
    const [showDeforestation, setShowDeforestation] = useState(false);
    const [showStations, setShowStations] = useState(false);
    const [stateFilter, setStateFilter] = useState('');
    const [period, setPeriod] = useState('hoje');
    const { data: fires = [], isLoading: firesLoading } = useFires(stateFilter ? { state: stateFilter } : undefined);
    const { data: cities = [] } = useCities();
    const states = useMemo(() => {
        const set = new Set(cities.map(c => c.state));
        return Array.from(set).sort();
    }, [cities]);
    const impactStats = useMemo(() => {
        const fireCount = fires.length;
        const affectedStates = new Set(fires.filter(f => f.state).map(f => f.state));
        const affectedCities = cities.filter(c => stateFilter ? c.state === stateFilter : affectedStates.has(c.state)).length;
        return { fireCount, affectedCities };
    }, [fires, cities, stateFilter]);
    const filterControls = (_jsx(FilterControls, { stateFilter: stateFilter, onStateChange: setStateFilter, period: period, onPeriodChange: setPeriod, showFires: showFires, onToggleFires: () => setShowFires(v => !v), showDeforestation: showDeforestation, onToggleDeforestation: () => setShowDeforestation(v => !v), showStations: showStations, onToggleStations: () => setShowStations(v => !v), states: states }));
    return (_jsxs("div", { className: "h-screen flex flex-col bg-background overflow-hidden", children: [_jsx("header", { className: "shrink-0 bg-card/80 backdrop-blur-xl border-b border-border z-40", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsxs("nav", { className: "hidden sm:flex items-center gap-1", children: [_jsx(Link, { to: "/", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Dashboard" }), _jsx(Link, { to: "/ranking", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Ranking" }), _jsx("span", { className: "px-3 py-1.5 text-xs font-body text-accent border-b border-accent font-semibold", children: "Mapa Queimadas" }), _jsx(Link, { to: "/guia", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Guia" })] }), _jsx(LiveIndicator, {})] }) }), _jsxs("div", { className: "flex-1 flex overflow-hidden relative", children: [!isMobile && (_jsxs("aside", { className: "w-72 shrink-0 bg-card border-r border-border overflow-y-auto p-4 space-y-2 z-10", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "font-heading text-2xl tracking-wide text-foreground", children: "MAPA DE QUEIMADAS" }), _jsx("p", { className: "text-xs text-muted-foreground font-body mt-0.5", children: "Focos ativos \u00B7 INPE/BDQueimadas" })] }), _jsx(ImpactCard, { fireCount: impactStats.fireCount, affectedCities: impactStats.affectedCities, loading: firesLoading }), _jsx("div", { className: "mt-4", children: filterControls })] })), _jsxs("div", { className: "flex-1 relative", children: [_jsx(FireMap, { showFires: showFires, showDeforestation: showDeforestation, showStations: showStations, stateFilter: stateFilter, periodDays: period === 'hoje' ? 1 : period === '7d' ? 7 : 30, fires: fires }), isMobile && (_jsx("div", { className: "absolute top-4 left-4 right-4 z-20", children: _jsx(ImpactCard, { fireCount: impactStats.fireCount, affectedCities: impactStats.affectedCities, loading: firesLoading }) })), isMobile && (_jsxs(Drawer, { children: [_jsx(DrawerTrigger, { asChild: true, children: _jsxs("button", { className: "absolute bottom-6 right-4 z-20 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-xl text-sm font-body text-foreground hover:bg-muted transition-colors", children: [_jsx(SlidersHorizontal, { className: "w-4 h-4 text-primary" }), "Filtros e Camadas"] }) }), _jsxs(DrawerContent, { className: "bg-card border-t border-border", children: [_jsx(DrawerHeader, { children: _jsx(DrawerTitle, { className: "font-heading tracking-wide text-foreground", children: "Filtros e Camadas" }) }), _jsx("div", { className: "px-4 pb-6 overflow-y-auto max-h-[60vh]", children: filterControls })] })] }))] })] })] }));
};
