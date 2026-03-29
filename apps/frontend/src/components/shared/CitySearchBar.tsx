import { useState, useRef, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CITIES_DATA } from '@data/mockCities'
import type { CityData } from '@app-types/city.types'

interface CitySearchBarProps {
  onSelect: (city: CityData) => void
  placeholder?: string
  className?: string
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#4af0c4'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#ff9f4a'
  if (aqi <= 200) return '#ef4444'
  return '#a855f7'
}

export const CitySearchBar = ({ onSelect, placeholder = 'Buscar cidade...', className }: CitySearchBarProps) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const filtered =
    debouncedQuery.trim().length > 0
      ? CITIES_DATA.filter(
          c =>
            c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            c.state.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 6)
      : []

  const handleSelect = useCallback(
    (city: CityData) => {
      setQuery(city.name)
      setOpen(false)
      onSelect(city)
    },
    [onSelect]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted]) handleSelect(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    setHighlighted(0)
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.trim().length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Buscar cidade"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        className="bg-muted border border-border rounded pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
      />
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-xl overflow-hidden z-50"
        >
          {filtered.map((city, idx) => {
            const color = getAQIColor(city.aqi)
            return (
              <button
                key={city.name}
                role="option"
                aria-selected={idx === highlighted}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => handleSelect(city)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors',
                  idx === highlighted ? 'bg-muted' : 'hover:bg-muted/60'
                )}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-body text-foreground truncate">{city.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {city.state} · {city.region}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color }}>
                  {city.aqi}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
