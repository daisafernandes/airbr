import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export const OmsComplianceBadge = ({ compliant, size = 'md', className }) => {
    return (_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full font-mono font-semibold uppercase tracking-wide', size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]', compliant
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/15 text-red-400 border border-red-500/30', className), children: [_jsx("span", { className: cn('inline-block rounded-full', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', compliant ? 'bg-emerald-400' : 'bg-red-400') }), compliant ? 'Conforme OMS' : 'Acima do limite'] }));
};
