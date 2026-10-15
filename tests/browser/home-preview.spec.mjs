import { expect, test } from '@playwright/test';

test('sample preview works with keyboard and preserves real reading links', async ({ page }) => {
  await page.goto('/');
  const choices = page.locator('[data-preview]');
  await choices.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(choices.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-leaf="1"]')).toBeVisible();
  await expect(page.locator('[data-leaf="0"]')).toBeHidden();
  await page.locator('[data-leaf="1"] a').click();
  await expect(page.getByRole('heading', { level: 1, name: '春望' })).toBeVisible();
});

test('without JavaScript all samples and their reading links remain available', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:43157/');
  await expect(page.locator('[data-leaf]:visible')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: '讀〈靜夜思〉' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '靜夜思' })).toBeVisible();
  await context.close();
});


test('sample fragments restore on direct entry and browser history', async ({ page }) => {
  await page.goto('/#sample-2');
  await expect(page.locator('[data-leaf="2"]')).toBeVisible();
  await page.locator('[data-preview="1"]').click();
  await expect(page).toHaveURL(/#sample-1$/);
  await expect(page.locator('[data-leaf="1"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-leaf="2"]')).toBeVisible();
  await page.goForward();
  await expect(page.locator('[data-leaf="1"]')).toBeVisible();
});
