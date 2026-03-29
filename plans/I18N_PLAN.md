# Plano de Internacionalização — Airbr Frontend

## Contexto e decisões arquiteturais

**Biblioteca escolhida:** `react-i18next` + `i18next`
- Padrão de mercado, suporte TypeScript nativo, lazy loading por namespace, integra com localStorage/detector de idioma do navegador
- Alternativa (`react-intl`) descartada por ser mais verbosa sem ganho real para este caso

**Idiomas:** Português (padrão), Inglês, Espanhol

**Complexidade principal:** o arquivo `utils/aqiInfo.ts` contém dados estruturados com texto em PT puro (`label`, `healthImpact`, `recommendation`, `description`…). Precisará tratamento especial — as strings saem do objeto e entram nos arquivos de tradução.

---

## Phase 1 — Infraestrutura

### 1.1 Instalar dependências

```bash
npm install i18next react-i18next i18next-browser-languagedetector --filter=@airbr/frontend
```

### 1.2 Criar estrutura de locales

```
apps/frontend/src/locales/
├── pt/
│   └── translation.json   ← strings extraídas de todos os componentes
├── en/
│   └── translation.json
└── es/
    └── translation.json
```

### 1.3 Criar `src/lib/i18n.ts`

Configuração central do i18next:
- Idioma padrão: `pt`
- `LanguageDetector` com fallback para `pt`
- Persistência via `localStorage` (chave `i18nextLng`)

```ts
// apps/frontend/src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import pt from '@/locales/pt/translation.json'
import en from '@/locales/en/translation.json'
import es from '@/locales/es/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: { escapeValue: false },
  })

export default i18n
```

### 1.4 Registrar no `App.tsx`

Importar `src/lib/i18n.ts` como side-effect antes de qualquer componente:

```ts
import '@/lib/i18n'
```

---

## Phase 2 — Arquivos de tradução

Estrutura do `translation.json` organizada por namespace semântico:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "ranking": "Ranking",
    "fireMap": "Mapa Queimadas",
    "guide": "Guia"
  },
  "aqi": {
    "bands": {
      "good":           { "label": "Bom",                "healthImpact": "...", "recommendation": "..." },
      "moderate":       { "label": "Moderado",           "healthImpact": "...", "recommendation": "..." },
      "sensitiveGroup": { "label": "Ruim para sensíveis","healthImpact": "...", "recommendation": "..." },
      "unhealthy":      { "label": "Ruim",               "healthImpact": "...", "recommendation": "..." },
      "veryUnhealthy":  { "label": "Muito ruim",         "healthImpact": "...", "recommendation": "..." },
      "hazardous":      { "label": "Perigoso",           "healthImpact": "...", "recommendation": "..." }
    }
  },
  "pollutants": {
    "pm25": { "fullName": "Material Particulado Fino",   "whoLimitPeriod": "média anual", "description": "...", "sources": "...", "effects": "..." },
    "pm10": { "fullName": "Material Particulado Inalável","whoLimitPeriod": "média anual", "description": "...", "sources": "...", "effects": "..." },
    "no2":  { "fullName": "Dióxido de Nitrogênio",       "whoLimitPeriod": "média anual", "description": "...", "sources": "...", "effects": "..." },
    "o3":   { "fullName": "Ozônio Troposférico",         "whoLimitPeriod": "média de 8 horas", "description": "...", "sources": "...", "effects": "..." },
    "co":   { "fullName": "Monóxido de Carbono",         "whoLimitPeriod": "média de 24 horas", "description": "...", "sources": "...", "effects": "..." }
  },
  "uv": {
    "low":      { "label": "Baixo",      "recommendation": "..." },
    "moderate": { "label": "Moderado",   "recommendation": "..." },
    "high":     { "label": "Alto",       "recommendation": "..." },
    "veryHigh": { "label": "Muito Alto", "recommendation": "..." },
    "extreme":  { "label": "Extremo",    "recommendation": "..." }
  },
  "pollen": {
    "low":      { "label": "Baixo",      "recommendation": "..." },
    "moderate": { "label": "Moderado",   "recommendation": "..." },
    "high":     { "label": "Alto",       "recommendation": "..." },
    "veryHigh": { "label": "Muito Alto", "recommendation": "..." }
  },
  "dashboard": {
    "layers": "Camadas",
    "fires": "Queimadas",
    "deforestation": "Desmatamento",
    "stations": "Estações",
    "compareCities": "Comparar cidades",
    "exitComparison": "Sair da comparação",
    "lastUpdate": "Última atualização"
  },
  "cityDashboard": {
    "forecast": "PREVISÃO 3 DIAS",
    "healthAlerts": "ALERTAS DE SAÚDE",
    "noAlerts": "Nenhum alerta ativo. Qualidade do ar boa.",
    "pollutants": "POLUENTES",
    "outdoorSafety": "SEGURANÇA AO AR LIVRE",
    "publicHealth": "SAÚDE PÚBLICA",
    "smokeSource": "FONTE DA FUMAÇA"
  },
  "ranking": {
    "title": "Ranking de Qualidade do Ar",
    "city": "Cidade",
    "state": "Estado",
    "aqi": "IQA",
    "status": "Status"
  },
  "glossary": {
    "title": "Guia de Qualidade do Ar"
  },
  "common": {
    "loading": "Carregando...",
    "error": "Erro ao carregar dados",
    "noData": "Sem dados disponíveis",
    "lastUpdate": "Última atualização",
    "source": "Fonte",
    "search": "Buscar cidade..."
  },
  "notFound": {
    "title": "Página não encontrada",
    "backHome": "Voltar ao início"
  }
}
```

### Tratamento especial de `aqiInfo.ts`

As constantes `AQI_BANDS`, `UV_LEVELS`, `POLLEN_LEVELS`, `POLLUTANT_INFO` e `DATA_SOURCES` têm campos traduzíveis.

**Estratégia:** manter os campos numéricos/cores/limites no objeto (são universais) e expor uma função utilitária que recebe `t` e devolve o objeto enriquecido com as traduções:

```ts
// utils/aqiInfo.ts
import type { TFunction } from 'i18next'

