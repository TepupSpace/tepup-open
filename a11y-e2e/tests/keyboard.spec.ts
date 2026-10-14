import { test, type Page } from '@playwright/test';
import { record, screenshot, setPrefs, urls } from './helpers';

/** What has focus right now, and whether a keyboard user can see it and isn't hidden under sticky bars. */
async function describeFocus(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { onBody: true };
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const indicator =
      (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
    // Obscured (WCAG 2.4.11): the element's centre is covered by something else (sticky header/footer).
    const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
    const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
    const top = document.elementFromPoint(cx, cy);
    // Visually hidden controls (sr-only radios) show focus on their label instead: skip them.
    const hidden = r.width <= 1 || r.height <= 1;
    const obscured = !hidden && r.height > 0 && !!top && top !== el && !el.contains(top) && !top.contains(el) && !(el as HTMLInputElement).labels?.[0]?.contains(top);
    const labelText = (el as HTMLInputElement).labels?.[0]?.textContent;
    const name = (el.getAttribute('aria-label') ?? labelText ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
    return {
      onBody: false,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role'),
      name,
      indicator: !!indicator,
      obscured,
      inView: r.bottom > 0 && r.top < innerHeight,
    };
  });
}

/** Tab through the page and log every stop. */
async function tabWalk(page: Page, steps: number) {
  const stops = [];
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab');
    // html has scroll-behavior: smooth; measure after the focus scroll settles.
    await page.waitForTimeout(450);
    stops.push(await describeFocus(page));
  }
  return stops;
}

test('tab walk: course page', async ({ page }, testInfo) => {
  await page.goto(`/courses/${urls.courses[0]}`);
  await page.waitForLoadState('networkidle');
  record(testInfo, 'keyboard', 'tab-walk course', await tabWalk(page, 50));
});

test('tab walk: lesson (all blocks)', async ({ page }, testInfo) => {
  const lesson = urls.lessons.find((l) => l.types.includes('question')) ?? urls.lessons[0];
  await page.addInitScript((id) => {
    const now = new Date().toISOString();
    localStorage.setItem('tepup_progress_v2', JSON.stringify({ version: 1, progress: { [id]: { contentType: 'lesson', completed: true, score: 0, completedAt: now } }, lastUpdated: now }));
  }, lesson.id);
  await page.goto(lesson.url);
  await page.keyboard.press('Tab'); // the chooser focuses its first option on open
  record(testInfo, 'keyboard', 'tab-walk lesson chooser', await describeFocus(page));
  await page.getByRole('button', { name: /Đọc toàn bộ/ }).press('Enter');
  record(testInfo, 'keyboard', 'tab-walk lesson all-blocks', await tabWalk(page, 60));
});

/**
 * A whole lesson by keyboard only: Enter on the footer button, answer each question with
 * Tab + Space + "Kiểm tra", and log where focus lands after every step and what the
 * live regions say. Stops at an exercise that needs a specific interaction.
 */
for (const pick of ['question', 'interactive'] as const) {
  test(`keyboard-only lesson flow (${pick})`, async ({ page }, testInfo) => {
    await setPrefs(page, {});
    const lesson =
      pick === 'question'
        ? urls.lessons.find((l) => l.types.includes('question') && l.types.length <= 6) ?? urls.lessons[0]
        : urls.lessons.find((l) => l.types.some((t) => ['sort-bucket', 'pair-match', 'flip-card', 'perspective-switch'].includes(t))) ?? urls.lessons[0];
    await page.goto(lesson.url);
    await page.waitForLoadState('networkidle');
    const log: unknown[] = [{ lesson: lesson.url }];
    // The main action is the last footer button (at the end: "Về khoá học" | "Học bài tiếp").
    const footer = page.locator('footer button').last();

    for (let step = 0; step < 40; step++) {
      const label = (await footer.textContent())?.trim() ?? '';
      const ariaDisabled = await footer.getAttribute('aria-disabled');
      const live = await page.locator('[aria-live]').allTextContents();

      if (/^Hoàn thành$|Học bài tiếp|Đọc chương tiếp/.test(label) && !ariaDisabled) {
        log.push({ step, end: label });
        break;
      }
      if (/Chọn đáp án/.test(label)) {
        // Find the first unanswered option by tabbing, as a keyboard user would.
        let found = false;
        for (let t = 0; t < 40 && !found; t++) {
          await page.keyboard.press('Tab');
          const f = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement;
            return { pressed: el?.getAttribute('aria-pressed'), group: !!el?.closest('[role="group"]') };
          });
          if (f.pressed === 'false' && f.group) found = true;
        }
        if (!found) { log.push({ step, stuck: 'no option reachable by Tab' }); break; }
        await page.keyboard.press('Space');
        log.push({ step, action: 'picked option', focus: await describeFocus(page) });
        continue;
      }
      if (/Kiểm tra/.test(label)) {
        await footer.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
        log.push({ step, action: 'Kiểm tra', focus: await describeFocus(page), live: (await page.locator('[aria-live]').allTextContents()).filter(Boolean) });
        continue;
      }
      if (/Hoàn thành bài tập/.test(label)) {
        log.push({ step, stop: 'exercise needs its own interaction', focus: await describeFocus(page) });
        await screenshot(page, testInfo, `kb-flow ${pick} exercise`);
        break;
      }
      // "Tiếp tục"
      await footer.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(700);
      log.push({ step, action: label, focus: await describeFocus(page), live: live.filter(Boolean) });
    }
    record(testInfo, 'keyboard', `flow ${pick}`, log);
  });
}

