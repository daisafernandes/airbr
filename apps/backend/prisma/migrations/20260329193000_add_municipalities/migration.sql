-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL,
    "ibgeCode" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "municipalities_ibgeCode_key" ON "municipalities"("ibgeCode");

-- Spatial index for nearest-neighbor (PostGIS enabled in prior migration)
CREATE INDEX IF NOT EXISTS "municipalities_geo_idx"
  ON "municipalities"
  USING GIST (ST_SetSRID(ST_MakePoint("lng", "lat"), 4326));
