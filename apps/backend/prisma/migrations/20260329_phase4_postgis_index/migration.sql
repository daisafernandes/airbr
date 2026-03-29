-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create geospatial index on cities using PostGIS
-- This enables fast ST_DWithin queries for nearby city lookups
CREATE INDEX IF NOT EXISTS "cities_geo_idx"
  ON "cities"
  USING GIST (ST_SetSRID(ST_MakePoint("lng", "lat"), 4326));
