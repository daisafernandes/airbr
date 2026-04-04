import { randomUUID } from 'node:crypto'

import request from 'supertest'

import { createApp } from '../../createApp'
import { prisma } from '@infrastructure/database/prisma'

describe('API integration (auth + alerts)', () => {
  const { app } = createApp()
  const suffix = () => randomUUID().slice(0, 8)

  let cityId = ''
  let userEmail = ''
  let password = 'Password123!'

  beforeAll(async () => {
    const s = suffix()
    const city = await prisma.city.create({
      data: {
        name: `API Test City ${s}`,
        state: 'TS',
        region: 'SE',
        lat: -23.5,
        lng: -46.6,
        source: 'test',
      },
    })
    cityId = city.id
  })

  afterAll(async () => {
    await prisma.city.deleteMany({ where: { id: cityId } })
  })

  it('rejects unauthenticated alert list', async () => {
    const res = await request(app).get('/api/v1/alerts')
    expect(res.status).toBe(401)
  })

  it('registers, logs in, creates and deletes an alert, and exposes metrics', async () => {
    const s = suffix()
    userEmail = `api-int-${s}@airbr.test`

    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: userEmail, password, name: `User ${s}` })
    expect(reg.status).toBe(201)
    expect(reg.body.token).toBeDefined()

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userEmail, password })
    expect(login.status).toBe(200)
    const token = login.body.token as string

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
    expect(me.body.email).toBe(userEmail)
    expect(me.body.preferredLocale).toBe('pt')

    const patchProfile = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `User ${s} Updated`, preferredLocale: 'en', defaultCityId: cityId })
    expect(patchProfile.status).toBe(200)
    expect(patchProfile.body.name).toBe(`User ${s} Updated`)
    expect(patchProfile.body.preferredLocale).toBe('en')
    expect(patchProfile.body.defaultCityId).toBe(cityId)

    const badCity = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ defaultCityId: 'ckf9q1k1g0000z01k8k4b1k2x' })
    expect(badCity.status).toBe(400)

    const create = await request(app)
      .post('/api/v1/alerts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cityId,
        thresholdAqi: 100,
        channels: ['EMAIL'],
        active: true,
      })
    expect(create.status).toBe(201)
    const alertId = create.body.id as string

    const list = await request(app).get('/api/v1/alerts').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(Array.isArray(list.body.data)).toBe(true)
    expect(list.body.data.some((a: { id: string }) => a.id === alertId)).toBe(true)

    const del = await request(app).delete(`/api/v1/alerts/${alertId}`).set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(204)

    const metrics = await request(app).get('/api/v1/metrics/summary')
    expect(metrics.status).toBe(200)
    expect(metrics.body.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(metrics.body.database).toMatchObject({
      registeredUsers: expect.any(Number),
      activeAlerts: expect.any(Number),
    })
    expect(metrics.body.product).toMatchObject({
      userRegistrations: expect.any(Number),
      alertsCreated: expect.any(Number),
    })
  })
})
