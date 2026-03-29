import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search } from 'lucide-react';
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useSearchCities } from '@hooks/useSearchCities';
export const CitySearchBar = ({ onSelect, placeholder = 'Buscar cidade...', className = '', useFixedDropdown = false }) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [dropdownRect, setDropdownRect] = useState(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);
    const { data: results = [] } = useSearchCities(debouncedQuery);
    const filtered = results.slice(0, 6);
    const handleSelect = useCallback((id, name) => {
        setQuery(name);
        setOpen(false);
        setActiveIdx(-1);
        onSelect(id, name);
    }, [onSelect]);
    const handleKeyDown = (e) => {
        if (!open || filtered.length === 0)
            return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, -1));
        }
        else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            const city = filtered[activeIdx];
            if (city)
                handleSelect(city.id, city.name);
        }
        else if (e.key === 'Escape') {
            setOpen(false);
        }
    };
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    useLayoutEffect(() => {
        if (!useFixedDropdown || !open || !inputRef.current)
            return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width });
    }, [open, useFixedDropdown]);
    return (_jsxs("div", { ref: containerRef, className: `relative ${className}`, children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" }), _jsx("input", { ref: inputRef, type: "text", value: query, onChange: e => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveIdx(-1);
                }, onFocus: () => query.length > 0 && setOpen(true), onKeyDown: handleKeyDown, placeholder: placeholder, autoComplete: "off", className: "bg-muted border border-border rounded pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full" }), open && filtered.length > 0 && (_jsx("div", { className: "bg-card border border-border rounded shadow-2xl overflow-hidden z-[200]", style: useFixedDropdown && dropdownRect
                    ? { position: 'fixed', top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }
                    : { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px' }, children: filtered.map((city, i) => (_jsxs("button", { onMouseDown: () => handleSelect(city.id, city.name), className: `w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${i === activeIdx ? 'bg-primary/10 text-foreground' : 'hover:bg-muted text-foreground'}`, children: [_jsx("span", { className: "font-body", children: city.name }), _jsxs("span", { className: "text-xs font-mono text-muted-foreground shrink-0", children: [city.state, " \u00B7 ", city.region, city.latestAqi && (_jsxs("span", { className: "ml-2 font-semibold", children: ["IQAr ", city.latestAqi.aqi] }))] })] }, city.id))) }))] }));
};
