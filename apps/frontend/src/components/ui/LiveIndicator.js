import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export const LiveIndicator = ({ className }) => {
    return (_jsxs("div", { className: cn('flex items-center gap-1.5', className), children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })] }), _jsx("span", { className: "text-[10px] font-mono font-semibold tracking-widest text-emerald-400 uppercase", children: "Ao vivo" })] }));
};
