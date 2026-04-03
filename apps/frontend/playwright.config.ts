import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_FRONTEND_PORT ?? 4173)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`
const backendHealth = process.env.PLAYWRIGHT_BACKEND_HEALTH_URL ?? 'http://127.0.0.1:3333/api/v1/health'
const viteApiUrl = process.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1'

const isCI = !!process.env.CI

const sharedServerEnv = {
  ...process.env,
  VITE_API_URL: viteApiUrl,
}

const webServer = isCI
  ? [
      {
        command: 'npm run dev --filter=@airbr/backend',
        cwd: '../..',
        url: backendHealth,
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
          ...process.env,
          NODE_ENV: 'development',
        },
      },
      {
        command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
        cwd: '.',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: sharedServerEnv,
      },
    ]
  : {
      command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      env: sharedServerEnv,
    }

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})
