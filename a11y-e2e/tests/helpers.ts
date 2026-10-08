import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

export interface Item { id: string; url: string; name: string; types: string[] }
export interface Urls {
  courses: string[]; lessons: Item[]; characters: string[]; stories: string[]; chapters: Item[];
  admin: Record<'category' | 'character' | 'course' | 'story' | 'library' | 'lesson' | 'chapter', string | null>;
}

/** Written by run.sh from the local database (collect-urls.sql). */
export const urls: Urls = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'urls.json'), 'utf8'));

export const RESULTS = path.join(process.cwd(), 'results');

/** Signed-in state of the local Docker admin (docker-seed.ts), written by auth.setup.ts. */
export const ADMIN_STATE = '.auth/admin.json';

export interface Prefs { theme?: 'light' | 'dark'; font?: 'default' | 'readable'; size?: number }

/** Reading settings, applied before any page script runs (same key as lib/reader-prefs.ts). */
export async function setPrefs(page: Page, prefs: Prefs) {
  await page.addInitScript((p) => {
    localStorage.setItem('tepup_reader_prefs', JSON.stringify({ theme: 'light', font: 'default', size: 2, ...p }));
  }, prefs);
}

/** Marks lessons/chapters as completed in local progress (same shape as ProgressContext). */
export async function markCompleted(page: Page, items: { id: string; type: 'lesson' | 'chapter' }[]) {
  await page.addInitScript((list) => {
    const now = new Date().toISOString();
    const progress: Record<string, unknown> = {};
    for (const it of list) progress[it.id] = { contentType: it.type, completed: true, score: 0, completedAt: now };
    localStorage.setItem('tepup_progress_v2', JSON.stringify({ version: 1, progress, lastUpdated: now }));
  }, items);
}

/** Open a finished lesson/chapter in "Đọc toàn bộ" mode: every block on screen at once. */
export async function openAllBlocks(page: Page, item: Item, type: 'lesson' | 'chapter') {
  await markCompleted(page, [{ id: item.id, type }]);
  await page.goto(item.url);
  await page.getByRole('button', { name: /Đọc toàn bộ/ }).click();
  await page.waitForLoadState('networkidle');
}

export function slugOf(s: string) {
  return s.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 120) || 'root';
}

function save(rel: string, data: unknown) {
  const file = path.join(RESULTS, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

/** One finding file per check; summarize.mjs rolls them up. Never throws: the run audits, it doesn't gate. */
export function record(testInfo: TestInfo, kind: string, label: string, data: unknown) {
  save(path.join(kind, testInfo.project.name, `${slugOf(label)}.json`), { label, project: testInfo.project.name, data });
}

/** axe-core against the rendered page (incl. cross-origin iframes), WCAG 2.2 A/AA + best practice. */
export async function runAxe(page: Page, testInfo: TestInfo, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    tags: v.tags.filter((t) => t.startsWith('wcag')),
    nodes: v.nodes.slice(0, 8).map((n) => ({
      target: n.target.join(' '),
      html: n.html.slice(0, 200),
      summary: n.failureSummary?.split('\n').slice(0, 3).join(' | '),
    })),
    count: v.nodes.length,
  }));
  record(testInfo, 'axe', label, { url: page.url(), violations, incomplete: results.incomplete.map((i) => i.id) });
  return violations;
}

export async function screenshot(page: Page, testInfo: TestInfo, label: string, fullPage = false) {
  const file = path.join(RESULTS, 'screens', testInfo.project.name, `${slugOf(label)}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage });
}

export async function ariaSnapshot(page: Page, testInfo: TestInfo, label: string, selector = 'body') {
  save(path.join('aria', testInfo.project.name, `${slugOf(label)}.yml`), await page.locator(selector).first().ariaSnapshot());
}

/** Horizontal scrolling at narrow widths fails WCAG 1.4.10 (reflow). */
export async function reflowOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.scrollingElement ?? document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const culprits: string[] = [];
    if (overflow > 1) {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
        const r = el.getBoundingClientRect();
        if (r.right > doc.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') {
          culprits.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} (${Math.round(r.right)}px)`);
          if (culprits.length >= 5) break;
        }
      }
    }
    return { overflow, culprits };
  });
}
