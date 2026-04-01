import '@/lib/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@contexts/AuthContext'
import { AlertsPage } from '@pages/AlertsPage'
import { CityPage } from '@pages/CityPage'
import { DashboardPage } from '@pages/DashboardPage'
import { FireFocusRedirectPage } from '@pages/FireFocusRedirectPage'
import { FireMapPage } from '@pages/FireMapPage'
import { GlossaryPage } from '@pages/GlossaryPage'
import { LoginPage } from '@pages/LoginPage'
import { MethodologyPage } from '@pages/MethodologyPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { RankingPage } from '@pages/RankingPage'
import { RegisterPage } from '@pages/RegisterPage'



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/mapa-queimadas" element={<FireMapPage />} />
              <Route path="/mapa-queimadas/foco/:id" element={<FireFocusRedirectPage />} />
              <Route path="/cidade/:id" element={<CityPage />} />
              <Route path="/guia" element={<GlossaryPage />} />
              <Route path="/metodologia" element={<MethodologyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
