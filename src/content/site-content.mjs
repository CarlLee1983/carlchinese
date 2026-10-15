import path from 'node:path';
import { loadReadingContent } from './reading-content.mjs';
import { validateIllustrations } from './illustrations.mjs';

// The same flag selects Astro's isolated output directory in astro.config.mjs.
export async function loadSiteContent() {
  const fixture = process.env.CARLCHINESE_GROUP_FIXTURE === '1';
  const content = await loadReadingContent(fixture
    ? { worksDirectory: path.resolve('tests/fixtures/group/tang300') }
    : {});
  // Private group fixtures test text/navigation, and deliberately have no generated art.
  const images = fixture ? undefined : await validateIllustrations(content.works);
  return { ...content, works: content.works.map(work => ({ ...work, illustration: images?.[work.id] })) };
}
