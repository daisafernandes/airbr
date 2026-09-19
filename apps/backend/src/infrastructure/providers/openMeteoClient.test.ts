import axios from 'axios'

import {
  fetchOpenMeteoCurrent,
  fetchOpenMeteoForecast,
  fetchOpenMeteoHistory,
} from './openMeteoClient'

jest.mock('axios')

const mockedAxios = jest.mocked(axios)

describe('openMeteoClient AQI scale', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses US AQI for the current reading', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { current: { us_aqi: 55 } } })
      .mockResolvedValueOnce({ data: { current: {} } })

    const reading = await fetchOpenMeteoCurrent('osasco', -23.5324, -46.7916)

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ current: expect.stringContaining('us_aqi') }),
      }),
    )
    expect(reading?.aqi).toBe(55)
  })

  it('uses US AQI for historical readings', async () => {
    const timestamp = new Date().toISOString()
    mockedAxios.get.mockResolvedValueOnce({
      data: { hourly: { time: [timestamp], us_aqi: [72] } },
    })

    const readings = await fetchOpenMeteoHistory('osasco', -23.5324, -46.7916, '24h')

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ hourly: expect.stringContaining('us_aqi') }),
      }),
    )
    expect(readings[0]?.aqi).toBe(72)
  })

  it('uses US AQI for forecast readings', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { hourly: { time: ['2026-09-19T12:00'], us_aqi: [81] } },
    })

    const forecast = await fetchOpenMeteoForecast(-23.5324, -46.7916)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ params: expect.objectContaining({ hourly: 'us_aqi' }) }),
    )
    expect(forecast[0]?.aqi).toBe(81)
  })
})
