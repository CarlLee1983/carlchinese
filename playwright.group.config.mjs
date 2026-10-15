import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/group-browser',
  use: { baseURL: 'http://127.0.0.1:43159' },
  webServer: {
    command: 'CARLCHINESE_GROUP_FIXTURE=1 pnpm exec astro preview --ignore-lock --host 127.0.0.1 --port 43159',
    url: 'http://127.0.0.1:43159/tang300/198-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%B8%80/',
    reuseExistingServer: false,
  },
});
