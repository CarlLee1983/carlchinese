import { expect, test } from '@playwright/test';
import { loadReadingContent } from '../../src/content/reading-content.mjs';
const content = await loadReadingContent();
const works = content.works.map(work => [String(work.frontmatter.number).padStart(3, '0'), work.frontmatter.title]);
async function checkImage(page, scope, number) {
  const figure = scope.locator('[data-poem-illustration]');
  const image = figure.locator('img');
  await expect(image).toHaveAttribute('src', `/art/poems/tang300/${number}-ink.webp`);
  await expect(image).toHaveAttribute('alt', /[\u4e00-\u9fff]/);
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await image.evaluate(img => img.decode());
  expect(await image.evaluate(img => img.naturalWidth > 0 && img.naturalWidth === Number(img.getAttribute('width')) && img.naturalHeight === Number(img.getAttribute('height')))).toBe(true);
  await expect(figure.locator('figcaption')).toHaveText('意境插圖・人工智慧生成');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const width of [390, 1440]) test(`preview and work image identities agree at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  for (let i = 0; i < works.length; i++) {
    const [number, title] = works[i];
    await page.goto('/');
    await page.locator(`[data-preview="${i}"]`).click();
    const leaf = page.locator(`[data-leaf="${i}"]`);
    await checkImage(page, leaf, number);
    const alt = await leaf.locator('img').getAttribute('alt');
    await leaf.getByRole('link', { name: `讀〈${title}〉` }).click();
    await checkImage(page, page.locator('#original'), number);
    await expect(page.locator('#original img')).toHaveAttribute('alt', alt);
  }
});
test('fragment entry and history preserve illustration identity', async ({ page }) => {
  await page.goto('/#sample-2');
  await checkImage(page, page.locator('[data-leaf="2"]'), '226');
  await page.locator('[data-preview="1"]').click();
  await checkImage(page, page.locator('[data-leaf="1"]'), '098');
  await page.goBack(); await checkImage(page, page.locator('[data-leaf="2"]'), '226');
  await page.goForward(); await checkImage(page, page.locator('[data-leaf="1"]'), '098');
});
test('all illustrations remain available without scripts', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:43157/');
  for (let i = 0; i < works.length; i++) await checkImage(page, page.locator(`[data-leaf="${i}"]`), works[i][0]);
  await page.getByRole('link', { name: '讀〈靜夜思〉' }).click();
  await checkImage(page, page.locator('#original'), '226');
  await context.close();
});
