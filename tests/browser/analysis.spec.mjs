import { expect, test } from '@playwright/test';
import { loadReadingContent } from '../../src/content/reading-content.mjs';

const { works } = await loadReadingContent();
const layers = {
  史實: '史實',
  通行說法: '文學解讀・通行說法',
  白話轉述: '文學解讀・白話轉述',
  本站觀點: '文學解讀・本站觀點',
  教學想像: '教學想像',
};

for (const work of works) for (const [device, viewport] of Object.entries({ desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } })) {
  test(`${work.frontmatter.title} shows every analysis paragraph and its evidence on ${device}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/tang300/${work.slug}/`);
    const analysis = page.getByRole('region', { name: '深入賞析' });
    const expected = work.sections.find((section) => section.title === '深入賞析');
    await expect(analysis.getByRole('heading', { level: 2 })).toHaveText('深入賞析');
    await expect(analysis.getByRole('heading', { level: 3 })).toHaveText(expected.subsections.map((subsection) => subsection.title));
    const authored = expected.subsections.flatMap((subsection) => subsection.paragraphs.flatMap((directive) => directive.paragraphs.map((text) => ({ text, directive }))));
    const paragraphs = analysis.locator('[data-analysis-paragraph]');
    await expect(paragraphs).toHaveCount(authored.length);
    for (const [index, { text, directive }] of authored.entries()) {
      const paragraph = paragraphs.nth(index);
      await expect(paragraph.locator('[data-layer-label]')).toHaveText(layers[directive.stance ?? directive.kind]);
      await expect(paragraph.locator('[data-analysis-text]')).toHaveText(text);
      const sources = paragraph.locator('[data-source]');
      await expect(sources).toHaveCount(directive.refs.length);
      for (const [sourceIndex, id] of directive.refs.entries()) {
        const source = sources.nth(sourceIndex);
        const record = work.frontmatter.sources[id];
        await expect(source.locator('[data-source-material]')).toHaveText(record.source);
        await expect(source.locator('[data-source-locator]')).toHaveText(record.locator);
        await expect(source).toContainText(`出處時代：${record.era}`);
        await expect(source).toContainText(`查證程度：${record.checked}`);
        if (record.note) await expect(source).toContainText(record.note);
        if (record.url) await expect(source.locator('a')).toHaveAttribute('href', new URL(record.url).href);
      }
      const box = await paragraph.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    }
    const legend = page.locator('[data-layer-legend] li');
    await expect(legend).toHaveText(['史實', '文學解讀・通行說法與白話轉述', '文學解讀・本站觀點', '教學想像']);
    const colors = await legend.evaluateAll((items) => items.map((item) => getComputedStyle(item).borderLeftColor));
    expect(new Set(colors).size).toBe(4);
    const shared = analysis.locator('[data-analysis-paragraph]').filter({ has: page.locator('[data-layer-label]:text-is("文學解讀・通行說法")') }).first();
    const paraphrase = analysis.locator('[data-analysis-paragraph]').filter({ has: page.locator('[data-layer-label]:text-is("文學解讀・白話轉述")') }).first();
    const opinion = analysis.locator('[data-analysis-paragraph]').filter({ has: page.locator('[data-layer-label]:text-is("文學解讀・本站觀點")') }).first();
    if (await paraphrase.count()) expect(await shared.evaluate((node) => getComputedStyle(node).borderLeftColor)).toBe(await paraphrase.evaluate((node) => getComputedStyle(node).borderLeftColor));
    await expect(opinion).toHaveCSS('border-left-style', 'dashed');
  });
}
