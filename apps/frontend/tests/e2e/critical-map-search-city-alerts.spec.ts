import { expect, test } from '@playwright/test'

test.describe('Critical flow: map, search and city', () => {
  test('user navigates through core experience', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('brazil-map')).toBeVisible()
    await expect(page.locator('.leaflet-container')).toBeVisible()

    const headerSearch = page.getByTestId('header-city-search')
    await headerSearch.fill('São')
    await page.getByRole('button', { name: /São Paulo/i }).first().click()

    await expect(page.getByRole('heading', { name: /São Paulo/i })).toBeVisible()
  })

  test('auth and alert routes redirect home', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/alerts')
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/profile')
    await expect(page).toHaveURL(/\/$/)
  })

  test('legacy URL paths redirect to canonical routes', async ({ page }) => {
    await page.goto('/mapa-queimadas')
    await expect(page).toHaveURL(/\/maps$/)

    await page.goto('/guia')
    await expect(page).toHaveURL(/\/guide$/)

    await page.goto('/cidade/legacy-id-test')
    await expect(page).toHaveURL(/\/city\/legacy-id-test$/)

    await page.goto('/mapa-queimadas/foco/abc123')
    await expect(page).toHaveURL(/\/maps\?foco=abc123/)
  })
})
