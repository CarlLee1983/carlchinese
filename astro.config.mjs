import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // Fixture content must never overwrite the production output, even when built directly.
  outDir: process.env.CARLCHINESE_GROUP_FIXTURE === '1' ? './dist-group-fixture' : './dist',
});
