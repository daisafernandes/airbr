# AirBR — Plano de Desenvolvimento

> Roadmap completo com fases incrementais e tracks de agentes paralelos.

---

## Agentes de Desenvolvimento

Cada fase é projetada para múltiplos agentes trabalhando em paralelo. Os agentes abaixo representam tracks independentes:

| Agente | Foco | Responsabilidades |
|--------|------|-------------------|
| **Agente A** | Backend & Infra | Express, DB, Redis, endpoints REST |
| **Agente B** | Data Pipeline | Integrações externas, cron jobs, normalização |
| **Agente C** | Frontend | React, mapa, dashboard, UI/UX |
| **Agente D** | DevOps & Qualidade | Docker, CI/CD, testes, configs |

---

## Fase 0 · Saneamento e Fundação

**Duração estimada:** 1–2 dias  
**Agentes:** A + C + D em paralelo

Corrigir inconsistências do scaffold atual antes de qualquer desenvolvimento novo. Sem isso, os agentes seguintes vão encontrar erros silenciosos.

### Agente A — Corrigir Backend ✅ CONCLUÍDO

- ✅ `DATABASE_URL` agora tem valor padrão (`postgresql://postgres:postgres@localhost:5432/airbr`) em `apps/backend/src/infrastructure/config/env.ts` — app sobe sem banco rodando; `GET /api/v1/health` retorna `503` controlado quando a conexão falha

### Agente C — Corrigir Frontend ✅ CONCLUÍDO

- ✅ Instalar `tailwindcss`, `postcss` e `autoprefixer`; criar `tailwind.config.ts` e `postcss.config.js` em `apps/frontend/`
- ✅ Tokens de cor e tipografia (DM Sans, Bebas Neue, DM Mono) configurados em `apps/frontend/src/styles/global.css`
- ✅ Biblioteca de componentes **shadcn/ui** completa instalada (~40 componentes em `components/ui/`)

### Agente D — Configuração Base ✅ CONCLUÍDO

- ✅ Criar `docker-compose.yml` na raiz com serviços: **PostgreSQL 16 + PostGIS** (`postgis/postgis:16-3.4`), healthcheck via `pg_isready`, volume persistente
- ✅ Criar `apps/backend/jest.config.js` (Jest + ts-jest; config em JS com JSDoc `/** @type {import('jest').Config} */`)
- ✅ Criar `apps/frontend/vitest.config.ts` (Vitest — ambiente `jsdom`, `globals: true`, aliases herdados do `vite.config.ts`)
- ✅ Configurar **GitHub Actions** básico (`.github/workflows/ci.yml`): jobs paralelos de lint + type-check (`tsc --noEmit`) em cada push/PR, Node 20
- ✅ Atualizar `apps/backend/.env.example` com comentários explicativos por variável e `DATABASE_URL` apontando para o Docker Compose local

**Entregas:** Tailwind ✅, shadcn/ui ✅, Docker Compose (Postgres + PostGIS) ✅, Jest config TS ✅, Vitest config ✅, CI básico ✅, .env.example documentado ✅

> **Fase 0 concluída integralmente.**

---

## Fase 1 · Persistência e Primeiros Dados Reais

**Duração estimada:** 3–5 dias  
**Agentes:** A + B em paralelo

Conectar ao banco real e trazer os primeiros dados externos. O Agente A prepara o banco enquanto o Agente B constrói os coletores das APIs gratuitas mais simples.

> **Dependência:** O Agente B deve aguardar o schema do Prisma (Agente A) antes de iniciar a escrita no banco. Alinhar os tipos do `Normalizer` com o schema antes de começar.

### Agente A — Banco de Dados e ORM ✅ CONCLUÍDO

- ✅ **Prisma** instalado com `@prisma/client`
- ✅ `apps/backend/prisma/schema.prisma` com modelos `City`, `AqiReading`, `FireFocus`, `JobLog`
- ✅ Migration `20260329181033_init` criada e aplicada — tabelas criadas no PostgreSQL + PostGIS (Docker Compose local)
- ✅ `node-cache` instalado; `apps/backend/src/infrastructure/cache/NodeCacheService.ts` criado
- ✅ Interface `ICacheService` (`get`, `set`, `invalidate`, `invalidateByPrefix`) em `apps/backend/src/domain/cache/ICacheService.ts`
- ✅ `NodeCacheService` instanciado no `main.ts` (exportado como `cacheService` — pronto para uso nos endpoints da Fase 2)

