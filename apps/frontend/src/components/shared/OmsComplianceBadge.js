import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
export const OmsComplianceBadge = ({ compliant, size = 'sm' }) => {
    const { t } = useTranslation();
    const isSmall = size === 'sm';
    const badge = compliant ? (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'} bg-green-500/15 text-green-400 border border-green-500/30`, children: [_jsx(ShieldCheck, { className: isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5' }), t('oms.badgeCompliant')] })) : (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'} bg-red-500/15 text-red-400 border border-red-500/30`, children: [_jsx(ShieldAlert, { className: isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5' }), t('oms.badgeAboveLimit')] }));
    return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("span", { children: badge }) }), _jsxs(TooltipContent, { side: "top", className: "max-w-[240px] p-3 space-y-1.5", children: [_jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: t('oms.tooltipTitle') }), _jsx("p", { className: "text-xs font-body text-muted-foreground", children: t('oms.tooltipDesc') }), compliant ? (_jsx("p", { className: "text-xs font-body text-green-400", children: t('oms.tooltipCompliant') })) : (_jsx("p", { className: "text-xs font-body text-red-400", children: t('oms.tooltipNonCompliant') }))] })] }));
};
