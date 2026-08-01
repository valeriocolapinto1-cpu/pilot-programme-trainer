import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke tests run against the production build, so they exercise the same
 * bundle and service worker that GitHub Pages serves.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath:
            process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
        },
      },
    },
  ],
  webServer: {
    // BASE_PATH="/" so the tests can use plain paths instead of the GitHub
    // Pages sub-directory. It must be set for `preview` too: vite preview
    // mounts the app under `base`, and a mismatch 404s every asset.
    command:
      'BASE_PATH=/ npm run build && BASE_PATH=/ npm run preview -- --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