### Agente B — Primeiros Coletores (APIs gratuitas, sem chave paga) ✅ CONCLUÍDO

- ✅ Interface `ICollector` + `NormalizedReading` em `apps/backend/src/jobs/collectors/ICollector.ts`
- ✅ `OpenWeatherMapCollector` — AQI por coordenada, 1.000 req/dia grátis
- ✅ `AQICNCollector` — +500 estações no Brasil, token gratuito
- ✅ `INPEFiresCollector` — focos de queimada em CSV, polling a cada 3h
- ✅ `OpenMeteoCollector` — clima + UV + AQI, sem necessidade de chave de API
- ✅ `Normalizer` com retry (exponential backoff) e persistência via `JobLog`
- ✅ `apps/backend/data/cities.json` com **50** cidades brasileiras monitoradas (fonte do seed)
- ✅ `JobScheduler` com `node-cron` (adiantado da Fase 2): AQI a cada 1h, queimadas a cada 3h, cleanup diário às 03:00

**Entregas:** Prisma + PostgreSQL ✅, migration aplicada ✅, seed com 50 cidades + 1200 leituras AQI ✅, `ICacheService` + `NodeCacheService` ✅, 4 coletores funcionando ✅, Normalizer unificado ✅.

> **Fase 1 concluída integralmente.**

---

## Fase 2 · Scheduler + API Core

**Duração estimada:** 3–4 dias  
**Agentes:** A + B em paralelo

Automatizar a ingestão de dados e expor os primeiros endpoints REST. É o ponto central de geração de valor do produto.

> **Nota:** Grande parte desta fase foi adiantada durante a Fase 1. O delta implementado nesta fase está marcado abaixo.

### Agente B — Scheduler de Jobs

- ✅ Instalar `node-cron` e criar `JobScheduler` com registro de coletores em `apps/backend/src/jobs/` (adiantado na Fase 1)
- ✅ Configurar schedules: AQI a cada **1h**, Queimadas INPE a cada **3h**, UV/clima a cada **1h**, limpeza a cada **24h** (adiantado na Fase 1)
- ✅ Criar modelo `JobLog` no banco: status, duração, registros inseridos, erros (adiantado na Fase 1)
- ✅ Implementar rate limiting interno (`RateLimiter.ts`) para respeitar limites das APIs gratuitas (adiantado na Fase 1)
- ✅ Implementar retry com exponential backoff para falhas de rede (`retry.ts`) (adiantado na Fase 1)
- ✅ Adicionar `GET /api/v1/admin/jobs` para status dos jobs — `AdminController`, `IJobLogRepository`, `PrismaJobLogRepository`

### Agente A — Endpoints REST Core

> **Redis diferido para v2 (Fase 7).** Cache implementado com `NodeCacheService` (in-process). A interface `ICacheService` garante a migração transparente para Redis quando chegar a Fase 7.

Todos com cache NodeCache (TTL conforme frequência de atualização):

- ✅ `GET /api/v1/cities` — lista com AQI atual, lat/lng e fonte; cache 15 min (adiantado na Fase 1)
- ✅ `GET /api/v1/cities/:id` — dados completos: AQI, PM2.5, PM10, O₃, NO₂, CO, UV, pólen; cache 15 min (adiantado na Fase 1)
- ✅ `GET /api/v1/cities/:id/history?period=24h|7d|30d|1y` — histórico por período; cache 15 min (24h) ou 1h (demais) (adiantado na Fase 1)
- ✅ `GET /api/v1/fires` — focos ativos com filtros por estado e bioma; cache 3h (adiantado na Fase 1)
- ✅ `GET /api/v1/cities/ranking` — top 10 mais e menos poluídas, filtros por região/estado; cache 15 min (adiantado na Fase 1)
- ✅ `GET /api/v1/cities/search?q=` — autocomplete por nome de cidade com estado e AQI atual; cache 15 min (adiantado na Fase 1)
- ✅ `GET /api/v1/cities/nearby?lat=&lng=` — cidades monitoradas próximas a uma coordenada; cache 15 min (adiantado na Fase 1)
- ✅ Cache injetado em `CityService`, `AqiService` e `FireService` via `ICacheService`
- ✅ `Normalizer` invalida prefixos de cache (`cities:` e `fires:`) após jobs bem-sucedidos

