import { expect, test } from '@playwright/test';
import { illustrations } from '../../src/content/illustrations.mjs';
import { loadReadingContent } from '../../src/content/reading-content.mjs';

const content = await loadReadingContent();
const works = content.works.map(work => ({ slug: work.slug, mist: illustrations[work.id].mist }));

async function checkMist(page, scope, mist) {
  const layer = scope.locator('[data-ink-mist]');
  if (!mist) { await expect(layer).toHaveCount(0); return; }
  await expect(layer).toHaveCount(1);
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  // 霧層落在逐圖標示的霧帶內，且包圖片的框不改變圖片的版面
  const [frame, image, band] = await Promise.all([
    scope.locator('[data-ink-mist-frame]').boundingBox(),
    scope.locator('[data-ink-mist-frame] img').boundingBox(),
    layer.boundingBox(),
  ]);
  expect(frame).toEqual(image);
  const expected = {
    x: image.x + image.width * mist.left / 100,
    y: image.y + image.height * mist.top / 100,
    width: image.width * (mist.right - mist.left) / 100,
    height: image.height * (mist.bottom - mist.top) / 100,
  };
  for (const [edge, value] of Object.entries(expected)) expect(Math.abs(band[edge] - value)).toBeLessThan(1.5);
}

for (const width of [390, 1440]) test(`each illustration shows mist only where its band is marked at ${width}px`, async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 900 });
  for (const [index, work] of works.entries()) {
    await page.goto('/');
    await page.locator(`[data-preview="${index}"]`).click();
    await checkMist(page, page.locator(`[data-leaf="${index}"]`), work.mist);
    await page.goto(`/tang300/${work.slug}/`);
    await checkMist(page, page.locator('#original'), work.mist);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

for (const width of [390, 1440]) test(`reduced motion hides the mist and keeps every illustration in place at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  for (const work of works.filter(work => work.mist)) {
    await page.goto(`/tang300/${work.slug}/`);
    const image = page.locator('#original img');
    const moving = await image.boundingBox();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('#original [data-ink-mist]')).toHaveCount(1);
    await expect(page.locator('#original [data-ink-mist]')).toBeHidden();
    await expect(image).toBeVisible();
    expect(await image.boundingBox()).toEqual(moving);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
});
