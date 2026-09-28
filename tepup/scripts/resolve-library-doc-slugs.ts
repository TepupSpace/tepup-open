/**
 * Đổi documentSlug thành documentId trong các block library-document đã nằm ở database.
 *
 * Block tham chiếu tài liệu được soạn ở file tĩnh bằng slug, và lẽ ra được đổi
 * sang id khi migrate — xem resolveLibraryDocSlugs trong scripts/migrate-static-to-db.ts.
 * Một vài script seed sau này ghi thẳng block vào database mà bỏ qua bước đó, để lại
 * những block chỉ có documentSlug.
 *
 * Hậu quả trên giao diện: trình render chỉ nhìn documentId nên không gọi API, và
 * khối trả về null — tài liệu biến mất khỏi bài học mà không báo lỗi gì.
 *
 * Bắt buộc chỉ định --env, không có giá trị mặc định: script này ghi vào database
 * nên không được phép âm thầm nối vào bất kỳ đâu. Nó in ra project ref trước khi
 * làm gì, để còn kịp dừng nếu nhìn thấy nhầm môi trường.
 *
 * Chạy thử:  npx tsx scripts/resolve-library-doc-slugs.ts --env='tepup-(.env)/.env.staging'
 * Ghi thật:  npx tsx scripts/resolve-library-doc-slugs.ts --env='tepup-(.env)/.env.production' --apply
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);

if (!envArg) {
  console.error('Thiếu --env=<đường dẫn>. Ví dụ:');
  console.error("  npx tsx scripts/resolve-library-doc-slugs.ts --env='tepup-(.env)/.env.staging'");
  process.exit(1);
}

const envPath = path.resolve(process.cwd(), envArg);
if (!existsSync(envPath)) {
  console.error(`Không thấy file env: ${envPath}`);
  process.exit(1);
}
config({ path: envPath, quiet: true });

// In ra project ref của Supabase để mắt thường xác nhận được môi trường.
const dbUrl = process.env.DATABASE_URL ?? '';
const projectRef = dbUrl.match(/postgres\.([a-z0-9]+):/)?.[1] ?? dbUrl.match(/db\.([a-z0-9]+)\.supabase/)?.[1] ?? '(không nhận ra)';
console.log(`File env    : ${envArg}`);
console.log(`Project ref : ${projectRef}`);

// Chỉ import kiểu — không kéo gì vào lúc chạy, nên không chạm DATABASE_URL sớm.
import type { Prisma } from '@prisma/client';

interface Block {
  type?: string;
  documentId?: string;
  documentSlug?: string;
  [key: string]: unknown;
}

/** Trả về mảng block mới, hoặc null nếu không có gì phải đổi. */
function resolve(
  blocks: Block[],
  slugToId: Map<string, string>,
  onMissing: (slug: string) => void
): Block[] | null {
  let changed = false;

  const next = blocks.map((block) => {
    if (block?.type !== 'library-document') return block;
    if (block.documentId || !block.documentSlug) return block;

    const id = slugToId.get(block.documentSlug);
    if (!id) {
      onMissing(block.documentSlug);
      return block;
    }

    // Bỏ hẳn documentSlug, giống hệt cách migrate ban đầu làm.
    const { documentSlug: _drop, ...rest } = block;
    changed = true;
    return { ...rest, documentId: id };
  });

  return changed ? next : null;
}

async function main() {
  // Nạp client sau khi env đã vào process.env — client Prisma đọc DATABASE_URL
  // ngay lúc khởi tạo, import tĩnh sẽ nối vào nhầm database.
  const { prisma } = await import('../lib/prisma');

  const docs = await prisma.libraryDocument.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(docs.map((d) => [d.slug, d.id]));
  console.log(`Đã nạp ${docs.length} tài liệu để tra slug.`);
  console.log(APPLY ? 'Chế độ: GHI THẬT\n' : 'Chế độ: chạy thử, không ghi (thêm --apply để ghi)\n');

  let touched = 0;
  const missing = new Set<string>();

  const lessons = await prisma.lessonContent.findMany({ select: { id: true, title: true, blocks: true } });
  for (const row of lessons) {
    const next = resolve((row.blocks as Block[]) ?? [], slugToId, (s) => missing.add(s));
    if (!next) continue;
    touched++;
    console.log(`  bài học: ${row.title}`);
    if (APPLY) {
      await prisma.lessonContent.update({
        where: { id: row.id },
        data: { blocks: next as unknown as Prisma.InputJsonValue },
      });
    }
  }

  const chapters = await prisma.chapterContent.findMany({ select: { id: true, title: true, blocks: true } });
  for (const row of chapters) {
    const next = resolve((row.blocks as Block[]) ?? [], slugToId, (s) => missing.add(s));
    if (!next) continue;
    touched++;
    console.log(`  chương truyện: ${row.title}`);
    if (APPLY) {
      await prisma.chapterContent.update({
        where: { id: row.id },
        data: { blocks: next as unknown as Prisma.InputJsonValue },
      });
    }
  }

  console.log(`\n${touched} nội dung cần đổi.`);
  if (missing.size > 0) {
    console.log(`\nSlug không tìm thấy tài liệu tương ứng (${missing.size}) — phải xử lý tay:`);
    for (const slug of missing) console.log(`  - ${slug}`);
  }
  if (!APPLY && touched > 0) console.log('\nChưa ghi gì cả. Chạy lại với --apply để áp dụng.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
