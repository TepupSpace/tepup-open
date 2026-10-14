/**
 * Chuyển mỗi LibraryDocument cũ ("Bài đọc") thành một mục thư viện với CÙNG id và slug
 * (docs/design-reference-library.md §9.2): tài liệu có trong scripts/library-reclassification.json
 * thành Nguồn (kèm trường trích dẫn), mọi tài liệu khác thành Mục từ.
 *
 * - "Khái niệm liên quan" trùng tiêu đề một mục từ khác thành liên kết Liên quan (RELATED,
 *   hai chiều, lưu một lần); mọi khái niệm vẫn giữ trong thân bài. "Đọc thêm" thành một
 *   phần của thân bài.
 * - Tính khoá chống trùng cho mọi mục Nguồn chưa có (kể cả mục tạo trước cột sourceKey).
 * - Chỉ THÊM liên kết, không xoá.
 *
 * Không xoá, không sửa LibraryDocument (đường lùi). Chạy lại thì nội dung các mục này
 * được ghi lại theo tài liệu cũ — nên chạy MỘT lần mỗi database, trước khi biên tập chúng.
 * Dừng trước khi ghi nếu có slug/khoá nguồn trùng với mục khác.
 *
 *   npx tsx scripts/reclassify-library-documents.ts --env=<file env>            (chạy thử)
 *   npx tsx scripts/reclassify-library-documents.ts --env=<file env> --apply
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);
if (!envArg || !existsSync(path.resolve(envArg))) {
  console.error('Thiếu hoặc sai --env=<file env>');
  process.exit(1);
}
config({ path: path.resolve(envArg), quiet: true, override: true });
const dbUrl = process.env.DATABASE_URL ?? '';
const ref =
  dbUrl.match(/\/\/[a-z_]+\.([a-z0-9]{20}):/)?.[1] ??
  (/(127\.0\.0\.1|localhost|@db:)/.test(dbUrl) ? 'LOCAL' : '(không nhận ra)');
console.log(`File env    : ${envArg}`);
console.log(`Project ref : ${ref}`);
console.log(APPLY ? 'GHI THẬT' : 'Chạy thử (thêm --apply để ghi)');

type Mapping = { documents: Record<string, { type: 'SOURCE'; meta: Record<string, unknown> }> };
type Section = { heading?: string; paragraphs: string[] };

/** Xem nhanh ≤ 200 ký tự: cắt ở cuối câu nếu được, không thì ở ranh giới từ. */
function toSummary(description: string): string {
  const d = description.replace(/\s+/g, ' ').trim();
  if (d.length <= 200) return d;
  const cut = d.slice(0, 200);
  const sentence = cut.lastIndexOf('. ');
  if (sentence > 80) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { parseMeta } = await import('../lib/library/schemas');
  const { sourceKeyOf } = await import('../lib/library/source-key');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  const mapping = JSON.parse(readFileSync(path.resolve('scripts/library-reclassification.json'), 'utf8')) as Mapping;
  const problems: string[] = [];

  const docs = await prisma.libraryDocument.findMany({ orderBy: { sortOrder: 'asc' } });
  const docIds = new Set(docs.map((d) => d.id));
  const docSlugs = new Set(docs.map((d) => d.slug));
  for (const slug of Object.keys(mapping.documents))
    if (!docSlugs.has(slug)) console.log(`(Bảng có "${slug}" nhưng database này không có tài liệu đó — bỏ qua.)`);

  // ---------- Kế hoạch cho từng tài liệu ----------
  type Plan = {
    id: string;
    slug: string;
    type: 'CONCEPT' | 'SOURCE';
    title: string;
    summary: string;
    body: { sections: Section[] };
    meta: Record<string, unknown>;
    sourceKey: string | null;
    isActive: boolean;
    related: string[];
  };
  const plans: Plan[] = [];
  for (const d of docs) {
    const m = mapping.documents[d.slug];
    const type = m ? 'SOURCE' : 'CONCEPT';
    const content = (d.content ?? {}) as { sections?: Section[]; relatedConcepts?: string[]; furtherReading?: string[] };
    const summary = toSummary(d.description);
    const sections: Section[] = [
      ...(summary !== d.description.trim() ? [{ paragraphs: [d.description.trim()] }] : []),
      ...(Array.isArray(content.sections) ? content.sections : []),
      ...(content.relatedConcepts?.length ? [{ heading: 'Khái niệm liên quan', paragraphs: content.relatedConcepts }] : []),
      ...(content.furtherReading?.length ? [{ heading: 'Đọc thêm', paragraphs: content.furtherReading }] : []),
    ];
    const parsed = parseMeta(type, m?.meta ?? {});
    if (!parsed.ok) problems.push(`${d.slug}: ${parsed.errors.join('; ')}`);
    const meta = parsed.ok ? parsed.meta : {};
    plans.push({
      id: d.id,
      slug: d.slug,
      type,
      title: d.title,
      summary,
      body: { sections },
      meta,
      sourceKey: type === 'SOURCE' ? sourceKeyOf(meta as { url?: string; identifier?: string }) : null,
      isActive: d.isActive,
      related: content.relatedConcepts ?? [],
    });
  }

  // ---------- Kiểm tra trùng trước khi ghi ----------
  // Database chưa chạy prisma/sql/2026-10-13-library-entries.sql: chạy thử vẫn xem được kế hoạch.
  let tablesMissing = false;
  const existing = await prisma.libraryEntry
    .findMany({ select: { id: true, slug: true, type: true, title: true, sourceKey: true, meta: true } })
    .catch((e: { code?: string }) => {
      if (e.code !== 'P2021') throw e;
      tablesMissing = true;
      return [];
    });
  if (tablesMissing) {
    const msg = 'Chưa có bảng LibraryEntry — chạy prisma/sql/2026-10-13-library-entries.sql trước khi --apply.';
    if (APPLY) problems.push(msg);
    else console.log(`\n(${msg})`);
  }
  for (const e of existing)
    if (docSlugs.has(e.slug) && !docIds.has(e.id)) problems.push(`Slug "${e.slug}" đã thuộc mục khác (${e.type} “${e.title}”)`);
  const keyOwner = new Map<string, string>();
  for (const e of existing) if (e.sourceKey) keyOwner.set(e.sourceKey, e.id);
  for (const p of plans) {
    if (!p.sourceKey) continue;
    const owner = keyOwner.get(p.sourceKey);
    if (owner && owner !== p.id) {
      const o = existing.find((e) => e.id === owner)!;
      problems.push(`${p.slug}: cùng nguồn với mục có sẵn “${o.title}” (/tv/${o.slug}) — gộp tay rồi chạy lại`);
    }
    keyOwner.set(p.sourceKey, p.id);
  }
  // Mục Nguồn có sẵn chưa có khoá (tạo trước cột sourceKey).
  const backfill: { id: string; slug: string; key: string }[] = [];
  for (const e of existing) {
    if (e.type !== 'SOURCE' || e.sourceKey || docIds.has(e.id)) continue;
    const key = sourceKeyOf((e.meta ?? {}) as { url?: string; identifier?: string });
    if (!key) continue;
    const owner = keyOwner.get(key);
    if (owner && owner !== e.id) problems.push(`Mục nguồn /tv/${e.slug} trùng nguồn với một mục khác (khoá ${key})`);
    keyOwner.set(key, e.id);
    backfill.push({ id: e.id, slug: e.slug, key });
  }

  // "Khái niệm liên quan" → RELATED khi trùng đúng tiêu đề một mục từ (mỗi cặp một lần).
  const conceptByTitle = new Map(plans.filter((p) => p.type === 'CONCEPT').map((p) => [norm(p.title), p]));
  const relatedPairs = new Map<string, [string, string]>();
  for (const p of plans) {
    if (p.type !== 'CONCEPT') continue;
    for (const c of p.related) {
      const t = conceptByTitle.get(norm(c));
      if (!t || t.id === p.id) continue;
      const k = [p.id, t.id].sort().join('|');
      if (!relatedPairs.has(k)) relatedPairs.set(k, [p.id, t.id]);
    }
  }

  // ---------- Bảng kế hoạch ----------
  console.log('\nTài liệu:');
  for (const p of plans)
    console.log(`  ${p.slug.padEnd(44)} ${p.type === 'SOURCE' ? 'Nguồn ' : 'Mục từ'}${p.sourceKey ? `  [${p.sourceKey}]` : ''}`);
  console.log(
    `\n${plans.filter((p) => p.type === 'CONCEPT').length} mục từ, ${plans.filter((p) => p.type === 'SOURCE').length} nguồn.`,
  );
  console.log(`Liên kết Liên quan từ "Khái niệm liên quan": ${relatedPairs.size}`);
  if (backfill.length) console.log(`Khoá chống trùng sẽ thêm cho ${backfill.length} mục nguồn có sẵn: ${backfill.map((b) => b.slug).join(', ')}`);

  if (problems.length) {
    console.error(`\nDỪNG — ${problems.length} vấn đề, chưa ghi gì:\n  - ${problems.join('\n  - ')}`);
    await prisma.$disconnect();
    process.exit(1);
  }
  if (!APPLY) {
    console.log('\nChạy thử xong, không có vấn đề. Thêm --apply để ghi.');
    await prisma.$disconnect();
    return;
  }

  // ---------- Ghi ----------
  const dir = path.resolve('../_backups');
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `library-before-reclassify-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      { documents: docs, entries: await prisma.libraryEntry.findMany(), links: await prisma.libraryLink.findMany() },
      null,
      1,
    ),
  );
  console.log(`\nBản lưu    : ${file}`);

  await prisma.$transaction(
    async (tx) => {
      for (const p of plans) {
        const data = {
          slug: p.slug,
          type: p.type,
          title: p.title,
          summary: p.summary,
          body: p.body,
          meta: p.meta as object,
          sourceKey: p.sourceKey,
          isActive: p.isActive,
        };
        await tx.libraryEntry.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
      }
      for (const [a, b] of relatedPairs.values()) {
        const has = await tx.libraryLink.findFirst({
          where: { kind: 'RELATED', OR: [{ fromId: a, toId: b }, { fromId: b, toId: a }] },
        });
        if (!has) await tx.libraryLink.create({ data: { fromId: a, toId: b, kind: 'RELATED' } });
      }
      for (const b of backfill) await tx.libraryEntry.update({ where: { id: b.id }, data: { sourceKey: b.key } });
    },
    { timeout: 120_000 },
  );

  // ---------- Kiểm tra sau khi ghi ----------
  const after = await prisma.libraryEntry.findMany({ where: { id: { in: [...docIds] } } });
  const byId = new Map(after.map((e) => [e.id, e]));
  const bad = plans.filter((p) => {
    const e = byId.get(p.id);
    return !e || e.slug !== p.slug || e.title !== p.title || e.isActive !== p.isActive || e.type !== p.type;
  });
  console.log(
    bad.length
      ? `KHÔNG KHỚP: ${bad.map((b) => b.slug).join(', ')}`
      : `Đã kiểm tra: ${plans.length}/${plans.length} tài liệu khớp id, slug, tiêu đề, trạng thái, loại.`,
  );
  if (bad.length) process.exitCode = 1;
  console.log('Tiếp theo: scripts/rebuild-library-usage.ts --apply để "Xuất hiện trong" tính cả block Bài đọc.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
