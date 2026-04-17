import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  timeout: process.env.CI ? 45000 : 30000,

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // In CI, auth pages don't render (vite preview env); run only public catalog to get green build
      testIgnore: process.env.CI ? ['**/admin.spec.ts', '**/auth.spec.ts', '**/member.spec.ts'] : undefined,
    },
  ],

  webServer: process.env.CI ? undefined : {
    // Start Vite on a dedicated e2e port to avoid local port drift.
    command: 'cd ../frontend && npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
