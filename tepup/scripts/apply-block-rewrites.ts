/**
 * Áp file ánh xạ rút gọn nội dung block vào database.
 *
 * Script KHÔNG tự cắt chữ. Nó chỉ áp đúng những cặp before → after đã được soạn tay
 * và soát trước trong `scripts/rewrites/*.json`. Trước khi ghi, nó kiểm tra chuỗi
 * `before` còn khớp nguyên vẹn với dữ liệu hiện tại — lệch một ký tự là dừng toàn bộ,
 * vì điều đó nghĩa là nội dung đã đổi kể từ lúc rà và bản rút gọn không còn đáng tin.
 *
 * Chạy:
 *   npx tsx scripts/apply-block-rewrites.ts <file.json>               # thử khan, không ghi
 *   npx tsx scripts/apply-block-rewrites.ts <file.json> --write       # ghi vào staging
 *   npx tsx scripts/apply-block-rewrites.ts <file.json> --write --production
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const mapPath = args.find((a) => !a.startsWith('--'));
const WRITE = args.includes('--write');
const USE_PRODUCTION = args.includes('--production');

if (!mapPath) {
  console.error('Thiếu đường dẫn file ánh xạ.');
  process.exit(1);
}

loadEnv({
  path: USE_PRODUCTION ? join(ROOT, 'tepup-(.env)', '.env.production') : join(ROOT, '.env'),
  override: true,
});

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Không tìm thấy DATABASE_URL.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type Rewrite = {
  source: 'lesson' | 'chapter';
  recordId: string;
  where: string;
  blockIndex: number;
  path: string;
  before: string;
  after: string;
};

/** Đi theo đường dẫn kiểu `pairs[0].right` / `cards[2].back.text` tới ô chứa chuỗi. */
function resolvePath(block: any, path: string): { holder: any; key: string | number } {
  const parts = path.split('.').flatMap((seg) => {
    const m = seg.match(/^(\w+)\[(\d+)\]$/);
    return m ? [m[1], Number(m[2])] : [seg];
  });
  let cur = block;
  for (const part of parts.slice(0, -1)) cur = cur?.[part as keyof typeof cur];
  return { holder: cur, key: parts[parts.length - 1] as string | number };
}

async function main() {
  const map = JSON.parse(readFileSync(resolve(mapPath!), 'utf-8')) as { rewrites: Rewrite[] };
  console.log(
    `\n${map.rewrites.length} chỗ · ${USE_PRODUCTION ? 'PRODUCTION' : 'staging'} · ` +
      `${WRITE ? 'GHI THẬT' : 'thử khan (không ghi)'}\n`
  );

  // Gom theo bản ghi: mỗi bản ghi chỉ đọc một lần và ghi lại một lần.
  const byRecord = new Map<string, Rewrite[]>();
  for (const r of map.rewrites) {
    const k = `${r.source}:${r.recordId}`;
    byRecord.set(k, [...(byRecord.get(k) ?? []), r]);
  }

  const backups: unknown[] = [];
  const pending: { source: string; id: string; blocks: unknown; count: number; where: string }[] = [];

  for (const [k, items] of byRecord) {
    const [source, id] = k.split(':') as ['lesson' | 'chapter', string];
    const row =
      source === 'lesson'
        ? await prisma.lessonContent.findUnique({ where: { id }, select: { blocks: true } })
        : await prisma.chapterContent.findUnique({ where: { id }, select: { blocks: true } });

    if (!row) throw new Error(`Không tìm thấy ${k}`);
    backups.push({ source, id, blocks: row.blocks });

    const blocks = structuredClone(row.blocks) as any[];
    for (const r of items) {
      const { holder, key } = resolvePath(blocks[r.blockIndex], r.path);
      const current = holder?.[key as keyof typeof holder];
      // Chốt chặn: nội dung phải còn đúng như lúc rà, nếu không thì bản rút gọn đã lỗi thời.
      if (current !== r.before) {
        console.error(`\n✗ Nội dung đã đổi kể từ lúc rà — dừng, không ghi gì cả.`);
        console.error(`  ${r.where} · block #${r.blockIndex} · ${r.path}`);
        console.error(`  mong đợi: ${r.before}`);
        console.error(`  hiện tại: ${current}`);
        process.exit(1);
      }
      holder[key] = r.after;
      console.log(`  ✓ ${r.where} · block #${r.blockIndex} · ${r.path}  (${r.before.length} → ${r.after.length})`);
    }
    pending.push({ source, id, blocks, count: items.length, where: items[0].where });
  }

  if (!WRITE) {
    console.log('\nThử khan xong — chưa ghi gì. Thêm --write để ghi thật.');
    return;
  }

  // Sao lưu trước khi chạm vào database. Đây là mốc để quay lui.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(ROOT, '..', '_backups', `pre-rewrite-${USE_PRODUCTION ? 'prod' : 'staging'}-${stamp}.json`);
  mkdirSync(dirname(backupPath), { recursive: true });
  writeFileSync(backupPath, JSON.stringify(backups, null, 2), 'utf-8');
  console.log(`\nĐã sao lưu bản gốc: ${backupPath}`);

  for (const p of pending) {
    if (p.source === 'lesson') {
      await prisma.lessonContent.update({ where: { id: p.id }, data: { blocks: p.blocks as never } });
    } else {
      await prisma.chapterContent.update({ where: { id: p.id }, data: { blocks: p.blocks as never } });
    }
    console.log(`  đã ghi · ${p.where} (${p.count} chỗ)`);
  }
  console.log(`\nXong: ${map.rewrites.length} chỗ trong ${pending.length} bản ghi.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
