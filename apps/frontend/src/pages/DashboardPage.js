import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Flame, Trees, Radio, GitCompare } from 'lucide-react';
import { Header } from '@components/shared/Header';
import { BrazilMap } from '@components/shared/BrazilMap';
import { AQISidebar } from '@components/shared/AQISidebar';
import { CityDashboard } from '@components/shared/CityDashboard';
import { ComparisonPanel } from '@components/shared/ComparisonPanel';
import { useFires } from '@hooks/useFires';
export const DashboardPage = () => {
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [compareCityA, setCompareCityA] = useState(null);
    const [compareCityB, setCompareCityB] = useState(null);
    const [viewMode, setViewMode] = useState('sidebar');
    const [showFires, setShowFires] = useState(false);
    const [showDeforestation, setShowDeforestation] = useState(false);
    const [showStations, setShowStations] = useState(false);
    const { data: fires = [] } = useFires();
    const lastUpdate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const handleCitySelect = (cityId) => {
        setSelectedCityId(cityId);
        if (viewMode === 'compare') {
            if (!compareCityA) {
                setCompareCityA(cityId);
            }
            else {
                setCompareCityB(cityId);
            }
        }
        else {
            setViewMode('city');
        }
    };
    const handleCloseCity = () => {
        setSelectedCityId(null);
        setViewMode('sidebar');
    };
    const handleEnterCompare = () => {
        setViewMode('compare');
        setSelectedCityId(null);
    };
    const handleCloseCompare = () => {
        setViewMode('sidebar');
        setCompareCityA(null);
        setCompareCityB(null);
        setSelectedCityId(null);
    };
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '-100px' } }), _jsx("div", { className: "ambient-blob blob-orange", style: { top: '40%', right: '20%' } }), _jsx(Header, { onCitySelect: handleCitySelect }), _jsxs("main", { className: "pt-16 px-4 pb-4 max-w-[1800px] mx-auto relative z-10", children: [_jsxs("div", { className: "flex items-center gap-3 py-3 flex-wrap", children: [_jsx("span", { className: "text-xs text-muted-foreground font-body uppercase tracking-wider", children: "Camadas:" }), _jsxs("button", { onClick: () => setShowFires(!showFires), className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${showFires
                                    ? 'bg-accent/15 border-accent/40 text-accent'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Flame, { className: "w-3.5 h-3.5" }), "Queimadas"] }), _jsxs("button", { onClick: () => setShowDeforestation(!showDeforestation), className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${showDeforestation
                                    ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Trees, { className: "w-3.5 h-3.5" }), "Desmatamento"] }), _jsxs("button", { onClick: () => setShowStations(!showStations), className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${showStations
                                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Radio, { className: "w-3.5 h-3.5" }), "Esta\u00E7\u00F5es"] }), _jsx("div", { className: "ml-auto", children: _jsxs("button", { onClick: viewMode === 'compare' ? handleCloseCompare : handleEnterCompare, className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${viewMode === 'compare'
                                        ? 'bg-primary/15 border-primary/40 text-primary'
                                        : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(GitCompare, { className: "w-3.5 h-3.5" }), viewMode === 'compare' ? 'Sair da comparação' : 'Comparar cidades'] }) })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(BrazilMap, { selectedCityId: selectedCityId, showFires: showFires, showDeforestation: showDeforestation, showStations: showStations, fires: fires.map(f => ({ lat: f.lat, lng: f.lng, intensity: f.intensity, state: f.state })) }), _jsx("div", { className: "hidden lg:block", children: viewMode === 'compare' ? (_jsx(ComparisonPanel, { cityA: compareCityA, cityB: compareCityB, onChangeCityA: setCompareCityA, onChangeCityB: setCompareCityB, onClose: handleCloseCompare })) : viewMode === 'city' && selectedCityId ? (_jsx(CityDashboard, { cityId: selectedCityId, onClose: handleCloseCity })) : (_jsx(AQISidebar, {})) })] }), _jsxs("footer", { className: "mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border", children: [_jsxs("span", { className: "font-mono", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", lastUpdate] }), _jsx("span", { children: "Fontes: CETESB \u00B7 INPE \u00B7 IBAMA \u00B7 IQAir \u00B7 DATASUS \u00B7 Open-Meteo" })] })] })] }));
};