**Entregas:** Scheduler com node-cron ✅, JobLog no banco ✅, todos os 7 endpoints core com cache NodeCache ✅, `GET /api/v1/admin/jobs` ✅.

> **Fase 2 concluída integralmente.**

---

## Fase 3 · Frontend Core — MVP Visual

**Duração estimada:** 4–6 dias  
**Agente:** C (pode ser subdividido em C1 e C2)

Construir as telas principais que definem a identidade visual do produto.

### Agente C1 — Mapa Interativo ✅ CONCLUÍDO

> **Decisão arquitetural:** Em vez de `MapPage.tsx` isolado, o mapa foi integrado como tela principal em `DashboardPage.tsx`, que combina mapa + sidebar de ranking numa única rota `/`. Essa abordagem reflete melhor o produto como dashboard ambiental.

- ✅ `apps/frontend/src/components/shared/BrazilMap.tsx` com mapa do Brasil centralizado (tiles CARTO dark), dados via `useCities` hook
- ✅ Marcadores coloridos por faixa de AQI (escala 0–500: verde → amarelo → laranja → vermelho → marrom)
- ✅ Popup de marcador com AQI e link para a página da cidade (rota canônica `/city/:id`; `/cidade/:id` redireciona)
- ✅ Camada de focos de queimada INPE sobrepostos (toggle `showFires`) — dados via `useFires` hook
- ✅ Camada de desmatamento (toggle `showDeforestation`) — dados mock PRODES (substituir na Fase 4)
- ✅ Toggle de camadas: Queimadas | Desmatamento | Estações — controles em `DashboardPage`
- ✅ Botão de geolocalização no `Header` — usa `airQualityService.getNearbyCities` para identificar cidade mais próxima
- ✅ `flyTo` funcional ao selecionar cidade por ID via busca ou geolocalização

### Agente C2 — Páginas de Conteúdo ✅ CONCLUÍDO

- ✅ `apps/frontend/src/services/airQualityService.ts` — 7 métodos mapeados para todos os endpoints da Fase 2
- ✅ Hooks TanStack Query (núcleo Fase 2): `useCities`, `useCity`, `useCityHistory`, `useFires`, `useRanking`, `useSearchCities` — **+** hooks da Fase 4+: `useHealthData`, `useWindSmoke`, `useOutdoorSafety`, `useDeforestation`, `useOMSCompliance`, `useFire`
- ✅ `apps/frontend/src/pages/CityPage.tsx` — página dedicada `/city/:id` (legado `/cidade/:id` → redirect): gauge AQI, poluentes, histórico (7d/30d/1y), segurança ao ar livre, alertas de saúde, metadados
- ✅ `apps/frontend/src/pages/RankingPage.tsx` — ranking completo com filtros por região/estado, dados via `useCities` com sort client-side
- ✅ `apps/frontend/src/components/shared/CitySearchBar.tsx` — autocomplete com debounce 300ms, integrado ao `GET /cities/search`
- ✅ `apps/frontend/src/components/shared/CityDashboard/AQIGauge.tsx` — gauge reutilizável com escala colorida e nível textual
- ✅ `apps/frontend/src/components/shared/CityDashboard/HealthAlertsCard.tsx` — alertas dinâmicos por faixa de AQI
- ✅ `Header` com navegação (Dashboard, Ranking, Mapa Queimadas) e geolocalização real via API
- ✅ `AQISidebar` e `ComparisonPanel` migrados para API real via `useRanking` e `useCity`
- ✅ `FireMapPage` + `FireMap` migrados para `useFires` hook
- ✅ Arquivos órfãos removidos: `HomePage.tsx`, `RootLayout.tsx`, todos os `.js` compilados do `src/`

