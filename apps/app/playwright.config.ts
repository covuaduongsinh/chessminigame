import { defineConfig } from '@playwright/test';

// Kiểm thử e2e trên bản web đã export (apps/app/dist).
// Trong container có sẵn Chromium: đặt CHROMIUM_PATH; trên CI dùng `npx playwright install chromium`.
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8081',
    viewport: { width: 1280, height: 860 },
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] }
      : {},
  },
  webServer: {
    command: 'node ../../scripts/serve-dist.mjs dist 8081',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: true,
  },
});
