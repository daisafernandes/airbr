import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getCityByName } from '@data/mockCities';
import { X } from 'lucide-react';
import { useState } from 'react';
import { AQIForecast } from './AQIForecast';
import { AQIGauge } from './AQIGauge';
import { AQIHistoryChart } from './AQIHistoryChart';
import { HealthAlertsCard } from './HealthAlertsCard';
import { OutdoorSafetyCard } from './OutdoorSafetyCard';
import { PollutantCards } from './PollutantCards';
import { PublicHealthCard } from './PublicHealthCard';
import { SmokeSourceCard } from './SmokeSourceCard';
export const CityDashboard = ({ cityName, onClose }) => {
    const [period, setPeriod] = useState('7d');
    const city = getCityByName(cityName);
    if (!city) {
        return (_jsxs("div", { className: "w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col items-center justify-center gap-3", children: [_jsxs("p", { className: "text-sm text-muted-foreground font-body text-center", children: ["Dados n\u00E3o dispon\u00EDveis para ", _jsx("strong", { className: "text-foreground", children: cityName }), "."] }), _jsx("button", { onClick: onClose, className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Fechar" })] }));
    }
    const historyData = period === '30d' ? city.history30d : city.history;
    return (_jsxs("div", { className: "w-80 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] pr-1 space-y-3 animate-fade-in", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-heading text-2xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-xs text-muted-foreground font-body uppercase tracking-widest mt-0.5", children: [city.state, " \u00B7 ", city.region] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors", "aria-label": "Fechar", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "mt-3 flex justify-center", children: _jsx(AQIGauge, { aqi: city.aqi, label: city.aqiLabel }) })] }), _jsx(PollutantCards, { pollutants: city.pollutants }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: "HIST\u00D3RICO" }), _jsx("div", { className: "flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden", children: ['7d', '30d'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-2.5 py-1 text-[10px] font-mono transition-colors ${period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`, children: p === '7d' ? '7 dias' : '30 dias' }, p))) })] }), _jsx(AQIHistoryChart, { history: historyData, hideTitleBar: true })] }), _jsx(AQIForecast, { forecast: city.forecast }), _jsx(SmokeSourceCard, { lat: city.lat, lng: city.lng, windDirection: city.windDirection, windSpeed: city.windSpeed, nearbyFires: city.nearbyFires.map(f => ({ lat: f.lat, lng: f.lng })) }), _jsx(OutdoorSafetyCard, { score: city.outdoorSafetyScore, uvIndex: city.uvIndex, pollenLevel: city.pollenLevel, aqi: city.aqi }), _jsx(HealthAlertsCard, { alerts: city.healthAlerts, aqiLabel: city.aqiLabel }), _jsx(PublicHealthCard, { hospitalizations: city.hospitalizations, history: city.hospitalizationHistory })] }));
};
