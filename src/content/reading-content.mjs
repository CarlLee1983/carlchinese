import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadWorks } from './works.mjs';

/** @typedef {import('./work-model').CatalogEntry} CatalogEntry */

const columns = ['number', 'volume', 'form', 'title', 'author', 'sourceTitle', 'tocPage', 'groupTitle', 'part', 'total', 'supplemented'];
/** @type {Array<[number, number, number, import('./work-model').CatalogEntry['form']]>} */
const spans = [
  [1, 33, 1, '五言古詩'], [34, 40, 1, '五言樂府'],
  [41, 58, 2, '七言古詩'], [59, 68, 3, '七言古詩'],
  [69, 82, 4, '七言樂府'], [83, 162, 5, '五言律詩'],
  [163, 215, 6, '七言律詩'], [216, 216, 6, '七言樂府'],
  [217, 245, 7, '五言絕句'], [246, 253, 7, '五言樂府'],
  [254, 304, 8, '七言絕句'], [305, 313, 8, '七言樂府'],
];
const anchors = new Map([[40, ['遊子吟', '孟郊', 1, '五言樂府']], [98, ['春望', '杜甫', 5, '五言律詩']], [226, ['靜夜思', '李白', 7, '五言絕句']]]);
const romanPages = new Set(['ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix']);

/** @param {{filePath: string, source: string}} input @returns {CatalogEntry[]} */
export function parseCatalog({ filePath, source }) {
  const lines = source.trimEnd().split(/\r?\n/);
  /** @param {number} line @param {string} reason @returns {never} */
  const fail = (line, reason) => { throw new Error(`${filePath}:${line}:1: ${reason}`); };
  if (lines[0] !== columns.join('\t')) fail(1, '篇目欄位不符');
  /** @type {CatalogEntry[]} */
  const entries = [];
  /** @type {Map<number, {title: string, author: string, sourceTitle: string, tocPage: string, total: number, start: number}>} */
  const groups = new Map();
  for (let index = 1; index < lines.length; index++) {
    const lineNumber = index + 1;
    const cells = lines[index].split('\t');
    if (cells.length !== columns.length) fail(lineNumber, `篇目須有 ${columns.length} 欄`);
    const [numberText, volumeText, form, title, author, sourceTitle, tocPage, groupTitle, partText, totalText, supplementedText] = cells;
    const number = Number(numberText);
    const volume = Number(volumeText);
    const part = Number(partText);
    const total = Number(totalText);
    if (!Number.isInteger(number) || numberText !== String(number) || number !== index) fail(lineNumber, `底本序號應為 ${index}，得到 ${numberText}`);
    const span = spans.find(([start, end]) => number >= start && number <= end);
    if (!span || volumeText !== String(volume) || volume !== span[2] || form !== span[3]) fail(lineNumber, `第 ${number} 首卷次／體裁不符`);
    if (![title, author, sourceTitle].every((value) => value.trim() && value === value.trim()) || !romanPages.has(tocPage)) fail(lineNumber, `第 ${number} 首題名、作者或目錄頁碼無效`);
    if (!['true', 'false'].includes(supplementedText)) fail(lineNumber, `第 ${number} 首補入標記無效`);
    const supplemented = supplementedText === 'true';
    if (supplemented !== [183, 184, 186].includes(number)) fail(lineNumber, `第 ${number} 首補入標記不符`);
    if (groupTitle) {
      if (!Number.isInteger(part) || !Number.isInteger(total) || total < 2 || part < 1 || part > total || title !== groupTitle) fail(lineNumber, `第 ${number} 首組詩欄位無效`);
      const start = number - part + 1;
      const group = groups.get(start);
      if (group && (group.title !== groupTitle || group.author !== author || group.sourceTitle !== sourceTitle || group.tocPage !== tocPage || group.total !== total || group.start + part - 1 !== number)) fail(lineNumber, `第 ${number} 首組詩其序或資料不符`);
      if (!group && part !== 1) fail(lineNumber, `第 ${number} 首組詩須從其一開始`);
      if (!group) groups.set(start, { title: groupTitle, author, sourceTitle, tocPage, total, start });
    } else if (partText || totalText) fail(lineNumber, `第 ${number} 首缺少組詩題名`);
    const anchor = anchors.get(number);
    if (anchor && [title, author, volume, form].some((value, i) => value !== anchor[i])) fail(lineNumber, `第 ${number} 首應為 ${anchor[0]}（${anchor[1]}）`);
    if (number === 226 && sourceTitle !== '夜思') fail(lineNumber, '第 226 首底本題名應為夜思');
    entries.push({ number, volume, form: /** @type {CatalogEntry['form']} */ (form), title, author, sourceTitle, tocPage, supplemented, ...(groupTitle ? { group: { title: groupTitle, part, total } } : {}) });
  }
  if (entries.length !== 313) fail(lines.length, `篇目須有 313 首，實得 ${entries.length}`);
  for (const group of groups.values()) {
    for (let part = 1; part <= group.total; part++) {
      const member = entries[group.start + part - 2];
      if (member?.group?.part !== part || member.group.title !== group.title || member.group.total !== group.total || member.author !== group.author) fail((member?.number ?? group.start + part - 1) + 1, `組詩 ${group.title} 缺少成員或資料不符`);
    }
  }
  return entries;
}

/** @param {{catalogFile?: string, worksDirectory?: string}} [options] */
export async function loadReadingContent({ catalogFile = path.resolve('content/tang300/catalog.tsv'), worksDirectory = path.resolve('content/tang300') } = {}) {
  const catalog = parseCatalog({ filePath: catalogFile, source: await readFile(catalogFile, 'utf8') });
  const works = await loadWorks(worksDirectory);
  for (const work of works) {
    const entry = catalog[work.frontmatter.number - 1];
    const { title, author, volume, form, supplemented, source_title: sourceTitle, group } = work.frontmatter;
    const groupMatches = (!group && !entry?.group) || (group && entry?.group && group.title === entry.group.title && group.part === entry.group.part && group.total === entry.group.total);
    if (!entry || title !== entry.title || author !== entry.author || volume !== entry.volume || form !== entry.form || supplemented !== entry.supplemented || (sourceTitle ?? title) !== entry.sourceTitle || !groupMatches) {
      throw new Error(`${path.join(worksDirectory, `${work.slug}.md`)}:1:1: 作品與底本篇目第 ${work.frontmatter.number} 首不符`);
    }
  }
  return { catalog, works: works.sort((a, b) => a.frontmatter.number - b.frontmatter.number) };
}
