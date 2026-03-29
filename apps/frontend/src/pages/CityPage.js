import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Wind, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCity } from '@hooks/useCity';
import { useCityHistory } from '@hooks/useCityHistory';
import { useOutdoorSafety } from '@hooks/useOutdoorSafety';
import { LiveIndicator } from '@components/shared/LiveIndicator';
import { AQIGauge } from '@components/shared/CityDashboard/AQIGauge';
import { PollutantCards } from '@components/shared/CityDashboard/PollutantCards';
import { AQIHistoryChart } from '@components/shared/CityDashboard/AQIHistoryChart';
import { OutdoorSafetyCard } from '@components/shared/CityDashboard/OutdoorSafetyCard';
import { HealthAlertsCard } from '@components/shared/CityDashboard/HealthAlertsCard';
import { SmokeSourceCard } from '@components/shared/CityDashboard/SmokeSourceCard';
import { OmsComplianceBadge } from '@components/shared/OmsComplianceBadge';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { getAQILabel, getHealthAlerts, getPollutantInfo } from '@utils/aqiInfo';
import { formatDateTime } from '@/utils/formatters';
function buildPollutants(reading, pollutantInfo) {
    const keys = ['pm25', 'pm10', 'no2', 'o3', 'co'];
    return keys
        .filter(k => reading[k] !== null)
        .map(k => {
        const info = pollutantInfo[k];
        return {
            key: k,
            label: info.label,
            value: reading[k],
            unit: info.unit,
            whoLimit: info.whoLimit,
            description: info.shortDesc,
        };
    });
}
function buildHistoryPoints(readings, locale) {
    const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
    const resolvedLocale = localeMap[locale] ?? 'pt-BR';
    return readings.map(r => ({
        day: new Date(r.timestamp).toLocaleDateString(resolvedLocale, { day: '2-digit', month: '2-digit' }),
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
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [period, setPeriod] = useState('7d');
    const { data: city, isLoading, isError } = useCity(id ?? null);
    const { data: historyReadings = [], isLoading: historyLoading } = useCityHistory(id ?? null, period === '1y' ? '1y' : period);
    const { data: outdoorSafety } = useOutdoorSafety(id ?? null);
    const pollutantInfo = getPollutantInfo(t);
    const aqi = city?.latestAqi?.aqi ?? 0;
    const aqiLabel = getAQILabel(aqi, t);
    const pollutants = city?.latestAqi ? buildPollutants(city.latestAqi, pollutantInfo) : [];
    const healthAlerts = getHealthAlerts(aqi, t);
    const historyData = buildHistoryPoints(historyReadings, i18n.language);
    const pm25 = city?.latestAqi?.pm25 ?? null;
    const omsCompliant = pm25 !== null ? pm25 <= 5 : false;
    const outdoorScore = outdoorSafety
        ? outdoorSafety.score / 10
        : city
            ? computeOutdoorSafety(aqi, city.latestAqi?.uv ?? null, city.latestAqi?.pollen ?? null).score
            : 0;
    const uvIndex = outdoorSafety?.breakdown.uv ?? city?.latestAqi?.uv ?? 0;
    const pollenLevel = outdoorSafety?.breakdown.pollen ?? city?.latestAqi?.pollen ?? 0;
    const temperature = outdoorSafety?.breakdown.temperature ?? city?.latestAqi?.temperature ?? null;
    const navLinks = [
        { to: '/', label: t('nav.dashboard') },
        { to: '/ranking', label: t('nav.ranking') },
        { to: '/mapa-queimadas', label: t('nav.fireMap') },
        { to: '/guia', label: t('nav.guide') },
    ];
    return (_jsxs("div", { className: "grain-overlay min-h-screen bg-background relative overflow-hidden", children: [_jsx("div", { className: "ambient-blob blob-cyan", style: { top: '-200px', left: '-100px' } }), _jsx("div", { className: "ambient-blob blob-blue", style: { bottom: '-150px', right: '-100px' } }), _jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto gap-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 shrink-0", children: [_jsx(Wind, { className: "w-6 h-6 text-primary" }), _jsxs("span", { className: "font-heading text-2xl tracking-wider text-foreground", children: ["Respir", _jsx("span", { className: "text-primary", children: "A" })] }), _jsx("span", { className: "text-xs font-mono text-muted-foreground ml-2 hidden sm:block", children: "AirBR" })] }), _jsx("nav", { className: "hidden md:flex items-center gap-0.5", children: navLinks.map(link => (_jsx(Link, { to: link.to, className: "px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted", children: link.label }, link.to))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LanguageSelector, {}), _jsx(LiveIndicator, {})] })] }) }), _jsxs("main", { className: "pt-20 pb-12 px-4 max-w-[1000px] mx-auto relative z-10", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "w-3.5 h-3.5" }), t('cityDashboard.back')] }), isLoading ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-10 bg-muted animate-pulse rounded w-64" }), _jsx("div", { className: "h-5 bg-muted animate-pulse rounded w-40" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-8", children: [_jsx("div", { className: "h-64 bg-muted animate-pulse rounded" }), _jsx("div", { className: "h-64 bg-muted animate-pulse rounded" })] })] })) : isError || !city ? (_jsxs("div", { className: "bg-card border border-border rounded p-8 text-center", children: [_jsx("p", { className: "text-muted-foreground font-body mb-4", children: t('cityDashboard.notFound') }), _jsx(Link, { to: "/", className: "text-xs text-primary hover:underline", children: t('cityDashboard.backToDashboard') })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-heading text-4xl sm:text-5xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-sm text-muted-foreground font-body uppercase tracking-widest mt-1", children: [city.state, " \u00B7 ", city.region] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(OmsComplianceBadge, { compliant: omsCompliant, size: "md" }), _jsxs(Link, { to: "/", state: { selectCity: city.id }, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-border rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), t('cityDashboard.seeOnMap')] })] })] }), _jsxs("p", { className: "text-[10px] font-mono text-muted-foreground mt-2", children: [t('cityDashboard.sourceLabel'), ": ", city.source, " \u00B7 ", t('cityDashboard.lastUpdateLabel'), ":", ' ', city.latestAqi
                                                ? formatDateTime(new Date(city.latestAqi.timestamp), {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : '—'] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-card border border-border rounded p-6 flex flex-col items-center", children: _jsx(AQIGauge, { aqi: aqi, label: aqiLabel }) }), pollutants.length > 0 && _jsx(PollutantCards, { pollutants: pollutants }), _jsx(HealthAlertsCard, { alerts: healthAlerts, aqiLabel: aqiLabel })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: t('cityDashboard.history') }), _jsx("div", { className: "flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden", children: ['7d', '30d', '1y'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-2.5 py-1 text-[10px] font-mono transition-colors ${period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`, children: p === '7d' ? t('cityDashboard.days7') : p === '30d' ? t('cityDashboard.days30') : t('cityDashboard.year1') }, p))) })] }), historyLoading ? (_jsx("div", { className: "h-24 bg-muted animate-pulse rounded" })) : historyData.length > 0 ? (_jsx(AQIHistoryChart, { history: historyData, hideTitleBar: true })) : (_jsx("p", { className: "text-xs text-muted-foreground font-body text-center py-4", children: t('cityDashboard.noHistory') }))] }), _jsx(OutdoorSafetyCard, { score: outdoorScore, uvIndex: uvIndex, pollenLevel: pollenLevel, aqi: aqi, temperature: temperature }), _jsx(SmokeSourceCard, { lat: city.lat, lng: city.lng, windDirection: 45, windSpeed: 0, nearbyFires: [] }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: t('cityDashboard.information') }), _jsxs("div", { className: "space-y-2 text-xs font-mono", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.coordinates') }), _jsxs("span", { className: "text-foreground", children: [city.lat.toFixed(4), ", ", city.lng.toFixed(4)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.state') }), _jsx("span", { className: "text-foreground", children: city.state })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.region') }), _jsx("span", { className: "text-foreground", children: city.region })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.dataSource') }), _jsx("span", { className: "text-foreground", children: city.source })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.temperature') }), _jsx("span", { className: "text-foreground", children: temperature != null && !Number.isNaN(temperature)
                                                                            ? `${temperature.toFixed(1)} ${t('cityDashboard.temperatureUnit')}`
                                                                            : '—' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: t('cityDashboard.whoLimitPM25') }), _jsx("span", { className: omsCompliant ? 'text-primary' : 'text-accent', children: pm25 !== null ? `${pm25.toFixed(1)} µg/m³ (${t('oms.limit').toLowerCase()}: 5)` : '—' })] })] })] })] })] }), _jsxs("footer", { className: "mt-10 text-xs text-muted-foreground text-center font-mono", children: [t('dashboard.sources'), ": ", city.source, " \u00B7 INPE \u00B7 DATASUS \u00B7 Open-Meteo \u00B7 IQAir"] })] }))] })] }));
};