> **Design system:** tokens de cor e tipografia (DM Sans, Bebas Neue, DM Mono em `global.css`). Componentes shadcn/ui. Mapa com esquema escuro alinhado ao brand.
>
> **Evoluções além do plano original (já no código):** i18n (`react-i18next`, `src/lib/i18n.ts`), rotas `/guide` (glossário), `/profile`, fluxo de recuperação de senha (`/forgot-password`, `/reset-password`), e metadados de foco de queimada (`/maps/foco/:id`).
>
> **Campos diferidos para Fase 4:** `windDirection`/`windSpeed` (vento real Open-Meteo), `nearbyFires` cross-referenciado por proximidade, `forecast` de AQI, dados DATASUS (internações respiratórias), camada PRODES (desmatamento real).

**Entregas:** `airQualityService.ts` ✅, hooks TanStack Query (core + Fase 4) ✅, `CityPage` full-page ✅, `CityDashboard` panel ✅, `CitySearchBar` com debounce ✅, `RankingPage` ✅, `FireMapPage` com dados reais ✅, `Header` navegação + geolocalização ✅, limpeza de artefatos ✅.

> **Fase 3 concluída integralmente.**

---

## Fase 4 · Fontes Oficiais BR + Features Avançadas

**Duração estimada:** 5–7 dias  
**Agentes:** A + B + C em paralelo

Integrar as fontes que fazem o diferencial do produto: dados oficiais brasileiros e correlações únicas que nenhuma outra plataforma realiza.

> **Diferencial único:** O cruzamento INPE (queimadas) + Open-Meteo (direção do vento) + DATASUS (internações) é o que nenhuma outra plataforma brasileira faz. Priorizar o endpoint `/wind-smoke` e o painel de saúde pública.

### Agente B — Novas Fontes de Dados

- ✅ `CETESBCollector` — sistema QUALAR, XML, PM2.5/PM10/O₃/NO₂ hora a hora para São Paulo
- ✅ `IEMACollector` — 11 estados, dados históricos, 82 localidades
- ✅ `IATCollector` — IQA diário da Região Metropolitana de Curitiba
- ✅ `PRODESCollector` — alertas de desmatamento INPE (shapefiles → GeoJSON)
- ✅ `DATASUSCollector` — internações respiratórias por município via API TabNet
- ✅ `IBGECollector` — população por município, percentual de idosos e crianças
- ✅ `Normalizer` atualizado para absorver os novos formatos (XML do CETESB via `fast-xml-parser`; PRODES/DATASUS/IBGE gerenciam sua própria persistência)

### Agente A — Endpoints Avançados ✅ CONCLUÍDO

- ✅ `GET /api/v1/cities/:id/health` — internações respiratórias + grupos de risco + correlação com AQI histórico (DATASUS + IBGE)
- ✅ `GET /api/v1/deforestation` — áreas desmatadas recentes por estado correlacionadas com queimadas e AQI regional (PRODES)
- ✅ `GET /api/v1/cities/:id/wind-smoke` — direção do vento (Open-Meteo) + focos INPE = origem da fumaça que afeta a cidade
- ✅ `GET /api/v1/cities/:id/outdoor-safety` — score composto: AQI + UV + pólen + temperatura
- ✅ `GET /api/v1/oms-compliance` — cidades acima/abaixo do limite PM2.5 da OMS (5 µg/m³), ranking nacional
- ✅ Índice geoespacial PostGIS criado via migration `20260329_phase4_postgis_index` (`cities_geo_idx` com `ST_DWithin`)

### Agente C — Painéis Avançados ✅ CONCLUÍDO

- ✅ **Painel de Saúde Pública** — `PublicHealthCard.tsx`: gráfico de internações respiratórias × histórico de AQI
- ✅ **"De onde vem a fumaça?"** — `SmokeSourceCard.tsx`: direção do vento + focos INPE destacados
- ✅ **Índice "Seguro ao Ar Livre"** — `OutdoorSafetyCard.tsx`: card com score composto (AQI + UV + pólen + temperatura)
- ✅ **Conformidade OMS** — `OMSCompliancePanel.tsx` + `OmsComplianceBadge.tsx`: ranking nacional de PM2.5
- ✅ **Camada de desmatamento** no mapa — polígonos PRODES via `useDeforestation` hook em `BrazilMap.tsx`

