import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

/** @typedef {{src: string, alt: string, width: number, height: number}} Illustration */
/** @type {Record<string, Illustration>} */
export const illustrations = {
  'tang300-040': { src: '/art/poems/tang300/040-ink.webp', alt: '母親低頭縫衣，門外小徑通向遠山，春草生在門邊。', width: 1536, height: 1024 },
  'tang300-098': { src: '/art/poems/tang300/098-ink.webp', alt: '殘垣間春草繁生，花枝上停著小鳥，遠處山河依然。', width: 1536, height: 1024 },
  'tang300-226': { src: '/art/poems/tang300/226-ink.webp', alt: '旅人坐在床沿低頭沉思，窗外明月將一片清光照在床前地面。', width: 1536, height: 1024 },
};

/**
 * Validate only authored works; catalogue-only entries do not require illustrations.
 * @param {Array<{id: string}>} works
 * @param {{records?: Record<string, Illustration>, publicDirectory?: string}} [options]
 */
export async function validateIllustrations(works, { records = illustrations, publicDirectory = path.resolve('public') } = {}) {
  const ids = new Set(works.map(work => work.id));
  for (const id of Object.keys(records)) {
    if (!ids.has(id)) throw new Error(`插圖 ${id}：沒有對應的可讀作品`);
  }
  const hashes = new Set();
  for (const { id } of works) {
    const item = records[id];
    if (!item) throw new Error(`插圖 ${id}：缺少專屬插圖`);
    const identity = /^([a-z0-9]+)-(\d{3})$/.exec(id);
    if (!identity || item.src !== `/art/poems/${identity[1]}/${identity[2]}-ink.webp`) throw new Error(`插圖 ${id}：路徑與作品識別不符`);
    if (!item.alt?.trim() || !/\p{Script=Han}/u.test(item.alt) || !Number.isInteger(item.width) || item.width <= 0 || !Number.isInteger(item.height) || item.height <= 0) throw new Error(`插圖 ${id}：替代文字或尺寸無效`);
    let data;
    try { data = await readFile(path.join(publicDirectory, item.src)); }
    catch { throw new Error(`插圖 ${id}：無法讀取 ${item.src}`); }
    if (!data.length) throw new Error(`插圖 ${id}：圖片檔案為空`);
    const hash = createHash('sha256').update(data).digest('hex');
    if (hashes.has(hash)) throw new Error(`插圖 ${id}：與其他作品重複使用圖片`);
    hashes.add(hash);
  }
  return records;
}
