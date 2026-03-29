import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Cloud, CloudSun, Sun, Wind, CloudLightning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAQILabel } from '@utils/aqiInfo';
function getAQIColor(aqi) {
    if (aqi <= 50)
        return '#4af0c4';
    if (aqi <= 100)
        return '#facc15';
    if (aqi <= 150)
        return '#ff9f4a';
    if (aqi <= 200)
        return '#ef4444';
    if (aqi <= 300)
        return '#a855f7';
    return '#be123c';
}
const IconMap = {
    sun: Sun,
    'cloud-sun': CloudSun,
    cloud: Cloud,
    haze: Wind,
    storm: CloudLightning,
};
export const AQIForecast = ({ forecast }) => {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: t('cityDashboard.forecast') }), _jsx("div", { className: "flex gap-2", children: forecast.map(day => {
                    const color = getAQIColor(day.aqi);
                    const label = getAQILabel(day.aqi, t);
                    const Icon = IconMap[day.icon];
                    return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1.5 bg-muted/40 border border-border/50 rounded p-2.5", children: [_jsx("span", { className: "text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider", children: day.date }), _jsx(Icon, { className: "w-5 h-5 text-muted-foreground" }), _jsx("span", { className: "font-mono text-base font-bold", style: { color }, children: day.aqi }), _jsx("span", { className: "text-[9px] font-body font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide", style: { background: `${color}20`, color }, children: label })] }, day.date));
                }) })] }));
};
