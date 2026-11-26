import { defineConfig } from '@playwright/test';

const port = Number(process.env.PW_PORT ?? 4322);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    ...(process.env.PW_CHROME_PATH
      ? { executablePath: process.env.PW_CHROME_PATH }
      : {
          channel:
            (process.env.PW_CHANNEL as 'chrome' | 'chromium' | undefined) ?? 'chrome',
        }),
    headless: true,
  },
  webServer: {
    command: `bun run preview -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
