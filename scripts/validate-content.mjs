import { loadReadingContent } from '../src/content/reading-content.mjs';

const { catalog, works } = await loadReadingContent();
console.log(`已驗證 ${catalog.length} 首篇目與 ${works.length} 篇可讀作品`);
