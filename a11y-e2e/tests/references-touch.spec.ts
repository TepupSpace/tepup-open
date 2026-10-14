import { expect, test } from '@playwright/test';
import { openAllBlocks, screenshot, setPrefs, urls } from './helpers';

// Library references on phones: one tap = preview with "Mở"; panels become a full-height
// sheet with a breadcrumb (docs/design-reference-library.md §6.1). Mobile projects only.
const DEMO = '/courses/demo-tham-chieu/bai-tham-chieu';
const lesson = urls.lessons.find((l) => l.url === DEMO);

test.describe('library references (touch)', () => {
  test.skip(!lesson, 'seed-reference-demo.ts has not been run on this database');

  test('tap → preview → Mở → sheet; nested → breadcrumb; back', async ({ page }, testInfo) => {
    await setPrefs(page, { theme: 'light' });
    await openAllBlocks(page, lesson!, 'lesson');

    await page.locator('a[data-tv="giam-sat-thong-tin"]').first().tap();
    const open = page.getByRole('button', { name: 'Mở', exact: true });
    const card = page.getByRole('dialog', { name: 'giám sát' }).filter({ has: open });
    await expect(card).toBeVisible();
    await expect(page).not.toHaveURL(/[?&]tv=/); // a tap only previews
    await card.getByRole('button', { name: 'Mở', exact: true }).tap();

    const sheet = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(sheet).toBeVisible();
    const box = (await sheet.boundingBox())!;
    const vw = page.viewportSize()!.width;
    // Full width on a phone. Playwright's Linux WebKit draws an 8px classic scrollbar a real iPhone doesn't have.
    expect(box.x).toBeLessThanOrEqual(1);
    expect(box.width).toBeGreaterThanOrEqual(vw - 10);
    await expect(page).toHaveURL(/[?&]tv=giam-sat-thong-tin/);

    await sheet.locator('a[data-tv="planet-money-palantir"]').tap();
    await page.getByRole('button', { name: 'Mở', exact: true }).tap();
    await expect(page.getByRole('navigation', { name: 'Các mục đang mở' })).toContainText(/giám sát/i);
    await screenshot(page, testInfo, `${DEMO} touch nested`, false);

    await page.getByRole('button', { name: 'Quay lại mục trước' }).tap();
    await expect(page.locator('[role="dialog"][aria-modal="true"]')).toContainText('Cùng tên');
    await page.getByRole('button', { name: 'Đóng', exact: true }).tap();
    await expect(page.locator('[role="dialog"][aria-modal="true"]')).toHaveCount(0);
  });
});
