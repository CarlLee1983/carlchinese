import { expect, test } from '@playwright/test';

test('home leads to the complete series catalogue and only three readable works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '生活國語' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '古典詩文' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '臺灣文學' })).toBeVisible();
  await page.getByRole('link', { name: '閱讀《唐詩三百首》目錄' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '唐詩三百首' })).toBeVisible();
  await expect(page.locator('[data-catalog-entry]')).toHaveCount(313);
  await expect(page.locator('[data-catalog-entry] a')).toHaveCount(3);
  await expect(page.locator('[data-catalog-entry="99"]')).toContainText('月夜');
  await expect(page.locator('[data-catalog-entry="99"] a')).toHaveCount(0);
  await expect(page.getByText('補入', { exact: true })).toHaveCount(3);
  await page.getByRole('link', { name: '040 遊子吟' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '遊子吟' })).toBeVisible();
});

test('readable works navigate in base-edition order with catalogue return and endpoints', async ({ page }) => {
  await page.goto('/tang300/040-%E9%81%8A%E5%AD%90%E5%90%9F/');
  const navigation = page.getByRole('navigation', { name: '作品導覽' });
  await expect(navigation.getByRole('link', { name: /上一篇/ })).toHaveCount(0);
  await navigation.getByRole('link', { name: '下一篇：098 春望' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '春望' })).toBeVisible();
  await navigation.getByRole('link', { name: '上一篇：040 遊子吟' }).click();
  await navigation.getByRole('link', { name: '下一篇：098 春望' }).click();
  await navigation.getByRole('link', { name: '下一篇：226 靜夜思' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '靜夜思' })).toBeVisible();
  await expect(page.getByText('底本題名：夜思')).toBeVisible();
  await expect(navigation.getByRole('link', { name: /下一篇/ })).toHaveCount(0);
  await navigation.getByRole('link', { name: '回系列目錄' }).click();
  await expect(page.locator('[data-catalog-entry] a')).toHaveCount(3);
  const missing = await page.request.get('/tang300/099-%E6%9C%88%E5%A4%9C/');
  expect(missing.status()).toBe(404);
});

test('mobile catalogue keeps all entries readable and the available work links usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tang300/');
  await expect(page.locator('[data-catalog-entry]')).toHaveCount(313);
  await expect(page.locator('[data-catalog-entry="226"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: '226 靜夜思' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '靜夜思' })).toBeVisible();
});
