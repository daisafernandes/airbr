import { CITIES_DATA } from '@data/mockCities'
import { Search } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface CitySearchBarProps {
  onSelect: (cityName: string) => void
  placeholder?: string
  className?: string
}

export const CitySearchBar = ({ onSelect, placeholder = 'Buscar cidade...', className = '' }: CitySearchBarProps) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered =
    query.length > 0
      ? CITIES_DATA.filter(
          c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.state.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 6)
      : []

  const handleSelect = useCallback(
    (name: string) => {
      setQuery(name)
      setOpen(false)
      setActiveIdx(-1)
      onSelect(name)
    },
    [onSelect],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      const city = filtered[activeIdx]
      if (city) handleSelect(city.name)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
          setActiveIdx(-1)
        }}
        onFocus={() => query.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="bg-muted border border-border rounded pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-2xl overflow-hidden z-50">
          {filtered.map((city, i) => (
            <button
              key={city.name}
              onMouseDown={() => handleSelect(city.name)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                i === activeIdx ? 'bg-primary/10 text-foreground' : 'hover:bg-muted text-foreground'
              }`}
            >
              <span className="font-body">{city.name}</span>
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                {city.state} · {city.region}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