**Entregas:** 6 de 6 coletores BR oficiais ✅, 5 endpoints avançados ✅, índice PostGIS ✅, 5 painéis avançados no frontend ✅.

#### Delta — Ajustes da Fase 4

- ✅ `apps/backend/src/jobs/collectors/IEMACollector.ts` — coletor para o Instituto Estadual do Meio Ambiente (IEMA), 11 estados, dados históricos, 82 localidades; registrado no `aqiCollectors` (schedule AQI 1h via `JobScheduler`)
- ✅ `apps/backend/src/jobs/collectors/IATCollector.ts` — coletor para o Instituto Água e Terra (IAT/Paraná), IQA diário da Região Metropolitana de Curitiba; registrado no `aqiCollectors`
- ✅ `apps/backend/src/infrastructure/config/collectorEnv.ts` — resumo de tokens/flags de coletores (sem expor segredos), alinhado a `env` e scripts de validação

> **Fase 4 concluída integralmente.**

---

## Fase 5 · Alertas e Notificações

**Duração estimada:** 3–4 dias  
**Agentes:** A + C em paralelo

Sistema de alertas proativo: o usuário define limites e é notificado quando o AQI ultrapassa o threshold em sua cidade favorita.

### Agente A — Sistema de Alertas ✅ CONCLUÍDO

- ✅ Modelo `Alert` no Prisma vinculado a **conta autenticada** (`userId`), com `cityId`, `thresholdAqi`, `channels` (EMAIL | PUSH) e `active`
- ✅ `POST /api/v1/alerts` — cadastrar alerta para o usuário logado
- ✅ `GET /api/v1/alerts` — listar alertas do usuário logado
- ✅ `DELETE /api/v1/alerts/:id` — remover alerta
- ✅ `PATCH /api/v1/alerts/:id` — ativar/desativar alerta (incremento além do plano inicial)
- ✅ `AlertChecker` em cron `*/15 * * * *` (a cada 15 minutos): verifica AQI e dispara notificações quando o threshold é ultrapassado
- ✅ Integração de e-mail com **Resend** (preferencial) e **Nodemailer/SMTP** como fallback
- ✅ Integração com **Web Push API** via chaves VAPID

### Agente C — UI de Alertas ✅ CONCLUÍDO

- ✅ `apps/frontend/src/pages/AlertsPage.tsx`: escolher cidade, definir threshold de AQI e selecionar canal (e-mail e/ou push)
- ✅ Listagem de alertas ativos com remoção e toggle de ativo/inativo
- ✅ Solicitação de permissão de Push Notification no browser
- ✅ Registro de Service Worker para receber push mesmo com o app fechado

**Entregas:** `POST/GET/DELETE/PATCH /alerts` ✅, AlertChecker ✅, e-mail de alerta ✅, Web Push (VAPID) ✅, UI de gerenciamento ✅, Service Worker ✅.

> **Fase 5 concluída integralmente.**

---

## Fase 6 · Qualidade, Performance e Deploy

**Duração estimada:** 3–4 dias  
**Agentes:** D (principal) + A + C em paralelo

Preparar o produto para produção real: testes, performance e infraestrutura de deploy.

> **Estado no código (abr/2026):** parte do item **Agente A** (testes, HTTP) e **Agente C** (PWA, E2E) já está implementada; **Dockerfiles** e **compose multi-serviço** ainda não. Redis continua fora do escopo v1 (cache em processo — Fase 7).

### Agente D — Infraestrutura de Produção

- ❌ **Pendente:** `apps/backend/Dockerfile` multi-stage (build TypeScript → runtime Node mínimo)
- ❌ **Pendente:** `apps/frontend/Dockerfile` (build Vite → Nginx)
- ❌ **Pendente:** `docker-compose.yml` na raiz com backend + frontend + postgres + redis (hoje só **PostgreSQL/PostGIS** para desenvolvimento local)
- ❌ **Pendente:** pipeline CI que faça **build de imagem** + push + deploy (o `.github/workflows/ci.yml` atual cobre lint, type-check, testes backend e E2E — ver abaixo)
- ⚠️ **Parcial:** variáveis por ambiente documentadas em `.env.example`; automação staging/production ainda manual
- ⚠️ **Parcial:** `GET /api/v1/health` — verifica **PostgreSQL** (`SELECT 1`); **sem Redis** (coerente com adiar Redis à Fase 7)

