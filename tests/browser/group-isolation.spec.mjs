import { expect, test } from '@playwright/test';

test('production output contains only the three authored works and their navigation', async ({ page }) => {
  await page.goto('/tang300/');
  await expect(page.locator('[data-catalog-entry]')).toHaveCount(313);
  await expect(page.locator('[data-catalog-entry] a')).toHaveCount(3);
  await expect(page.getByText('目前3篇已有完整閱讀內容')).toBeVisible();
  await expect(page.locator('[data-catalog-entry="198"] a, [data-catalog-entry="199"] a, [data-catalog-entry="200"] a')).toHaveCount(0);
  await expect(page.getByText('測試用虛構文本')).toHaveCount(0);

  for (const slug of ['198-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%B8%80', '199-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%BA%8C', '200-%E9%81%A3%E6%82%B2%E6%87%B7-%E5%85%B6%E4%B8%89']) {
    expect((await page.request.get(`/tang300/${slug}/`)).status()).toBe(404);
  }

  await page.goto('/tang300/040-%E9%81%8A%E5%AD%90%E5%90%9F/');
  const navigation = page.getByRole('navigation', { name: '作品導覽' });
  await expect(navigation.getByRole('link', { name: /上一篇/ })).toHaveCount(0);
  await expect(navigation.getByRole('link', { name: '下一篇：098 春望' })).toBeVisible();
  await navigation.getByRole('link', { name: '下一篇：098 春望' }).click();
  await expect(navigation.getByRole('link', { name: '上一篇：040 遊子吟' })).toBeVisible();
  await navigation.getByRole('link', { name: '下一篇：226 靜夜思' }).click();
  await expect(navigation.getByRole('link', { name: /下一篇/ })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('測試用虛構文本');
  await expect(page.locator('a[href^="/tang300/198-"], a[href^="/tang300/199-"], a[href^="/tang300/200-"]')).toHaveCount(0);
});
