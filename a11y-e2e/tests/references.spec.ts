import { expect, test } from '@playwright/test';
import { openAllBlocks, record, runAxe, screenshot, setPrefs, urls } from './helpers';

// Library references (/tv/<slug>, docs/design-reference-library.md §6), desktop + keyboard.
// Needs the local demo: npx tsx scripts/seed-reference-demo.ts --env=<local env> --apply
const DEMO = '/courses/demo-tham-chieu/bai-tham-chieu';
const lesson = urls.lessons.find((l) => l.url === DEMO);

test.describe('library references (desktop)', () => {
  test.skip(!lesson, 'seed-reference-demo.ts has not been run on this database');

  test.beforeEach(async ({ page }) => {
    await setPrefs(page, { theme: 'light' });
    await openAllBlocks(page, lesson!, 'lesson');
  });

  test('hover shows a preview tied to the link', async ({ page }) => {
    const link = page.locator('a[data-tv="kha-nang-doc-duoc"]').first();
    await expect(link).toHaveAttribute('href', '/tv/kha-nang-doc-duoc');
    await expect(link).not.toHaveAttribute('target', '_blank');
    await link.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toContainText('Khả năng đọc được');
    await expect(tip).toContainText('Mục từ');
    const describedBy = await link.getAttribute('aria-describedby');
    expect(describedBy).toBe(await tip.getAttribute('id'));
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
  });

  test('click opens a panel; nested link stacks a narrower one; Esc closes one layer at a time', async ({ page }) => {
    const opener = page.locator('a[data-tv="giam-sat-thong-tin"]').first(); // markdown, inside a callout
    await opener.click();
    const first = page.getByRole('dialog', { name: 'giám sát' });
    await expect(first).toBeVisible();
    await expect(page).toHaveURL(/[?&]tv=giam-sat-thong-tin/);
    await expect(first.getByRole('heading', { name: 'giám sát' })).toBeFocused();
    // A network, not a hierarchy: related entries, backlinks from other entries' text, same-name entries.
    await expect(first.getByRole('heading', { name: 'Liên quan' })).toBeVisible();
    await expect(first.getByRole('heading', { name: 'Được nhắc đến trong' })).toBeVisible();
    await expect(first.locator('a[data-tv="kha-nang-doc-duoc"]')).toBeVisible();
    await expect(first.getByRole('heading', { name: 'Cùng tên' })).toBeVisible();
    await expect(first.locator('a[data-tv="giam-sat-dich-te"]')).toBeVisible();
    await expect(first).toContainText('Xuất hiện trong');

    await first.locator('a[data-tv="planet-money-palantir"]').click();
    const second = page.getByRole('dialog', { name: 'Love in the time of Palantir' });
    await expect(second).toBeVisible();
    await expect(page).toHaveURL(/tv=giam-sat-thong-tin%2Cplanet-money-palantir|tv=giam-sat-thong-tin,planet-money-palantir/);
    const w1 = (await first.boundingBox())!.width;
    const w2 = (await second.boundingBox())!.width;
    expect(w2).toBeLessThan(w1);
    await expect(second).toContainText('Podcast');
    await expect(second.getByRole('heading', { name: 'Được trích trong' })).toBeVisible();
    await expect(second.getByRole('link', { name: /Mở nguồn/ })).toHaveAttribute('target', '_blank');

    // If the mouse rests on a link in the new panel, a preview appears and the first Esc
    // (correctly) closes that preview first. Move the mouse aside to test panel closing only.
    await page.mouse.move(5, 5);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(second).toBeHidden();
    await expect(first).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(first).toBeHidden();
    await expect(page).not.toHaveURL(/[?&]tv=/);
    await expect(opener).toBeFocused();
  });

  test('keyboard: focus shows the preview, Enter opens the panel', async ({ page }) => {
    const link = page.locator('a[data-tv="osint"]').first();
    await link.focus();
    await expect(page.getByRole('tooltip')).toContainText('Open-Source Intelligence');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'OSINT' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'OSINT' })).toContainText('điều tra nguồn mở');
  });

  test('section anchors, overdue tools, missing entries and external links', async ({ page }) => {
    await page.locator('a[data-tv="cong-cu-mat-khau"]').first().click();
    const tool = page.getByRole('dialog', { name: 'Trình quản lý mật khẩu' });
    await expect(tool).toContainText('quá hạn rà soát');
    await expect(tool).toContainText('Cơ bản');
    await page.keyboard.press('Escape');
    await expect(tool).toBeHidden();
    // Closing returns focus to the link but must not pop its preview over what the mouse does next.
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await page.locator('a[data-tv="khong-ton-tai"]').hover();
    await expect(page.getByRole('tooltip')).toContainText('không còn trong thư viện');

    const external = page.locator('a[href="https://example.com"]');
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).not.toHaveAttribute('data-tv');
  });

  test('a shared URL reopens the same panels', async ({ page }) => {
    // Panels open over whatever screen the lesson starts on; clicking outside them closes them (by design).
    await page.goto(`${DEMO}?tv=kha-nang-doc-duoc,scott-seeing-like-a-state`);
    await expect(page.getByRole('dialog', { name: 'Khả năng đọc được (legibility)' })).toBeAttached();
    await expect(page.getByRole('dialog', { name: 'Seeing Like a State' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Seeing Like a State' })).toContainText('Yale University Press');
  });

  test('accessibility with a panel open (light and dark)', async ({ page }, testInfo) => {
    await page.locator('a[data-tv="giam-sat-thong-tin"]').first().click();
    await expect(page.getByRole('dialog', { name: 'giám sát' })).toBeVisible();
    await runAxe(page, testInfo, `${DEMO} panel light`);
    await screenshot(page, testInfo, `${DEMO} panel light`, false);
    record(testInfo, 'references', 'panel-open', { ok: true });
  });
});

test.describe('library references (dark)', () => {
  test.skip(!lesson, 'seed-reference-demo.ts has not been run on this database');
  test('panel in dark mode', async ({ page }, testInfo) => {
    await setPrefs(page, { theme: 'dark' });
    await openAllBlocks(page, lesson!, 'lesson');
    await page.locator('a[data-tv="scott-seeing-like-a-state"]').first().click();
    await expect(page.getByRole('dialog', { name: 'Seeing Like a State' })).toBeVisible();
    await runAxe(page, testInfo, `${DEMO} panel dark`);
    await screenshot(page, testInfo, `${DEMO} panel dark`, false);
  });
});

test.describe('entry page and saved list', () => {
  test('entry page, save toggles and survives reload', async ({ page }, testInfo) => {
    const res = await page.goto('/tv/kha-nang-doc-duoc');
    expect(res?.url()).toMatch(/\/thu-vien\/muc\/kha-nang-doc-duoc$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Khả năng đọc được (legibility)' })).toBeVisible();
    const save = page.getByRole('button', { name: 'Lưu' });
    await expect(save).toHaveAttribute('aria-pressed', 'false');
    await save.click();
    await expect(page.getByRole('button', { name: 'Đã lưu' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Đã lưu' })).toHaveAttribute('aria-pressed', 'true');
    await runAxe(page, testInfo, '/thu-vien/muc/kha-nang-doc-duoc');
  });
});
