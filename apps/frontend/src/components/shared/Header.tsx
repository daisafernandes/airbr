import { Wind, MapPin } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { airQualityService } from '@services/airQualityService'

import { AuthHeaderActions } from './AuthHeaderActions'
import { CitySearchBar } from './CitySearchBar'
import { LiveIndicator } from './LiveIndicator'

interface HeaderProps {
  onCitySelect: (cityId: string) => void
}

export const Header = ({ onCitySelect }: HeaderProps) => {
  const location = useLocation()
  const { t } = useTranslation()

  const handleLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const nearby = await airQualityService.getNearbyCities(
            pos.coords.latitude,
            pos.coords.longitude,
            100,
          )
          if (nearby[0]) onCitySelect(nearby[0].id)
        } catch {
          // silently ignore if geolocation lookup fails
        }
      },
    )
  }, [onCitySelect])

  const navLinks = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/ranking', label: t('nav.ranking') },
    { to: '/maps', label: t('nav.fireMap') },
    { to: '/guide', label: t('nav.guide') },
  ]

  /** Busca de cidade escondida em várias rotas; em /maps a busca fica na sidebar do mapa de focos. */
  const hideCitySearch = ['/alerts', '/guide', '/ranking', '/profile', '/maps'].includes(location.pathname)
  const hideGeolocation = ['/alerts', '/guide', '/ranking', '/profile'].includes(location.pathname)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 min-h-16 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex min-h-16 items-center justify-between px-6 py-2 sm:py-3 max-w-[1800px] mx-auto gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Wind className="w-6 h-6 text-primary" />
          <span className="font-heading text-2xl tracking-wider text-foreground">
            Respir<span className="text-primary">A</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(link => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-xs font-body rounded transition-colors ${
                  active
                    ? 'text-primary border-b border-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Search + geolocate + language + live */}

        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
          <LiveIndicator />
          {!hideCitySearch && (
            <CitySearchBar
              onSelect={(cityId) => onCitySelect(cityId)}
              className="w-48 sm:w-64 md:w-56 lg:w-72"
              testId="header-city-search"
            />
          )}
          {!hideGeolocation && (
            <button
              type="button"
              onClick={handleLocation}
              title={t('header.detectLocation')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-body bg-muted border border-border rounded hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground hover:text-primary shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('header.location')}</span>
            </button>
          )}
          <LanguageSelector />
          <AuthHeaderActions />
        </div>
      </div>
    </header>
  )
}
