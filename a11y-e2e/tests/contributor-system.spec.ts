import { test } from '@playwright/test';
import { ADMIN_STATE, runAxe, screenshot, setPrefs, urls } from './helpers';

// Pages of the contributor system (docs/proposal-contributor-edits-and-maintainers.md), as an
// admin (who may open every contributor page too), in light and dark reading themes.
// Record ids come from collect-urls.sql; pages whose record is missing are skipped.
const c = urls.contrib ?? {};
const PAGES = [
  '/contributor/notifications',
  '/contributor/courses',
  '/contributor/review-requests',
  '/contributor/recent-changes',
  '/contributor/suggestions',
  '/contributor/flags',
  c.lesson && `/contributor/lessons/${c.lesson}`,
  c.chapter && `/contributor/chapters/${c.chapter}`,
  c.library && `/contributor/library/${c.library}`,
  c.course && `/contributor/maintain/${c.course}`,
  c.lesson && `/contributor/history/LESSON/${c.lesson}`,
  c.course && `/contributor/history/COURSE_OUTLINE/${c.course}`,
  c.lessonEdit && `/contributor/reviews/${c.lessonEdit}`,
  c.chapterEdit && `/contributor/reviews/${c.chapterEdit}`,
  c.entryEdit && `/contributor/reviews/${c.entryEdit}`,
  c.outlineEdit && `/contributor/reviews/${c.outlineEdit}`,
  c.reviewRequest && `/contributor/review-requests/${c.reviewRequest}`,
  '/admin/notifications',
  '/admin/review-requests',
  '/admin/recent-changes',
  '/admin/audit-log',
  c.course && `/admin/courses/${c.course}/members`,
  c.course && `/admin/courses/${c.course}/deleted`,
  c.lesson && `/admin/history/LESSON/${c.lesson}`,
  c.reviewRequest && `/admin/review-requests/${c.reviewRequest}`,
  c.lessonEdit && `/admin/reviews/${c.lessonEdit}`,
].filter((u): u is string => !!u);

for (const theme of ['light', 'dark'] as const) {
  test.describe(`contributor system pages (${theme})`, () => {
    test.use({ storageState: ADMIN_STATE });
    for (const url of PAGES) {
      test(`${url} ${theme}`, async ({ page }, testInfo) => {
        await setPrefs(page, { theme });
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await runAxe(page, testInfo, `${url} ${theme}`);
        await screenshot(page, testInfo, `${url} ${theme}`);
      });
    }
  });
}
