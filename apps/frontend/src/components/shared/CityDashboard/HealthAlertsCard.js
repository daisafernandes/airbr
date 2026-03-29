import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, Info, ShieldAlert, Skull } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const severityConfig = {
    info: { icon: Info, color: '#4af0c4', bg: '#4af0c420' },
    warning: { icon: AlertTriangle, color: '#facc15', bg: '#facc1520' },
    danger: { icon: ShieldAlert, color: '#ff9f4a', bg: '#ff9f4a20' },
    critical: { icon: Skull, color: '#ef4444', bg: '#ef444420' },
};
export const HealthAlertsCard = ({ alerts, aqiLabel }) => {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground", children: t('cityDashboard.healthAlerts') }), _jsx("span", { className: "text-[10px] font-mono text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded", children: aqiLabel })] }), alerts.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground font-body", children: t('cityDashboard.noAlerts') })) : (_jsx("div", { className: "space-y-2", children: alerts.map((alert, i) => {
                    const { icon: Icon, color, bg } = severityConfig[alert.severity];
                    return (_jsxs("div", { className: "flex items-start gap-2.5 p-2.5 rounded text-xs font-body", style: { background: bg }, children: [_jsx(Icon, { className: "w-3.5 h-3.5 mt-0.5 flex-shrink-0", style: { color } }), _jsx("span", { className: "text-foreground leading-relaxed", children: alert.message })] }, i));
                }) }))] }));
};
