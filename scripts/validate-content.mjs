import { loadWorks } from '../src/content/works.mjs';

const works = await loadWorks();
console.log(`已驗證 ${works.length} 篇作品`);
