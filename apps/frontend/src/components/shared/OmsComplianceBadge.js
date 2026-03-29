import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShieldCheck, ShieldAlert } from 'lucide-react';
export const OmsComplianceBadge = ({ compliant, size = 'sm' }) => {
    const isSmall = size === 'sm';
    if (compliant) {
        return (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-full font-mono font-semibold ${isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'} bg-green-500/15 text-green-400 border border-green-500/30`, children: [_jsx(ShieldCheck, { className: isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5' }), "Conforme OMS"] }));
    }
    return (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-full font-mono font-semibold ${isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'} bg-red-500/15 text-red-400 border border-red-500/30`, children: [_jsx(ShieldAlert, { className: isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5' }), "Acima do limite"] }));
};
