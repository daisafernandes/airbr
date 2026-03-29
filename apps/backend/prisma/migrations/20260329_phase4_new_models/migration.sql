-- AlterTable: add wind and temperature fields to aqi_readings
ALTER TABLE "aqi_readings" ADD COLUMN "windDirection" DOUBLE PRECISION;
ALTER TABLE "aqi_readings" ADD COLUMN "windSpeed" DOUBLE PRECISION;
ALTER TABLE "aqi_readings" ADD COLUMN "temperature" DOUBLE PRECISION;

-- AlterTable: add population fields to cities
ALTER TABLE "cities" ADD COLUMN "populationTotal" INTEGER;
ALTER TABLE "cities" ADD COLUMN "elderlyPct" DOUBLE PRECISION;
ALTER TABLE "cities" ADD COLUMN "childrenPct" DOUBLE PRECISION;

-- CreateTable: deforestation_alerts
CREATE TABLE "deforestation_alerts" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "areaHa" DOUBLE PRECISION NOT NULL,
    "biome" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'prodes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deforestation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: health_data
CREATE TABLE "health_data" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "respiratoryHospitalizations" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'datasus',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deforestation_alerts_detectedAt_idx" ON "deforestation_alerts"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "health_data_cityId_year_month_key" ON "health_data"("cityId", "year", "month");

-- CreateIndex
CREATE INDEX "health_data_cityId_year_month_idx" ON "health_data"("cityId", "year", "month");

-- AddForeignKey
ALTER TABLE "health_data" ADD CONSTRAINT "health_data_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
