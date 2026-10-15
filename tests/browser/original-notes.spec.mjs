import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const expectedSources = JSON.parse(readFileSync(new URL('./original-sources.json', import.meta.url), 'utf8'));

async function expectSource(source, expected) {
  await expect(source.locator('[data-source-material]')).toHaveText(expected.source);
  await expect(source.locator('[data-source-locator]')).toHaveText(expected.locator);
  await expect(source.getByText(`出處時代：${expected.era}`, { exact: true })).toBeVisible();
  await expect(source.getByText(`查證程度：${expected.checked}`, { exact: true })).toBeVisible();
  if (expected.note) await expect(source.locator('.note')).toHaveText(expected.note);
  else await expect(source.locator('.note')).toHaveCount(0);
  if (expected.url) await expect(source.locator('a')).toHaveAttribute('href', new URL(expected.url).href);
  else await expect(source.locator('a')).toHaveCount(0);
}

const cases = [
  {
    slug: '040-遊子吟',
    collated: ['陳婉俊《唐詩三百首補注》', '章燮《唐詩三百首註疏》', '《孟東野詩集》', '《全唐詩》', '郭茂倩《樂府詩集》'],
    readings: ['寸｜ㄘㄨㄣˋ', '暉｜ㄏㄨㄟ'],
    rhymes: ['衣｜本詩押微韻'],
    variants: ['第 5 句｜一作｜難將寸草心', '第 5 句｜正文｜難將寸草心'],
    titleNotes: ['《全唐詩》卷三七二題下注「自註迎母溧上作」'],
    textNotes: ['題名及文中「遊」採通行正字'],
    refs: {
      collation: [['chen_bu_zhu_1'], ['zhang_zhu_shu_1'], ['meng_dongye_1'], ['quan_tang_shi_1'], ['yue_fu_shi_ji_1']],
      reading: [['moe_concise_1'], ['moe_concise_2']], rhyme: [['guang_yun_2']],
      variant: [['quan_tang_shi_1'], ['gao_tang_shi_1', 'yang_tang_yin_1']],
      'title-note': [['quan_tang_shi_1']], 'text-note': [['moe_variants_1', 'moe_variants_2']],
    },
  },
  {
    slug: '099-春望',
    collated: ['《全唐詩》卷二二四', '仇兆鰲《杜詩詳註》'],
    readings: ['濺｜ㄐㄧㄢˋ', '恨｜ㄏㄣˋ', '烽｜ㄈㄥ', '搔｜ㄙㄠ', '更｜ㄍㄥˋ', '欲｜ㄩˋ', '勝｜ㄕㄥ', '簪｜ㄗㄢ'],
    rhymes: ['簪｜本詩押侵韻'],
    variants: ['第 2 句｜一作｜城荒草木深'],
    titleNotes: [],
    textNotes: [],
    refs: {
      collation: [['quan_tang_shi_1'], ['qiu_du_shi_1']],
      reading: [['moe_concise_1'], ['moe_concise_2'], ['moe_concise_3'], ['moe_concise_4'], ['moe_concise_5'], ['moe_concise_6'], ['moe_concise_7', 'qiu_du_shi_2'], ['moe_concise_8']],
      rhyme: [['moe_revised_1']], variant: [['qiu_du_shi_3']], 'title-note': [], 'text-note': [],
    },
  },
  {
    slug: '226-靜夜思',
    sourceTitle: '夜思',
    collated: ['陳婉俊《唐詩三百首補注》', '章燮《唐詩三百首註疏》', '《李太白文集》', '《全唐詩》'],
    readings: ['霜｜ㄕㄨㄤ'],
    rhymes: [],
    variants: ['第 1 句｜正文｜床前看月光', '第 3 句｜正文｜舉頭望山月'],
    titleNotes: [],
    textNotes: ['古本「牀」依教育部正字作「床」', '通行正文取《唐詩三百首》的「明月光」'],
    refs: {
      collation: [['chen_bu_zhu_1'], ['zhang_zhu_shu_1'], ['li_taibai_wenji_1'], ['quan_tang_shi_1']],
      reading: [['moe_concise_1']], rhyme: [],
      variant: [['li_taibai_wenji_1', 'quan_tang_shi_1', 'yue_fu_shi_ji_1'], ['li_taibai_wenji_1', 'quan_tang_shi_1', 'yue_fu_shi_ji_1']],
      'title-note': [],
      'text-note': [['moe_variants_1', 'li_taibai_wenji_1'], ['chen_bu_zhu_1', 'li_taibai_wenji_1', 'quan_tang_shi_1', 'yue_fu_shi_ji_1', 'gao_tang_shi_1']],
    },
  },
];

for (const item of cases) for (const [device, viewport] of Object.entries({ desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } })) {
  test(`${item.slug} renders its original-text annotations with direct sources on ${device}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/tang300/${item.slug}/`);
    const original = page.getByRole('region', { name: '原文' });
    await expect(original.getByText('底本：四藤吟社 313 首本')).toBeVisible();
    if (item.sourceTitle) await expect(original.getByText(`底本題名：${item.sourceTitle}`)).toBeVisible();
    await expect(original.locator('[data-annotation="collation"]')).toHaveCount(item.collated.length);
    for (const title of item.collated) await expect(original.locator('[data-annotation="collation"]').filter({ hasText: title })).toHaveCount(1);
    for (const [index, ids] of item.refs.collation.entries()) {
      const source = original.locator('[data-annotation="collation"]').nth(index).locator('[data-source]');
      await expect(source).toHaveAttribute('data-source-id', ids[0]);
      await expectSource(source, expectedSources[item.slug][ids[0]]);
    }
    for (const [key, expected] of Object.entries({ reading: item.readings, rhyme: item.rhymes, variant: item.variants, 'title-note': item.titleNotes, 'text-note': item.textNotes })) {
      const notes = original.locator(`[data-annotation="${key}"]`);
      await expect(notes).toHaveCount(expected.length);
      for (const [index, phrase] of expected.entries()) {
        await expect(notes.nth(index)).toContainText(phrase);
        await expect(notes.nth(index).locator('[data-source]')).toHaveCount(item.refs[key][index].length);
        for (const [sourceIndex, id] of item.refs[key][index].entries()) {
          const source = notes.nth(index).locator('[data-source]').nth(sourceIndex);
          await expect(source).toHaveAttribute('data-source-id', id);
          await expectSource(source, expectedSources[item.slug][id]);
        }
      }
    }
    for (const link of await page.locator('[data-source] a').all()) {
      const href = await link.getAttribute('href');
      expect(new URL(href).protocol).toMatch(/^https?:$/);
    }
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows).toBe(false);
  });
}

test('unresolved source details and URL availability stay explicit', async ({ page }) => {
  await page.goto('/tang300/040-遊子吟/');
  const record = page.locator('[data-source-id="tang_shi_gui_1"]');
  await expectSource(record, expectedSources['040-遊子吟'].tang_shi_gui_1);
  await expect(record).toContainText('已核書影');
  await expect(record).toContainText('「仁」字待核');
  await expect(record.locator('a')).toHaveCount(0);
  const linked = page.locator('[data-source-id="quan_tang_shi_1"]').first();
  await expect(linked.locator('a')).toHaveAttribute('href', /^https:\/\//);
});
