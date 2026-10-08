import { test } from '@playwright/test';
import { openAllBlocks, record, screenshot, setPrefs, urls } from './helpers';

// The reading settings themselves: each combination on a course page and a full lesson,
// with screenshots for a human look, and checks that pages without .reader are untouched.
const lesson = urls.lessons.find((l) => l.types.includes('question') && l.types.includes('image')) ?? urls.lessons[0];
const interactive = urls.lessons.find((l) => l.types.some((t) => ['budget-allocator', 'sort-bucket', 'calculator'].includes(t))) ?? urls.lessons[1];

const COMBOS = [
  { name: 'default', prefs: {} },
  { name: 'dark', prefs: { theme: 'dark' as const } },
  { name: 'readable-font', prefs: { font: 'readable' as const } },
  { name: 'size-150', prefs: { size: 5 } },
  { name: 'dark-readable-150', prefs: { theme: 'dark' as const, font: 'readable' as const, size: 5 } },
];

for (const combo of COMBOS) {
  test(`reading settings: ${combo.name}`, async ({ page }, testInfo) => {
    await setPrefs(page, combo.prefs);
    await page.goto(`/courses/${urls.courses[0]}`);
    await page.waitForLoadState('networkidle');
    const course = await page.evaluate(() => ({
      htmlFontSize: getComputedStyle(document.documentElement).fontSize,
      bodyFont: getComputedStyle(document.body).fontFamily.split(',')[0],
      bodyBg: getComputedStyle(document.body).backgroundColor,
      attrs: { ...document.documentElement.dataset },
    }));
    await screenshot(page, testInfo, `course ${combo.name}`);
    await openAllBlocks(page, lesson, 'lesson');
    await screenshot(page, testInfo, `lesson ${combo.name}`, true);
    await openAllBlocks(page, interactive, 'lesson');
    await screenshot(page, testInfo, `interactive ${combo.name}`, true);
    // Pages without .reader must not change.
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    const hub = await page.evaluate(() => ({
      htmlFontSize: getComputedStyle(document.documentElement).fontSize,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    }));
    await screenshot(page, testInfo, `hub ${combo.name}`);
    record(testInfo, 'reader', combo.name, { course, hub });
  });
}

test('reading settings: reduced motion and no flash', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  // "Theo máy" (system) + OS dark: the theme must already be dark at first paint.
  const firstPaintTheme: string[] = [];
  page.on('domcontentloaded', async () => {
    firstPaintTheme.push(await page.evaluate(() => document.documentElement.dataset.readerTheme ?? 'none'));
  });
  await page.goto(lesson.url);
  await page.waitForLoadState('networkidle');
  record(testInfo, 'reader', 'system-dark-first-paint', { firstPaintTheme });
  await context.close();
});
