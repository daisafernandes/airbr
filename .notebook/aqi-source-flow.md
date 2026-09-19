# AQI Source Flow

Airbr city AQI comes from `apps/backend/src/infrastructure/database/repositories/LiveAqiRepository.ts`, which calls `fetchOpenMeteoCurrent()` in `apps/backend/src/infrastructure/providers/openMeteoClient.ts`.

Key details:
- Current readings request Open-Meteo `current=us_aqi,...`.
- History and forecast also use `us_aqi`, keeping all displayed AQI values on the U.S. EPA scale.
- Returned readings use `source: 'open-meteo'`.
- `CityService.getCityById()` attaches this as `latestAqi`.
- Frontend city views read `city.latestAqi.aqi` directly; the gauge does not recalculate AQI.
- Ranking sidebar and ranking page both use `/cities/ranking` via `useRanking()`, so their ordering comes from `LiveAqiRepository.getRanking()` rather than client-side sorting of `/cities`.
- Backend caches latest readings for 15 minutes through `live-aqi:latest:<cityId>` and city responses through `city:<id>`.

Gotcha: comparisons with IQAir can still differ because Airbr uses Open-Meteo/CAMS model data, while IQAir pages may use station or aggregated measurements. The scale is now aligned to U.S. AQI, but the source, location, and update time can still differ.
