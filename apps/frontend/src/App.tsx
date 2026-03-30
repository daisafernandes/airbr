import '@/lib/i18n'
import { AuthProvider } from '@contexts/AuthContext'
import { CityPage } from '@pages/CityPage'
import { DashboardPage } from '@pages/DashboardPage'
import { FireMapPage } from '@pages/FireMapPage'
import { GlossaryPage } from '@pages/GlossaryPage'
import { MethodologyPage } from '@pages/MethodologyPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { RankingPage } from '@pages/RankingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'


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
              <Route path="/cidade/:id" element={<CityPage />} />
              <Route path="/guia" element={<GlossaryPage />} />
              <Route path="/metodologia" element={<MethodologyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
