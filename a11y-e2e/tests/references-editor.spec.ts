import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE, urls } from './helpers';

/** Select exactly one word in a rich-text paragraph, as a person drag-selecting would. */
async function selectWord(page: Page, word: string) {
  const para = page.locator('.bn-editor [data-content-type="paragraph"]').filter({ hasText: word }).first();
  await expect(para).toBeVisible();
  // A double-click can land on the neighbouring space, so set the range directly, then
  // release the mouse inside it so the formatting toolbar opens.
  await para.click();
  await page.evaluate((w) => {
    const root = [...document.querySelectorAll('.bn-editor [data-content-type="paragraph"]')].find((el) => el.textContent?.includes(w))!;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const i = n.textContent!.indexOf(w);
      if (i >= 0) {
        const range = document.createRange();
        range.setStart(n, i);
        range.setEnd(n, i + w.length);
        const sel = document.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
        break;
      }
    }
  }, word);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => document.getSelection()?.toString())).toBe(word);
}

// Admin: create a missing library entry from inside the lesson editor and insert the link
// in one step (components/admin/editor/QuickCreateEntry.tsx). Needs seed-reference-demo.ts.
const DEMO = '/courses/demo-tham-chieu/bai-tham-chieu';
const lesson = urls.lessons.find((l) => l.url === DEMO);

test.use({ storageState: ADMIN_STATE });

test.describe('lesson editor: create a reference inline (admin)', () => {
  test.skip(!lesson, 'seed-reference-demo.ts has not been run on this database');

  test('select text → Tham chiếu → Tạo mục mới → link inserted, entry exists', async ({ page }) => {
    const word = `Clavería`;
    const stamp = Date.now().toString(36);
    await page.goto(`/admin/lessons/${lesson!.id}/content`);

    await selectWord(page, word);
    await expect(page.getByRole('button', { name: 'Tham chiếu' })).toBeVisible();
    await page.getByRole('button', { name: 'Tham chiếu' }).click();

    // Search is prefilled with the selection; nothing matches yet, so create it.
    const search = page.getByLabel('Tìm mục thư viện');
    await expect(search).toHaveValue(/Claver/);
    await page.getByRole('button', { name: /Tạo mục mới/ }).click();

    const form = page.getByRole('group', { name: 'Tạo mục mới' });
    await expect(form.getByLabel('Loại')).toBeFocused();
    await form.getByLabel('Slug *').fill(`clavería-e2e-${stamp}`.normalize('NFD').replace(/[̀-ͯ]/g, ''));
    await form.getByLabel(/Xem nhanh/).fill('Toàn quyền Tây Ban Nha ở Philippines, phát danh mục họ năm 1849.');

    // One kind of entry (Mục từ); a related entry is optional and links the two both ways.
    await expect(form.getByLabel('Loại')).toHaveValue('CONCEPT');
    await form.getByLabel(/Liên quan tới/).fill('Khả năng');
    await form.getByRole('button', { name: /Khả năng đọc được/ }).click();
    await form.getByRole('button', { name: 'Tạo và chèn' }).click();

    // The word is now a /tv/ link in the editor, and the entry is live.
    const link = page.locator(`.bn-editor a[href="/tv/claveria-e2e-${stamp}"]`);
    await expect(link).toHaveText(word);
    const res = await page.request.get(`/api/tv/entry/claveria-e2e-${stamp}`);
    expect(res.ok()).toBe(true);
    const entry = (await res.json()).data;
    expect(entry.type).toBe('CONCEPT');
    expect(entry.related.map((r: { slug: string }) => r.slug)).toContain('kha-nang-doc-duoc');
    // …and the other side shows it too. (Library caches are stale-while-revalidate after a save,
    // so the first read may be one step behind.)
    await expect
      .poll(async () => (await (await page.request.get('/api/tv/entry/kha-nang-doc-duoc')).json()).data.related.map((r: { slug: string }) => r.slug))
      .toContain(`claveria-e2e-${stamp}`);
  });

  test('links are marked in the editor; no plain "Tạo liên kết" button or Ctrl+K', async ({ page }) => {
    await page.goto(`/admin/lessons/${lesson!.id}/content`);
    // Library links: purple, dotted underline — distinct from body text and from external links.
    const tv = page.locator('.bn-editor a[href^="/tv/"]').first();
    await expect(tv).toBeVisible();
    const style = await tv.evaluate((el) => {
      const cs = getComputedStyle(el);
      const p = getComputedStyle(el.closest('[data-content-type]')!);
      return { deco: cs.textDecorationLine, dotted: cs.textDecorationStyle, color: cs.color, bodyColor: p.color };
    });
    expect(style.deco).toContain('underline');
    expect(style.dotted).toBe('dotted');
    expect(style.color).not.toBe(style.bodyColor);

    await selectWord(page, 'Clavería');
    await expect(page.getByRole('button', { name: 'Tham chiếu' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo liên kết|Create link/i })).toHaveCount(0);
    // The built-in Ctrl+K link form went with the button.
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    await expect(page.getByPlaceholder(/URL|liên kết/i)).toHaveCount(0);
  });

  test('pasting a link that already has a source entry offers that entry instead of a new one', async ({ page }) => {
    await page.goto(`/admin/lessons/${lesson!.id}/content`);
    await selectWord(page, 'Clavería');
    await page.getByRole('button', { name: 'Tham chiếu' }).click();
    const search = page.getByLabel('Tìm mục thư viện');
    // Same NPR transcript as the seeded source, written differently (www, slash, tracking).
    await search.fill('http://www.npr.org/transcripts/nx-s1-5953112/?utm_source=facebook');
    await expect(page.getByText('Đã có nguồn cho link này')).toBeVisible();
    await expect(page.getByRole('button', { name: /Love in the time of Palantir/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo mục Nguồn từ link này/ })).toHaveCount(0);
    // The full editor's server check agrees.
    const res = await page.request.get('/api/admin/library-entries/check-source?url=' + encodeURIComponent('https://npr.org/transcripts/nx-s1-5953112#x'));
    expect((await res.json()).match?.slug).toBe('planet-money-palantir');
  });
});
