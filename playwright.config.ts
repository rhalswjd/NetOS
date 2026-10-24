import { defineConfig, devices } from '@playwright/test';
import { deploymentConfig } from './src/lib/deployment';
const base = deploymentConfig().base.replace(/\/$/, '');
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:4371${base}/`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4371 --ignore-lock',
    url: `http://127.0.0.1:4371${base}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
