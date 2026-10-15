import { loadReadingContent } from '../src/content/reading-content.mjs';

import { validateIllustrations } from '../src/content/illustrations.mjs';

const { catalog, works } = await loadReadingContent();
await validateIllustrations(works);
console.log(`已驗證 ${catalog.length} 首篇目與 ${works.length} 篇可讀作品`);
