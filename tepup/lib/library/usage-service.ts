/**
 * Chỉ mục ngược "Xuất hiện trong" (docs/design-reference-library.md §7.3).
 *
 * Mỗi lần một bài học/chương được xuất bản, quét JSON block của nó tìm link
 * `/tv/<slug>` (và block `library-document` trỏ tới một mục đã chuyển sang
 * LibraryEntry), rồi thay toàn bộ dòng LibraryUsage của bài/chương đó.
 * `scripts/rebuild-library-usage.ts` dựng lại cho mọi bài/chương.
 */
import type { Prisma, PrismaClient } from '@prisma/client';
import { collectLibraryDocumentRefs, collectTvSlugs } from './refs';

type Db = PrismaClient | Prisma.TransactionClient;

export type UsageTarget = 'LESSON' | 'CHAPTER';

/** Đếm số lần mỗi mục (theo id) được trỏ tới trong một mảng block. */
export async function countEntryRefs(db: Db, blocks: unknown): Promise<Map<string, number>> {
  const bySlug = collectTvSlugs(blocks);
  const docRefs = collectLibraryDocumentRefs(blocks);
  const counts = new Map<string, number>();
  if (bySlug.size === 0 && docRefs.ids.length === 0 && docRefs.slugs.length === 0) return counts;

  const rows = await db.libraryEntry.findMany({
    where: {
      OR: [
        { slug: { in: [...bySlug.keys(), ...docRefs.slugs] } },
        { id: { in: docRefs.ids } },
      ],
    },
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));
  const ids = new Set(rows.map((r) => r.id));
  const add = (id: string | undefined, n: number) => {
    if (id) counts.set(id, (counts.get(id) ?? 0) + n);
  };
  for (const [slug, n] of bySlug) add(idBySlug.get(slug), n);
  for (const slug of docRefs.slugs) add(idBySlug.get(slug), 1);
  for (const id of docRefs.ids) add(ids.has(id) ? id : undefined, 1);
  return counts;
}

/** Thay toàn bộ dòng chỉ mục của một bài/chương. Gọi trong cùng transaction với lúc xuất bản. */
export async function rebuildUsage(db: Db, targetType: UsageTarget, targetId: string, blocks: unknown): Promise<number> {
  const counts = await countEntryRefs(db, blocks);
  await db.libraryUsage.deleteMany({ where: { targetType, targetId } });
  if (counts.size) {
    await db.libraryUsage.createMany({
      data: [...counts].map(([entryId, count]) => ({ entryId, targetType, targetId, count })),
    });
  }
  return counts.size;
}
