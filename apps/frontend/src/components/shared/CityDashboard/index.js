import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCity } from '@hooks/useCity';
import { useCityHistory } from '@hooks/useCityHistory';
import { useHealthData } from '@hooks/useHealthData';
import { useOutdoorSafety } from '@hooks/useOutdoorSafety';
import { useWindSmoke } from '@hooks/useWindSmoke';
import { getAQILabel, getHealthAlerts } from '@utils/aqiInfo';
import { formatDateTime } from '@utils/formatters';
import { AQIGauge } from './AQIGauge';
import { AQIHistoryChart } from './AQIHistoryChart';
import { HealthAlertsCard } from './HealthAlertsCard';
import { OutdoorSafetyCard } from './OutdoorSafetyCard';
import { PollutantCards } from './PollutantCards';
import { PublicHealthCard } from './PublicHealthCard';
import { SmokeSourceCard } from './SmokeSourceCard';
function buildPollutants(reading, t) {
    const defs = [
        { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', whoLimit: 5 },
        { key: 'pm10', label: 'PM10', unit: 'µg/m³', whoLimit: 15 },
        { key: 'no2', label: 'NO₂', unit: 'µg/m³', whoLimit: 10 },
        { key: 'o3', label: 'O₃', unit: 'µg/m³', whoLimit: 60 },
        { key: 'co', label: 'CO', unit: 'mg/m³', whoLimit: 4 },
    ];
    return defs
        .filter(d => reading[d.key] !== null)
        .map(d => ({
        key: d.key,
        label: d.label,
        value: reading[d.key],
        unit: d.unit,
        whoLimit: d.whoLimit,
        description: t(`pollutants.${d.key}.shortDesc`),
    }));
}
function buildHistoryPoints(readings, locale) {
    return readings.map(r => ({
        day: new Date(r.timestamp).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }),
        aqi: r.aqi,
    }));
}
function computeOutdoorSafety(aqi, uv, pollen) {
    const aqiScore = Math.max(0, 10 - (aqi / 50));
    const uvScore = uv !== null ? Math.max(0, 10 - uv) : 5;
    const pollenScore = pollen !== null ? Math.max(0, 10 - pollen) : 5;
    const score = Math.round(((aqiScore + uvScore + pollenScore) / 3) * 10) / 10;
    return { score: Math.min(10, Math.max(0, score)), uvIndex: uv ?? 0, pollenLevel: pollen ?? 0 };
}
const LOCALE_MAP = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
export const CityDashboard = ({ cityId, onClose }) => {
    const [period, setPeriod] = useState('7d');
    const { t, i18n } = useTranslation();
    const locale = LOCALE_MAP[i18n.language] ?? 'pt-BR';
    const { data: city, isLoading, isError } = useCity(cityId);
    const { data: historyReadings = [], isLoading: historyLoading } = useCityHistory(cityId, period === '7d' ? '7d' : '30d');
    const { data: windSmoke } = useWindSmoke(cityId);
    const { data: outdoorSafety } = useOutdoorSafety(cityId);
    const { data: healthData } = useHealthData(cityId);
    if (isLoading) {
        return (_jsxs("div", { className: "w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col gap-3 animate-pulse", children: [_jsx("div", { className: "h-6 bg-muted rounded w-3/4" }), _jsx("div", { className: "h-4 bg-muted rounded w-1/2" }), _jsx("div", { className: "h-40 bg-muted rounded" }), _jsx("div", { className: "h-24 bg-muted rounded" }), _jsx("div", { className: "h-24 bg-muted rounded" })] }));
    }
    if (isError || !city) {
        return (_jsxs("div", { className: "w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col items-center justify-center gap-3", children: [_jsx("p", { className: "text-sm text-muted-foreground font-body text-center", children: t('cityDashboard.noData') }), _jsx("button", { onClick: onClose, className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: t('cityDashboard.close') })] }));
    }
    const aqi = city.latestAqi?.aqi ?? 0;
    const aqiLabel = getAQILabel(aqi, t);
    const pollutants = city.latestAqi ? buildPollutants(city.latestAqi, t) : [];
    const healthAlerts = getHealthAlerts(aqi, t);
    const historyData = buildHistoryPoints(historyReadings, locale);
    const outdoorScore = outdoorSafety
        ? outdoorSafety.score / 10
        : (() => {
            const { score } = computeOutdoorSafety(aqi, city.latestAqi?.uv ?? null, city.latestAqi?.pollen ?? null);
            return score;
        })();
    const uvIndex = outdoorSafety?.breakdown.uv ?? city.latestAqi?.uv ?? 0;
    const pollenLevel = outdoorSafety?.breakdown.pollen ?? city.latestAqi?.pollen ?? 0;
    const temperature = outdoorSafety?.breakdown.temperature ?? city.latestAqi?.temperature ?? null;
    const lastUpdate = city.latestAqi
        ? formatDateTime(new Date(city.latestAqi.timestamp), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';
    return (_jsxs("div", { className: "w-80 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] pr-1 space-y-3 animate-fade-in", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-heading text-2xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-xs text-muted-foreground font-body uppercase tracking-widest mt-0.5", children: [city.state, " \u00B7 ", city.region] }), _jsxs("p", { className: "text-[10px] font-mono text-muted-foreground mt-1", children: [t('cityDashboard.lastUpdateLabel'), ": ", lastUpdate] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors", "aria-label": t('cityDashboard.close'), children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "mt-3 flex justify-center", children: _jsx(AQIGauge, { aqi: aqi, label: aqiLabel }) })] }), pollutants.length > 0 && _jsx(PollutantCards, { pollutants: pollutants }), _jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: t('cityDashboard.history') }), _jsx("div", { className: "flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden", children: ['7d', '30d'].map(p => (_jsx("button", { onClick: () => setPeriod(p), className: `px-2.5 py-1 text-[10px] font-mono transition-colors ${period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`, children: p === '7d' ? t('cityDashboard.days7') : t('cityDashboard.days30') }, p))) })] }), historyLoading ? (_jsx("div", { className: "h-24 bg-muted animate-pulse rounded" })) : historyData.length > 0 ? (_jsx(AQIHistoryChart, { history: historyData, hideTitleBar: true })) : (_jsx("p", { className: "text-xs text-muted-foreground font-body text-center py-4", children: t('cityDashboard.noHistory') }))] }), _jsx(OutdoorSafetyCard, { score: outdoorScore, uvIndex: uvIndex, pollenLevel: pollenLevel, aqi: aqi, temperature: temperature }), _jsx(SmokeSourceCard, { lat: city.lat, lng: city.lng, windDirection: windSmoke?.wind.direction ?? 0, windSpeed: windSmoke?.wind.speed ?? 0, nearbyFires: windSmoke?.nearbyFires ?? [] }), healthData && healthData.monthlyData.length > 0 && (_jsx(PublicHealthCard, { hospitalizations: healthData.monthlyData[healthData.monthlyData.length - 1]?.hospitalizations ?? 0, history: healthData.monthlyData.map(d => d.hospitalizations) })), _jsx(HealthAlertsCard, { alerts: healthAlerts, aqiLabel: aqiLabel })] }));
};
