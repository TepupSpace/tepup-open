import { expect, test } from '@playwright/test';
import { openAllBlocks, screenshot, setPrefs, urls } from './helpers';

// Phone layouts: the scroll buttons sit above the bottom tab bar and above the lesson
// player's sticky footer (components/ui/ScrollJumpButtons.tsx, `above-bottom-chrome`).

test('scroll buttons stay clear of the bottom tab bar', async ({ page }) => {
  await setPrefs(page, { theme: 'light' });
  await page.goto('/thu-vien');
  const down = page.getByRole('button', { name: 'Xuống cuối trang' });
  // The buttons appear after the first measurement.
  await down.waitFor({ timeout: 3000 }).catch(() => {});
  test.skip(!(await down.count()), 'the library page is too short on this database');
  const b = (await down.boundingBox())!;
  const bar = (await page.getByRole('navigation', { name: 'Điều hướng dưới cùng' }).boundingBox())!;
  expect(b.y + b.height).toBeLessThanOrEqual(bar.y);
  await down.tap();
  await expect(page.getByRole('button', { name: 'Lên đầu trang' })).toBeVisible();
});

test('scroll buttons stay clear of the lesson footer', async ({ page }, testInfo) => {
  await setPrefs(page, { theme: 'light' });
  const lesson = urls.lessons.find((l) => l.types.length > 3) ?? urls.lessons[0];
  await openAllBlocks(page, lesson, 'lesson');
  const down = page.getByRole('button', { name: 'Xuống cuối trang' });
  await expect(down).toBeVisible();
  const b = (await down.boundingBox())!;
  const footer = await page.locator('footer').last().boundingBox();
  if (footer) expect(b.y + b.height).toBeLessThanOrEqual(footer.y + 1);
  await screenshot(page, testInfo, 'scroll jump lesson phone', false);
});
