/**
 * Rà mọi block đang nằm trong database bằng schema ở `lib/schemas/blocks.ts`.
 *
 * Chỉ ĐỌC. Kiểm đúng như các route lưu bài (chuẩn hoá trước rồi mới kiểm): bản ghi
 * nào có lỗi ở đây thì người soạn sẽ không lưu được bài đó cho tới khi sửa block.
 * Các loại block không có schema (loại cũ, không render) được liệt kê riêng.
 *
 * Chạy:
 *   npx tsx scripts/audit-block-schemas.ts               # staging (theo .env)
 *   npx tsx scripts/audit-block-schemas.ts --production  # production
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isKnownBlockType } from '../lib/schemas/blocks';
import { prepareBlocksForSave } from '../lib/ai-import/normalize';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const USE_PRODUCTION = process.argv.includes('--production');

// `.env` trỏ vào staging. Production phải được nạp tường minh, không bao giờ mặc định.
loadEnv({
  path: USE_PRODUCTION ? join(ROOT, 'tepup-(.env)', '.env.production') : join(ROOT, '.env'),
  override: true,
});

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Không tìm thấy DATABASE_URL trong file env tương ứng.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log(`\nĐang rà schema: ${USE_PRODUCTION ? 'PRODUCTION' : 'staging'}\n`);

  const lessons = await prisma.lessonContent.findMany({
    select: { id: true, blocks: true, lesson: { select: { name: true, course: { select: { name: true } } } } },
  });
  const chapters = await prisma.chapterContent.findMany({
    select: { id: true, blocks: true, chapter: { select: { title: true, story: { select: { title: true } } } } },
  });
  const contributions = await prisma.contribution.findMany({
    where: { status: { in: ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED'] } },
    select: { id: true, type: true, data: true },
  });

  const records = [
    ...lessons.map((l) => ({
      where: `[lesson] ${l.lesson?.course?.name ?? '?'} › ${l.lesson?.name ?? '?'} (${l.id})`,
      errors: checkBlocks(l.blocks),
    })),
    ...chapters.map((c) => ({
      where: `[chapter] ${c.chapter?.story?.title ?? '?'} › ${c.chapter?.title ?? '?'} (${c.id})`,
      errors: checkBlocks(c.blocks),
    })),
    ...contributions.map((c) => ({
      where: `[contribution ${c.type}] ${c.id}`,
      errors: contributionBlockErrors(c.data),
    })),
  ];

  const legacy = new Map<string, number>();
  const tallyLegacy = (blocks: unknown) => {
    if (!Array.isArray(blocks)) return;
    for (const b of blocks) {
      const t = (b as { type?: unknown } | null)?.type;
      if (!isKnownBlockType(t)) legacy.set(String(t), (legacy.get(String(t)) ?? 0) + 1);
    }
  };
  lessons.forEach((l) => tallyLegacy(l.blocks));
  chapters.forEach((c) => tallyLegacy(c.blocks));

  const bad = records.filter((r) => r.errors.length);
  const byType = new Map<string, number>();
  for (const r of bad) {
    for (const e of r.errors) {
      const t = e.match(/^Block #\d+ \(([^)]+)\)/)?.[1] ?? '?';
      byType.set(t, (byType.get(t) ?? 0) + 1);
    }
  }

  console.log(
    `Đã quét ${lessons.length} bài học, ${chapters.length} chương truyện, ${contributions.length} đóng góp đang mở.`
  );
  console.log(`${bad.length} bản ghi có lỗi schema.\n`);
  for (const r of bad) {
    console.log(`  ${r.where}`);
    for (const e of r.errors) console.log(`    ${e}`);
  }
  if (byType.size) {
    console.log('\nSố lỗi theo loại block:');
    for (const [t, n] of [...byType].sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);
  }
  if (legacy.size) {
    console.log('\nBlock loại cũ không có schema (được giữ nguyên, không chặn lưu):');
    for (const [t, n] of [...legacy].sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);
  }
}

function checkBlocks(blocks: unknown): string[] {
  return prepareBlocksForSave(blocks).errors;
}

function contributionBlockErrors(data: unknown): string[] {
  const d = data as { blocks?: unknown; levels?: { lessons?: { content?: { blocks?: unknown } }[] }[] } | null;
  if (!d) return [];
  if (d.blocks !== undefined) return checkBlocks(d.blocks);
  return (d.levels ?? []).flatMap((lv) =>
    (lv.lessons ?? []).flatMap((ls) => (ls.content?.blocks !== undefined ? checkBlocks(ls.content.blocks) : []))
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
