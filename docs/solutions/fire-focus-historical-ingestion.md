# Focos de queimada: ingestão atual vs histórico longo

## Ingestão em produção (hoje)

- **Fonte**: WFS do INPE / BDQueimadas, camada `ref_focos_qmd_24h` (focos das últimas ~24h no recorte publicado).
- **Job**: [`INPEFiresCollector`](../../apps/backend/src/jobs/collectors/INPEFiresCollector.ts), agendado a cada **3 horas** em [`JobScheduler`](../../apps/backend/src/jobs/JobScheduler.ts).
- **Persistência**: `upsert` em `fire_focuses` com unicidade `(lat, lng, detectedAt)` — o histórico no banco **acumula** enquanto o coletor roda; não há limpeza automática dessa tabela.

Isso **não** carrega anos retroativos num único fetch: cada execução só reflete o snapshot atual da camada 24h.

## Objetivo: anos de histórico antes do deploy

Para preencher o passado sem esperar meses de coleta contínua, é preciso uma **fonte histórica** e um **job de backfill** separado do fluxo 24h.

### Opções de fonte (avaliar licença, cobertura e volume)

| Fonte | Observação |
|--------|------------|
| **NASA FIRMS** | CSV/API por janela de datas; útil para backfill regional/global; respeitar [terms of use](https://earthdata.nasa.gov/). |
| **INPE / BDQueimadas** | Verificar se há camadas WFS/WCS ou downloads históricos alinhados ao mesmo esquema de atributos; pode exigir múltiplas requisições por período. |
| **Outros provedores** | Somente após checar termos e consistência com o modelo `FireFocus` (lat, lng, `detectedAt`, opcional intensidade/satélite/bioma/estado). |

### Esboço de job de backfill

1. **Novo coletor** (ex.: `HistoricalFiresBackfillCollector`) que aceita `since` / `until` (ou ano-safra) e obtém lotes da fonte escolhida.
2. **Execução**: script CLI ou job manual (`npm run …`), **não** no mesmo cron de 3h — limitar paralelismo e usar retries para não sobrecarregar o provedor.
3. **Persistência**: reutilizar `IFireRepository.upsert` para manter idempotência com `(lat, lng, detectedAt)`.
4. **Operação**: documentar limite de dias (`MAX_FIRE_HISTORY_DAYS` no [`FireController`](../../apps/backend/src/infrastructure/http/controllers/FireController.ts)) vs quantidade de linhas no DB; para consultas muito largas no mapa, considerar agregação espacial/temporal no backend no futuro.

Até esse backfill existir, períodos longos na UI só mostram dados **desde que** o coletor 24h venha populando o banco.
