import { expect, test } from '@playwright/test';

const works = [
  { slug: '040-遊子吟', title: '遊子吟', author: '孟郊', lines: ['慈母手中線，', '遊子身上衣。', '臨行密密縫，', '意恐遲遲歸。', '誰言寸草心，', '報得三春暉？'] },
  { slug: '098-春望', title: '春望', author: '杜甫', lines: ['國破山河在，', '城春草木深。', '感時花濺淚，', '恨別鳥驚心。', '烽火連三月，', '家書抵萬金。', '白頭搔更短，', '渾欲不勝簪。'] },
  { slug: '226-靜夜思', title: '靜夜思', author: '李白', lines: ['床前明月光，', '疑是地上霜。', '舉頭望明月，', '低頭思故鄉。'] },
];

for (const work of works) {
  test(`${work.title} opens at its stable URL with complete original text`, async ({ page }) => {
    await page.goto(`/tang300/${work.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(work.title);
    await expect(page.getByText(`${work.author}・唐`)).toBeVisible();
    await expect(page.locator('[data-poem-line]')).toHaveText(work.lines);
    await expect(page.getByText('標點為本站編輯所加')).toBeVisible();
  });
}
