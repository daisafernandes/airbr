import { Search, MapPin, Wind } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
  'Fortaleza', 'Curitiba', 'Manaus', 'Recife', 'Porto Alegre',
  'Belém', 'Goiânia', 'Campinas', 'Guarulhos', 'São Luís',
  'Maceió', 'Campo Grande', 'Cuiabá', 'Natal', 'Florianópolis',
]

interface HeaderProps {
  onCitySelect: (city: string) => void
}

export const Header = ({ onCitySelect }: HeaderProps) => {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.length > 0
    ? CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  const handleSelect = (city: string) => {
    setQuery(city)
    setShowSuggestions(false)
    onCitySelect(city)
  }

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        onCitySelect('Minha Localização')
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-2">
          <Wind className="w-6 h-6 text-primary" />
          <span className="font-heading text-2xl tracking-wider text-foreground">
            Respir<span className="text-primary">A</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
        </div>

        <div className="relative flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar cidade..."
              className="bg-muted border border-border rounded pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-64"
            />
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-xl overflow-hidden">
                {filtered.map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLocation}
            className="flex items-center gap-1 px-3 py-2 text-xs font-body bg-muted border border-border rounded hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground hover:text-primary"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Localização</span>
          </button>
        </div>
      </div>
    </header>
  )
}
