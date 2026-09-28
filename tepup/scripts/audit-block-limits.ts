/**
 * Rà độ dài nội dung của các block tương tác đang nằm trong database.
 *
 * Chỉ ĐỌC — không ghi gì vào database. In báo cáo ra màn hình và lưu toàn văn bản
 * gốc của mọi chỗ vi phạm ra `_backups/` để còn đối chiếu và quay lui.
 *
 * Chạy:
 *   npx tsx scripts/audit-block-limits.ts               # staging (theo .env)
 *   npx tsx scripts/audit-block-limits.ts --production  # production
 *
 * Block nằm ở hai bảng — LessonContent (Khoá học) và ChapterContent (Truyện) —
 * bỏ sót một bảng là bỏ sót nửa nội dung.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLIP_CARD_LIMITS, PAIR_MATCH_LIMITS, isPairLopsided, pairLineGap } from '../lib/blockLimits';

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

type Violation = {
  source: 'lesson' | 'chapter';
  recordId: string;
  where: string;
  blockIndex: number;
  /** Đường dẫn tới đúng chuỗi bị vi phạm bên trong block. */
  path: string;
  kind: string;
  length: number;
  limit: number;
  text: string;
};

function auditBlocks(
  blocks: unknown,
  source: Violation['source'],
  recordId: string,
  where: string
): Violation[] {
  if (!Array.isArray(blocks)) return [];
  const out: Violation[] = [];

  blocks.forEach((block: any, blockIndex: number) => {
    const base = { source, recordId, where, blockIndex };

    if (block?.type === 'pair-match' && Array.isArray(block.pairs)) {
      block.pairs.forEach((pair: any, i: number) => {
        const left = String(pair?.left ?? '');
        const right = String(pair?.right ?? '');

        if (left.length > PAIR_MATCH_LIMITS.left)
          out.push({ ...base, path: `pairs[${i}].left`, kind: 'vế trái quá dài',
                     length: left.length, limit: PAIR_MATCH_LIMITS.left, text: left });

        if (right.length > PAIR_MATCH_LIMITS.right)
          out.push({ ...base, path: `pairs[${i}].right`, kind: 'vế phải quá dài',
                     length: right.length, limit: PAIR_MATCH_LIMITS.right, text: right });

        // Lệch tỉ lệ là lỗi riêng: hai vế có thể đều trong ngưỡng mà vẫn lệch trông thấy.
        if (isPairLopsided(left, right))
          out.push({ ...base, path: `pairs[${i}].right`,
                     kind: `chênh ${pairLineGap(left, right)} dòng so với "${left}"`,
                     length: right.length, limit: PAIR_MATCH_LIMITS.right, text: right });
      });
    }

    if (block?.type === 'flip-card' && Array.isArray(block.cards)) {
      block.cards.forEach((card: any, i: number) => {
        for (const side of ['front', 'back'] as const) {
          const face = card?.[side];
          if (face?.kind !== 'text') continue;
          const text = String(face.text ?? '');
          if (text.length > FLIP_CARD_LIMITS.face)
            out.push({ ...base, path: `cards[${i}].${side}.text`,
                       kind: `mặt ${side === 'front' ? 'trước' : 'sau'} quá dài`,
                       length: text.length, limit: FLIP_CARD_LIMITS.face, text });
        }
      });
    }
  });

  return out;
}

async function main() {
  console.log(`\nĐang rà: ${USE_PRODUCTION ? 'PRODUCTION' : 'staging'}\n`);

  const lessons = await prisma.lessonContent.findMany({
    select: { id: true, blocks: true, lesson: { select: { name: true, course: { select: { name: true } } } } },
  });
  const chapters = await prisma.chapterContent.findMany({
    select: { id: true, blocks: true, chapter: { select: { title: true, story: { select: { title: true } } } } },
  });

  const violations = [
    ...lessons.flatMap((l) =>
      auditBlocks(l.blocks, 'lesson', l.id, `${l.lesson?.course?.name ?? '?'} › ${l.lesson?.name ?? '?'}`)
    ),
    ...chapters.flatMap((c) =>
      auditBlocks(c.blocks, 'chapter', c.id, `${c.chapter?.story?.title ?? '?'} › ${c.chapter?.title ?? '?'}`)
    ),
  ];

  console.log(`Đã quét ${lessons.length} bài học và ${chapters.length} chương truyện.`);
  console.log(`Tìm thấy ${violations.length} chỗ vượt ngưỡng.\n`);

  for (const v of violations) {
    console.log(`  [${v.source}] ${v.where}`);
    console.log(`    block #${v.blockIndex} · ${v.path} · ${v.kind} (${v.length}/${v.limit})`);
    console.log(`    ${v.text}\n`);
  }

  // Lưu cả bản ghi gốc đầy đủ, không chỉ đoạn vi phạm — đây là mốc để quay lui.
  const affected = new Set(violations.map((v) => `${v.source}:${v.recordId}`));
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = join(ROOT, '..', '_backups', `block-limits-audit-${USE_PRODUCTION ? 'prod' : 'staging'}-${stamp}.json`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        scannedAt: new Date().toISOString(),
        database: USE_PRODUCTION ? 'production' : 'staging',
        limits: { pairMatch: PAIR_MATCH_LIMITS, flipCard: FLIP_CARD_LIMITS },
        violations,
        originals: [
          ...lessons.filter((l) => affected.has(`lesson:${l.id}`)).map((l) => ({ source: 'lesson', id: l.id, blocks: l.blocks })),
          ...chapters.filter((c) => affected.has(`chapter:${c.id}`)).map((c) => ({ source: 'chapter', id: c.id, blocks: c.blocks })),
        ],
      },
      null,
      2
    ),
    'utf-8'
  );
  console.log(`Bản gốc đã lưu: ${outPath}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
