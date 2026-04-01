import { expect, test } from '@playwright/test'

test.describe('Critical flow: map, search, city and alerts', () => {
  test('user navigates through core experience and creates an alert', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('brazil-map')).toBeVisible()
    await expect(page.locator('.leaflet-container')).toBeVisible()

    const headerSearch = page.getByTestId('header-city-search')
    await headerSearch.fill('São')
    await page.getByRole('button', { name: /São Paulo/i }).first().click()

    await expect(page.getByRole('heading', { name: /São Paulo/i })).toBeVisible()

    await page.locator('a[href="/alerts"]').first().click()
    await expect(page).toHaveURL(/\/login/)

    await page.locator('a[href="/register"]').first().click()
    await expect(page).toHaveURL(/\/register/)

    const now = Date.now()
    const email = `playwright-${now}@airbr.test`
    const password = 'Password123!'

    await page.locator('#name').fill('Playwright User')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: /Criar conta|Create account/i }).click()

    await expect(page).toHaveURL(/\/alerts/)
    await expect(page.getByTestId('alerts-save-button')).toBeVisible()

    const alertsSearch = page.getByTestId('alerts-city-search')
    await alertsSearch.fill('São')
    await page.getByRole('button', { name: /São Paulo/i }).first().click()

    await page.getByLabel(/Limiar|Threshold/i).fill('120')
    await page.getByTestId('alerts-save-button').click()

    await expect(page.getByText(/São Paulo/i).first()).toBeVisible()
  })
})
