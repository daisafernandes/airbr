import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
export const RootLayout = () => {
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: _jsx(Outlet, {}) }) }));
};
