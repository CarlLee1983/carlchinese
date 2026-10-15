import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { parseWork } from '../src/content/works.mjs';

const samples = [
  ['040-遊子吟.md', '遊子吟', 6],
  ['099-春望.md', '春望', 8],
  ['226-靜夜思.md', '靜夜思', 4],
];

test('formal loader retains every real work and its four question levels', async () => {
  for (const [filename, title, lineCount] of samples) {
    const filePath = path.resolve('content/tang300', filename);
    const work = parseWork({ filePath, source: await readFile(filePath, 'utf8') });
    assert.equal(work.frontmatter.title, title);
    assert.equal(work.frontmatter.text.length, lineCount);
    assert.deepEqual(work.sections.map((s) => s.title), ['深入賞析', '親子共學']);
    assert.deepEqual(work.sections[1].subsections.map((s) => s.title), ['開場', '共讀', '提問', '表達活動']);
    assert.deepEqual(work.sections[1].subsections[2].questions.map((q) => q.level), ['提取', '推論', '詮釋整合', '評估']);
  }
});

const fixture = `---
title: 試讀
author: 甲
dynasty: 唐
number: 1
volume: 1
form: 五言絕句
supplemented: false
collated_from: [book]
text: [春風到窗前，, 明月照故園。]
sources:
  book:
    source: 《測試本》
    locator: 卷一
    era: 後世古籍
    checked: 僅核錄文
---

## 深入賞析

### 字詞

:::史實{refs="book"}
春風是風。
:::

### 背景

:::文學解讀{stance="本站觀點"}
這是背景。
:::

### 技巧

:::文學解讀{stance="本站觀點"}
這是技巧。
:::

### 情感

:::文學解讀{stance="本站觀點"}
這是情感。
:::

## 親子共學

### 開場

:::教學想像
我們來想像。
:::

### 共讀

:::文學解讀{stance="白話轉述"}
我們一起讀。
:::

### 提問

\`\`\`yaml questions
- level: 提取
  question: 看見什麼？
  likely_answers:
    - answer: 春風。
      follow_up: 對，還有呢？
    - answer: 明月。
      follow_up: 很好。
- level: 推論
  question: 想到什麼？
  likely_answers:
    - answer: 故園。
      follow_up: 為什麼？
    - answer: 春風。
      follow_up: 再想想。
- level: 詮釋整合
  question: 詩在說什麼？
  likely_answers:
    - answer: 風。
      follow_up: 也有月亮。
    - answer: 月亮。
      follow_up: 是的。
- level: 評估
  question: 你喜歡嗎？
  likely_answers:
    - answer: 喜歡。
      follow_up: 為什麼？
    - answer: 不喜歡。
      follow_up: 可以說說。
\`\`\`

### 表達活動

說一句你的詩。
`;

const fixturePath = '/fixtures/tang300/001-試讀.md';
test('small complete fixture passes the public loader', () => {
  const work = parseWork({ filePath: fixturePath, source: fixture });
  assert.equal(work.frontmatter.text[1], '明月照故園。');
});

test('source accepts an absolute public HTTPS URL', () => {
  const source = fixture.replace('    checked: 僅核錄文', '    checked: 僅核錄文\n    url: https://example.org/卷一');
  assert.equal(parseWork({ filePath: fixturePath, source }).frontmatter.sources.book.url, 'https://example.org/卷一');
});

const invalid = [
  ['missing required field', 'author: 甲\n', '', /author.*必填/],
  ['empty source reference', 'collated_from: [book]', 'collated_from: []', /至少 1 項/],
  ['unknown source reference', 'collated_from: [book]', 'collated_from: [missing]', /未登錄來源 missing/],
  ['invalid enum', 'era: 後世古籍', 'era: 其他', /era.*無效值/],
  ['unknown era without note', 'era: 後世古籍', 'era: 待考', /待考必須說明/],
  ['unrecorded check without note', 'checked: 僅核錄文', 'checked: 未記錄', /未記錄必須說明/],
  ['malformed source URL', '    checked: 僅核錄文', '    checked: 僅核錄文\n    url: not-a-url', /url.*http\/https/, /:17:10:/],
  ['javascript source URL', '    checked: 僅核錄文', '    checked: 僅核錄文\n    url: javascript:alert(1)', /url.*http\/https/, /:17:10:/],
  ['variant outside poem', 'sources:\n', 'variants:\n  - line: 3\n    reading: 異文\n    kind: 正文\n    refs: [book]\nsources:\n', /超出詩句數/],
  ['mismatched number', 'number: 1', 'number: 2', /檔名與序號/],
  ['bare paragraph', ':::史實{refs="book"}\n春風是風。\n:::', '春風是風。', /須包在標示層次/],
  ['wrong heading order', '### 技巧', '### 情感', /子標題錯序/],
  ['unknown frontmatter field', 'author: 甲', 'author: 甲\nunknown: value', /未知欄位 unknown/],
  ['inherited frontmatter key', 'author: 甲', 'author: 甲\nconstructor: value', /未知欄位 constructor/],
  ['unknown nested field', '    locator: 卷一', '    locator: 卷一\n    extra: value', /未知欄位 extra/],
  ['inherited nested field', '    locator: 卷一', '    locator: 卷一\n    toString: value', /未知欄位 toString/],
  ['unknown directive', ':::史實{refs="book"}', ':::未知{refs="book"}', /未知 directive/],
  ['inherited directive name', ':::史實{refs="book"}', ':::constructor{refs="book"}', /未知 directive constructor/],
  ['unknown directive attribute', ':::史實{refs="book"}', ':::史實{refs="book" extra="x"}', /未知 directive 屬性 extra/],
  ['unclosed directive', ':::史實{refs="book"}\n春風是風。\n:::', ':::史實{refs="book"}\n春風是風。', /未閉合 directive/],
  ['missing question level', '- level: 評估', '- level: 推論', /缺少提問層級 評估/],
  ['one answer', '    - answer: 明月。\n      follow_up: 很好。', '', /2–3 組回答與接話/],
  ['missing follow up', '      follow_up: 很好。', '', /follow_up 必填/],
  ['unknown question key', '  question: 看見什麼？', '  question: 看見什麼？\n  extra: x', /未知欄位 extra/],
  ['unresolved YAML tag in frontmatter', 'author: 甲', 'author: !unknown 甲', /Unresolved tag|未支援 YAML 標籤/],
  ['unresolved YAML tag in questions', '  question: 看見什麼？', '  question: !unknown 看見什麼？', /Unresolved tag|未支援 YAML 標籤/],
  ['multiline poem item', 'text: [春風到窗前，, 明月照故園。]', 'text:\n  - |-\n    春風到窗前，\n    明月照故園。', /詩句須為單行/],
  ['overlong oral sentence', '我們一起讀。', '我們一起讀這一首很長很長很長很長很長很長很長很長很長的詩。', /句長.*超過 25/],
  ['overlong analysis', '春風是風。', `${'春'.repeat(1501)}。`, /深入賞析.*超過 1500/],
  ['overlong alphanumeric oral sentence', '我們一起讀。', `${'A'.repeat(26)}。`, /句長.*超過 25/],
];

for (const [name, before, after, reason, position] of invalid) {
  test(`loader rejects ${name} with file, line, column and reason`, () => {
    const source = fixture.replace(before, after);
    assert.notEqual(source, fixture);
    assert.throws(() => parseWork({ filePath: fixturePath, source }), (error) => {
      assert.match(error.message, /^\/fixtures\/tang300\/001-試讀\.md:\d+:\d+:/);
      if (position) assert.match(error.message, position);
      assert.match(error.message, reason);
      return true;
    });
  });
}
