import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Wind, ArrowLeft, ExternalLink } from 'lucide-react';
import { useCity } from '@hooks/useCity';
import { useCityHistory } from '@hooks/useCityHistory';
import { LiveIndicator } from '@components/shared/LiveIndicator';
import { AQIGauge } from '@components/shared/CityDashboard/AQIGauge';
import { PollutantCards } from '@components/shared/CityDashboard/PollutantCards';
import { AQIHistoryChart } from '@components/shared/CityDashboard/AQIHistoryChart';
import { OutdoorSafetyCard } from '@components/shared/CityDashboard/OutdoorSafetyCard';
import { HealthAlertsCard } from '@components/shared/CityDashboard/HealthAlertsCard';
import { SmokeSourceCard } from '@components/shared/CityDashboard/SmokeSourceCard';
import { OmsComplianceBadge } from '@components/shared/OmsComplianceBadge';
function getAQILabel(aqi) {
    if (aqi <= 50)
        return 'Bom';
    if (aqi <= 100)
        return 'Moderado';
    if (aqi <= 150)
        return 'Ruim p/ sensíveis';
    if (aqi <= 200)
        return 'Ruim';
    if (aqi <= 300)
        return 'Muito ruim';
    return 'Perigoso';
}
function buildPollutants(reading) {
    const defs = [
        { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', whoLimit: 5, description: 'Partículas finas (< 2,5 µm). Penetram fundo nos pulmões e causam doenças respiratórias e cardiovasculares.' },
        { key: 'pm10', label: 'PM10', unit: 'µg/m³', whoLimit: 15, description: 'Partículas inaláveis (< 10 µm). Irritam vias aéreas superiores e agravam asma e bronquite.' },
        { key: 'no2', label: 'NO₂', unit: 'µg/m³', whoLimit: 10, description: 'Dióxido de nitrogênio. Emitido por motores e indústrias. Agrava asma e aumenta risco de infecções.' },
        { key: 'o3', label: 'O₃', unit: 'µg/m³', whoLimit: 60, description: 'Ozônio troposférico. Formado pela reação de NOx com COV sob luz solar. Irrita olhos e pulmões.' },
        { key: 'co', label: 'CO', unit: 'mg/m³', whoLimit: 4, description: 'Monóxido de carbono. Gás inodoro e incolor que reduz a capacidade do sangue de transportar oxigênio.' },
    ];
    return defs
        .filter(d => reading[d.key] !== null)
        .map(d => ({ key: d.key, label: d.label, value: reading[d.key], unit: d.unit, whoLimit: d.whoLimit, description: d.description }));
}
function buildHealthAlerts(aqi) {
    if (aqi <= 50)
        return [{ severity: 'info', message: 'Qualidade do ar boa. Sem restrições para atividades ao ar livre.' }];
    if (aqi <= 100)
        return [{ severity: 'warning', message: 'Qualidade moderada. Pessoas muito sensíveis podem sentir leve desconforto.' }];
    if (aqi <= 150)
        return [
            { severity: 'warning', message: 'Ruim para grupos sensíveis: crianças, idosos e asmáticos devem limitar esforços ao ar livre.' },
            { severity: 'info', message: 'Pessoas saudáveis geralmente não são afetadas.' },
        ];
    if (aqi <= 200)
        return [
            { severity: 'danger', message: 'Qualidade do ar ruim. Evite atividades físicas intensas ao ar livre.' },
            { severity: 'warning', message: 'Grupos de risco: permaneça em ambientes fechados e com janelas fechadas.' },
        ];
    if (aqi <= 300)
        return [
            { severity: 'critical', message: 'Qualidade muito ruim. Risco à saúde de toda a população.' },
            { severity: 'danger', message: 'Crianças, idosos e doentes cardiorrespiratórios: não saia de casa.' },
        ];
    return [
        { severity: 'critical', message: 'SITUAÇÃO DE EMERGÊNCIA. Qualidade do ar perigosa.' },
        { severity: 'critical', message: 'Toda a população deve evitar qualquer exposição ao ar externo.' },
    ];
}
function buildHistoryPoints(readings) {
    return readings.map(r => ({
        day: new Date(r.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        aqi: r.aqi,
    }));
}
function computeOutdoorSafety(aqi, uv, pollen) {
    const aqiScore = Math.max(0, 10 - aqi / 50);
    const uvScore = uv !== null ? Math.max(0, 10 - uv) : 5;
    const pollenScore = pollen !== null ? Math.max(0, 10 - pollen) : 5;
    const score = Math.round(((aqiScore + uvScore + pollenScore) / 3) * 10) / 10;
    return { score: Math.min(10, Math.max(0, score)), uvIndex: uv ?? 0, pollenLevel: pollen ?? 0 };
}
export const CityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [period, setPeriod] = useState('7d');
    const { data: city, isLoading, isError } = useCity(id ?? null);
    const { data: historyReadings = [], isLoading: historyLoading } = useCityHistory(id ?? null, period === '1y' ? '1y' : period);
    const aqi = city?.latestAqi?.aqi ?? 0;
    const aqiLabel = getAQILabel(aqi);
    const pollutants = city?.latestAqi ? buildPollutants(city.latestAqi) : [];
    const healthAlerts = buildHealthAlerts(aqi);
    const historyData = buildHistoryPoints(historyReadings);
    const pm25 = city?.latestAqi?.pm25 ?? null;
    const omsCompliant = pm25 !== null ? pm25 <= 5 : false;
    const safety = city ? computeOutdoorSafety(aqi, city.latestAqi?.uv ?? null, city.latestAqi?.pollen ?? null) : null;
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '-100px' } }), _jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto gap-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 shrink-0", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsxs("nav", { className: "hidden md:flex items-center gap-0.5", children: [_jsx(Link, { to: "/", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Dashboard" }), _jsx(Link, { to: "/ranking", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Ranking" }), _jsx(Link, { to: "/mapa-queimadas", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Mapa Queimadas" }), _jsx(Link, { to: "/guia", className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: "Guia" })] }), _jsx(LiveIndicator, {})] }) }), _jsxs("main", { className: "pt-20 pb-12 px-4 max-w-[1000px] mx-auto relative z-10", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "w-3.5 h-3.5" }), "Voltar"] }), isLoading ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-10 bg-muted animate-pulse rounded w-64" }), _jsx("div", { className: "h-5 bg-muted animate-pulse rounded w-40" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-8", children: [_jsx("div", { className: "h-64 bg-muted animate-pulse rounded" }), _jsx("div", { className: "h-64 bg-muted animate-pulse rounded" })] })] })) : isError || !city ? (_jsxs("div", { className: "bg-card border border-border rounded p-8 text-center", children: [_jsx("p", { className: "text-muted-foreground font-body mb-4", children: "Cidade n\u00E3o encontrada." }), _jsx(Link, { to: "/", className: "text-xs text-primary hover:underline", children: "Voltar ao dashboard" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-heading text-4xl sm:text-5xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-sm text-muted-foreground font-body uppercase tracking-widest mt-1", children: [city.state, " \u00B7 ", city.region] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(OmsComplianceBadge, { compliant: omsCompliant, size: "md" }), _jsxs(Link, { to: "/", state: { selectCity: city.id }, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-border rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), "Ver no mapa"] })] })] }), _jsxs("p", { className: "text-[10px] font-mono text-muted-foreground mt-2", children: ["Fonte: ", city.source, " \u00B7 \u00DAltima atualiza\u00E7\u00E3o:", ' ', city.latestAqi
                                                ? new Date(city.latestAqi.timestamp).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : '—'] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-card border border-border rounded p-6 flex flex-col items-center", children: _jsx(AQIGauge, { aqi: aqi, label: aqiLabel }) }), pollutants.length > 0 && _jsx(PollutantCards, { pollutants: pollutants }), _jsx(HealthAlertsCard, { alerts: healthAlerts, aqiLabel: aqiLabel })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: "HIST\u00D3RICO" }), _jsx("div", { className: "flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden", children: ['7d', '30d', '1y'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-2.5 py-1 text-[10px] font-mono transition-colors ${period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`, children: p === '7d' ? '7d' : p === '30d' ? '30d' : '1 ano' }, p))) })] }), historyLoading ? (_jsx("div", { className: "h-24 bg-muted animate-pulse rounded" })) : historyData.length > 0 ? (_jsx(AQIHistoryChart, { history: historyData, hideTitleBar: true })) : (_jsx("p", { className: "text-xs text-muted-foreground font-body text-center py-4", children: "Hist\u00F3rico ainda n\u00E3o dispon\u00EDvel." }))] }), safety && (_jsx(OutdoorSafetyCard, { score: safety.score, uvIndex: safety.uvIndex, pollenLevel: safety.pollenLevel, aqi: aqi })), _jsx(SmokeSourceCard, { lat: city.lat, lng: city.lng, windDirection: 45, windSpeed: 0, nearbyFires: [] }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "INFORMA\u00C7\u00D5ES" }), _jsxs("div", { className: "space-y-2 text-xs font-mono", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Coordenadas" }), _jsxs("span", { className: "text-foreground", children: [city.lat.toFixed(4), ", ", city.lng.toFixed(4)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Estado" }), _jsx("span", { className: "text-foreground", children: city.state })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Regi\u00E3o" }), _jsx("span", { className: "text-foreground", children: city.region })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Fonte dos dados" }), _jsx("span", { className: "text-foreground", children: city.source })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Limite OMS PM2.5" }), _jsx("span", { className: omsCompliant ? 'text-primary' : 'text-accent', children: pm25 !== null ? `${pm25.toFixed(1)} µg/m³ (limite: 5)` : '—' })] })] })] })] })] }), _jsxs("footer", { className: "mt-10 text-xs text-muted-foreground text-center font-mono", children: ["Fontes: ", city.source, " \u00B7 INPE \u00B7 DATASUS \u00B7 Open-Meteo \u00B7 IQAir"] })] }))] })] }));
};
