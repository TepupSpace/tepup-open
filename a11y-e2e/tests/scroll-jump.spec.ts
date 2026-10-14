import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE, openAllBlocks, screenshot, setPrefs, urls } from './helpers';

// "Lên đầu trang" / "Xuống cuối trang" (components/ui/ScrollJumpButtons.tsx): only the useful
// button shows, it works for the document and for the lesson player's own scroller, it stays
// clear of the phone's bottom bars, and it is absent from admin pages.

const scrolled = (page: Page) =>
  page.evaluate(() => {
    const main = document.getElementById('main-content');
    const el = main && main.scrollHeight > main.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(main).overflowY) ? main : document.scrollingElement!;
    return { top: el.scrollTop, rest: el.scrollHeight - el.clientHeight - el.scrollTop };
  });

async function checkJumps(page: Page) {
  const up = page.getByRole('button', { name: 'Lên đầu trang' });
  const down = page.getByRole('button', { name: 'Xuống cuối trang' });
  await expect(down).toBeVisible();
  await expect(up).toHaveCount(0);
  await down.click();
  await expect.poll(async () => (await scrolled(page)).rest).toBeLessThan(5);
  await expect(up).toBeVisible();
  await expect(down).toHaveCount(0);
  await up.click();
  await expect.poll(async () => (await scrolled(page)).top).toBeLessThan(5);
  await expect(up).toHaveCount(0);
}

test.describe('scroll jump buttons', () => {
  test.beforeEach(async ({ page }) => {
    await setPrefs(page, { theme: 'light' });
  });

  test('a long library page', async ({ page }) => {
    await page.goto('/thu-vien');
    test.skip((await scrolled(page)).rest < 600, 'the library page is too short on this database');
    await checkJumps(page);
  });

  test('a lesson read in full', async ({ page }, testInfo) => {
    const lesson = urls.lessons.find((l) => l.types.length > 3) ?? urls.lessons[0];
    await openAllBlocks(page, lesson, 'lesson');
    await checkJumps(page);
    await page.getByRole('button', { name: 'Xuống cuối trang' }).waitFor();
    await screenshot(page, testInfo, 'scroll jump lesson', false);
  });
});

test.describe('not on admin pages', () => {
  test.use({ storageState: ADMIN_STATE });
  test('admin library list', async ({ page }) => {
    await page.goto('/admin/library-entries');
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(300);
    await expect(page.getByRole('button', { name: /Lên đầu trang|Xuống cuối trang/ })).toHaveCount(0);
  });
});