### Agente A — Performance e Testes

- **1) Testes (unitário + integração)**
  - **Resultado esperado:** suíte de testes unitários cobrindo `services`, `collectors` e `normalizer`, além de testes de integração para endpoints críticos (`/cities`, `/cities/:id`, `/cities/:id/history`, `/fires`, `/alerts`) com banco de teste isolado.
  - **Critério objetivo de aceite:** cobertura global mínima de **70%** (linhas) no backend e execução dos testes de integração sem dependência de banco de desenvolvimento.
  - **Evidência de validação:** `npm run test --filter=@airbr/backend -- --coverage` e job de CI `test-backend` verde com relatório de cobertura anexado.
  - **Status:** ✅ **Concluído** para o **escopo atual** do `collectCoverageFrom` em `jest.config.js` (serviços críticos, repositórios, utilidades alinhadas ao threshold).
  - **Implementado no repositório:**
    - Unitários: `AuthService.test.ts`, `AlertService.test.ts`, `CityService.test.ts`, `alertNotificationCopy.test.ts`, `AlertChecker.test.ts`, entre outros.
    - Integração: `PrismaAlertRepository.integration.test.ts`, `api.integration.test.ts` (fluxo auth + alertas + métricas), etc.
    - Config: `apps/backend/jest.config.js` com `coverageThreshold` no conjunto coletado.
  - **Resultado aferido (referência histórica 31/03/2026):** ~**75%+** de linhas no escopo medido; revalidar com `npm run test:cov` no backend.
- **2) Performance HTTP**
  - **Implementado:** `compression` em `createApp.ts`; `express-rate-limit` em `/api/v1` (`apiRateLimiter`) e limite mais restrito em `/api/v1/admin` (`adminRateLimiter`); paginação via `sanitizePagination` e query `page`/`limit` onde aplicável (ex.: `CityController`).
  - **Pendente:** testes automatizados que garantam **429** sob carga e `Content-Encoding: gzip` nos cenários previstos; validação manual com `curl` em staging ainda não substitui o critério de aceite.
- **3) Performance de banco**
  - **Pendente:** rodada formal de `EXPLAIN ANALYZE` + migrations de índice adicionais além do já existente (ex.: PostGIS na Fase 4), com evidência antes/depois.

### Agente C — Performance e PWA

- ✅ **PWA** — `vite-plugin-pwa` em `apps/frontend/vite.config.ts` (manifest, `injectManifest` com `src/sw.ts`)
- ❌ **Pendente:** **code splitting** por rota com `React.lazy` + `Suspense` (rotas ainda importadas de forma estática em `App.tsx`)
- ⚠️ **Parcial:** dependência `leaflet.markercluster` presente no `package.json`, mas **sem uso** no mapa ainda — clustering não está ligado
- ⚠️ **Parcial:** componente base `Skeleton` (shadcn) existe; não há skeleton em **todas** as telas com loading assíncrono
- ✅ **E2E Playwright** — `apps/frontend/tests/e2e/critical-map-search-city-alerts.spec.ts` (mapa → busca → cidade → registro → alerta); job `e2e` no CI com Postgres + `prisma migrate deploy`

### CI (GitHub Actions)

- ✅ Jobs: **lint**, **type-check** (`tsc --noEmit` backend + frontend), **test-backend** (Postgres service + migrations + `npm run test` no workspace backend), **e2e** (Postgres + Playwright Chromium + `npm run test:e2e` no frontend)

**Entregas alvo da fase:** Dockerfiles multi-stage, CI/CD completo com imagens, cobertura > 70% (escopo ampliado), rate limiting validado em testes, PWA instalável, marker clustering no mapa, E2E com Playwright.

