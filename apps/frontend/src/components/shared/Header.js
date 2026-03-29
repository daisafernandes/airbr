import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wind, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { airQualityService } from '@services/airQualityService';
import { useCallback } from 'react';
import { CitySearchBar } from './CitySearchBar';
import { LiveIndicator } from './LiveIndicator';
export const Header = ({ onCitySelect }) => {
    const location = useLocation();
    const handleLocation = useCallback(() => {
        if (!navigator.geolocation)
            return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const nearby = await airQualityService.getNearbyCities(pos.coords.latitude, pos.coords.longitude, 100);
                if (nearby[0])
                    onCitySelect(nearby[0].id);
            }
            catch {
                // silently ignore if geolocation lookup fails
            }
        });
    }, [onCitySelect]);
    const navLinks = [
        { to: '/', label: 'Dashboard' },
        { to: '/ranking', label: 'Ranking' },
        { to: '/mapa-queimadas', label: 'Mapa Queimadas' },
        { to: '/guia', label: 'Guia' },
    ];
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto gap-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 shrink-0", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsx("nav", { className: "hidden md:flex items-center gap-0.5", children: navLinks.map(link => {
                        const active = location.pathname === link.to;
                        return (_jsx(Link, { to: link.to, className: `px-3 py-1.5 text-xs font-body rounded transition-colors ${active
                                ? 'text-primary border-b border-primary font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`, children: link.label }, link.to));
                    }) }), _jsxs("div", { className: "flex items-center gap-2 flex-1 md:flex-none justify-end", children: [_jsx(CitySearchBar, { onSelect: (cityId) => onCitySelect(cityId), className: "w-48 sm:w-64 md:w-56 lg:w-72" }), _jsxs("button", { onClick: handleLocation, title: "Detectar minha localiza\u00E7\u00E3o", className: "flex items-center gap-1 px-3 py-2 text-xs font-body bg-muted border border-border rounded hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground hover:text-primary shrink-0", children: [_jsx(MapPin, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "Localiza\u00E7\u00E3o" })] }), _jsx(LiveIndicator, {})] })] }) }));
};
