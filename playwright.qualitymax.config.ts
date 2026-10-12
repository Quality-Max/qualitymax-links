import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/qualitymax.spec.ts',
  workers: 1,
  use: { baseURL: 'http://localhost:3003', headless: true },
  webServer: {
    command: 'node dist-server/server.js',
    port: 3003,
    reuseExistingServer: false,
    env: { NODE_ENV: 'production', PORT: '3003', QUALITYMAX_BRANDING: 'true' },
  },
});
