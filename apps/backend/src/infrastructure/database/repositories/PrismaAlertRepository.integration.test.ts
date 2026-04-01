import { randomUUID } from 'node:crypto'

import { prisma } from '@infrastructure/database/prisma'

import { PrismaAlertRepository } from './PrismaAlertRepository'

const makeSuffix = () => randomUUID().slice(0, 8)

describe('PrismaAlertRepository integration', () => {
  const repo = new PrismaAlertRepository()
  const testIds = {
    userId: '',
    cityId: '',
    alertId: '',
  }

  beforeEach(async () => {
    const suffix = makeSuffix()
    const user = await prisma.user.create({
      data: {
        email: `repo-alert-${suffix}@airbr.dev`,
        name: `Repo ${suffix}`,
        passwordHash: 'hash',
      },
    })
    const city = await prisma.city.create({
      data: {
        name: `Cidade Teste ${suffix}`,
        state: 'TS',
        region: 'SE',
        lat: -23.5,
        lng: -46.6,
        source: 'test',
      },
    })
    testIds.userId = user.id
    testIds.cityId = city.id
    testIds.alertId = ''
  })

  afterEach(async () => {
    await prisma.alertDispatch.deleteMany({
      where: { alert: { userId: testIds.userId } },
    })
    await prisma.alert.deleteMany({ where: { userId: testIds.userId } })
    await prisma.city.deleteMany({ where: { id: testIds.cityId } })
    await prisma.user.deleteMany({ where: { id: testIds.userId } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates, lists, toggles and deletes an alert', async () => {
    const created = await repo.create({
      userId: testIds.userId,
      cityId: testIds.cityId,
      thresholdAqi: 120,
      channels: ['EMAIL', 'PUSH'],
    })
    testIds.alertId = created.id

    const listed = await repo.findByUserId(testIds.userId)
    expect(listed).toHaveLength(1)
    expect(listed[0]?.channels).toEqual(['EMAIL', 'PUSH'])

    const updated = await repo.updateActive(created.id, testIds.userId, false)
    expect(updated?.active).toBe(false)

    const deleted = await repo.delete(created.id, testIds.userId)
    expect(deleted).toBe(true)
  })

  it('records dispatches and returns latest dispatch date', async () => {
    const created = await repo.create({
      userId: testIds.userId,
      cityId: testIds.cityId,
      thresholdAqi: 150,
      channels: ['EMAIL'],
    })
    testIds.alertId = created.id

    await repo.recordDispatch(created.id, 'EMAIL', 160)
    await repo.recordDispatch(created.id, 'PUSH', 170)

    const recent = await repo.findRecentDispatchesForAlert(created.id, 5)
    const lastSentAt = await repo.lastDispatchAt(created.id)

    expect(recent.length).toBeGreaterThanOrEqual(2)
    expect(recent[0]?.channel).toMatch(/EMAIL|PUSH/)
    expect(lastSentAt).toBeInstanceOf(Date)
  })
})
