import { Search } from 'lucide-react'
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

import { useSearchCities } from '@hooks/useSearchCities'

interface CitySearchBarProps {
  onSelect: (cityId: string, cityName: string) => void
  placeholder?: string
  className?: string
  useFixedDropdown?: boolean
}

export const CitySearchBar = ({ onSelect, placeholder = 'Buscar cidade...', className = '', useFixedDropdown = false }: CitySearchBarProps) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: results = [] } = useSearchCities(debouncedQuery)
  const filtered = results.slice(0, 6)

  const handleSelect = useCallback(
    (id: string, name: string) => {
      setQuery(name)
      setOpen(false)
      setActiveIdx(-1)
      onSelect(id, name)
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
      if (city) handleSelect(city.id, city.name)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (containerRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useLayoutEffect(() => {
    if (!useFixedDropdown || !open || !inputRef.current) {
      setDropdownRect(null)
      return
    }
    const update = () => {
      if (!inputRef.current) return
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, useFixedDropdown, debouncedQuery])

  const listClass =
    'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2'

  const dropdownList = filtered.map((city, i) => (
    <button
      key={city.id}
      type="button"
      onMouseDown={e => {
        e.preventDefault()
        handleSelect(city.id, city.name)
      }}
      className={`${listClass} ${i === activeIdx ? 'bg-primary/10 text-foreground' : 'hover:bg-muted text-foreground'}`}
    >
      <span className="font-body">{city.name}</span>
      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {city.state} · {city.region}
        {city.latestAqi && <span className="ml-2 font-semibold">IQAr {city.latestAqi.aqi}</span>}
      </span>
    </button>
  ))

  const showDropdown = open && filtered.length > 0
  const fixedPortal =
    showDropdown &&
    useFixedDropdown &&
    dropdownRect &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={dropdownRef}
        className="bg-card border border-border rounded shadow-2xl overflow-hidden z-[300]"
        style={{
          position: 'fixed',
          top: dropdownRect.top + 4,
          left: dropdownRect.left,
          width: dropdownRect.width,
        }}
      >
        {dropdownList}
      </div>,
      document.body,
    )

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
      {showDropdown && !useFixedDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-2xl overflow-hidden z-[200]">
          {dropdownList}
        </div>
      )}
      {fixedPortal}
    </div>
  )
}
