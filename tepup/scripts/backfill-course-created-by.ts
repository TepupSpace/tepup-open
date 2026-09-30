/**
 * Điền Course.createdById cho các khoá contributor đã được duyệt trước khi có cột này.
 *
 * Contributor chỉ xem được bài đang ẩn trong khoá do chính họ tạo, nên một khoá cũ
 * thiếu createdById nghĩa là tác giả của nó không xem được bài ẩn (reviewer/admin
 * thì vẫn xem được hết). Khoá admin tự tạo từ trước thì để trống.
 *
 * Cách khớp: mỗi contribution NEW_COURSE đã APPROVED ↔ khoá có đúng tên đó, chưa có
 * createdById, và được tạo trong vòng 10 phút quanh lúc duyệt (publishNewCourse tạo
 * khoá ngay sau khi claim). Khớp 0 hoặc nhiều hơn 1 khoá thì bỏ qua và in ra để xử lý tay.
 *
 * Chạy SQL prisma/sql/2026-10-01-course-created-by.sql trước.
 *
 * Chạy thử:  npx tsx scripts/backfill-course-created-by.ts --env=.env
 * Ghi thật:  npx tsx scripts/backfill-course-created-by.ts --env=.env --apply
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const APPLY = process.argv.includes('--apply');
const MATCH_WINDOW_MS = 10 * 60_000;

const envArg = process.argv.find((a) => a.startsWith('--env='));
if (!envArg) {
  console.error('ERROR: --env=<path to env file> is required.');
  console.error("  staging:    --env=.env");
  console.error("  production: --env='tepup-(.env)/.env.production'");
  process.exit(1);
}

const envPath = envArg.slice('--env='.length);
const parsed = dotenv.config({ path: envPath, override: true });
const databaseUrl = parsed.parsed?.DATABASE_URL;
if (!databaseUrl) {
  console.error(`ERROR: no DATABASE_URL found in ${envPath}`);
  process.exit(1);
}

const projectRef = databaseUrl.match(/postgres\.([a-z]+)/)?.[1] ?? 'unknown';
const KNOWN: Record<string, string> = {}; // add your Supabase project refs: { '<ref>': 'STAGING' | 'PRODUCTION' }
const targetLabel = KNOWN[projectRef as keyof typeof KNOWN] ?? `UNKNOWN (${projectRef})`;

const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 15_000 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['error'] });

async function main() {
  console.log(`Target : ${targetLabel}`);
  console.log(APPLY ? 'Mode   : APPLY\n' : 'Mode   : dry run (add --apply to write)\n');

  const contributions = await prisma.contribution.findMany({
    where: { type: 'NEW_COURSE', status: 'APPROVED' },
    select: { id: true, contributorId: true, data: true, resolvedAt: true },
    orderBy: { resolvedAt: 'asc' },
  });

  const unowned = await prisma.course.findMany({
    where: { createdById: null },
    select: { id: true, slug: true, name: true, createdAt: true },
  });

  const claimed = new Set<string>();
  const updates: { courseId: string; slug: string; contributorId: string }[] = [];

  for (const c of contributions) {
    const name = (c.data as { course?: { name?: string } } | null)?.course?.name?.trim();
    if (!name || !c.resolvedAt) {
      console.log(`  skip ${c.id}: không có tên khoá hoặc resolvedAt`);
      continue;
    }
    const resolvedAt = c.resolvedAt.getTime();
    const candidates = unowned.filter(
      (course) =>
        !claimed.has(course.id) &&
        course.name.trim() === name &&
        Math.abs(course.createdAt.getTime() - resolvedAt) <= MATCH_WINDOW_MS
    );
    if (candidates.length !== 1) {
      console.log(`  skip ${c.id} "${name}": ${candidates.length} khoá khớp`);
      continue;
    }
    const course = candidates[0];
    claimed.add(course.id);
    updates.push({ courseId: course.id, slug: course.slug, contributorId: c.contributorId });
    console.log(`  ${course.slug} ← contributor ${c.contributorId}`);
  }

  console.log(`\n${updates.length}/${contributions.length} contribution khớp được một khoá.`);

  if (!APPLY || updates.length === 0) return;

  for (const u of updates) {
    // Chỉ ghi khi vẫn còn trống, để chạy lại không đè lên giá trị đã có.
    await prisma.course.updateMany({
      where: { id: u.courseId, createdById: null },
      data: { createdById: u.contributorId },
    });
  }
  console.log('Đã ghi.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
