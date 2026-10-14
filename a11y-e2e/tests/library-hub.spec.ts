import { expect, test } from '@playwright/test';
import { openAllBlocks, runAxe, screenshot, setPrefs, urls } from './helpers';

// One library (docs/design-reference-library.md §7.4, §7.5, §9.2): one kind of knowledge entry
// (Mục từ) linked as a network, tabs that share one frame, a map of the network, and old
// "Bài đọc" blocks opening the same side panel as /tv/ links.

const TABS = ['/thu-vien', '/thu-vien/nguon', '/thu-vien/viet-tat', '/thu-vien/tu-cong-cu', '/thu-vien/ban-do', '/thu-vien/da-luu'];

test.describe('library hub', () => {
  test.beforeEach(async ({ page }) => {
    await setPrefs(page, { theme: 'light' });
  });

  test('old URLs land on the library', async ({ page }) => {
    for (const from of ['/library', '/thu-vien/thuat-ngu']) {
      const res = await page.goto(from);
      expect(new URL(res!.url()).pathname, from).toBe('/thu-vien');
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Thư viện' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mục từ', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('the frame does not move when switching tabs', async ({ page }) => {
    const boxes: Record<string, number[]> = {};
    for (const url of TABS) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const nav = page.getByRole('navigation', { name: 'Các phần của thư viện' });
      await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', url);
      const parts = [
        page.getByRole('heading', { level: 1, name: 'Thư viện' }),
        page.getByLabel('Tìm trong thư viện'),
        nav,
        page.getByRole('heading', { level: 2 }).first(),
      ];
      const b = await Promise.all(parts.map((l) => l.boundingBox()));
      boxes[url] = b.flatMap((x) => [Math.round(x!.x), Math.round(x!.y), Math.round(x!.width)]);
    }
    const first = boxes[TABS[0]];
    for (const url of TABS) expect(boxes[url], `${url} vs ${TABS[0]}`).toEqual(first);
  });

  test('Mục từ lists every concept A–Z and opens one in the side panel', async ({ page }, testInfo) => {
    await page.goto('/thu-vien');
    const link = page.locator('main dl a[data-tv="kha-nang-doc-duoc"]');
    await screenshot(page, testInfo, '/thu-vien', false);
    test.skip(!(await link.count()), 'seed-reference-demo.ts has not been run on this database');
    await expect(page.getByRole('navigation', { name: 'Theo chữ cái' })).toBeVisible();
    await link.click();
    const panel = page.getByRole('dialog', { name: /Khả năng đọc được/ });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Liên quan' })).toBeVisible();
    await expect(panel.getByRole('link', { name: /Xem trên bản đồ/ })).toHaveAttribute('href', '/thu-vien/ban-do?muc=kha-nang-doc-duoc');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    expect((await runAxe(page, testInfo, '/thu-vien')).map((v) => v.id)).toEqual([]);
  });

  test('an entry from an old "Bài đọc" uses the new form', async ({ page }) => {
    const res = await page.goto('/thu-vien/muc/thue-tncn');
    test.skip(res?.status() !== 200, 'no converted Bài đọc on this database');
    const main = page.locator('main');
    // Old text lists are gone; related entries are real links.
    await expect(main.getByRole('heading', { name: 'Khái niệm liên quan' })).toHaveCount(0);
    await expect(main.getByRole('heading', { name: 'Đọc thêm' })).toHaveCount(0);
    await expect(main.getByRole('heading', { name: 'Liên quan', exact: true })).toBeVisible();
    await expect(main.locator('a[data-tv="giam-tru-gia-canh"]')).toBeVisible();
  });

  test('Nguồn lists sources by kind with a citation', async ({ page }) => {
    await page.goto('/thu-vien/nguon');
    const src = page.locator('main a[data-tv="planet-money-palantir"]');
    test.skip(!(await src.count()), 'seed-reference-demo.ts has not been run on this database');
    await expect(page.getByRole('heading', { level: 3, name: 'Podcast' })).toBeVisible();
  });

  test('Bản đồ shows the network; ?muc= highlights an entry; a node opens it', async ({ page }, testInfo) => {
    await page.goto('/thu-vien/ban-do?muc=kha-nang-doc-duoc');
    const map = page.getByRole('group', { name: /Bản đồ thư viện: \d+ mục, \d+ liên kết/ });
    await expect(map).toBeVisible();
    const node = map.locator('a[data-tv="kha-nang-doc-duoc"]');
    test.skip(!(await node.count()), 'seed-reference-demo.ts has not been run on this database');
    // Its neighbours are lit, unrelated entries dimmed.
    await expect(map.locator('a[data-tv="giam-sat-hang-loat"]')).toHaveCSS('opacity', '1');
    await expect(map.locator('a[data-tv="cong-cu-mat-khau"]')).toHaveCSS('opacity', '0.3');
    await screenshot(page, testInfo, '/thu-vien/ban-do focus', false);
    // Filters: hiding sources removes their dots.
    await page.getByRole('checkbox', { name: /Nguồn/ }).uncheck();
    await expect(map.locator('a[data-tv="planet-money-palantir"]')).toHaveCount(0);
    await page.getByRole('checkbox', { name: /Nguồn/ }).check();
    // Keyboard: Tab reaches the dots; Enter opens the panel.
    await node.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: /Khả năng đọc được/ })).toBeVisible();
    await page.keyboard.press('Escape');
    // The same information as a list.
    await page.getByText('Xem dạng danh sách').click();
    await expect(page.getByRole('list', { name: 'Danh sách mục và liên kết' })).toContainText('Khả năng đọc được');
    expect((await runAxe(page, testInfo, '/thu-vien/ban-do')).map((v) => v.id)).toEqual([]);
  });

  test('pasting a source link into the search finds that source', async ({ page }) => {
    await page.goto('/thu-vien/viet-tat');
    await page.getByLabel('Tìm trong thư viện').fill('https://www.npr.org/transcripts/nx-s1-5953112?utm_medium=social');
    await expect(page.getByText('Đúng tài liệu của link này')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Love in the time of Palantir' })).toHaveAttribute('href', '/tv/planet-money-palantir');
  });

  test('"Đề xuất mục mới" asks for the kind of entry', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/suggestions', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/thu-vien');
    await page.getByRole('button', { name: 'Đề xuất mục mới' }).click();
    const dialog = page.getByRole('dialog', { name: 'Đề xuất cho thư viện' });
    const kind = dialog.getByRole('group', { name: 'Loại góp ý' });
    await expect(kind.getByRole('radio')).toHaveCount(4);
    await kind.getByRole('radio', { name: /Công cụ mới/ }).check();
    await dialog.getByLabel('Tên công cụ hoặc cách cài đặt').fill('Bật xác thực hai lớp cho Zalo');
    await dialog.getByLabel(/Nó giúp được gì/).fill('Chặn người khác đăng nhập dù biết mật khẩu.');
    await dialog.getByRole('button', { name: 'Gửi góp ý' }).click();
    await expect(dialog).toContainText('Cảm ơn bạn');
    expect(sent).toMatchObject({ targetType: 'new-entry', targetId: 'thu-vien', suggestedType: 'TOOL' });
  });
});

test.describe('old "Bài đọc" block', () => {
  const lesson = urls.lessons.find((l) => l.url === '/courses/logic-101/confirmation-bias');
  test.skip(!lesson, 'logic-101/confirmation-bias is not on this database');

  test('"Xem tài liệu" opens the library side panel', async ({ page }) => {
    await setPrefs(page, { theme: 'light' });
    await openAllBlocks(page, lesson!, 'lesson');
    const open = page.getByRole('button', { name: 'Xem tài liệu' }).first();
    await expect(open).toBeVisible();
    await open.click();
    const panel = page.getByRole('dialog').last();
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(/[?&]tv=/);
    await expect(panel).toContainText(/Nguồn|Mục từ/);
    await page.keyboard.press('Escape');
    await expect(open).toBeFocused();
  });
});
