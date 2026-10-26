import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { illustrations, validateIllustrations } from '../src/content/illustrations.mjs';
import { loadReadingContent } from '../src/content/reading-content.mjs';
import { loadSiteContent } from '../src/content/site-content.mjs';

const { works } = await loadReadingContent();
test('every readable work receives a distinct image; catalogue-only works need none', async () => {
  const result = await validateIllustrations(works);
  assert.equal(Object.keys(result).length, 3);
  const site = await loadSiteContent();
  for (const work of site.works) assert.deepEqual(work.illustration, result[work.id]);
});
for (const [name, change, error] of [
  ['missing image', r => { delete r['tang300-098']; }, /098.*缺少/],
  ['wrong identity', r => { r['tang300-099'] = r['tang300-098']; delete r['tang300-098']; }, /099.*沒有對應/],
  ['swapped image', r => { r['tang300-098'].src = r['tang300-040'].src; }, /098.*識別不符/],
  ['empty alt', r => { r['tang300-040'].alt = ''; }, /040.*替代文字/],
  ['invalid size', r => { r['tang300-040'].width = 0; }, /040.*尺寸/],
  ['missing mist decision', r => { delete r['tang300-098'].mist; }, /098.*霧帶/],
  ['mist outside the image', r => { r['tang300-098'].mist.right = 120; }, /098.*霧帶/],
  ['non-numeric mist edge', r => { r['tang300-098'].mist.top = '38'; }, /098.*霧帶/],
  ['vertically inverted mist band', r => { r['tang300-098'].mist.top = 80; }, /098.*霧帶/],
  ['horizontally inverted mist band', r => { r['tang300-098'].mist.left = 100; }, /098.*霧帶/],
  ['mist band with extra keys', r => { r['tang300-098'].mist.opacity = 50; }, /098.*霧帶/],
]) test(`image validation rejects ${name}`, async () => {
  const records = structuredClone(illustrations); change(records);
  await assert.rejects(validateIllustrations(works, { records }), error);
});
test('an explicit null records an indoor scene judged to have no mist', async () => {
  const records = structuredClone(illustrations); records['tang300-098'].mist = null;
  const result = await validateIllustrations(works, { records });
  assert.equal(result['tang300-098'].mist, null);
});
test('missing files and identical images saved under different work IDs fail', async () => {
  const publicDirectory = await mkdtemp(path.join(os.tmpdir(), 'poem-art-'));
  try {
    await assert.rejects(validateIllustrations(works, { publicDirectory }), /040.*無法讀取/);
    const directory = path.join(publicDirectory, 'art/poems/tang300'); await mkdir(directory, { recursive: true });
    const image = await readFile('public/art/poems/tang300/040-ink.webp');
    for (const number of ['040', '098', '226']) await writeFile(path.join(directory, `${number}-ink.webp`), image);
    await assert.rejects(validateIllustrations(works, { publicDirectory }), /098.*重複/);
  } finally { await rm(publicDirectory, { recursive: true, force: true }); }
});
