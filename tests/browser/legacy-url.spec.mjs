import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('the former 春望 URL reaches the corrected base-edition URL without JavaScript', async ({ page, request }) => {
  const response = await request.get('/tang300/099-春望/');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/tang300/098-春望/"');
  await page.goto('/tang300/099-春望/');
  await expect.poll(() => decodeURI(page.url())).toMatch(/\/tang300\/098-春望\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('春望');
  await expect(page.getByText('國破山河在，', { exact: true })).toBeVisible();
});
