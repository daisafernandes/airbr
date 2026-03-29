import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function getBarColor(ratio) {
    if (ratio <= 0.5)
        return '#4af0c4';
    if (ratio <= 1.0)
        return '#facc15';
    if (ratio <= 1.5)
        return '#ff9f4a';
    if (ratio <= 2.0)
        return '#ef4444';
    return '#a855f7';
}
export const PollutantCards = ({ pollutants }) => {
    return (_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsx("h3", { className: "font-heading text-lg tracking-wide text-foreground mb-3", children: "POLUENTES" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: pollutants.map(p => {
                    const ratio = p.value / p.whoLimit;
                    const barWidth = Math.min(ratio * 100, 200);
                    const color = getBarColor(ratio);
                    const overLimit = ratio > 1;
                    return (_jsxs("div", { className: "bg-muted/40 border border-border/50 rounded p-2.5 space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider", children: p.label }), overLimit && (_jsx("span", { className: "text-[9px] font-mono px-1 py-0.5 rounded", style: { background: `${color}20`, color }, children: "acima OMS" }))] }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsx("span", { className: "font-mono text-lg font-bold", style: { color }, children: p.value }), _jsx("span", { className: "text-[10px] text-muted-foreground", children: p.unit })] }), _jsx("div", { className: "w-full h-1 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${Math.min(barWidth, 100)}%`, background: color } }) }), _jsxs("span", { className: "text-[9px] text-muted-foreground font-mono", children: ["OMS: ", p.whoLimit, " ", p.unit] })] }, p.key));
                }) })] }));
};