**Progresso (abr/2026):** testes backend (escopo atual) ✅ · compressão + rate limit + paginação ✅ · CI com testes + E2E ✅ · PWA ✅ · Playwright ✅ · Docker / compose produção ❌ · lazy routes ❌ · clustering no mapa ❌ · testes 429/gzip ❌ · EXPLAIN/indexação adicional ❌

---

## Fase 7 · v2 — Comunidade, API Pública e Widget

**Duração estimada:** A definir após v1 estável em produção  
**Agentes:** A + B + C + D

Features de crescimento orgânico e abertura do ecossistema. Iniciar apenas após v1 estável.

### Agente B — Relatos da Comunidade

- Endpoint `POST /api/v1/reports` — usuário reporta fumaça, cheiro, visibilidade reduzida
- Modelo `CommunityReport`: `lat`, `lng`, `type`, `description`, `verifiedAt`
- Job de moderação automática: cruzar relatos com dados de satélite para validação
- Camada de relatos no mapa com ícones distintos por tipo de reporte

### Agente A — Cache Distribuído + API Pública Aberta

- Migrar `NodeCacheService` → `RedisCache` (`ioredis`): criar `apps/backend/src/infrastructure/cache/RedisCache.ts` implementando `ICacheService`; adicionar serviço **Redis 7** ao `docker-compose.yml`; manter fallback gracioso (sem Redis = sem cache, sem erro)
- Expor versão pública da API (subdomínio `api.airbr.com.br`) com documentação **Swagger / OpenAPI**
- Sistema de **API Keys** para desenvolvedores externos com dashboard de uso
- Rate limiting diferenciado por tier — free: 100 req/h, pro: 10.000 req/h
- Painel de métricas de uso: calls/dia, endpoints mais utilizados, top consumidores

### Agente C — Widget Embeddável

- Build separado via Vite: componente como **Web Component** (`<airbr-widget city="sao-paulo">`)
- Tamanho máximo: < 30 KB gzip
- Personalizável via atributos HTML: `theme` (dark | light), `compact` (apenas AQI ou completo)
- Página de geração de código embed — target: prefeituras, portais de notícia, portais meteorológicos

**Entregas:** Community Reports, API pública com API Keys, Swagger docs, widget embeddável < 30 KB.

---

## Fase 8 · v2 — Contas de Usuário e Autenticação

**Duração estimada:** A definir após v1 estável em produção  
**Agentes:** A + C em paralelo

Introduzir sistema de identidade completo, vinculando alertas e relatos a contas de usuário e habilitando experiências personalizadas.

> **Estado no código (abr/2026):** o núcleo de **conta + JWT + alertas por `userId`** já está implementado (Fase 5 + evolução). O que falta em relação ao texto original desta fase é sobretudo **Community Reports**, **gamificação** e alguns **detalhes de UX** (ex.: indicação na página da cidade).

### Agente A — Backend de Autenticação

- ✅ `bcryptjs` + JWT (`@infrastructure/auth/jwt`, `AuthService` com hash de senha)
- ✅ Modelo `User` no Prisma (`email`, `passwordHash`, `name`, `phone`, `defaultCityId`, `preferredLocale`, relações com `Alert` e `PushSubscription`)
- ✅ Middleware `requireAuth` (`apps/backend/src/infrastructure/http/middlewares/requireAuth.ts`) — Bearer JWT nas rotas protegidas
- ✅ `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- ✅ `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me` — perfil do usuário autenticado
- ✅ `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
- ✅ Modelo `Alert` com `userId` (sem e-mail solto no alerta)
- ❌ **Pendente (v2):** `CommunityReport` + `userId`; gamificação "Colaborador AirBR"
- ⚠️ **`/api/v1/admin/*`:** proteção por **`ADMIN_API_KEY`** (`requireAdminAuth` — Bearer ou `X-Admin-Key`), **não** por JWT de usuário (diverge do bullet original "JWT no admin")

### Agente C — Frontend de Autenticação

