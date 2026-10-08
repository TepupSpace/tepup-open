import { test } from '@playwright/test';
import { ariaSnapshot, openAllBlocks, reflowOverflow, record, runAxe, screenshot, setPrefs, urls, type Item } from './helpers';

// Real lesson and chapter content (imported from production), every block on screen via
// "Đọc toàn bộ". Light + dark: dark mode re-points the palette, so contrast must be re-checked.
const INTERACTIVE = new Set([
  'sort-bucket', 'perspective-switch', 'pair-match', 'flip-card', 'calculator', 'slider-simulator',
  'hot-cold-guess', 'bias-detector', 'budget-allocator', 'custom',
]);

// Active lessons/chapters without any block show "chưa có nội dung" and have no "Đọc toàn bộ":
// they are listed by summarize.mjs (urls.json) instead of tested here.
const all: [Item, 'lesson' | 'chapter'][] = [
  ...urls.lessons.map((l) => [l, 'lesson'] as [Item, 'lesson']),
  ...urls.chapters.map((c) => [c, 'chapter'] as [Item, 'chapter']),
].filter(([item]) => item.types.length > 0);

for (const theme of ['light', 'dark'] as const) {
  test.describe(`content (${theme})`, () => {
    for (const [item, type] of all) {
      test(`${item.url} ${theme}`, async ({ page }, testInfo) => {
        await setPrefs(page, { theme });
        await openAllBlocks(page, item, type);
        await runAxe(page, testInfo, `${item.url} ${theme}`);
        const interactive = item.types.some((t) => INTERACTIVE.has(t));
        if (theme === 'light' && interactive) await ariaSnapshot(page, testInfo, item.url, 'main');
        if (interactive) await screenshot(page, testInfo, `${item.url} ${theme}`, true);
      });
    }
  });
}

test.describe('content reflow at 320px, text 150%, readable font', () => {
  test.use({ viewport: { width: 320, height: 640 } });
  for (const [item, type] of all) {
    test(item.url, async ({ page }, testInfo) => {
      await setPrefs(page, { size: 5, font: 'readable' });
      await openAllBlocks(page, item, type);
      const result = await reflowOverflow(page);
      record(testInfo, 'reflow', item.url, result);
      if (result.overflow > 1) await screenshot(page, testInfo, `reflow ${item.url}`, true);
    });
  }
});
