import type { Request, Response } from 'express'

import type { AirQualityForecastService } from '@application/services/AirQualityForecastService'
import type { AqiService } from '@application/services/AqiService'
import type { CityService } from '@application/services/CityService'
import type { HealthService } from '@application/services/HealthService'
import type { OutdoorSafetyService } from '@application/services/OutdoorSafetyService'
import type { WindSmokeService } from '@application/services/WindSmokeService'
import type { HistoryPeriod } from '@domain/repositories/IAqiRepository'
import { AppError } from '@shared/errors/AppError'
import { sanitizePagination } from '@shared/utils/pagination'

const VALID_PERIODS: HistoryPeriod[] = ['24h', '7d', '30d', '1y']

export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly aqiService: AqiService,
    private readonly windSmokeService: WindSmokeService,
    private readonly outdoorSafetyService: OutdoorSafetyService,
    private readonly healthService: HealthService,
    private readonly airQualityForecastService: AirQualityForecastService,
  ) {}

  listCities = async (req: Request, res: Response): Promise<void> => {
    const cities = await this.cityService.listCitiesPaginated(
      sanitizePagination({
        page: Number(req.query['page']),
        limit: Number(req.query['limit']),
      }),
    )
    res.json(cities)
  }

  getCity = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] ?? ''
    const city = await this.cityService.getCityById(id)
    if (!city) throw new AppError('City not found', 404)
    res.json(city)
  }

  getCityHistory = async (req: Request, res: Response): Promise<void> => {
    const { period = '24h' } = req.query
    const id = req.params['id'] ?? ''

    if (!VALID_PERIODS.includes(period as HistoryPeriod)) {
      throw new AppError(`Invalid period. Allowed values: ${VALID_PERIODS.join(', ')}`, 400)
    }

    const history = await this.aqiService.getHistory(id, period as HistoryPeriod)
    res.json(history)
  }

  searchCities = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new AppError('Query parameter "q" is required', 400)
    }

    const cities = await this.cityService.searchCities(q.trim())
    res.json(cities)
  }

  findNearby = async (req: Request, res: Response): Promise<void> => {
    const { lat, lng, radius } = req.query

    if (!lat || !lng) throw new AppError('"lat" and "lng" query parameters are required', 400)

    const latNum = parseFloat(lat as string)
    const lngNum = parseFloat(lng as string)
    const radiusKm = radius ? parseFloat(radius as string) : 100

    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new AppError('"lat" and "lng" must be valid numbers', 400)
    }

    const cities = await this.cityService.findNearby(latNum, lngNum, radiusKm)
    res.json(cities)
  }

  getRanking = async (req: Request, res: Response): Promise<void> => {
    const { region, state } = req.query

    const ranking = await this.aqiService.getRanking({
      region: typeof region === 'string' ? region : undefined,
      state: typeof state === 'string' ? state : undefined,
    })

    res.json(ranking)
  }

  getWindSmoke = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] ?? ''
    const city = await this.cityService.getCityById(id)
    if (!city) throw new AppError('City not found', 404)

    const result = await this.windSmokeService.getWindSmoke(id, city.lat, city.lng)
    res.json(result)
  }

  getOutdoorSafety = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] ?? ''
    const city = await this.cityService.getCityById(id)
    if (!city) throw new AppError('City not found', 404)

    const result = await this.outdoorSafetyService.getOutdoorSafety(id)
    res.json(result)
  }

  getHealthData = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] ?? ''
    const city = await this.cityService.getCityById(id)
    if (!city) throw new AppError('City not found', 404)

    const result = await this.healthService.getHealthData(id)
    res.json(result)
  }

  getAirQualityForecast = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'] ?? ''
    const city = await this.cityService.getCityById(id)
    if (!city) throw new AppError('City not found', 404)

    const result = await this.airQualityForecastService.getForecast(id, city.lat, city.lng)
    res.json(result)
  }

  getOMSCompliance = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.aqiService.getOMSCompliance()
    res.json(result)
  }
}
