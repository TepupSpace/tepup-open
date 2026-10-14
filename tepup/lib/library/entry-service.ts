/**
 * Đọc/ghi mục thư viện (LibraryEntry) và các liên kết giữa chúng.
 *
 * - Đọc công khai đi qua `unstable_cache` gắn LIBRARY_TAG; mọi lần ghi ở admin phải
 *   gọi `revalidateLibrary()` (lib/cache.ts).
 * - Quy tắc liên kết (§4.1, `LINK_RULES`) và quy tắc theo loại (viết tắt ít nhất một
 *   đích, nguồn không trùng) được kiểm tra ở đây vì cần database.
 * - Các mục nối thành mạng: RELATED (hai chiều), CITES (tới nguồn), và MENTIONS — server
 *   tự dựng từ link /tv/ trong thân bài mỗi lần lưu, để có "Được nhắc đến trong".
 *
 * Thiết kế: docs/design-reference-library.md §4, §6.2, §6.3, §7.3.
 */
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { LIBRARY_TAG } from '@/lib/cache';
import {
  LINK_RULES,
  TYPE_LABELS,
  parseMeta,
  type EntryBody,
  type EntryInput,
  type EntryType,
  type LinkKind,
  type SourceMeta,
  type ToolMeta,
} from './schemas';
import { shortCitation, fullCitation, type Citation } from './citation';
import { baseTitle, collectTvSlugs, isValidEntrySlug } from './refs';
import { sourceKeyOf } from './source-key';

const CACHE_SECONDS = 300;
/** Giới hạn số slug một lần hỏi xem nhanh (một bài học hiếm khi quá vài chục). */
export const PREVIEW_BATCH_MAX = 100;

// ============================================================
// Kiểu dữ liệu trả về cho giao diện
// ============================================================

export interface EntryRef {
  slug: string;
  type: EntryType;
  title: string;
}

export interface EntryPreview extends EntryRef {
  typeLabel: string;
  summary: string;
  /** Nhãn phụ: tên tiếng Anh của mục từ, dạng đầy đủ của viết tắt… */
  subtitle?: string;
  /** Nguồn: trích dẫn ngắn. */
  citation?: Citation;
  /** Công cụ: ngày cập nhật (dd/mm/yyyy) và đã quá hạn rà soát chưa. */
  updatedAt?: string;
  overdue?: boolean;
}

export interface EntryUsageRef {
  kind: 'lesson' | 'chapter';
  href: string;
  title: string;
  /** Khoá học hoặc truyện chứa nó. */
  parent: string;
}

export interface EntryFull extends EntryPreview {
  id: string;
  body: EntryBody | null;
  meta: Record<string, unknown>;
  /** Nguồn: trích dẫn đầy đủ. */
  fullCitation?: Citation;
  /** Nhóm liên kết đã sắp xếp, theo vai trò hiển thị (§6.3). */
  sources: (EntryRef & { citation?: Citation })[];
  /** Nguồn: các mục trích nguồn này. */
  citedBy: EntryRef[];
  /** Liên quan, cả hai chiều (RELATED lưu một lần). */
  related: EntryRef[];
  /** Liên kết ngược: mục khác có link /tv/ tới mục này trong thân bài. */
  mentionedIn: EntryRef[];
  /** Viết tắt: trỏ tới. Mục từ/công cụ: các viết tắt trỏ về đây. */
  expandsTo: EntryRef[];
  acronyms: EntryRef[];
  /** Mục cùng tên (bỏ phần "(…)" cuối tiêu đề) — như trang định hướng của Wikipedia. */
  otherMeanings: EntryRef[];
  usages: EntryUsageRef[];
}

// ============================================================
// Tiện ích
// ============================================================

function ddmmyyyy(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
}

