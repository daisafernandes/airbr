import type { IAlertRepository } from '@domain/repositories/IAlertRepository'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { IPushSubscriptionRepository } from '@domain/repositories/IPushSubscriptionRepository'
import { logger } from '@shared/utils/logger'
import { AlertChecker } from './AlertChecker'

describe('AlertChecker', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const row = {
    alertId: 'a1',
    userId: 'u1',
    userEmail: 'u@test.dev',
    preferredLocale: 'en',
    cityId: 'c1',
    cityName: 'Test City',
    state: 'TS',
    thresholdAqi: 100,
    channels: ['EMAIL'] as Array<'EMAIL' | 'PUSH'>,
  }

  it('sends email and records dispatch when AQI meets threshold and cooldown allows', async () => {
    const alerts: Pick<
      IAlertRepository,
      'findActiveForChecker' | 'lastDispatchAt' | 'recordDispatch'
    > = {
      findActiveForChecker: jest.fn().mockResolvedValue([row]),
      lastDispatchAt: jest.fn().mockResolvedValue(null),
      recordDispatch: jest.fn().mockResolvedValue(undefined),
    }
    const aqi: Pick<IAqiRepository, 'findLatestByCity'> = {
      findLatestByCity: jest.fn().mockResolvedValue({ aqi: 150 }),
    }
    const pushSubs: Pick<IPushSubscriptionRepository, 'findByUserId'> = {
      findByUserId: jest.fn().mockResolvedValue([]),
    }
    const emailSender = { send: jest.fn().mockResolvedValue(undefined) }
    const pushSender = { send: jest.fn() }

    const checker = new AlertChecker(alerts as IAlertRepository, aqi as IAqiRepository, pushSubs as IPushSubscriptionRepository, emailSender, pushSender)

    await checker.run()

    expect(emailSender.send).toHaveBeenCalledWith(
      row.userEmail,
      'Air quality alert: Test City (TS)',
      'AQI is 150, at or above your threshold of 100.',
    )
    expect(alerts.recordDispatch).toHaveBeenCalledWith(row.alertId, 'EMAIL', 150)
    expect(pushSender.send).not.toHaveBeenCalled()
  })

  it('skips when latest AQI is below threshold', async () => {
    const alerts: Pick<IAlertRepository, 'findActiveForChecker' | 'lastDispatchAt' | 'recordDispatch'> = {
      findActiveForChecker: jest.fn().mockResolvedValue([row]),
      lastDispatchAt: jest.fn(),
      recordDispatch: jest.fn(),
    }
    const aqi: Pick<IAqiRepository, 'findLatestByCity'> = {
      findLatestByCity: jest.fn().mockResolvedValue({ aqi: 50 }),
    }
    const pushSubs: Pick<IPushSubscriptionRepository, 'findByUserId'> = {
      findByUserId: jest.fn(),
    }
    const emailSender = { send: jest.fn() }
    const pushSender = { send: jest.fn() }

    const checker = new AlertChecker(alerts as IAlertRepository, aqi as IAqiRepository, pushSubs as IPushSubscriptionRepository, emailSender, pushSender)

    await checker.run()

    expect(emailSender.send).not.toHaveBeenCalled()
    expect(alerts.recordDispatch).not.toHaveBeenCalled()
  })

  it('skips email when cooldown has not elapsed', async () => {
    const recent = new Date()
    const alerts: Pick<IAlertRepository, 'findActiveForChecker' | 'lastDispatchAt' | 'recordDispatch'> = {
      findActiveForChecker: jest.fn().mockResolvedValue([row]),
      lastDispatchAt: jest.fn().mockResolvedValue(recent),
      recordDispatch: jest.fn(),
    }
    const aqi: Pick<IAqiRepository, 'findLatestByCity'> = {
      findLatestByCity: jest.fn().mockResolvedValue({ aqi: 200 }),
    }
    const pushSubs: Pick<IPushSubscriptionRepository, 'findByUserId'> = {
      findByUserId: jest.fn().mockResolvedValue([]),
    }
    const emailSender = { send: jest.fn() }
    const pushSender = { send: jest.fn() }

    const checker = new AlertChecker(alerts as IAlertRepository, aqi as IAqiRepository, pushSubs as IPushSubscriptionRepository, emailSender, pushSender)

    await checker.run()

    expect(emailSender.send).not.toHaveBeenCalled()
    expect(alerts.recordDispatch).not.toHaveBeenCalled()
  })
})
