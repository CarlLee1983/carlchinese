import path from 'node:path';
import { loadReadingContent } from './reading-content.mjs';

// The same flag selects Astro's isolated output directory in astro.config.mjs.
export function loadSiteContent() {
  return loadReadingContent(process.env.CARLCHINESE_GROUP_FIXTURE === '1'
    ? { worksDirectory: path.resolve('tests/fixtures/group/tang300') }
    : {});
}
