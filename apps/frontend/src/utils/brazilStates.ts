/** UF → nome por extenso (pt-BR), para exibição tipo "Mato Grosso (MT)". */
const UF_TO_NAME: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

/**
 * Formata estado para exibição: sigla de 2 letras → "Nome completo (UF)".
 * Outros valores são devolvidos como estão (trim).
 */
export function formatStateLabel(state: string | null | undefined): string | null {
  if (state == null) return null
  const s = state.trim()
  if (s.length === 0) return null
  if (s.length === 2) {
    const uf = s.toUpperCase()
    const name = UF_TO_NAME[uf]
    if (name) return `${name} (${uf})`
  }
  return s
}
