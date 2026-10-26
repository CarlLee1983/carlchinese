import { expect, test } from '@playwright/test';

// 帶筆觸的元素與筆觸所在的偽元素
const strokes = [
  { host: '.section-heading h2', pseudo: '::after' },
  { host: '.area-feature:nth-child(1) h2', pseudo: '::after' },
  { host: '.area-feature:nth-child(2) h2', pseudo: '::after' },
  { host: '.site-footer', pseudo: '::before' },
];
// 沒有裁切：不設 clip-path，或 inset 的各邊都是 0（插值結果可能寫成 0% 或 0px）
const fullyDrawn = clipPath => clipPath === 'none' || /^inset\(([^)]*)\)$/.exec(clipPath)?.[1].split(' ').every(edge => parseFloat(edge) === 0) === true;
const clipOf = (page, { host, pseudo }) => page.locator(host).evaluate((element, pseudo) => getComputedStyle(element, pseudo).clipPath, pseudo);

// 等元素（含偽元素）進入視窗後開始的有限長度動畫結束；回傳是否真的有動畫播放
async function settleOnEntry(locator) {
  await locator.scrollIntoViewIfNeeded();
  const started = () => locator.evaluate(element => element.getAnimations({ subtree: true }).length > 0);
  await expect.poll(started).toBe(true);
  return locator.evaluate(async element => {
    const animations = element.getAnimations({ subtree: true }).filter(animation => animation.effect.getComputedTiming().endTime !== Infinity);
    await Promise.all(animations.map(animation => animation.finished));
    return animations.map(animation => animation.effect.pseudoElement ?? 'element');
  });
}

const lineOpacities = (page, leaf) => page.locator(`[data-leaf="${leaf}"] .sample-lines span`).evaluateAll(spans => spans.map(span => getComputedStyle(span).opacity));

for (const width of [390, 1440]) test(`brush strokes write themselves out on entering view at ${width}px`, async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  for (const stroke of strokes) {
    expect(await settleOnEntry(page.locator(stroke.host))).toContain(stroke.pseudo);
    expect(fullyDrawn(await clipOf(page, stroke)), stroke.host).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

for (const width of [390, 1440]) test(`preview lines settle from pale ink for every poem chosen at ${width}px`, async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  for (const leaf of [0, 1, 2, 0]) {
    await page.locator(`[data-preview="${leaf}"]`).click();
    const lines = page.locator(`[data-leaf="${leaf}"] .sample-lines span`);
    // 換上的詩句重新洇開
    expect(await settleOnEntry(lines.first())).toContain('element');
    await lines.last().evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    for (const opacity of await lineOpacities(page, leaf)) expect(opacity).toBe('1');
    await expect(page).toHaveURL(new RegExp(`#sample-${leaf}$`));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('preview lines become visible on direct fragment entry and after scrolling past quickly', async ({ page }) => {
  await page.goto('/#sample-2');
  for (const line of await page.locator('[data-leaf="2"] .sample-lines span').all()) await expect(line).toHaveCSS('opacity', '1', { timeout: 10_000 });
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('[data-leaf="0"]').scrollIntoViewIfNeeded();
  for (const line of await page.locator('[data-leaf="0"] .sample-lines span').all()) await expect(line).toHaveCSS('opacity', '1', { timeout: 10_000 });
});

async function expectComplete(page) {
  for (const stroke of strokes) {
    await page.locator(stroke.host).scrollIntoViewIfNeeded();
    expect(fullyDrawn(await clipOf(page, stroke)), stroke.host).toBe(true);
  }
  await page.locator('[data-leaf="0"]').scrollIntoViewIfNeeded();
  for (const opacity of await lineOpacities(page, 0)) expect(opacity).toBe('1');
}

test('reduced motion shows strokes and preview lines complete without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expectComplete(page);
  expect(await page.locator('[data-leaf="0"] .sample-lines span').evaluateAll(spans => spans.flatMap(span => span.getAnimations()).length)).toBe(0);
});

test.describe('without scripts', () => {
  test.use({ javaScriptEnabled: false });
  test('strokes and preview lines are complete', async ({ page }) => {
    await page.goto('/');
    await expectComplete(page);
  });
});
