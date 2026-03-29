import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sun, Wind, Flower2, Info, Thermometer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getUVLevels, getPollenLevels } from '@utils/aqiInfo';
/** Mirrors backend `OutdoorSafetyService` tempScore for bar fill and color. */
function tempComfortBarAndColor(temp) {
    const score = temp >= 18 && temp <= 28
        ? 100
        : temp >= 12 && temp < 18
            ? 80
            : temp > 28 && temp <= 34
                ? 70
                : temp >= 8 && temp < 12
                    ? 50
                    : temp > 34 && temp <= 38
                        ? 40
                        : 20;
    const color = score >= 80 ? '#4af0c4' : score >= 50 ? '#facc15' : score >= 40 ? '#ff9f4a' : '#ef4444';
    return { barFill: score, color };
}
function getSafetyLabelKey(score) {
    if (score >= 8)
        return 'safe';
    if (score >= 6)
        return 'moderate';
    if (score >= 4)
        return 'caution';
    if (score >= 2)
        return 'dangerous';
    return 'critical';
}
function getSafetyColor(score) {
    if (score >= 8)
        return '#4af0c4';
    if (score >= 6)
        return '#facc15';
    if (score >= 4)
        return '#ff9f4a';
    if (score >= 2)
        return '#ef4444';
    return '#a855f7';
}
const MetricRow = ({ icon, label, value, sublabel, barFill, color, tooltip }) => (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [icon, _jsx("span", { children: label }), tooltip && (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("button", { className: "text-muted-foreground/50 hover:text-muted-foreground transition-colors", children: _jsx(Info, { className: "w-3 h-3" }) }) }), _jsx(TooltipContent, { side: "top", className: "max-w-[220px] p-3", children: tooltip })] }))] }), _jsxs("span", { className: "font-mono text-sm font-bold", style: { color }, children: [value, " ", _jsx("span", { className: "text-[10px] font-normal text-muted-foreground", children: sublabel })] })] }), _jsx("div", { className: "w-full h-1 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${barFill}%`, background: color } }) })] }));
function getUVLabel(uv, uvLevels) {
    for (const level of uvLevels) {
        if (uv <= level.max)
            return level.label;
    }
    return uvLevels[uvLevels.length - 1]?.label ?? '';
}
function getPollenLabel(level, pollenLevels) {
    for (const pl of pollenLevels) {
        if (level <= pl.max)
            return pl.label;
    }
    return pollenLevels[pollenLevels.length - 1]?.label ?? '';
}
export const OutdoorSafetyCard = ({ score, uvIndex, pollenLevel, aqi, temperature }) => {
    const { t } = useTranslation();
    const uvLevels = getUVLevels(t);
    const pollenLevels = getPollenLevels(t);
    const tempVisual = temperature !== null && !Number.isNaN(temperature) ? tempComfortBarAndColor(temperature) : null;
    const labelKey = getSafetyLabelKey(score);
    const color = getSafetyColor(score);
    const label = t(`cityDashboard.safetyLabel.${labelKey}`);
    const UVTooltip = () => (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: t('cityDashboard.uvTooltipTitle') }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: t('cityDashboard.uvTooltipDesc') }), _jsx("div", { className: "space-y-0.5 pt-0.5", children: uvLevels.map(level => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: level.color } }), _jsx("span", { className: "text-[10px] font-body", style: { color: level.color }, children: level.label }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["\u2014 ", level.recommendation] })] }, level.label))) })] }));
    const PollenTooltip = () => (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: t('cityDashboard.pollenTooltipTitle') }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: t('cityDashboard.pollenTooltipDesc') }), _jsx("div", { className: "space-y-0.5 pt-0.5", children: pollenLevels.map(level => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: level.color } }), _jsx("span", { className: "text-[10px] font-body", style: { color: level.color }, children: level.label }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["\u2014 ", level.recommendation] })] }, level.label))) })] }));
    const TemperatureTooltip = () => (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: t('cityDashboard.temperatureTooltipTitle') }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: t('cityDashboard.temperatureTooltipDesc') })] }));
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: t('cityDashboard.outdoorSafety') }), _jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "font-mono text-4xl font-bold", style: { color }, children: score.toFixed(1) }), _jsx("span", { className: "text-[9px] text-muted-foreground font-mono uppercase tracking-wider", children: "/ 10" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-body font-bold px-3 py-1 rounded-full uppercase tracking-wide", style: { background: `${color}20`, color }, children: label }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-body", children: t('cityDashboard.compositeIndex') })] })] }), _jsxs("div", { className: "space-y-2.5", children: [_jsx(MetricRow, { icon: _jsx(Wind, { className: "w-3.5 h-3.5" }), label: t('cityDashboard.airQuality'), value: aqi, sublabel: "AQI", barFill: Math.min((aqi / 300) * 100, 100), color: aqi <= 50 ? '#4af0c4' : aqi <= 100 ? '#facc15' : aqi <= 150 ? '#ff9f4a' : '#ef4444' }), _jsx(MetricRow, { icon: _jsx(Sun, { className: "w-3.5 h-3.5" }), label: t('cityDashboard.uvIndex'), value: uvIndex, sublabel: getUVLabel(uvIndex, uvLevels), barFill: (uvIndex / 11) * 100, color: uvIndex <= 2 ? '#4af0c4' : uvIndex <= 5 ? '#facc15' : uvIndex <= 7 ? '#ff9f4a' : '#ef4444', tooltip: _jsx(UVTooltip, {}) }), _jsx(MetricRow, { icon: _jsx(Flower2, { className: "w-3.5 h-3.5" }), label: t('cityDashboard.pollen'), value: pollenLevel, sublabel: getPollenLabel(pollenLevel, pollenLevels), barFill: (pollenLevel / 10) * 100, color: pollenLevel <= 2 ? '#4af0c4' : pollenLevel <= 5 ? '#facc15' : '#ff9f4a', tooltip: _jsx(PollenTooltip, {}) }), _jsx(MetricRow, { icon: _jsx(Thermometer, { className: "w-3.5 h-3.5" }), label: t('cityDashboard.temperature'), value: tempVisual != null && temperature != null ? temperature.toFixed(1) : '—', sublabel: tempVisual ? t('cityDashboard.temperatureUnit') : '', barFill: tempVisual?.barFill ?? 0, color: tempVisual?.color ?? 'rgba(255,255,255,0.15)', tooltip: _jsx(TemperatureTooltip, {}) })] })] }));
};
