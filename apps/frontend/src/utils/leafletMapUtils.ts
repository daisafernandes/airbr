/** Escape text for HTML popups (attribute-safe for inner HTML text nodes). */
export function escapeHtmlForLeafletPopup(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function escapeAttrForLeaflet(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

export function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.data)) return record.data as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }
  return []
}
