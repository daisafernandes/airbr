import { buildAqiAlertNotification, normalizeAlertLocale } from './alertNotificationCopy'

describe('alertNotificationCopy', () => {
  describe('normalizeAlertLocale', () => {
    it('maps en-US to en', () => {
      expect(normalizeAlertLocale('en-US')).toBe('en')
    })
    it('maps es to es', () => {
      expect(normalizeAlertLocale('es')).toBe('es')
    })
    it('defaults unknown to pt', () => {
      expect(normalizeAlertLocale('fr')).toBe('pt')
    })
    it('defaults null to pt', () => {
      expect(normalizeAlertLocale(null)).toBe('pt')
    })
  })

  describe('buildAqiAlertNotification', () => {
    const base = {
      cityName: 'São Paulo',
      state: 'SP',
      aqi: 120,
      thresholdAqi: 100,
    }

    it('uses Portuguese copy for pt', () => {
      const { title, body } = buildAqiAlertNotification({ ...base, preferredLocale: 'pt' })
      expect(title).toBe('Alerta de qualidade do ar: São Paulo (SP)')
      expect(body).toBe('O IQAr está em 120, igual ou acima do seu limite de 100.')
    })

    it('uses English copy for en', () => {
      const { title, body } = buildAqiAlertNotification({ ...base, preferredLocale: 'en' })
      expect(title).toBe('Air quality alert: São Paulo (SP)')
      expect(body).toBe('AQI is 120, at or above your threshold of 100.')
    })

    it('uses Spanish copy for es', () => {
      const { title, body } = buildAqiAlertNotification({ ...base, preferredLocale: 'es' })
      expect(title).toBe('Alerta de calidad del aire: São Paulo (SP)')
      expect(body).toBe('El AQI está en 120, igual o por encima de tu umbral de 100.')
    })
  })
})