export const getAqiBands = (t: TFunction) => [
  { min: 0,   max: 50,  color: '#4af0c4', label: t('aqi.bands.good.label'),           healthImpact: t('aqi.bands.good.healthImpact'),           recommendation: t('aqi.bands.good.recommendation') },
  { min: 51,  max: 100, color: '#facc15', label: t('aqi.bands.moderate.label'),       healthImpact: t('aqi.bands.moderate.healthImpact'),       recommendation: t('aqi.bands.moderate.recommendation') },
  // ...
]
```

---

## Phase 3 — Seletor de idioma na UI

### 3.1 Criar `components/ui/LanguageSelector.tsx`

```tsx
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
]

export const LanguageSelector = () => {
  const { i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><Globe className="w-4 h-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map(lang => (
          <DropdownMenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}>
            {lang.flag} {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 3.2 Integrar no `Header.tsx`

Adicionar `<LanguageSelector />` ao lado dos links de navegação. O idioma selecionado persiste via `localStorage` automaticamente pelo `LanguageDetector`.

---

## Phase 4 — Migração de componentes

Substituir strings hardcoded por `const { t } = useTranslation()` em cada arquivo, seguindo esta ordem de prioridade (maior impacto primeiro):

| Prioridade | Arquivo | Motivo |
|---|---|---|
| 1 | `utils/aqiInfo.ts` | Dados reutilizados em muitos componentes |
| 2 | `components/shared/Header.tsx` | Visível em todas as páginas |
| 3 | `components/shared/CityDashboard/*` (8 arquivos) | Core do produto |
| 4 | `pages/DashboardPage.tsx` | Página principal |
| 5 | `components/shared/AQISidebar.tsx` | Sidebar principal |
| 6 | `components/shared/RankingTable.tsx` | Tabela de ranking |
| 7 | `pages/RankingPage.tsx`, `FireMapPage.tsx`, `CityPage.tsx` | Páginas secundárias |
| 8 | `pages/GlossaryPage.tsx` | Guia com muito texto |
| 9 | `pages/NotFoundPage.tsx` | Simples, poucos strings |

**Padrão de uso em componentes:**

```tsx
import { useTranslation } from 'react-i18next'

export const MyComponent = () => {
  const { t } = useTranslation()
  return <h1>{t('cityDashboard.forecast')}</h1>
}
```

**Formatação de datas com locale:**

```ts
// utils/formatters.ts
import i18n from '@/lib/i18n'

const LOCALE_MAP: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) =>
  date.toLocaleString(LOCALE_MAP[i18n.language] ?? 'pt-BR', options)
```

---

## Phase 5 — TypeScript type-safety

Configurar `i18next` para inferir tipos a partir dos arquivos JSON:

```ts
// src/types/i18n.d.ts
import 'i18next'
import translation from '@/locales/pt/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof translation }
  }
}
```

Isso garante que `t('aqi.bands.good.label')` seja checado pelo TypeScript — chaves inválidas viram erros de compilação.

---

## O que NÃO muda

- Rotas (`/mapa-queimadas`, `/guia`) ficam em PT — são slugs de URL, não UI
- Nomes de cidades permanecem em PT (são dados geográficos do backend)
- Componentes `ui/` da Radix/shadcn não precisam de tradução (são primitivos sem texto próprio)

---

## Estimativa de esforço

| Phase | Complexidade | Estimativa |
|---|---|---|
| 1 — Infraestrutura | Baixa | ~1h |
| 2 — Arquivos de tradução (3 idiomas) | Alta | ~4–6h |
| 3 — Seletor de idioma na UI | Baixa | ~30min |
| 4 — Migração de ~17 componentes | Média | ~4–6h |
| 5 — TypeScript type-safety | Baixa | ~30min |
| **Total** | | **~10–14h** |
