/**
 * Tách tiêu đề cũ của block `text` (`{ type: 'text', title, paragraphs }`) thành một block
 * `heading` cấp 2 riêng, đặt ngay trước block text (block text giữ nguyên, chỉ bỏ `title`).
 *
 * Vì sao: nội dung seed cũ đặt tiêu đề trong `text.title`. Trang học hiển thị nó như H2, nhưng
 * nó không phải block heading, nên bảng "Tiến độ › Bài này" (chỉ đọc block heading) báo bài
 * "chưa chia thành các phần". Trình soạn thảo vốn đã tách như vậy khi mở bài
 * (lib/editor/blocknote-converter.ts); script làm trước cho mọi bài/chương. Cấp 2 thay vì 3
 * của editor để giữ đúng giao diện H2 người học đang thấy.
 *
 * - Tiêu đề là chữ thuần (đã kiểm tra: không có markdown/HTML), chỉ cần escape & < >.
 * - Mỗi bài/chương một transaction: khoá dòng (lockLessonContent/lockChapterContent), ghi,
 *   ghi revision SCRIPT (previous = bản cũ), rebuildUsage. `updatedAt` để Prisma tự đổi, nên
 *   editor đang mở bài cũ sẽ nhận 409 khi xuất bản thay vì ghi đè.
 * - Chạy lại không đổi gì (idempotent): block đã tách không còn `title`.
 * - Bản chụp trước khi ghi: ../_backups/split-text-titles-<ref>-<thời điểm>.json
 *
 * Chạy thử (mặc định): npx tsx scripts/split-text-titles.ts --env=.env
 * Ghi thật:            npx tsx scripts/split-text-titles.ts --env='tepup-(.env)/.env.production' --apply
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);
if (!envArg) {
  console.error("Thiếu --env=<đường dẫn>. Staging: --env=.env   Production: --env='tepup-(.env)/.env.production'");
  process.exit(1);
}
const envPath = path.resolve(process.cwd(), envArg);
if (!existsSync(envPath)) {
  console.error(`Không thấy file env: ${envPath}`);
  process.exit(1);
}
config({ path: envPath, quiet: true, override: true });

const dbUrl = process.env.DATABASE_URL ?? '';
const projectRef = dbUrl.match(/postgres\.([a-z0-9]+):/)?.[1] ?? dbUrl.match(/db\.([a-z0-9]+)\.supabase/)?.[1] ?? '(không nhận ra)';
const TARGETS: Record<string, string> = { nreigcbwcvgxwoxzgpbb: 'STAGING', nuvetzmapgwvplsglgik: 'PRODUCTION' };
console.log(`File env : ${envArg}`);
console.log(`Đích     : ${TARGETS[projectRef] ?? 'KHÔNG RÕ'} (${projectRef})`);
console.log(`Chế độ   : ${APPLY ? 'GHI THẬT (--apply)' : 'chạy thử (không ghi)'}`);

type Block = { type?: string; title?: unknown; [key: string]: unknown };

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Trả về mảng block mới và số tiêu đề đã tách (0: không đổi gì). */
export function splitTitles(blocks: Block[]): { blocks: Block[]; count: number } {
  let count = 0;
  const out: Block[] = [];
  for (const b of blocks) {
    const title = b?.type === 'text' && typeof b.title === 'string' ? b.title.trim() : '';
    if (!title) {
      out.push(b);
      continue;
    }
    count++;
    out.push({ type: 'heading', level: 2, html: escapeHtml(title) });
    const { title: _drop, ...rest } = b;
    void _drop;
    const paragraphs = Array.isArray(rest.paragraphs) ? (rest.paragraphs as unknown[]) : [];
    const hasBody = paragraphs.some((p) => typeof p === 'string' && p.trim()) || (typeof rest.html === 'string' && rest.html.trim());
    // Block chỉ có tiêu đề: không để lại block text rỗng (sẽ thành một bước trống).
    if (hasBody) out.push(rest);
  }
  return { blocks: out, count };
}

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { lockLessonContent, lockChapterContent, recordRevision } = await import('../lib/services/revision-service');
  const { rebuildUsage } = await import('../lib/library/usage-service');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  const lessons = await prisma.lessonContent.findMany({
    select: { lessonId: true, title: true, blocks: true, lesson: { select: { name: true, courseId: true } } },
  });
  const chapters = await prisma.chapterContent.findMany({
    select: { chapterId: true, title: true, blocks: true, chapter: { select: { title: true } } },
  });

  type Plan = { kind: 'LESSON' | 'CHAPTER'; id: string; label: string; courseId: string | null; title: string; before: Block[]; count: number };
  const plans: Plan[] = [];
  for (const l of lessons) {
    const before = Array.isArray(l.blocks) ? (l.blocks as Block[]) : [];
    const { count } = splitTitles(before);
    if (count) plans.push({ kind: 'LESSON', id: l.lessonId, label: l.lesson.name, courseId: l.lesson.courseId, title: l.title, before, count });
  }
  for (const c of chapters) {
    const before = Array.isArray(c.blocks) ? (c.blocks as Block[]) : [];
    const { count } = splitTitles(before);
    if (count) plans.push({ kind: 'CHAPTER', id: c.chapterId, label: c.chapter.title, courseId: null, title: c.title, before, count });
  }

  const total = plans.reduce((a, p) => a + p.count, 0);
  console.log(`\nSẽ tách ${total} tiêu đề trong ${plans.filter((p) => p.kind === 'LESSON').length} bài học và ${plans.filter((p) => p.kind === 'CHAPTER').length} chương.`);
  for (const p of plans.slice(0, 10)) console.log(`  ${p.kind === 'LESSON' ? 'Bài ' : 'Chương'} ${p.label}: ${p.count}`);
  if (plans.length > 10) console.log(`  … và ${plans.length - 10} mục nữa`);

  if (!APPLY || plans.length === 0) {
    if (!APPLY) console.log('\nChạy thử xong. Thêm --apply để ghi.');
    await prisma.$disconnect();
    return;
  }

  const backupDir = path.resolve(process.cwd(), '../_backups');
  mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `split-text-titles-${projectRef}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(backupFile, JSON.stringify(plans.map(({ kind, id, label, title, before }) => ({ kind, id, label, title, blocks: before })), null, 1));
  console.log(`\nĐã chụp bản cũ: ${backupFile}`);

  let done = 0;
  let skipped = 0;
  for (const p of plans) {
    await prisma.$transaction(async (tx) => {
      // Đọc lại dưới khoá: có ai vừa sửa thì tách trên bản mới nhất.
      const live = p.kind === 'LESSON' ? await lockLessonContent(tx, p.id) : await lockChapterContent(tx, p.id);
      const liveBlocks = Array.isArray(live?.blocks) ? (live!.blocks as Block[]) : [];
      const { blocks, count } = splitTitles(liveBlocks);
      if (!live || !count) {
        skipped++;
        return;
      }
      if (p.kind === 'LESSON') {
        await tx.lessonContent.update({ where: { lessonId: p.id }, data: { blocks: blocks as object[] } });
      } else {
        await tx.chapterContent.update({ where: { chapterId: p.id }, data: { blocks: blocks as object[] } });
      }
      await recordRevision(tx, {
        targetType: p.kind,
        targetId: p.id,
        courseId: p.courseId,
        label: p.label,
        snapshot: { title: live.title, blocks: blocks as object[] },
        previous: { title: live.title, blocks: liveBlocks as object[] },
        source: 'SCRIPT',
        autoPatrol: true,
      });
      await rebuildUsage(tx, p.kind, p.id, blocks);
      done++;
    }, { timeout: 30_000 });
  }
  console.log(`Xong: ghi ${done} mục, bỏ qua ${skipped} (đã đổi trong lúc chạy).`);
  console.log('Nhớ: nội dung công khai cập nhật sau tối đa ~10 phút (cache), hoặc khi có lượt xuất bản kế tiếp.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
