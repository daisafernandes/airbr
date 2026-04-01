-- Track A: indexes for paginated list endpoints and filtered recency queries.
CREATE INDEX IF NOT EXISTS "alerts_userId_createdAt_idx"
  ON "alerts" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "fire_focuses_state_detectedAt_idx"
  ON "fire_focuses" ("state", "detectedAt" DESC);

CREATE INDEX IF NOT EXISTS "fire_focuses_biome_detectedAt_idx"
  ON "fire_focuses" ("biome", "detectedAt" DESC);

CREATE INDEX IF NOT EXISTS "deforestation_alerts_state_detectedAt_idx"
  ON "deforestation_alerts" ("state", "detectedAt" DESC);

CREATE INDEX IF NOT EXISTS "deforestation_alerts_biome_detectedAt_idx"
  ON "deforestation_alerts" ("biome", "detectedAt" DESC);
