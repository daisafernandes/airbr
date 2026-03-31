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
- ✅ Criar `apps/backend/jest.config.ts` (Jest + ts-jest — migrado de `.js` para `.ts` com tipagem `Config`)
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
- ✅ `apps/backend/data/cities.json` com 50 cidades brasileiras monitoradas
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
- ✅ Popup de marcador com AQI e link `→ Ver página completa` apontando para `/cidade/:id`
- ✅ Camada de focos de queimada INPE sobrepostos (toggle `showFires`) — dados via `useFires` hook
- ✅ Camada de desmatamento (toggle `showDeforestation`) — dados mock PRODES (substituir na Fase 4)
- ✅ Toggle de camadas: Queimadas | Desmatamento | Estações — controles em `DashboardPage`
- ✅ Botão de geolocalização no `Header` — usa `airQualityService.getNearbyCities` para identificar cidade mais próxima
- ✅ `flyTo` funcional ao selecionar cidade por ID via busca ou geolocalização

### Agente C2 — Páginas de Conteúdo ✅ CONCLUÍDO

- ✅ `apps/frontend/src/services/airQualityService.ts` — 7 métodos mapeados para todos os endpoints da Fase 2
- ✅ Hooks TanStack Query: `useCities`, `useCity`, `useCityHistory`, `useFires`, `useRanking`, `useSearchCities`
- ✅ `apps/frontend/src/pages/CityPage.tsx` — página dedicada `/cidade/:id`: gauge AQI, poluentes, histórico (7d/30d/1y), segurança ao ar livre, alertas de saúde, metadados
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
> **Campos diferidos para Fase 4:** `windDirection`/`windSpeed` (vento real Open-Meteo), `nearbyFires` cross-referenciado por proximidade, `forecast` de AQI, dados DATASUS (internações respiratórias), camada PRODES (desmatamento real).

**Entregas:** `airQualityService.ts` ✅, 6 hooks TanStack Query ✅, `CityPage` full-page ✅, `CityDashboard` panel ✅, `CitySearchBar` com debounce ✅, `RankingPage` ✅, `FireMapPage` com dados reais ✅, `Header` navegação + geolocalização ✅, limpeza de artefatos ✅.

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

### Agente D — Infraestrutura de Produção

- Criar `apps/backend/Dockerfile` multi-stage (build TypeScript → runtime Node mínimo)
- Criar `apps/frontend/Dockerfile` (build Vite → Nginx)
- Atualizar `docker-compose.yml` da raiz com todos os serviços (backend, frontend, postgres, redis)
- Atualizar GitHub Actions (`.github/workflows/ci.yml`) com pipeline completo: test → build → push imagem → deploy
- Configurar variáveis de ambiente por ambiente (development / staging / production)
- Adicionar `GET /api/v1/health` para monitoramento externo (uptime, versão, status do DB e Redis)

### Agente A — Performance e Testes

- Testes de unidade para services, collectors e normalizer (cobertura > 70%)
- Testes de integração para os endpoints principais usando banco de teste isolado
- Implementar **paginação** em todos os endpoints que retornam listas
- Adicionar **rate limiting** na API pública com `express-rate-limit`
- Adicionar middleware de **compressão gzip** (`compression`)
- Revisar índices do banco para queries mais lentas (identificadas via `EXPLAIN ANALYZE`)

### Agente C — Performance e PWA

- Configurar **PWA** com `vite-plugin-pwa` (Web App Manifest + Service Worker de cache)
- Implementar **code splitting** por rota com `React.lazy` + `Suspense`
- Otimizar o mapa: **marker clustering** (`react-leaflet-cluster`) para lidar com > 500 pontos sem travamento
- Adicionar **skeleton screens** em todos os componentes com loading assíncrono
- Testes E2E com **Playwright**: fluxo completo mapa → busca → cidade → configurar alerta

**Entregas:** Dockerfiles multi-stage, CI/CD completo, cobertura > 70%, rate limiting, PWA instalável, marker clustering, E2E com Playwright.

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

### Agente A — Backend de Autenticação

- Instalar `bcryptjs`, `@types/bcryptjs`, `jsonwebtoken` e `@types/jsonwebtoken`
- Adicionar modelo `User` ao schema Prisma: `id`, `email`, `passwordHash`, `name`, `createdAt`
- Criar `apps/backend/src/infrastructure/http/middlewares/authMiddleware.ts` com verificação do Bearer token
- `POST /api/v1/auth/register` — criação de conta com hash de senha
- `POST /api/v1/auth/login` — autenticação com retorno de JWT
- `GET /api/v1/users/:id` — perfil do usuário autenticado
- Migrar modelo `Alert`: substituir campo `email` por `userId`, vinculando alertas à conta
- Vincular `CommunityReport` a `userId` para rastreabilidade
- Proteger `GET /api/v1/admin/jobs` com JWT
- Gamificação: badge "Colaborador AirBR" para reporters frequentes

### Agente C — Frontend de Autenticação

> **Infraestrutura antecipada — já implementada antes desta fase:**
>
> | Item | Arquivo | Status |
> |------|---------|--------|
> | `AuthContext` com JWT + localStorage | `apps/frontend/src/contexts/AuthContext.tsx` | ✅ pre-built |
> | Axios interceptor 401 → `/login` | `apps/frontend/src/services/api.ts` | ✅ pre-built |
> | `userService.ts` (create + getById) | `apps/frontend/src/services/userService.ts` | ✅ pre-built |
> | `useCreateUser` hook (TanStack Query) | `apps/frontend/src/hooks/useCreateUser.ts` | ✅ pre-built |
> | `user.types.ts` + `api.types.ts` | `apps/frontend/src/types/` | ✅ pre-built |
> | Zod schema `createUserSchema` | `apps/frontend/src/utils/validators.ts` | ✅ pre-built |
>
> **Delta restante para completar esta fase:**

- ❌ Criar `apps/frontend/src/services/authService.ts` com métodos `login`, `register` e `logout`
- ❌ Criar `apps/frontend/src/pages/LoginPage.tsx` + rota `/login`
- ❌ Criar `apps/frontend/src/pages/RegisterPage.tsx` + rota `/register` (usando o hook `useCreateUser`)
- ❌ Conectar `AuthContext.signIn` ao endpoint real `POST /api/v1/auth/login` (atualmente o contexto existe mas sem endpoint real)
- ✅ Interceptor Axios para redirecionar ao `/login` em respostas 401 — já implementado em `services/api.ts`
- ❌ Indicador visual na `CityPage` quando o usuário autenticado já tem um alerta ativo para aquela cidade
- ❌ Persistência de alertas vinculada à conta entre dispositivos

**Entregas:** Modelo `User` no banco, `POST /auth/register`, `POST /auth/login`, JWT + authMiddleware, páginas `/login` e `/register`, alertas vinculados à conta, gamificação de reporters.

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
