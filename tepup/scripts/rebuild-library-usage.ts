/**
 * Dựng lại toàn bộ chỉ mục ngược LibraryUsage ("Xuất hiện trong") từ nội dung đang
 * xuất bản của MỌI bài học và chương (docs/design-reference-library.md §7.3).
 *
 * Bình thường không cần: mỗi lần xuất bản đã tự dựng lại cho bài/chương đó. Chạy sau
 * khi chuyển LibraryDocument sang LibraryEntry, hoặc sau khi sửa nội dung bằng script.
 *
 *   npx tsx scripts/rebuild-library-usage.ts --env=<file env>            (chạy thử)
 *   npx tsx scripts/rebuild-library-usage.ts --env=<file env> --apply
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';

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

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { countEntryRefs, rebuildUsage } = await import('../lib/library/usage-service');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  let targets = 0;
  let rows = 0;
  const lessons = await prisma.lessonContent.findMany({ select: { lessonId: true, blocks: true } });
  const chapters = await prisma.chapterContent.findMany({ select: { chapterId: true, blocks: true } });
  for (const [type, id, blocks] of [
    ...lessons.map((l) => ['LESSON', l.lessonId, l.blocks] as const),
    ...chapters.map((c) => ['CHAPTER', c.chapterId, c.blocks] as const),
  ]) {
    const n = APPLY ? await rebuildUsage(prisma, type, id, blocks) : (await countEntryRefs(prisma, blocks)).size;
    if (n) targets++;
    rows += n;
  }
  console.log(`${lessons.length} bài học, ${chapters.length} chương; ${targets} có tham chiếu, ${rows} dòng chỉ mục ${APPLY ? 'đã ghi' : 'sẽ ghi'}.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
