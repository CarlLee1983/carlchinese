import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadReadingContent, parseCatalog } from '../src/content/reading-content.mjs';

const catalogFile = path.resolve('content/tang300/catalog.tsv');

test('formal reading entry joins the 313 base-edition entries to the three readable works', async () => {
  const { catalog, works } = await loadReadingContent();
  assert.equal(catalog.length, 313);
  assert.deepEqual(catalog.filter((entry) => entry.number === 40 || entry.number === 98 || entry.number === 226).map(({ number, title, sourceTitle, volume, form }) => ({ number, title, sourceTitle, volume, form })), [
    { number: 40, title: '遊子吟', sourceTitle: '遊子吟', volume: 1, form: '五言樂府' },
    { number: 98, title: '春望', sourceTitle: '春望', volume: 5, form: '五言律詩' },
    { number: 226, title: '靜夜思', sourceTitle: '夜思', volume: 7, form: '五言絕句' },
  ]);
  assert.deepEqual(works.map((work) => work.frontmatter.number), [40, 98, 226]);
  assert.deepEqual(catalog.filter((entry) => entry.supplemented).map((entry) => entry.number), [183, 184, 186]);
});

test('formal reading entry rejects a swapped title with catalogue position', async () => {
  const source = await readFile(catalogFile, 'utf8');
  assert.throws(() => parseCatalog({ filePath: catalogFile, source: source.replace('98\t5\t五言律詩\t春望\t', '98\t5\t五言律詩\t月夜\t') }), /catalog\.tsv:\d+:\d+:.*98.*春望/);
});

test('formal catalogue rejects an ungrouped middle poem even when the last part exists', async () => {
  const source = await readFile(catalogFile, 'utf8');
  const changed = source.replace('185\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡五首\txv\t詠懷古跡\t3\t5\tfalse', '185\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡五首\txv\t\t\t\tfalse');
  assert.notEqual(changed, source);
  assert.throws(() => parseCatalog({ filePath: catalogFile, source: changed }), /catalog\.tsv:\d+:\d+:.*組詩.*缺少成員/);
});

for (const [field, before, after] of [
  ['source title', '184\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡五首\txv', '184\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡二首\txv'],
  ['TOC page', '184\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡五首\txv', '184\t6\t七言律詩\t詠懷古跡\t杜甫\t詠懷古跡五首\txvi'],
]) {
  test(`formal catalogue keeps one group's ${field} consistent`, async () => {
    const source = await readFile(catalogFile, 'utf8');
    const changed = source.replace(before, after);
    assert.notEqual(changed, source);
    assert.throws(() => parseCatalog({ filePath: catalogFile, source: changed }), /catalog\.tsv:\d+:\d+:.*組詩.*資料不符/);
  });
}

test('formal reading entry accepts reordered group fields in valid work frontmatter', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'carl-catalog-'));
  try {
    const source = await readFile(path.resolve('content/tang300/098-春望.md'), 'utf8');
    const grouped = source.replace('title: 春望\n', 'title: 詠懷古跡\nsource_title: 詠懷古跡五首\n').replace('number: 98\nvolume: 5\nform: 五言律詩\nsupplemented: false\n', 'number: 183\nvolume: 6\nform: 七言律詩\nsupplemented: true\ngroup:\n  total: 5\n  part: 1\n  title: 詠懷古跡\n');
    await writeFile(path.join(directory, '183-詠懷古跡-其一.md'), grouped);
    const { works } = await loadReadingContent({ worksDirectory: directory });
    assert.equal(works[0].frontmatter.group.part, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
