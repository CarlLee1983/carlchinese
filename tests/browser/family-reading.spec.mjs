import { expect, test } from '@playwright/test';
import { loadReadingContent } from '../../src/content/reading-content.mjs';

const { works } = await loadReadingContent();
const viewports = { desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } };
const inclusiveLines = {
  遊子吟: ['你可以想像一個角色，也可以跳過。', '可以想像一個照顧者和一個角色。'],
  春望: ['可以自己想，也可以跳過。', '你可以想像一個人，也可以跳過。'],
  靜夜思: ['沒關係。可以想像一個人，也可以跳過。', '可以寫想像的人，也可以跳過。'],
};

for (const work of works) for (const [device, viewport] of Object.entries(viewports)) {
  test(`${work.frontmatter.title} offers the complete family reading script on ${device}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/tang300/${work.slug}/`);
    const family = page.getByRole('region', { name: '親子共學' });
    const expected = work.sections.find((section) => section.title === '親子共學');
    await expect(family.getByRole('heading', { level: 3 })).toHaveText(['開場', '共讀', '提問', '表達活動']);

    for (const title of ['開場', '共讀']) {
      const subsection = family.getByRole('region', { name: title });
      const authored = expected.subsections.find((item) => item.title === title).paragraphs.flatMap((directive) => directive.paragraphs.map((text) => ({ text, directive })));
      const paragraphs = subsection.locator('[data-analysis-paragraph]');
      await expect(paragraphs).toHaveCount(authored.length);
      for (const [index, { text, directive }] of authored.entries()) {
        const paragraph = paragraphs.nth(index);
        const label = directive.kind === '文學解讀' ? `文學解讀・${directive.stance}` : directive.kind;
        await expect(paragraph.locator('[data-layer-label]')).toHaveText(label);
        await expect(paragraph.locator('[data-analysis-text]')).toHaveText(text);
        await expect(paragraph.locator('[data-source]')).toHaveCount(directive.refs.length);
        for (const [sourceIndex, id] of directive.refs.entries()) {
          const source = paragraph.locator('[data-source]').nth(sourceIndex);
          const record = work.frontmatter.sources[id];
          await expect(source).toContainText(record.source);
          await expect(source).toContainText(record.locator);
          await expect(source).toContainText(`出處時代：${record.era}`);
          await expect(source).toContainText(`查證程度：${record.checked}`);
        }
        const box = await paragraph.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
    }

    const questions = family.getByRole('region', { name: '提問' });
    const authoredQuestions = expected.subsections.find((item) => item.title === '提問').questions;
    await expect(questions.locator('[data-layer-label]')).toHaveText('教學想像');
    await expect(questions.locator('[data-question]')).toHaveCount(authoredQuestions.length);
    await expect(questions.locator('[data-question-level]')).toHaveText(authoredQuestions.map((item) => item.level));
    for (const [index, question] of authoredQuestions.entries()) {
      const rendered = questions.locator('[data-question]').nth(index);
      await expect(rendered.locator('[data-question-text]')).toHaveText(question.question);
      const replies = rendered.locator('[data-answer]');
      await expect(replies).toHaveCount(question.likely_answers.length);
      for (const [replyIndex, reply] of question.likely_answers.entries()) {
        await expect(replies.nth(replyIndex).locator('[data-follow-up-label]')).toHaveText('家長怎麼接：');
        await expect(replies.nth(replyIndex).locator('[data-answer-text]')).toHaveText(reply.answer);
        await expect(replies.nth(replyIndex).locator('[data-follow-up]')).toHaveText(reply.follow_up);
      }
    }

    const activity = family.getByRole('region', { name: '表達活動' });
    const authoredActivity = expected.subsections.find((item) => item.title === '表達活動').paragraphs;
    await expect(activity.locator('[data-layer-label]')).toHaveText('教學想像');
    await expect(activity.locator('[data-activity-paragraph]')).toHaveText(authoredActivity.map((item) => item.text));
    for (const line of inclusiveLines[work.frontmatter.title]) await expect(family).toContainText(line);
    await expect(family).not.toContainText('likely_answers:');

    expect(await page.locator('main > section[id]').evaluateAll((items) => items.map((item) => item.id))).toEqual(['original', 'analysis', 'family']);
    const links = page.getByRole('navigation', { name: '頁內導覽' }).getByRole('link');
    await expect(links).toHaveText(['原文', '深入賞析', '親子共學']);
    for (const [index, id] of ['original', 'analysis', 'family'].entries()) {
      await links.nth(index).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const target = page.locator(`#${id}`);
      await expect(target.locator('h2').first()).toBeInViewport();
    }
  });
}