test('reading settings panel by keyboard', async ({ page }, testInfo) => {
  const lesson = urls.lessons[0];
  await page.goto(lesson.url);
  await page.waitForLoadState('networkidle');
  const log: unknown[] = [];
  const aa = page.getByRole('button', { name: /Tuỳ chọn đọc/ }).first();
  await aa.focus();
  await page.keyboard.press('Enter');
  log.push({ opened: await page.getByRole('group', { name: 'Tuỳ chọn đọc' }).isVisible() });
  await page.keyboard.press('Tab');
  log.push({ firstStop: await describeFocus(page) });
  await page.keyboard.press('ArrowRight'); // radio group: next theme
  log.push({ theme: await page.evaluate(() => document.documentElement.dataset.readerTheme) });
  await screenshot(page, testInfo, 'settings panel open');
  await page.keyboard.press('Escape');
  log.push({ afterEscape: await describeFocus(page) });
  record(testInfo, 'keyboard', 'reader settings', log);
});

test('suggest-edit dialog by keyboard', async ({ page }, testInfo) => {
  await page.goto(urls.lessons[0].url);
  await page.waitForLoadState('networkidle');
  const log: unknown[] = [];
  const pencil = page.getByRole('button', { name: /Góp ý chỉnh sửa/ });
  await pencil.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  log.push({ initial: await describeFocus(page) });
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  log.push({ trappedAfter12Tabs: await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  log.push({ afterEscape: await describeFocus(page) });
  record(testInfo, 'keyboard', 'suggest dialog', log);
});

/**
 * Regression: opening "Góp ý" from the selection bar and pressing "Huỷ" must leave the
 * learner where they were reading (focus used to return to the page heading and jump to the top).
 */
test('suggest dialog from a selection keeps the reading position', async ({ page }, testInfo) => {
  const lesson = urls.lessons.find((l) => l.types.length > 3) ?? urls.lessons[0];
  await page.addInitScript((id) => {
    const now = new Date().toISOString();
    localStorage.setItem('tepup_progress_v2', JSON.stringify({ version: 1, progress: { [id]: { contentType: 'lesson', completed: true, score: 0, completedAt: now } }, lastUpdated: now }));
  }, lesson.id);
  await page.goto(lesson.url);
  await page.getByRole('button', { name: /Đọc toàn bộ/ }).click();
  await page.waitForLoadState('networkidle');
  // A paragraph well down the lesson, scrolled into the middle of the screen.
  // A plain text paragraph: text inside buttons (quiz options) can't be drag-selected.
  const para = page.locator('main p:not(button p):not(label p)').filter({ hasText: /.{80,}/ }).nth(4);
  // html has scroll-behavior: smooth, so scroll instantly and let it settle before measuring.
  await para.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => window.scrollY);
  // Select like a person does: drag across the text with the mouse (focus moves to the page).
  const box = (await para.boundingBox())!;
  // Along the first line: the vertical middle of a two-line paragraph is the gap between lines.
  await page.mouse.move(box.x + 4, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + Math.min(box.width - 4, 260), box.y + 10, { steps: 8 });
  await page.mouse.up();
  const bar = page.getByRole('toolbar', { name: 'Thao tác với đoạn đã chọn' });
  await bar.getByRole('button', { name: /^Góp ý$/ }).click();
  await page.getByRole('button', { name: 'Huỷ' }).click();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => window.scrollY);
  const focus = await describeFocus(page);
  record(testInfo, 'keyboard', 'suggest dialog keeps position', { before, after, moved: Math.abs(after - before), focus });
  await screenshot(page, testInfo, 'suggest cancel position');
});
