import { test } from '@playwright/test';
import { ADMIN_STATE, ariaSnapshot, reflowOverflow, record, runAxe, screenshot, setPrefs, urls } from './helpers';

// Every page type a visitor can reach, in light and dark reading themes. The dark theme only
// applies on learner pages (.reader); on the others it must change nothing.
const PUBLIC = [
  '/',
  '/courses',
  '/library',
  '/login',
  '/register',
  '/register-contributor',
  '/feature-request',
  '/contributor-guide',
  '/contributor-guide/block-demo',
  '/khong-ton-tai-404',
  ...urls.courses.map((c) => `/courses/${c}`),
  ...urls.characters.map((c) => `/story/${c}`),
  ...urls.stories,
];

const CONTRIBUTOR = ['/contributor', '/contributor/drafts', '/contributor/submissions', '/contributor/reviews', '/contributor/courses/new', '/contributor/settings', '/contributor/ai-guide'];

const a = urls.admin;
const ADMIN = [
  '/admin', '/admin/categories', '/admin/categories/new', '/admin/characters', '/admin/characters/new',
  '/admin/courses', '/admin/courses/new', '/admin/custom-blocks', '/admin/custom-blocks/new',
  '/admin/feature-requests', '/admin/library', '/admin/reviews', '/admin/settings', '/admin/stories',
  '/admin/stories/new', '/admin/users',
  a.category && `/admin/categories/${a.category}`,
  a.character && `/admin/characters/${a.character}`,
  a.course && `/admin/courses/${a.course}`,
  a.course && `/admin/courses/${a.course}/levels`,
  a.story && `/admin/stories/${a.story}`,
  a.story && `/admin/stories/${a.story}/parts`,
  a.library && `/admin/library/${a.library}`,
  a.lesson && `/admin/lessons/${a.lesson}/content`,
  a.chapter && `/admin/chapters/${a.chapter}/content`,
].filter((u): u is string => !!u);

for (const theme of ['light', 'dark'] as const) {
  test.describe(`pages (${theme})`, () => {
    for (const url of PUBLIC) {
      test(`${url} ${theme}`, async ({ page }, testInfo) => {
        await setPrefs(page, { theme });
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await runAxe(page, testInfo, `${url} ${theme}`);
        if (theme === 'light') await ariaSnapshot(page, testInfo, url);
        await screenshot(page, testInfo, `${url} ${theme}`);
      });
    }
  });
}

// Signed-in areas: same reading settings as the learner pages (dark mode included).
for (const theme of ['light', 'dark'] as const) {
  test.describe(`contributor and admin pages (signed in, ${theme})`, () => {
    test.use({ storageState: ADMIN_STATE });
    for (const url of [...CONTRIBUTOR, ...ADMIN]) {
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

// 320 CSS px ≈ a 1280 px window at 400% zoom (WCAG 1.4.10), plus the largest reading size.
test.describe('reflow at 320px, text 150%', () => {
  test.use({ viewport: { width: 320, height: 640 } });
  for (const url of PUBLIC) {
    test(url, async ({ page }, testInfo) => {
      await setPrefs(page, { size: 5, font: 'readable' });
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const result = await reflowOverflow(page);
      record(testInfo, 'reflow', url, result);
      if (result.overflow > 1) await screenshot(page, testInfo, `reflow ${url}`, true);
    });
  }
});
