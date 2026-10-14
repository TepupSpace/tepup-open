/**
 * Ảnh chụp cách nội dung được render, để so trước/sau khi đổi trình render.
 *
 * Mọi chuỗi trong mọi block của MỌI bài học và chương truyện (kể cả bài đang ẩn)
 * được đưa qua đúng hai đường render mà người học thấy:
 *   - trường `html` (rich text)      → sanitizeInlineHtml
 *   - mọi chuỗi khác (markdown nhẹ)  → renderInlineMarkdown → HTML tĩnh
 * Kết quả cùng số block của từng bài được ghi ra một file JSON. Chạy lại với
 * --compare=<file cũ> để thấy chính xác chuỗi nào render khác đi.
 *
 * Chỉ ĐỌC database. Bắt buộc --env như mọi script khác.
 *
 *   npx tsx scripts/snapshot-render.ts --env=<file env> --out=../_backups/render-baseline-2026-10-13.json
 *   npx tsx scripts/snapshot-render.ts --env=<file env> --compare=../_backups/render-baseline-2026-10-13.json
 *
 * --compare thoát với mã 1 nếu có bất kỳ khác biệt nào, trừ những chuỗi chứa link
 * tham chiếu `/tv/` (khác biệt có chủ đích); những chuỗi đó vẫn được liệt kê riêng.
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);
const outArg = process.argv.find((a) => a.startsWith('--out='))?.slice('--out='.length);
const compareArg = process.argv.find((a) => a.startsWith('--compare='))?.slice('--compare='.length);

if (!envArg || (!outArg && !compareArg)) {
  console.error('Cách dùng: --env=<file env> và --out=<file.json> hoặc --compare=<file.json>');
  process.exit(1);
}
const envPath = path.resolve(process.cwd(), envArg);
if (!existsSync(envPath)) {
  console.error(`Không thấy file env: ${envPath}`);
  process.exit(1);
}
config({ path: envPath, quiet: true, override: true });
const dbUrl = process.env.DATABASE_URL ?? '';
const projectRef =
  dbUrl.match(/\/\/[a-z_]+\.([a-z0-9]{20}):/)?.[1] ??
  dbUrl.match(/db\.([a-z0-9]+)\.supabase/)?.[1] ??
  (dbUrl.includes('127.0.0.1') || dbUrl.includes('localhost') ? 'LOCAL' : '(không nhận ra)');
console.log(`File env    : ${envArg}`);
console.log(`Project ref : ${projectRef}`);

type Item = [path: string, rendered: string];
interface Target {
  kind: 'lesson' | 'chapter';
  where: string;
  blockCount: number;
  blockTypes: string[];
  items: Item[];
}
type Snapshot = Record<string, Target>;

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { sanitizeInlineHtml } = await import('../lib/security/sanitize-html');
  const { renderInlineMarkdown } = await import('../lib/utils/renderInlineMarkdown');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  const md = (s: string) => renderToStaticMarkup(React.createElement(React.Fragment, null, renderInlineMarkdown(s)));

  function project(value: unknown, at: string, key: string, out: Item[]) {
    if (typeof value === 'string') {
      if (value === '') return;
      out.push([at, key === 'html' ? sanitizeInlineHtml(value) : md(value)]);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => project(v, `${at}[${i}]`, key, out));
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        // Định danh, URL ảnh/media và công thức không phải văn bản người học đọc.
        if (['id', 'type', 'src', 'url', 'documentId', 'documentSlug', 'formula', 'condition', 'customBlockTypeId', 'color', 'icon', 'variant', 'mode'].includes(k)) continue;
        project(v, `${at}.${k}`, k, out);
      }
    }
  }

  const snap: Snapshot = {};

  const lessons = await prisma.lessonContent.findMany({
    select: { blocks: true, lesson: { select: { id: true, slug: true, course: { select: { slug: true } } } } },
  });
  for (const lc of lessons) {
    const blocks = (Array.isArray(lc.blocks) ? lc.blocks : []) as Record<string, unknown>[];
    const items: Item[] = [];
    blocks.forEach((b, i) => project(b, `#${i + 1}`, '', items));
    snap[`lesson:${lc.lesson.id}`] = {
      kind: 'lesson',
      where: `${lc.lesson.course.slug}/${lc.lesson.slug}`,
      blockCount: blocks.length,
      blockTypes: blocks.map((b) => String(b?.type)),
      items,
    };
  }

  const chapters = await prisma.chapterContent.findMany({
    select: { blocks: true, chapter: { select: { id: true, slug: true, story: { select: { slug: true } } } } },
  });
  for (const cc of chapters) {
    const blocks = (Array.isArray(cc.blocks) ? cc.blocks : []) as Record<string, unknown>[];
    const items: Item[] = [];
    blocks.forEach((b, i) => project(b, `#${i + 1}`, '', items));
    snap[`chapter:${cc.chapter.id}`] = {
      kind: 'chapter',
      where: `${cc.chapter.story.slug}/${cc.chapter.slug}`,
      blockCount: blocks.length,
      blockTypes: blocks.map((b) => String(b?.type)),
      items,
    };
  }
  await prisma.$disconnect();

  const nTargets = Object.keys(snap).length;
  const nItems = Object.values(snap).reduce((s, t) => s + t.items.length, 0);
  console.log(`Đã render   : ${lessons.length} bài học, ${chapters.length} chương, ${nItems} chuỗi`);

  if (outArg) {
    const outPath = path.resolve(process.cwd(), outArg);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify({ projectRef, takenAt: new Date().toISOString(), targets: snap }, null, 1));
    console.log(`Đã ghi      : ${outPath} (${nTargets} mục)`);
  }

  if (compareArg) {
    const base = JSON.parse(readFileSync(path.resolve(process.cwd(), compareArg), 'utf8')) as { targets: Snapshot };
    let unexpected = 0;
    let intended = 0;
    const report: string[] = [];
    for (const [key, before] of Object.entries(base.targets)) {
      const after = snap[key];
      if (!after) {
        report.push(`THIẾU   ${before.where}`);
        unexpected++;
        continue;
      }
      if (before.blockCount !== after.blockCount || before.blockTypes.join() !== after.blockTypes.join()) {
        report.push(`BLOCK   ${before.where}: ${before.blockCount} → ${after.blockCount} block`);
        unexpected++;
      }
      const afterMap = new Map(after.items);
      for (const [p, html] of before.items) {
        const now = afterMap.get(p);
        if (now === html) continue;
        const isTv = (now ?? '').includes('/tv/') || html.includes('/tv/');
        if (isTv) intended++;
        else unexpected++;
        report.push(`${isTv ? 'CÓ Ý   ' : 'KHÁC   '} ${before.where} ${p}\n    trước: ${html.slice(0, 300)}\n    sau  : ${String(now).slice(0, 300)}`);
      }
    }
    for (const key of Object.keys(snap)) if (!base.targets[key]) report.push(`MỚI    ${snap[key].where}`);
    console.log(report.slice(0, 200).join('\n'));
    console.log(`\nSo sánh    : ${unexpected} khác biệt ngoài ý muốn, ${intended} khác biệt có chủ đích (/tv/)`);
    if (unexpected > 0) process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
