import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@contexts/AuthContext';
import { DashboardPage } from '@pages/DashboardPage';
import { RankingPage } from '@pages/RankingPage';
import { FireMapPage } from '@pages/FireMapPage';
import { NotFoundPage } from '@pages/NotFoundPage';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
        },
    },
});
export const App = () => {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Sonner, {}), _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/ranking", element: _jsx(RankingPage, {}) }), _jsx(Route, { path: "/mapa-queimadas", element: _jsx(FireMapPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }) })] }) }));
};