> **Infraestrutura e fluxos já presentes no repositório:**
>
> | Item | Arquivo | Status |
> |------|---------|--------|
> | `AuthContext` + `authService.me()` ao iniciar sessão | `apps/frontend/src/contexts/AuthContext.tsx` | ✅ |
> | `authService` (`login`, `register`, `me`, `updateMe`, recuperação de senha) | `apps/frontend/src/services/authService.ts` | ✅ |
> | Interceptor 401 → `/login` | `apps/frontend/src/services/api.ts` | ✅ |
> | `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `ProfilePage` | `apps/frontend/src/pages/` + rotas em `App.tsx` | ✅ |
> | Rotas protegidas (ex.: alertas) | `ProtectedRoute` / fluxo que redireciona anônimos | ✅ |

- ❌ **Pendente:** indicador na **`CityPage`** quando o usuário logado já tem **alerta ativo** para aquela cidade (API de alertas por cidade ou filtro client-side)
- ✅ **Entregue:** alertas persistidos por **conta** via API (`GET/POST/PATCH/DELETE /alerts` com JWT) — já comportamento entre dispositivos ao usar a mesma conta

**Entregas originais da fase:** em grande parte **atendidas** para auth + perfil + alertas por usuário; **pendentes** para fechar o texto do plano: Community Reports, gamificação, proteção admin conforme desenho (hoje é API key), UX de alerta na cidade.

---

## Estimativas de Tempo

| Fase | Descrição | Solo | Com agentes paralelos |
|------|-----------|------|-----------------------|
| Fase 0 | Saneamento | 1–2 dias | 1 dia |
| Fase 1 | Persistência e coletores | 3–5 dias | 2–3 dias |
| Fase 2 | Scheduler + API core | 3–4 dias | 2–3 dias |
| Fase 3 | Frontend MVP | 4–6 dias | 2–4 dias |
| Fase 4 | Fontes BR + features avançadas | 5–7 dias | 3–4 dias |
| Fase 5 | Alertas e notificações | 3–4 dias | 2–3 dias |
| Fase 6 | Qualidade + deploy | 3–4 dias | 2–3 dias |
| **Total v1** | | **~22–32 dias** | **~12–18 dias** |
| Fase 7 | v2 — Comunidade + API Pública + Widget | A definir | A definir |
| Fase 8 | v2 — Contas de Usuário e Autenticação | A definir | A definir |

> As fases 0 → 2 têm dependências sequenciais entre os Agentes A e B. A partir da Fase 3, os agentes são quase totalmente independentes e o paralelismo é mais eficiente.

---

## Regras de Coordenação entre Agentes

### Schema Prisma é a fonte da verdade
O Agente A é o único que cria ou altera migrations. Agentes B e C nunca modificam o schema diretamente. Qualquer mudança de modelo passa pela revisão do Agente A.

### Branches por fase
Cada agente trabalha em sua própria branch seguindo o padrão `feat/phase-N-agente-X`. PRs são integrados ao `main` apenas ao término de cada fase, nunca no meio do desenvolvimento simultâneo.

### Pacote de tipos compartilhados
Criar `packages/shared-types/` no workspace npm com os tipos de response da API. Tanto o backend (Agente A) quanto o frontend (Agente C) importam deste pacote, garantindo consistência sem duplicação.

> **Estado (abr/2026):** ainda **não** existe o pacote `packages/shared-types/`; tipos duplicados permanecem em `apps/frontend/src/types/` e DTOs no backend.

### Seed de dados obrigatório
O Agente B mantém `apps/backend/prisma/seed.ts` com dados de exemplo: 50 cidades e as últimas 24h de leituras de AQI mockadas. Isso permite o Agente C desenvolver e testar o frontend sem depender dos jobs de ingestão estarem rodando.

### Zero credenciais no código
Nenhum agente faz commit de chaves de API, tokens ou senhas. Toda credencial vai para `.env` local (gitignored) e GitHub Secrets para CI/CD. O Agente D é o guardião dessas regras no pipeline de CI.

### Métricas de sucesso para v1
- Cobertura de cidades monitoradas: > 100
- Dados atualizando corretamente nos intervalos definidos
- Mapa carregando em < 3s na conexão 4G
- Score Lighthouse (Performance + Accessibility): > 85
- Zero segredos expostos no repositório
- CI verde em 100% dos PRs antes do merge
