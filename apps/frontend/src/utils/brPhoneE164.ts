/** Brazil +55: DDD (2) + 8 or 9 digits → E.164 +5511987654321 */
export function brMaskedToE164(masked: string): string | null {
  const d = masked.replace(/\D/g, '')
  if (!d.startsWith('55')) return null
  const afterCountry = d.slice(2)
  if (afterCountry.length < 10 || afterCountry.length > 11) return null
  return `+${d}`
}

export function e164ToBrMasked(e164: string | null | undefined): string {
  if (!e164 || !e164.startsWith('+55')) return ''
  const d = e164.replace(/\D/g, '')
  if (!d.startsWith('55')) return ''
  const n = d.slice(2)
  if (n.length < 10) return ''
  const ddd = n.slice(0, 2)
  const num = n.slice(2)
  if (num.length === 9) {
    return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
  }
  if (num.length === 8) {
    return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`
  }
  return ''
}
