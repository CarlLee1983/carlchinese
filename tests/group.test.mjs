import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadReadingContent } from '../src/content/reading-content.mjs';

const fixtureDirectory = path.resolve('tests/fixtures/group/tang300');
const names = ['198-遣悲懷-其一.md', '199-遣悲懷-其二.md'];

test('formal content entry loads two readable members of a three-part group', async () => {
  const { catalog, works } = await loadReadingContent({ worksDirectory: fixtureDirectory });
  assert.equal(catalog.length, 313);
  assert.deepEqual(works.map((work) => [work.frontmatter.number, work.slug, work.frontmatter.group]), [
    [198, '198-遣悲懷-其一', { title: '遣悲懷', part: 1, total: 3 }],
    [199, '199-遣悲懷-其二', { title: '遣悲懷', part: 2, total: 3 }],
  ]);
  assert.deepEqual(catalog.slice(197, 200).map((entry) => entry.group.part), [1, 2, 3]);
});

for (const [name, filename, from, to, reason] of [
  ['wrong group title', names[0], '  title: 遣悲懷', '  title: 其他組詩', /作品與底本篇目第 198 首不符/],
  ['wrong group total', names[0], '  total: 3', '  total: 2', /作品與底本篇目第 198 首不符/],
  ['wrong group part', names[1], '  part: 2', '  part: 3', /檔名與序號／題名不符/],
  ['wrong work identity', names[1], 'number: 199', 'number: 200', /檔名與序號／題名不符/],
]) {
  test(`formal content entry rejects ${name}`, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'carl-group-'));
    try {
      for (const fixtureName of names) {
        const source = await readFile(path.join(fixtureDirectory, fixtureName), 'utf8');
        const changed = fixtureName === filename ? source.replace(from, to) : source;
        if (fixtureName === filename) assert.notEqual(changed, source);
        await writeFile(path.join(directory, fixtureName), changed);
      }
      await assert.rejects(loadReadingContent({ worksDirectory: directory }), (error) => {
        assert.match(error.message, /\.md:\d+:\d+:/);
        assert.match(error.message, reason);
        return true;
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
