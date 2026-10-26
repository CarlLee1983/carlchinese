import { expect, test } from '@playwright/test';

const hero = '.cover h1 img';
const quote = '.cover-copy p';
const button = '.cover-copy .button';

// 主視覺、引言與按鈕此刻呈現給讀者的狀態
const coverState = page => page.evaluate(selectors => selectors.map(selector => {
  const element = document.querySelector(selector);
  const style = getComputedStyle(element);
  return { opacity: style.opacity, filter: style.filter, reach: style.getPropertyValue('--ink-reach').trim() };
}), [hero, quote, button]);

const isSettled = state => state.opacity === '1' && ['none', 'blur(0px)'].includes(state.filter) && ['', '150%'].includes(state.reach);

for (const width of [390, 1440]) test(`the hero spreads from a drop of ink and its words follow at ${width}px`, async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const entrances = await page.evaluate(selectors => selectors.map(selector => document.querySelector(selector).getAnimations().length), [hero, quote, button]);
  for (const count of entrances) expect(count).toBeGreaterThan(0);
  // 按鈕只淡入：入場過程中任何時刻都不模糊
  const buttonFilters = await page.locator(button).evaluate(element => [0, 900, 1900, 2300, 2800].map(time => {
    for (const animation of element.getAnimations()) { animation.pause(); animation.currentTime = time; }
    return getComputedStyle(element).filter;
  }));
  for (const filter of buttonFilters) expect(filter).toBe('none');
  // 開場 300ms：墨只落在題字一點，引言與按鈕都還沒出現
  const opening = await page.evaluate(selectors => selectors.map(selector => {
    const element = document.querySelector(selector);
    for (const animation of element.getAnimations()) { animation.pause(); animation.currentTime = 300; }
    const style = getComputedStyle(element);
    return { opacity: Number(style.opacity), reach: parseFloat(style.getPropertyValue('--ink-reach')) };
  }), [hero, quote, button]);
  expect(opening[0].reach).toBeLessThan(50);
  expect(opening[1].opacity).toBe(0);
  expect(opening[2].opacity).toBe(0);
  await page.evaluate(selectors => Promise.all(selectors.flatMap(selector => document.querySelector(selector).getAnimations())
    .map(animation => { animation.play(); return animation.finished; })), [hero, quote, button]);
  for (const state of await coverState(page)) expect(isSettled(state), JSON.stringify(state)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('reduced motion shows the hero, quote and button at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(selectors => selectors.map(selector => document.querySelector(selector).getAnimations().length), [hero, quote, button])).toEqual([0, 0, 0]);
  for (const state of await coverState(page)) expect(isSettled(state), JSON.stringify(state)).toBe(true);
});

test('the catalogue button keeps its keyboard focus order and focus style', async ({ page }) => {
  const focusPath = async () => {
    await page.goto('/');
    const path = [];
    for (let step = 0; step < 6; step++) {
      await page.keyboard.press('Tab');
      path.push(await page.evaluate(() => document.activeElement.textContent.trim()));
    }
    await page.locator(button).focus();
    return { path, outline: await page.locator(button).evaluate(element => getComputedStyle(element).outline) };
  };
  const moving = await focusPath();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(moving.path).toContain('閱讀《唐詩三百首》目錄');
  expect(await focusPath()).toEqual(moving);
});

test.describe('without scripts', () => {
  test.use({ javaScriptEnabled: false });
  test('the hero, quote and button become fully visible', async ({ page }) => {
    await page.goto('/');
    for (const selector of [hero, quote, button]) await expect(page.locator(selector)).toHaveCSS('opacity', '1', { timeout: 10_000 });
    await expect(page.locator(hero)).toHaveCSS('filter', /none|blur\(0px\)/);
  });
});
