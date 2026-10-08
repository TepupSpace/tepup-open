import { test, type Page } from '@playwright/test';
import { markCompleted, record, screenshot, urls } from './helpers';

/** Controls smaller than 24×24 CSS px (WCAG 2.5.8), excluding links inside running text. */
async function smallTargets(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const sel = 'a[href], button, input, select, textarea, [role="button"], [role="tab"], [role="radio"], [tabindex]:not([tabindex="-1"])';
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || el.closest('[aria-hidden="true"]')) continue;
      if (el.tagName === 'A' && el.closest('p, li') && cs.display === 'inline') continue; // inline-text exception
      if (el.classList.contains('sr-only')) continue;
      if (r.width < 24 || r.height < 24) {
        const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40);
        out.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
    }
    return out;
  });
}

test('touch targets: course, story, lesson', async ({ page }, testInfo) => {
  const lesson = urls.lessons.find((l) => l.types.includes('question')) ?? urls.lessons[0];
  await markCompleted(page, [{ id: lesson.id, type: 'lesson' }]);
  const result: Record<string, string[]> = {};
  for (const url of [`/courses/${urls.courses[0]}`, urls.stories[0], '/courses', '/']) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    result[url] = await smallTargets(page);
  }
  await page.goto(lesson.url);
  await page.getByRole('button', { name: /Đọc toàn bộ/ }).tap();
  await page.waitForLoadState('networkidle');
  result[`${lesson.url} (all blocks)`] = await smallTargets(page);
  record(testInfo, 'touch', 'targets', result);
});

/**
 * Text selection on a phone: a touch, then a selection that settles. The "Hỏi AI / Kiểm
 * chứng / Góp ý sửa" bar must appear near the bottom, clear of the OS menu above the text.
 * (Emulation: a real long-press and the OS menu itself can't be reproduced here.)
 */
test('text selection toolbar on touch', async ({ page }, testInfo) => {
  const lesson = urls.lessons[0];
  await markCompleted(page, [{ id: lesson.id, type: 'lesson' }]);
  await page.goto(lesson.url);
  await page.getByRole('button', { name: /Đọc toàn bộ/ }).tap();
  const para = page.locator('main p').filter({ hasText: /\S{4,}/ }).first();
  await para.tap();
  await para.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
  });
  await page.waitForTimeout(900);
  const bar = page.getByRole('toolbar', { name: 'Thao tác với đoạn đã chọn' });
  const visible = await bar.isVisible();
  const box = visible ? await bar.boundingBox() : null;
  const viewport = page.viewportSize();
  record(testInfo, 'touch', 'selection toolbar', {
    visible,
    box,
    nearBottom: box && viewport ? box.y > viewport.height / 2 : null,
    buttons: visible ? await bar.getByRole('button').allTextContents() : [],
  });
  await screenshot(page, testInfo, 'selection toolbar');
});
