import { expect, test, type Page } from '@playwright/test';
import { openAllBlocks, setPrefs, urls } from './helpers';

// The selection bar has two buttons: "AI" (opens Hỏi AI / Kiểm chứng in place) and "Góp ý"
// (one form; the learner picks "Sửa nội dung bài" or "Đề xuất thuật ngữ" in it).
const DEMO = '/courses/demo-tham-chieu/bai-tham-chieu';
const lesson = urls.lessons.find((l) => l.url === DEMO) ?? urls.lessons.find((l) => l.types.length > 3);

async function selectSomeText(page: Page) {
  const para = page.locator('main p:not(button p):not(label p)').filter({ hasText: /.{60,}/ }).first();
  await para.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const box = (await para.boundingBox())!;
  await page.mouse.move(box.x + 4, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + Math.min(box.width - 4, 200), box.y + 10, { steps: 6 });
  await page.mouse.up();
  return page.getByRole('toolbar', { name: 'Thao tác với đoạn đã chọn' });
}

test.describe('selection bar', () => {
  test.skip(!lesson, 'no lesson to test on');

  test.beforeEach(async ({ page }) => {
    await setPrefs(page, { theme: 'light' });
    await openAllBlocks(page, lesson!, 'lesson');
  });

  test('two buttons; "AI" opens the AI actions in place and back again', async ({ page }) => {
    const bar = await selectSomeText(page);
    await expect(bar.getByRole('button')).toHaveText(['AI', 'Góp ý']);
    await bar.getByRole('button', { name: 'AI' }).click();
    await expect(bar.getByRole('button')).toHaveText(['', 'Hỏi AI', 'Kiểm chứng']);
    await expect(bar.getByRole('button', { name: 'Quay lại' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(bar.getByRole('button', { name: 'Hỏi AI' })).toBeFocused();
    await bar.getByRole('button', { name: 'Quay lại' }).click();
    await expect(bar.getByRole('button', { name: 'AI' })).toBeFocused();
  });

  test('one "Góp ý" form with a type choice; a new entry goes to the library queue with its type', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    // Don't write to the database: answer the request here and keep what was sent.
    await page.route('**/api/suggestions', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    const bar = await selectSomeText(page);
    await bar.getByRole('button', { name: 'Góp ý' }).click();
    const dialog = page.getByRole('dialog', { name: 'Góp ý' });
    await expect(dialog).toBeVisible();
    const kind = dialog.getByRole('group', { name: 'Loại góp ý' });
    await expect(kind.getByRole('radio', { name: /Sửa nội dung bài/ })).toBeChecked();
    await expect(dialog.getByLabel('Đoạn cần sửa (không bắt buộc)')).not.toBeEmpty();

    // Five kinds: fix the lesson, or a new entry of one of the four library types.
    await expect(kind.getByRole('radio')).toHaveCount(5);
    await kind.getByRole('radio', { name: /Nguồn mới/ }).check();
    await expect(dialog.getByLabel('Link hoặc tên tài liệu')).toBeVisible();
    await kind.getByRole('radio', { name: /Mục từ mới/ }).check();
    await expect(dialog.getByLabel('Từ hoặc khái niệm cần giải thích')).toBeVisible();
    await dialog.getByLabel(/Bạn hiểu nó là gì/).fill('Một khái niệm cần thêm vào thư viện để người học tra.');
    await dialog.getByRole('button', { name: 'Gửi góp ý' }).click();
    await expect(dialog).toContainText('Cảm ơn bạn');
    expect(sent).toMatchObject({ targetType: 'new-entry', targetId: lesson!.id, suggestedType: 'CONCEPT' });
  });
});
