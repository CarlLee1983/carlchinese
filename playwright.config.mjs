import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:43157' },
  webServer: {
    command: 'pnpm exec astro preview --ignore-lock --host 127.0.0.1 --port 43157',
    url: 'http://127.0.0.1:43157/tang300/040-%E9%81%8A%E5%AD%90%E5%90%9F/',
    reuseExistingServer: false,
  },
});
