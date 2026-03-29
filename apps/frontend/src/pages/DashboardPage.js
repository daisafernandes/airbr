import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Flame, Trees } from 'lucide-react';
import { Header } from '@components/shared/Header';
import { BrazilMap } from '@components/shared/BrazilMap';
import { AQISidebar } from '@components/shared/AQISidebar';
import { CityDashboard } from '@components/shared/CityDashboard';
export const DashboardPage = () => {
    const [selectedCity, setSelectedCity] = useState(null);
    const [showFires, setShowFires] = useState(false);
    const [showDeforestation, setShowDeforestation] = useState(false);
    const lastUpdate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '-100px' } }), _jsx("div", { className: "ambient-blob blob-orange", style: { top: '40%', right: '20%' } }), _jsx(Header, { onCitySelect: setSelectedCity }), _jsxs("main", { className: "pt-16 px-4 pb-4 max-w-[1800px] mx-auto relative z-10", children: [_jsxs("div", { className: "flex items-center gap-3 py-3", children: [_jsx("span", { className: "text-xs text-muted-foreground font-body uppercase tracking-wider", children: "Camadas:" }), _jsxs("button", { onClick: () => setShowFires(!showFires), className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${showFires
                                    ? 'bg-accent/15 border-accent/40 text-accent'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Flame, { className: "w-3.5 h-3.5" }), "Queimadas"] }), _jsxs("button", { onClick: () => setShowDeforestation(!showDeforestation), className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${showDeforestation
                                    ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`, children: [_jsx(Trees, { className: "w-3.5 h-3.5" }), "Desmatamento"] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(BrazilMap, { selectedCity: selectedCity, showFires: showFires, showDeforestation: showDeforestation }), _jsx("div", { className: "hidden lg:block", children: selectedCity
                                    ? _jsx(CityDashboard, { cityName: selectedCity, onClose: () => setSelectedCity(null) })
                                    : _jsx(AQISidebar, {}) })] }), _jsxs("footer", { className: "mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border", children: [_jsxs("span", { className: "font-mono", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", lastUpdate] }), _jsx("span", { children: "Fontes: CETESB \u00B7 INPE \u00B7 IBAMA \u00B7 OpenAQ" })] })] })] }));
};
