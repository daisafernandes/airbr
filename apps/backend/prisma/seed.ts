import { PrismaClient } from '@prisma/client'
import citiesData from '../data/cities.json'

const prisma = new PrismaClient()

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

/** Generate a realistic AQI baseline per city based on population/region heuristics */
function cityAqiBaseline(region: string): number {
  const baselines: Record<string, number> = {
    Sudeste: 75,
    Nordeste: 55,
    Sul: 45,
    'Centro-Oeste': 60,
    Norte: 40,
  }
  return baselines[region] ?? 60
}

async function main() {
  console.log('🌱 Starting seed...')

  await prisma.aqiReading.deleteMany()
  await prisma.city.deleteMany()

  const cities = await Promise.all(
    citiesData.map((c) =>
      prisma.city.upsert({
        where: { name_state: { name: c.name, state: c.state } },
        update: {},
        create: {
          name: c.name,
          state: c.state,
          region: c.region,
          lat: c.lat,
          lng: c.lng,
          source: 'seed',
        },
      }),
    ),
  )

  console.log(`✅ Seeded ${cities.length} cities`)

  const now = new Date()
  const readings = cities.flatMap((city) => {
    const baseline = cityAqiBaseline(
      citiesData.find((c) => c.name === city.name)?.region ?? 'Sudeste',
    )

    return Array.from({ length: 24 }, (_, i) => {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      const variance = randomBetween(-20, 20)
      const aqi = Math.max(1, Math.round(baseline + variance))
      const pm25Factor = aqi / 100

      return {
        cityId: city.id,
        aqi,
        pm25: parseFloat((pm25Factor * randomBetween(30, 60)).toFixed(1)),
        pm10: parseFloat((pm25Factor * randomBetween(50, 90)).toFixed(1)),
        o3: parseFloat(randomBetween(20, 80).toFixed(1)),
        no2: parseFloat(randomBetween(5, 40).toFixed(1)),
        co: parseFloat(randomBetween(0.2, 2.5).toFixed(2)),
        uv: parseFloat(randomBetween(0, 11).toFixed(1)),
        pollen: null,
        timestamp,
        source: 'seed-mock',
      }
    })
  })

  await prisma.aqiReading.createMany({ data: readings })
  console.log(`✅ Seeded ${readings.length} AQI readings (24h × ${cities.length} cities)`)

  await prisma.fireFocus.createMany({
    data: [
      { lat: -12.5, lng: -55.2, intensity: 80, satellite: 'AQUA_M-T', biome: 'Cerrado', state: 'MT', detectedAt: new Date(now.getTime() - 2 * 3600000) },
      { lat: -3.8, lng: -62.1, intensity: 95, satellite: 'NOAA-20', biome: 'Amazônia', state: 'AM', detectedAt: new Date(now.getTime() - 4 * 3600000) },
      { lat: -10.1, lng: -48.5, intensity: 60, satellite: 'AQUA_M-T', biome: 'Cerrado', state: 'TO', detectedAt: new Date(now.getTime() - 1 * 3600000) },
      { lat: -14.3, lng: -43.7, intensity: 70, satellite: 'TERRA_M-T', biome: 'Caatinga', state: 'BA', detectedAt: new Date(now.getTime() - 5 * 3600000) },
      { lat: -6.5, lng: -44.8, intensity: 55, satellite: 'NOAA-20', biome: 'Cerrado', state: 'MA', detectedAt: new Date(now.getTime() - 3 * 3600000) },
    ],
  })
  console.log('✅ Seeded 5 fire focuses')

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
