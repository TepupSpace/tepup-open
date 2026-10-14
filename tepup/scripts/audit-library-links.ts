/**
 * Kiểm tra tham chiếu thư viện trong MỌI bài học và chương (docs/design-reference-library.md §10).
 *
 * Báo:
 *   LỖI     link /tv/<slug> trỏ tới mục không có hoặc đang ẩn
 *   LỖI     block library-document trỏ tới tài liệu không có (theo id hoặc slug)
 *   LỖI     thuật ngữ không thuộc đúng một chủ đề; viết tắt không trỏ tới đâu
 *   CẢNH BÁO link ra ngoài (http/https) nằm thẳng trong nội dung — quy tắc mới: mỗi
 *           nguồn ngoài phải có một mục Nguồn (§5.3). Thành lỗi sau giai đoạn 5.
 *   CẢNH BÁO mục thư viện không được bài nào trỏ tới
 *
 * Chỉ đọc. Thoát mã 1 nếu có LỖI (cảnh báo không làm hỏng lần chạy).
 *   npx tsx scripts/audit-library-links.ts --env=<file env> [--strict-urls]
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- walks untyped block JSON */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';

const STRICT_URLS = process.argv.includes('--strict-urls');
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);
if (!envArg || !existsSync(path.resolve(envArg))) {
  console.error('Thiếu hoặc sai --env=<file env>');
  process.exit(1);
}
config({ path: path.resolve(envArg), quiet: true, override: true });
const dbUrl = process.env.DATABASE_URL ?? '';

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/g;
const MEDIA_KEYS = new Set(['src', 'url', 'captionsUrl', 'poster']);

/** Link ra ngoài trong văn bản (bỏ qua URL media: ảnh/video có kiểm tra riêng). */
function externalUrls(value: unknown, key = ''): string[] {
  if (typeof value === 'string') return MEDIA_KEYS.has(key) ? [] : value.match(URL_RE) ?? [];
  if (Array.isArray(value)) return value.flatMap((v) => externalUrls(v, key));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => externalUrls(v, k));
  return [];
}

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { collectTvSlugs, collectLibraryDocumentRefs } = await import('../lib/library/refs');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  // Trước khi áp prisma/sql/2026-10-13-library-entries.sql, bảng chưa có: vẫn kiểm tra
  // được tài liệu cũ và link ra ngoài.
  const entries = await prisma.libraryEntry
    .findMany({
      select: { id: true, slug: true, type: true, title: true, isActive: true, linksFrom: { select: { kind: true } } },
    })
    .catch((e: { code?: string }) => {
      if (e.code !== 'P2021') throw e;
      console.log('(Chưa có bảng LibraryEntry ở database này — bỏ qua phần kiểm tra mục thư viện.)');
      return [];
    });
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const docs = await prisma.libraryDocument.findMany({ select: { id: true, slug: true, isActive: true } });
  const docIds = new Set(docs.filter((d) => d.isActive).map((d) => d.id));
  const docSlugs = new Set(docs.filter((d) => d.isActive).map((d) => d.slug));

  const lessons = await prisma.lessonContent.findMany({
    select: { blocks: true, lesson: { select: { slug: true, course: { select: { slug: true } } } } },
  });
  const chapters = await prisma.chapterContent.findMany({
    select: { blocks: true, chapter: { select: { slug: true, story: { select: { slug: true } } } } },
  });
  const targets = [
    ...lessons.map((l) => ({ where: `${l.lesson.course.slug}/${l.lesson.slug}`, blocks: l.blocks })),
    ...chapters.map((c) => ({ where: `truyện ${c.chapter.story.slug}/${c.chapter.slug}`, blocks: c.blocks })),
  ];

  const errors: string[] = [];
  const warnings: string[] = [];
  const used = new Set<string>();
  let urlCount = 0;

  for (const t of targets) {
    for (const [slug] of collectTvSlugs(t.blocks)) {
      const e = bySlug.get(slug);
      if (!e) errors.push(`${t.where}: /tv/${slug} không có trong thư viện`);
      else if (!e.isActive) errors.push(`${t.where}: /tv/${slug} đang ẩn`);
      else used.add(slug);
    }
    const refs = collectLibraryDocumentRefs(t.blocks);
    for (const id of refs.ids) if (!docIds.has(id) && !entries.some((e) => e.id === id && e.isActive)) errors.push(`${t.where}: library-document id ${id} không mở được`);
    for (const s of refs.slugs) if (!docSlugs.has(s) && !bySlug.get(s)?.isActive) errors.push(`${t.where}: library-document slug ${s} không mở được`);
    // Link nằm trong ô tương tác (lựa chọn câu hỏi, thẻ lật, ghép cặp, phân loại) hiện
    // như chữ thường — link trong nút là lỗi trợ năng (renderInlineMarkdown links: false).
    for (const b of (Array.isArray(t.blocks) ? t.blocks : []) as Record<string, any>[]) {
      const inside: unknown[] = [];
      if (b.type === 'question') inside.push(...(b.options ?? []).map((o: any) => o.text));
      if (b.type === 'flip-card') inside.push(...(b.cards ?? []).flatMap((c: any) => [c.front?.text, c.back?.text]));
      if (b.type === 'pair-match') inside.push(...(b.pairs ?? []).flatMap((p: any) => [p.left, p.right]));
      if (b.type === 'sort-bucket') inside.push(...(b.items ?? []).map((i: any) => i.text));
      if (b.type === 'perspective-switch') inside.push(...(b.question?.options ?? []).map((o: any) => o.text));
      const n = inside.filter((x) => typeof x === 'string' && /\]\(|https?:\/\//.test(x)).length;
      if (n) warnings.push(`${t.where}: ${n} link nằm trong ${b.type} (lựa chọn/thẻ/mục) sẽ hiện như chữ thường, không bấm được`);
    }
    const urls = externalUrls(t.blocks);
    if (urls.length) {
      urlCount += urls.length;
      (STRICT_URLS ? errors : warnings).push(`${t.where}: ${urls.length} link ra ngoài chưa có mục Nguồn (${urls.slice(0, 2).join(', ')}${urls.length > 2 ? ', …' : ''})`);
    }
  }

  for (const e of entries) {
    const kinds = e.linksFrom.map((l) => l.kind);
    if (e.type === 'ACRONYM' && !kinds.includes('EXPANDS_TO')) errors.push(`Viết tắt “${e.title}” (/tv/${e.slug}) không trỏ tới đâu`);
    if (e.isActive && !used.has(e.slug) && (e.type === 'CONCEPT' || e.type === 'ACRONYM')) warnings.push(`Chưa bài nào trỏ tới “${e.title}” (/tv/${e.slug})`);
  }

  console.log(`${lessons.length} bài học, ${chapters.length} chương, ${entries.length} mục thư viện, ${docs.length} tài liệu cũ.`);
  for (const w of warnings.slice(0, 100)) console.log(`CẢNH BÁO ${w}`);
  if (warnings.length > 100) console.log(`… và ${warnings.length - 100} cảnh báo khác`);
  for (const e of errors) console.log(`LỖI     ${e}`);
  console.log(`\n${errors.length} lỗi, ${warnings.length} cảnh báo, ${urlCount} link ra ngoài trong nội dung.`);
  await prisma.$disconnect();
  if (errors.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
