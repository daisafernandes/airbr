# Fire Source Flow

Airbr fire foci come from `apps/backend/src/infrastructure/providers/inpeFiresClient.ts`.

Key details:
- The old WFS URL at `queimadas.dgi.inpe.br/queimadas/geoserver/ows` now returns 404.
- Current official open-data index points to `https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/`.
- `fetchINPEFires()` reads recent daily Brazil CSV files from `csv/diario/Brasil/focos_diario_br_YYYYMMDD.csv`.
- Current daily CSV headers include `id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,...,bioma,frp`.
- INPE daily CSV returns full state names; the backend normalizes them to UF codes so frontend filters such as `state=MA` match city state values.
- `LiveFireRepository` caches all fetched live fires under `live-fires:all` for 1 hour.
- `FireService.listFiresPaginated()` adds nearest municipalities and caches paginated responses for 3 hours.

Gotcha: If the INPE fetch fails, `LiveFireRepository.loadAll()` logs `[LiveFire] INPE fetch failed` and returns an empty list. The UI can look like there are simply no fires, so check backend logs and the provider URL first.
