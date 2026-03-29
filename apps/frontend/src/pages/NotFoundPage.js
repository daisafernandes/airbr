import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export const NotFoundPage = () => {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-6 py-16 text-center", children: [_jsx("h1", { className: "text-6xl font-bold text-gray-300", children: "404" }), _jsx("p", { className: "text-xl text-gray-600", children: "P\u00E1gina n\u00E3o encontrada" }), _jsx(Link, { to: "/", children: _jsx(Button, { children: "Voltar ao in\u00EDcio" }) })] }));
};
