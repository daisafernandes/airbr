import { getNearestCity } from '@data/mockCities'
import { Wind, MapPin } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { CitySearchBar } from './CitySearchBar'
import { LiveIndicator } from './LiveIndicator'

interface HeaderProps {
  onCitySelect: (city: string) => void
}

export const Header = ({ onCitySelect }: HeaderProps) => {
  const location = useLocation()

  const handleLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const city = getNearestCity(pos.coords.latitude, pos.coords.longitude)
        onCitySelect(city.name)
      },
      () => {
        // Fallback: São Paulo
        onCitySelect('São Paulo')
      },
    )
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/ranking', label: 'Ranking' },
    { to: '/mapa-queimadas', label: 'Mapa Queimadas' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto gap-4">
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

        {/* Search + geolocate + live */}
        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
          <CitySearchBar
            onSelect={onCitySelect}
            className="w-48 sm:w-64 md:w-56 lg:w-72"
          />
          <button
            onClick={handleLocation}
            title="Detectar minha localização"
            className="flex items-center gap-1 px-3 py-2 text-xs font-body bg-muted border border-border rounded hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground hover:text-primary shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Localização</span>
          </button>
          <LiveIndicator />
        </div>
      </div>
    </header>
  )
}
