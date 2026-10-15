import { expect, test } from '@playwright/test';

const first = '/tang300/198-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%B8%80/';
const second = '/tang300/199-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%BA%8C/';
const missing = '/tang300/200-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%B8%89/';

for (const [device, viewport] of Object.entries({ desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } })) {
test(`group catalogue and pages expose two readable members while keeping the total at three on ${device}`, async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.goto('/tang300/');
  await expect(page.locator('[data-catalog-entry]')).toHaveCount(313);
  await expect(page.locator('[data-catalog-entry] a')).toHaveCount(2);
  await expect(page.getByText('目前2篇已有完整閱讀內容')).toBeVisible();
  await expect(page.locator('[data-catalog-entry="198"] a')).toHaveAttribute('href', decodeURI(first));
  await expect(page.locator('[data-catalog-entry="199"] a')).toHaveAttribute('href', decodeURI(second));
  await expect(page.locator('[data-catalog-entry="200"] a')).toHaveCount(0);

  await page.goto(first);
  await expect(page.locator('[data-poem-illustration]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: '遣悲懷・其一' })).toBeVisible();
  await expect(page.getByText('底本題名：遣悲懷三首')).toBeVisible();
  const group = page.getByRole('navigation', { name: '組詩導覽' });
  await expect(group).toContainText('遣悲懷・共3首');
  await expect(group.getByText('其一（本篇）')).toBeVisible();
  await expect(group.getByText('其三（尚未有內容）')).toBeVisible();
  await expect(group.getByRole('link')).toHaveCount(1);
  await group.getByRole('link', { name: '其二' }).click();

  await expect(page).toHaveURL(second);
  await expect(page.getByRole('heading', { level: 1, name: '遣悲懷・其二' })).toBeVisible();
  await expect(group).toContainText('遣悲懷・共3首');
  await expect(group.getByText('其二（本篇）')).toBeVisible();
  await expect(group.getByText('其三（尚未有內容）')).toBeVisible();
  await expect(group.getByRole('link')).toHaveCount(1);
  await group.getByRole('link', { name: '其一' }).click();
  await expect(page).toHaveURL(first);
  expect((await page.request.get(missing)).status()).toBe(404);
});
}
