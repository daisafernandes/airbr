-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aqi_readings" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "aqi" INTEGER NOT NULL,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "o3" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "co" DOUBLE PRECISION,
    "uv" DOUBLE PRECISION,
    "pollen" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,

    CONSTRAINT "aqi_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fire_focuses" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "intensity" DOUBLE PRECISION,
    "satellite" TEXT,
    "biome" TEXT,
    "state" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fire_focuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "collectorName" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "recordsInserted" INTEGER,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_state_key" ON "cities"("name", "state");

-- CreateIndex
CREATE INDEX "aqi_readings_cityId_timestamp_idx" ON "aqi_readings"("cityId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "fire_focuses_detectedAt_idx" ON "fire_focuses"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "fire_focuses_lat_lng_detectedAt_key" ON "fire_focuses"("lat", "lng", "detectedAt");

-- AddForeignKey
ALTER TABLE "aqi_readings" ADD CONSTRAINT "aqi_readings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
