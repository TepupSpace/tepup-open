/**
 * Cầu nối block `library-document` ("Bài đọc") sang LibraryEntry (Phương án B,
 * docs/design-reference-library.md §9.2).
 *
 * Tài liệu cũ được chuyển thành Mục từ hoặc Nguồn với CÙNG id và slug
 * (scripts/reclassify-library-documents.ts), nên block đang trỏ tới một tài liệu theo
 * id hoặc slug vẫn mở đúng nội dung đó. Hai hàm dưới đây đọc LibraryEntry trước và trả
 * về đúng dạng dữ liệu cũ; tài liệu chưa được chuyển thì đọc từ LibraryDocument như trước.
 */
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { LIBRARY_TAG } from '@/lib/cache';
import {
  getDocumentById,
  getDocumentBySlug,
  getDocumentSummaries,
  type LibraryDocumentData,
  type LibraryDocumentSummary,
} from '@/lib/services/library-service';
import { TYPE_LABELS, type EntryBody, type EntryType } from './schemas';

/** Loại mục có thân bài để mở như một "Bài đọc" (viết tắt thì không). */
const READABLE: EntryType[] = ['CONCEPT', 'SOURCE', 'TOOL'];

type CompatDocument = Pick<LibraryDocumentData, 'id' | 'slug' | 'title' | 'description' | 'category' | 'content' | 'isActive'> & {
  /** Có khi tài liệu đã là LibraryEntry: block mở bằng bảng bên thay vì cửa sổ cũ. */
  entryType?: EntryType;
};

type Row = {
  id: string;
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  body: unknown;
  isActive: boolean;
};

function wordCount(body: EntryBody | null): number {
  return (body?.sections ?? []).reduce(
    (n, s) => n + [s.heading ?? '', ...s.paragraphs].join(' ').split(/\s+/).filter(Boolean).length,
    0,
  );
}

async function getEntryDocumentInternal(ref: string): Promise<CompatDocument | null> {
  const row = ((await prisma.libraryEntry.findUnique({ where: { id: ref } })) ??
    (await prisma.libraryEntry.findUnique({ where: { slug: ref } }))) as Row | null;
  if (!row || !READABLE.includes(row.type)) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.summary,
    category: TYPE_LABELS[row.type],
    content: { sections: ((row.body as EntryBody | null)?.sections ?? []) as LibraryDocumentData['content']['sections'] },
    isActive: row.isActive,
    entryType: row.type,
  };
}
const getEntryDocument = unstable_cache(getEntryDocumentInternal, ['library-entry-as-document'], {
  revalidate: 300,
  tags: [LIBRARY_TAG],
});

/** Một tài liệu theo id hoặc slug: LibraryEntry trước, LibraryDocument sau. */
export async function getDocumentCompat(ref: string): Promise<CompatDocument | null> {
  const entry = await getEntryDocument(ref);
  if (entry) return entry;
  return (await getDocumentById(ref)) ?? (await getDocumentBySlug(ref));
}

async function listEntryDocumentsInternal(): Promise<(LibraryDocumentSummary & { entryType: EntryType })[]> {
  const rows = (await prisma.libraryEntry.findMany({
    where: { isActive: true, type: { in: READABLE } },
    take: 2000,
  })) as Row[];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.summary,
    category: TYPE_LABELS[r.type],
    icon: null,
    readMinutes: Math.max(1, Math.round(wordCount(r.body as EntryBody | null) / 200)),
    entryType: r.type,
  }));
}
const listEntryDocuments = unstable_cache(listEntryDocumentsInternal, ['library-entries-as-documents'], {
  revalidate: 300,
  tags: [LIBRARY_TAG],
});

/**
 * Danh sách cho ô chọn tài liệu của block: mọi mục đọc được, cộng tài liệu cũ chưa
 * chuyển (không trùng id/slug). Sắp theo tiêu đề.
 */
export async function listDocumentsCompat(): Promise<(LibraryDocumentSummary & { entryType?: EntryType })[]> {
  const [entries, docs] = await Promise.all([listEntryDocuments(), getDocumentSummaries()]);
  const ids = new Set(entries.map((e) => e.id));
  const slugs = new Set(entries.map((e) => e.slug));
  const collator = new Intl.Collator('vi', { sensitivity: 'base' });
  return [...entries, ...docs.filter((d) => !ids.has(d.id) && !slugs.has(d.slug))].sort((a, b) =>
    collator.compare(a.title, b.title),
  );
}
