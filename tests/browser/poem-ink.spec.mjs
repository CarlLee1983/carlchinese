import { expect, test } from '@playwright/test';
import { loadReadingContent } from '../../src/content/reading-content.mjs';

const { works } = await loadReadingContent();

// 把每句的入場定格在同一時刻，取讀者此刻看到的各句不透明度
const opacitiesAt = (page, time) => page.locator('[data-poem-line]').evaluateAll((lines, time) => lines.map(line => {
  for (const animation of line.getAnimations()) { animation.pause(); animation.currentTime = time; }
  return Number(getComputedStyle(line).opacity);
}), time);

for (const width of [390, 1440]) test(`poem lines settle from pale ink one after another at ${width}px`, async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 900 });
  for (const work of works) {
    await page.goto(`/tang300/${work.slug}/`);
    // 原文區以外的作品頁內容沒有任何動態
    expect(await page.evaluate(() => document.getAnimations().filter(animation => !animation.effect.target.closest('#original')).length)).toBe(0);
    // 第一句剛洇成濃墨的時刻，後面的句子仍淡、且不比前一句濃
    const midway = await opacitiesAt(page, 1700);
    expect(midway[0]).toBe(1);
    expect(midway.at(-1)).toBeLessThan(1);
    midway.slice(1).forEach((opacity, index) => expect(opacity).toBeLessThanOrEqual(midway[index]));
    await page.locator('[data-poem-line]').evaluateAll(lines => Promise.all(lines.flatMap(line => line.getAnimations()).map(animation => { animation.play(); return animation.finished; })));
    for (const opacity of await page.locator('[data-poem-line]').evaluateAll(lines => lines.map(line => getComputedStyle(line).opacity))) expect(opacity).toBe('1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('reduced motion shows every poem line at once without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const work of works) {
    await page.goto(`/tang300/${work.slug}/`);
    const lines = await page.locator('[data-poem-line]').evaluateAll(elements => elements.map(line => ({ animations: line.getAnimations().length, opacity: getComputedStyle(line).opacity })));
    for (const line of lines) expect(line).toEqual({ animations: 0, opacity: '1' });
  }
});

test.describe('without scripts', () => {
  test.use({ javaScriptEnabled: false });
  test('poem lines become fully visible', async ({ page }) => {
    for (const work of works) {
      await page.goto(`/tang300/${work.slug}/`);
      const lines = page.locator('[data-poem-line]');
      const count = await lines.count();
      for (let index = 0; index < count; index++) await expect(lines.nth(index)).toHaveCSS('opacity', '1', { timeout: 10_000 });
    }
  });
});
