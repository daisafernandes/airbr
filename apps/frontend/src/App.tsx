import '@/lib/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@contexts/AuthContext'
import { AlertsPage } from '@pages/AlertsPage'
import { CityPage } from '@pages/CityPage'
import { DashboardPage } from '@pages/DashboardPage'
import { FireFocusRedirectPage } from '@pages/FireFocusRedirectPage'
import { FireMapPage } from '@pages/FireMapPage'
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage'
import { GlossaryPage } from '@pages/GlossaryPage'
import { LoginPage } from '@pages/LoginPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage'
import { RankingPage } from '@pages/RankingPage'
import { RegisterPage } from '@pages/RegisterPage'
import { ResetPasswordPage } from '@pages/ResetPasswordPage'

function LegacyCidadeRedirect() {
  const { id } = useParams()
  return <Navigate to={`/city/${id ?? ''}`} replace />
}

function LegacyMapaFocoRedirect() {
  const { id } = useParams()
  return <Navigate to={`/maps/foco/${id ?? ''}`} replace />
}

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
              <Route path="/maps" element={<FireMapPage />} />
              <Route path="/maps/foco/:id" element={<FireFocusRedirectPage />} />
              <Route path="/city/:id" element={<CityPage />} />
              <Route path="/guide" element={<GlossaryPage />} />
              <Route path="/mapa-queimadas" element={<Navigate to="/maps" replace />} />
              <Route path="/mapa-queimadas/foco/:id" element={<LegacyMapaFocoRedirect />} />
              <Route path="/cidade/:id" element={<LegacyCidadeRedirect />} />
              <Route path="/guia" element={<Navigate to="/guide" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