/** Ngày hôm nay theo giờ Việt Nam, dạng yyyy-mm-dd, để so với reviewBy. */
function todayVN(): string {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

const ref = (e: { slug: string; type: EntryType; title: string }): EntryRef => ({ slug: e.slug, type: e.type, title: e.title });

type EntryRow = {
  id: string;
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  body: Prisma.JsonValue;
  meta: Prisma.JsonValue;
  isActive: boolean;
  updatedAt: Date;
};

function previewOf(e: EntryRow): EntryPreview {
  const meta = (e.meta ?? {}) as Record<string, unknown>;
  const p: EntryPreview = { ...ref(e), typeLabel: TYPE_LABELS[e.type], summary: e.summary };
  switch (e.type) {
    case 'CONCEPT':
      if (typeof meta.titleEn === 'string' && meta.titleEn) p.subtitle = meta.titleEn;
      break;
    case 'ACRONYM':
      if (typeof meta.expansion === 'string') p.subtitle = meta.expansion;
      break;
    case 'SOURCE':
      p.citation = shortCitation(e.title, meta as unknown as SourceMeta);
      break;
    case 'TOOL': {
      p.updatedAt = ddmmyyyy(e.updatedAt);
      const reviewBy = (meta as Partial<ToolMeta>).reviewBy;
      p.overdue = !!reviewBy && reviewBy < todayVN();
      break;
    }
  }
  return p;
}

// ============================================================
// Đọc công khai (cache)
// ============================================================

async function getPreviewsInternal(slugs: string[]): Promise<EntryPreview[]> {
  const clean = [...new Set(slugs.filter(isValidEntrySlug))].slice(0, PREVIEW_BATCH_MAX);
  if (clean.length === 0) return [];
  const rows = (await prisma.libraryEntry.findMany({ where: { slug: { in: clean }, isActive: true } })) as EntryRow[];
  return rows.map((r) => previewOf(r));
}

/** Xem nhanh cho một loạt slug (một request mỗi bài học — §6.6). Slug lạ bị bỏ qua. */
export async function getEntryPreviews(slugs: string[]): Promise<EntryPreview[]> {
  const key = [...new Set(slugs)].sort();
  return cachedPreviews(key);
}
const cachedPreviews = unstable_cache(getPreviewsInternal, ['library-entry-previews'], {
  revalidate: CACHE_SECONDS,
  tags: [LIBRARY_TAG],
});

async function usagesFor(entryId: string): Promise<EntryUsageRef[]> {
  const rows = await prisma.libraryUsage.findMany({ where: { entryId }, take: 200 });
  const lessonIds = rows.filter((r) => r.targetType === 'LESSON').map((r) => r.targetId);
  const chapterIds = rows.filter((r) => r.targetType === 'CHAPTER').map((r) => r.targetId);
  const [lessons, chapters] = await Promise.all([
    lessonIds.length
      ? prisma.lesson.findMany({
          where: { id: { in: lessonIds }, isActive: true, course: { isActive: true } },
          select: { slug: true, name: true, course: { select: { slug: true, name: true } } },
        })
      : [],
    chapterIds.length
      ? prisma.chapter.findMany({
          where: { id: { in: chapterIds }, isActive: true, story: { isActive: true } },
          select: {
            slug: true,
            title: true,
            story: { select: { slug: true, title: true, character: { select: { slug: true } } } },
          },
        })
      : [],
  ]);
  return [
    ...lessons.map((l) => ({
      kind: 'lesson' as const,
      href: `/courses/${l.course.slug}/${l.slug}`,
      title: l.name,
      parent: l.course.name,
    })),
    ...chapters.map((c) => ({
      kind: 'chapter' as const,
      href: `/story/${c.story.character.slug}/${c.story.slug}/${c.slug}`,
      title: c.title,
      parent: c.story.title,
    })),
  ];
}

async function getEntryFullInternal(slug: string): Promise<EntryFull | null> {
  if (!isValidEntrySlug(slug)) return null;
  const linkSel = { select: { slug: true, type: true, title: true, isActive: true, meta: true } } as const;
  const e = await prisma.libraryEntry.findUnique({
    where: { slug },
    include: {
      linksFrom: { include: { to: linkSel }, orderBy: { order: 'asc' } },
      linksTo: { include: { from: linkSel }, orderBy: { order: 'asc' } },
    },
  });
  if (!e || !e.isActive) return null;

  type Linked = { slug: string; type: EntryType; title: string; isActive: boolean; meta: Prisma.JsonValue };
  const out = (kind: LinkKind) =>
    (e.linksFrom as { kind: LinkKind; to: Linked }[]).filter((l) => l.kind === kind && l.to.isActive).map((l) => l.to);
  const inc = (kind: LinkKind) =>
    (e.linksTo as { kind: LinkKind; from: Linked }[]).filter((l) => l.kind === kind && l.from.isActive).map((l) => l.from);
  const withCitation = (s: Linked) => ({ ...ref(s), citation: shortCitation(s.title, s.meta as unknown as SourceMeta) });

  const preview = previewOf(e as EntryRow);
  const meta = (e.meta ?? {}) as Record<string, unknown>;
  const collator = new Intl.Collator('vi', { sensitivity: 'base' });
  const uniq = (list: Linked[]) => {
    const seen = new Set<string>();
    return list
      .filter((l) => !seen.has(l.slug) && !!seen.add(l.slug))
      .map(ref)
      .sort((a, b) => collator.compare(a.title, b.title));
  };

  const related = uniq(out('RELATED').concat(inc('RELATED')));
  const relatedSlugs = new Set(related.map((r) => r.slug));
  const full: EntryFull = {
    ...preview,
    id: e.id,
    body: (e.body as EntryBody | null) ?? null,
    meta,
    sources: out('CITES').map(withCitation),
    citedBy: uniq(inc('CITES')),
    related,
    // Đã nằm trong "Liên quan" thì không lặp lại ở liên kết ngược.
    mentionedIn: uniq(inc('MENTIONS')).filter((m) => !relatedSlugs.has(m.slug)),
    expandsTo: out('EXPANDS_TO').map(ref),
    acronyms: uniq(inc('EXPANDS_TO')),
    otherMeanings: [],
    usages: await usagesFor(e.id),
  };
  if (e.type === 'SOURCE') full.fullCitation = fullCitation(e.title, meta as unknown as SourceMeta);
  if (e.type === 'CONCEPT') {
    const base = baseTitle(e.title);
    const same = await prisma.libraryEntry.findMany({
      where: { type: 'CONCEPT', isActive: true, title: { startsWith: base, mode: 'insensitive' }, NOT: { id: e.id } },
      select: { slug: true, type: true, title: true },
      take: 50,
    });
    full.otherMeanings = same
      .filter((x) => baseTitle(x.title).toLocaleLowerCase('vi') === base.toLocaleLowerCase('vi'))
      .map((x) => ref(x as { slug: string; type: EntryType; title: string }));
  }
  return full;
}

/** Toàn bộ một mục cho bảng bên và trang /thu-vien/muc/<slug>. Null nếu không có/đang ẩn. */
export const getEntryFull = unstable_cache(getEntryFullInternal, ['library-entry-full'], {
  revalidate: CACHE_SECONDS,
  tags: [LIBRARY_TAG],
});

/** Danh sách công khai theo loại (trang mục từ, nguồn, viết tắt, tủ công cụ). */
async function listEntriesInternal(type: EntryType): Promise<EntryPreview[]> {
  const rows = (await prisma.libraryEntry.findMany({ where: { type, isActive: true }, take: 3000 })) as EntryRow[];
  const collator = new Intl.Collator('vi', { sensitivity: 'base' });
  return rows.map((r) => previewOf(r)).sort((a, b) => collator.compare(a.title, b.title));
}
export const listEntries = unstable_cache(listEntriesInternal, ['library-entry-list'], {
  revalidate: CACHE_SECONDS,
  tags: [LIBRARY_TAG],
});

// ============================================================
// Ghi (admin) — không cache
// ============================================================

export class EntryValidationError extends Error {
  constructor(public issues: string[]) {
    super(issues.join('; '));
  }
}

/** Kiểm tra meta theo loại và các quy tắc liên kết. Ném EntryValidationError. */
async function validate(
  input: EntryInput,
  selfId?: string,
): Promise<{ meta: Record<string, unknown>; sourceKey: string | null }> {
  const issues: string[] = [];
  const meta = parseMeta(input.type, input.meta);
  if (!meta.ok) issues.push(...meta.errors);

  const targetIds = [...new Set(input.links.map((l) => l.toId))];
  const targets = targetIds.length
    ? await prisma.libraryEntry.findMany({ where: { id: { in: targetIds } }, select: { id: true, type: true, title: true } })
    : [];
  const byId = new Map(targets.map((t) => [t.id, t]));
  const seen = new Set<string>();
  for (const l of input.links) {
    const target = byId.get(l.toId);
    const rule = LINK_RULES[l.kind];
    if (!target) issues.push(`Liên kết tới mục không tồn tại (${l.toId})`);
    else if (selfId && target.id === selfId) issues.push('Một mục không thể liên kết tới chính nó');
    else if (!rule.from.includes(input.type))
      issues.push(`Mục loại ${TYPE_LABELS[input.type]} không dùng được liên kết ${l.kind}`);
    else if (!rule.to.includes(target.type as EntryType))
      issues.push(`Liên kết ${l.kind} phải trỏ tới ${rule.to.map((t) => TYPE_LABELS[t]).join('/')}, không phải “${target.title}”`);
    const key = `${l.toId}:${l.kind}`;
    if (seen.has(key)) issues.push(`Liên kết bị lặp: “${target?.title ?? l.toId}”`);
    seen.add(key);
  }

  const count = (k: LinkKind) => input.links.filter((l) => l.kind === k).length;
  if (input.type === 'ACRONYM' && count('EXPANDS_TO') < 1)
    issues.push('Viết tắt phải trỏ tới ít nhất một mục (liên kết EXPANDS_TO)');

  // Nguồn: không cho hai mục trỏ cùng một tài liệu (khoá chuẩn hoá, cột UNIQUE).
  let sourceKey: string | null = null;
  if (input.type === 'SOURCE' && meta.ok) {
    sourceKey = sourceKeyOf(meta.meta as { url?: string; identifier?: string });
    const dupe = sourceKey ? await findSourceByKey(sourceKey, selfId) : null;
    if (dupe) issues.push(`Nguồn này đã có trong thư viện: “${dupe.title}” (/tv/${dupe.slug}). Dùng mục đó thay vì tạo mới.`);
  }

  if (issues.length) throw new EntryValidationError(issues);
  return { meta: (meta as { ok: true; meta: Record<string, unknown> }).meta, sourceKey };
}

/** Mục Nguồn có cùng khoá chống trùng (trừ chính nó). */
export async function findSourceByKey(key: string, excludeId?: string) {
  return prisma.libraryEntry.findFirst({
    where: { sourceKey: key, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true, slug: true, title: true, type: true, summary: true, isActive: true },
  });
}

function writeData(input: EntryInput, meta: Record<string, unknown>, sourceKey: string | null) {
  return {
    sourceKey,
    slug: input.slug,
    type: input.type,
    title: input.title,
    summary: input.summary,
    body: input.body ? (input.body as Prisma.InputJsonValue) : Prisma.DbNull,
    meta: meta as Prisma.InputJsonValue,
    isActive: input.isActive,
  };
}

/**
 * Ghi liên kết đi ra của một mục: các liên kết người soạn chọn, rồi MENTIONS từ link /tv/
 * trong phần xem nhanh, thân bài và mức làm theo. RELATED đã có ở chiều ngược lại thì bỏ
 * (quan hệ hai chiều chỉ lưu một lần).
 */
async function writeLinks(tx: Prisma.TransactionClient, id: string, input: EntryInput) {
  await tx.libraryLink.deleteMany({ where: { fromId: id } });
  const relatedTo = input.links.filter((l) => l.kind === 'RELATED').map((l) => l.toId);
  const reverse = new Set(
    relatedTo.length
      ? (
          await tx.libraryLink.findMany({
            where: { toId: id, kind: 'RELATED', fromId: { in: relatedTo } },
            select: { fromId: true },
          })
        ).map((l) => l.fromId)
      : [],
  );
  const chosen = input.links.filter((l) => !(l.kind === 'RELATED' && reverse.has(l.toId)));
  if (chosen.length)
    await tx.libraryLink.createMany({
      data: chosen.map((l) => ({ fromId: id, toId: l.toId, kind: l.kind, order: l.order })),
    });
  const mentioned = [...collectTvSlugs([input.summary, input.body, input.meta]).keys()];
  if (mentioned.length) {
    const targets = await tx.libraryEntry.findMany({ where: { slug: { in: mentioned }, NOT: { id } }, select: { id: true } });
    if (targets.length)
      await tx.libraryLink.createMany({
        data: targets.map((t) => ({ fromId: id, toId: t.id, kind: 'MENTIONS' as const })),
        skipDuplicates: true,
      });
  }
}

export async function createEntry(input: EntryInput) {
  const { meta, sourceKey } = await validate(input);
  return prisma.$transaction(async (tx) => {
    const entry = await tx.libraryEntry.create({ data: writeData(input, meta, sourceKey) });
    await writeLinks(tx, entry.id, input);
    return entry;
  });
}

export async function updateEntry(id: string, input: EntryInput) {
  const { meta, sourceKey } = await validate(input, id);
  return prisma.$transaction(async (tx) => {
    const entry = await tx.libraryEntry.update({ where: { id }, data: writeData(input, meta, sourceKey) });
    // Liên kết đi ra được thay nguyên bộ; liên kết đi vào (do mục khác tạo) giữ nguyên.
    await writeLinks(tx, id, input);
    return entry;
  });
}

export async function deleteEntry(id: string) {
  await prisma.libraryEntry.delete({ where: { id } });
}

/** Admin: tìm mục theo tiêu đề/slug, lọc theo loại. Dùng cho danh sách và bộ chọn. */
export async function searchEntriesAdmin(opts: { q?: string; type?: EntryType; take?: number }) {
  const where: Prisma.LibraryEntryWhereInput = {};
  if (opts.type) where.type = opts.type;
  if (opts.q) {
    where.OR = [
      { title: { contains: opts.q, mode: 'insensitive' } },
      { slug: { contains: opts.q.toLowerCase() } },
      { summary: { contains: opts.q, mode: 'insensitive' } },
    ];
  }
  return prisma.libraryEntry.findMany({
    where,
    orderBy: [{ type: 'asc' }, { title: 'asc' }],
    take: Math.min(opts.take ?? 200, 500),
    select: { id: true, slug: true, type: true, title: true, summary: true, isActive: true, updatedAt: true, meta: true },
  });
}

export async function getEntryAdmin(id: string) {
  return prisma.libraryEntry.findUnique({
    where: { id },
    include: {
      linksFrom: { include: { to: { select: { id: true, slug: true, type: true, title: true } } }, orderBy: { order: 'asc' } },
      linksTo: { include: { from: { select: { id: true, slug: true, type: true, title: true } } } },
    },
  });
}

// ============================================================
// Bản đồ (đồ thị) cho trang /thu-vien/ban-do
// ============================================================

export interface GraphData {
  nodes: { slug: string; title: string; type: EntryType }[];
  /** s, t = chỉ số trong `nodes`. Mỗi cặp một cạnh, bất kể loại và chiều liên kết. */
  edges: { s: number; t: number }[];
}

async function getGraphInternal(): Promise<GraphData> {
  const [entries, links] = await Promise.all([
    prisma.libraryEntry.findMany({ where: { isActive: true }, select: { id: true, slug: true, title: true, type: true } }),
    prisma.libraryLink.findMany({ select: { fromId: true, toId: true } }),
  ]);
  const index = new Map(entries.map((e, i) => [e.id, i]));
  const seen = new Set<string>();
  const edges: GraphData['edges'] = [];
  for (const l of links) {
    const a = index.get(l.fromId);
    const b = index.get(l.toId);
    if (a === undefined || b === undefined || a === b) continue;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ s: a, t: b });
  }
  return { nodes: entries.map((e) => ({ slug: e.slug, title: e.title, type: e.type as EntryType })), edges };
}

/** Mọi mục đang hiển thị và mọi liên kết giữa chúng. */
export const getGraph = unstable_cache(getGraphInternal, ['library-graph'], {
  revalidate: CACHE_SECONDS,
  tags: [LIBRARY_TAG],
});

/** Số mục đang hiển thị theo loại (cho trang /thu-vien). */
export const countEntriesByType = unstable_cache(
  async () => {
    const rows = await prisma.libraryEntry.groupBy({ by: ['type'], where: { isActive: true }, _count: true });
    return Object.fromEntries(rows.map((r) => [r.type, r._count])) as Partial<Record<EntryType, number>>;
  },
  ['library-entry-counts'],
  { revalidate: CACHE_SECONDS, tags: [LIBRARY_TAG] },
);
