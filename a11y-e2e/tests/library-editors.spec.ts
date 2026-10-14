import { expect, test } from '@playwright/test';
import { ADMIN_STATE, urls } from './helpers';

// Admin editing of the library: the entry editor has the lesson editor's draft → publish flow
// with the save bar pinned on top, and the "Bài đọc" block picks a library entry.
test.use({ storageState: ADMIN_STATE });

test.describe('library entry editor: drafts and publishing', () => {
  test('autosaved draft stays private until "Xuất bản"; "Bỏ nháp" restores the live entry', async ({ page }) => {
    const res = await page.request.get('/api/tv/entry/kha-nang-doc-duoc');
    test.skip(!res.ok(), 'seed-reference-demo.ts has not been run on this database');
    const entry = (await res.json()).data as { id: string; summary: string };
    const live = () => page.request.get('/api/tv/entry/kha-nang-doc-duoc').then(async (r) => (await r.json()).data.summary as string);
    const original = entry.summary;
    const stamp = Date.now().toString(36);

    await page.goto(`/admin/library-entries/${entry.id}`);
    const bar = page.getByRole('button', { name: 'Xuất bản' });
    await expect(bar).toBeVisible();
    const summary = page.getByLabel(/^Xem nhanh/);
    await expect(summary).toHaveValue(original);

    // Autosave: a draft only admins see.
    await summary.fill(`${original} (nháp ${stamp})`);
    await expect(page.getByText(/Đã lưu nháp/)).toBeVisible({ timeout: 15_000 });
    expect(await live()).toBe(original);

    // The bar stays on top while scrolling the long form.
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(300);
    const top = (await bar.boundingBox())!.y;
    expect(top).toBeLessThan(150);

    // Reopening resumes the draft; "Bỏ nháp" goes back to the live entry.
    await page.reload();
    await expect(summary).toHaveValue(`${original} (nháp ${stamp})`);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Bỏ nháp' }).click();
    await expect(summary).toHaveValue(original);

    // Publish makes it live; then put the original text back the same way.
    await summary.fill(`${original} (${stamp})`);
    await bar.click();
    await expect(page.getByRole('status').filter({ hasText: 'Đã xuất bản' })).toBeVisible();
    await expect.poll(live).toBe(`${original} (${stamp})`);
    await summary.fill(original);
    await bar.click();
    await expect.poll(live).toBe(original);
  });

  test('a new entry: "Lưu nháp" creates it hidden', async ({ page }) => {
    const stamp = Date.now().toString(36);
    await page.goto('/admin/library-entries/new');
    await page.getByLabel(/^Tiêu đề/).fill(`Mục thử nháp ${stamp}`);
    await page.getByLabel(/^Xem nhanh/).fill('Một mục tạo bằng Lưu nháp, chưa hiển thị cho người học.');
    await page.getByRole('button', { name: 'Lưu nháp' }).click();
    await expect(page).toHaveURL(/\/admin\/library-entries\/(?!new)[^/]+$/);
    await expect(page.getByLabel('Hiển thị công khai')).not.toBeChecked();
    const res = await page.request.get(`/api/tv/entry/muc-thu-nhap-${stamp}`);
    expect(res.status()).toBe(404); // hidden from learners
  });
});

test.describe('"Bài đọc" block', () => {
  // A lesson whose "Bài đọc" block points at a library entry (old blocks with their own
  // content keep the old editor, unchanged).
  const lesson = urls.lessons.find((l) => l.url === '/courses/logic-101/confirmation-bias');
  test.skip(!lesson, 'logic-101/confirmation-bias is not on this database');

  test('shows the linked entry and picks another with the library search', async ({ page }) => {
    await page.goto(`/admin/lessons/${lesson!.id}/content`);
    const edit = page.getByRole('button', { name: /^Sửa block Tài liệu/ }).first();
    await edit.focus();
    await edit.click();
    const drawer = page.getByRole('dialog').last();
    // No old "Tạo nội dung mới" form: the block points at a library entry.
    await expect(drawer.getByText('Tạo nội dung mới')).toHaveCount(0);
    await expect(drawer.getByRole('button', { name: 'Chọn mục khác' })).toBeVisible();
    await drawer.getByRole('button', { name: 'Chọn mục khác' }).click();
    const search = drawer.getByLabel('Tìm mục thư viện');
    await expect(search).toBeFocused();
    await search.fill('http://www.npr.org/transcripts/nx-s1-5953112/');
    await expect(drawer.getByText('Đã có nguồn cho link này')).toBeVisible();
    await drawer.getByRole('button', { name: 'Huỷ, giữ mục đang chọn' }).click();
    await expect(drawer.getByRole('button', { name: 'Chọn mục khác' })).toBeFocused();
  });
});
