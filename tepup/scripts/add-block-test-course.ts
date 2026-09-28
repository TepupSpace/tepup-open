/**
 * Seed the "Sandbox Block" course — a scratch course for trying out block types.
 *
 * It exists to exercise the editor and the player, not to teach anything. Lesson 1
 * carries the three new interactive blocks (Nối cặp / Lật thẻ / Phân loại vào rổ),
 * lesson 2 is deliberately empty so there is a blank canvas to author into.
 *
 * The course is created with `isActive: false`. Learner-facing queries in
 * `lib/services/content-service.ts` filter on `isActive: true`, so it stays
 * invisible on the public site while remaining fully editable in /admin. Flip the
 * toggle in admin when you want to walk the learner flow.
 *
 * Everything is upserted by slug, so re-running is safe and idempotent — but note
 * that re-running RESETS lesson 1's blocks back to the fixtures below, discarding
 * edits made in admin. Lesson 2 is only created once and never overwritten.
 *
 *   npx tsx scripts/add-block-test-course.ts --env=<path>              # dry run
 *   npx tsx scripts/add-block-test-course.ts --env=<path> --apply      # writes
 *
 * `--env` is REQUIRED and must be given explicitly — this script can target the live
 * production database, so there is no default and no silent fallback to `.env`.
 *
 *   staging:    --env=.env
 *   production: --env='tepup-(.env)/.env.production'
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import type { ContentBlock } from '../lib/types/content';

// ─── args ─────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
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

// ─── structure ────────────────────────────────────────────────────────────────

const CATEGORY = {
  slug: 'sandbox',
  name: 'Sandbox',
  description: 'Khu vực thử nghiệm nội bộ — không dành cho học viên.',
  icon: 'flask-conical',
  sortOrder: 99,
};

const COURSE = {
  slug: 'sandbox-block',
  name: 'Sandbox Block',
  description: 'Khoá thử nghiệm để test các loại block. Không phải nội dung học thật.',
  icon: 'puzzle',
  sortOrder: 99,
  // Hidden from learners; content-service filters on isActive.
  isActive: false,
};

const LEVEL_NAME = 'Thử nghiệm';

// ─── lesson 1 blocks ──────────────────────────────────────────────────────────

/**
 * One of each new block, plus a step-break so the player's reveal gating is
 * exercised too: the three exercises sit in separate reveal groups, which is how
 * you can tell whether each one really unlocks the Continue button on its own.
 */
const LESSON_1_BLOCKS: ContentBlock[] = [
  {
    type: 'text',
    paragraphs: [
      'Bài này chỉ để thử ba loại block mới. Nội dung không có giá trị học thuật — cứ sửa thoải mái.',
    ],
  },
  {
    type: 'callout',
    variant: 'info',
    title: 'Cách test',
    text: 'Mỗi bài tập nằm ở một bước riêng. Nút "Tiếp tục" phải bị khoá cho tới khi bạn làm xong bài tập của bước đó.',
  },

  { type: 'step-break' },

  {
    type: 'pair-match',
    title: 'Nối khái niệm với định nghĩa',
    instruction: 'Chạm một mục bên trái, rồi chạm mục tương ứng bên phải.',
    pairs: [
      { id: 'p1', left: 'Lạm phát', right: 'Mức giá chung tăng lên theo thời gian' },
      { id: 'p2', left: 'GDP', right: 'Tổng giá trị hàng hoá và dịch vụ trong nước' },
      { id: 'p3', left: 'Thất nghiệp', right: 'Người muốn làm việc nhưng chưa có việc làm' },
      { id: 'p4', left: 'Thuế luỹ tiến', right: 'Thu nhập càng cao thì tỷ lệ đóng càng lớn' },
    ],
  },

  { type: 'step-break' },

  {
    type: 'flip-card',
    title: 'Thuật ngữ cần nhớ',
    instruction: 'Chạm vào từng thẻ để xem nội dung phía sau. Phải lật hết mới đi tiếp được.',
    cards: [
      {
        id: 'c1',
        front: { kind: 'text', text: 'Thiên kiến xác nhận' },
        back: { kind: 'text', text: 'Xu hướng chỉ tìm và tin thông tin **ủng hộ** điều mình đã tin sẵn.' },
      },
      {
        id: 'c2',
        front: { kind: 'text', text: 'Nguỵ biện người rơm' },
        back: { kind: 'text', text: 'Bóp méo lập luận của đối phương thành phiên bản dễ đánh đổ hơn.' },
      },
      {
        id: 'c3',
        front: { kind: 'text', text: 'Hiệu ứng mỏ neo' },
        back: { kind: 'text', text: 'Con số đầu tiên nghe được kéo mọi ước lượng sau đó về phía nó.' },
      },
      {
        id: 'c4',
        front: { kind: 'text', text: 'Nguỵ biện chi phí chìm' },
        back: { kind: 'text', text: 'Cố theo tiếp chỉ vì đã lỡ bỏ vào quá nhiều, dù biết nên dừng.' },
      },
    ],
  },

  { type: 'step-break' },

  {
    type: 'sort-bucket',
    title: 'Xếp khoản chi vào đúng nhóm',
    // No instruction on purpose: the block's own default text stays in sync with
    // what the block can actually do (it gained drag-and-drop after this seed ran).
    buckets: [
      { id: 'b1', label: 'Nhu cầu thiết yếu' },
      { id: 'b2', label: 'Mong muốn' },
    ],
    items: [
      { id: 'i1', text: 'Tiền thuê nhà', bucketId: 'b1' },
      { id: 'i2', text: 'Vé xem phim', bucketId: 'b2' },
      { id: 'i3', text: 'Hoá đơn điện nước', bucketId: 'b1' },
      { id: 'i4', text: 'Điện thoại đời mới nhất', bucketId: 'b2' },
      { id: 'i5', text: 'Bảo hiểm y tế', bucketId: 'b1' },
      { id: 'i6', text: 'Cà phê mang đi mỗi sáng', bucketId: 'b2' },
    ],
  },

  { type: 'step-break' },

  {
    type: 'callout',
    variant: 'success',
    title: 'Xong',
    text: 'Nếu bạn tới được đây thì cả ba block đều mở khoá đúng.',
  },
];

const LESSONS = [
  { slug: 'ba-block-moi', name: 'Ba block mới', blocks: LESSON_1_BLOCKS },
  { slug: 'trang-trong', name: 'Trang trống để tự soạn', blocks: null },
];

// ─── run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nTarget: ${targetLabel}  (${envPath})`);
  console.log(`Mode:   ${APPLY ? 'APPLY — will write' : 'DRY RUN — no writes'}\n`);

  const existing = await prisma.course.findUnique({
    where: { slug: COURSE.slug },
    include: { lessons: { select: { slug: true } } },
  });
  console.log(
    existing
      ? `  Course "${COURSE.slug}" already exists (${existing.lessons.length} lesson) — will be updated.`
      : `  Course "${COURSE.slug}" does not exist yet — will be created.`
  );
  console.log(`  Category: ${CATEGORY.slug}`);
  console.log(`  Lessons:  ${LESSONS.map((l) => l.slug).join(', ')}`);
  console.log(`  Blocks in "${LESSONS[0].slug}": ${LESSON_1_BLOCKS.length}`);
  console.log(`  isActive: ${COURSE.isActive} (ẩn khỏi học viên)\n`);

  if (!APPLY) {
    console.log('  Dry run — nothing was written. Re-run with --apply to commit.\n');
    return;
  }

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    create: CATEGORY,
    update: { name: CATEGORY.name, description: CATEGORY.description, icon: CATEGORY.icon },
  });
  console.log(`  ✓ category ${category.slug}`);

  const course = await prisma.course.upsert({
    where: { slug: COURSE.slug },
    create: { ...COURSE, categoryId: category.id },
    update: {
      name: COURSE.name,
      description: COURSE.description,
      icon: COURSE.icon,
      isActive: COURSE.isActive,
      categoryId: category.id,
    },
  });
  console.log(`  ✓ course ${course.slug} (isActive=${course.isActive})`);

  // Level has no unique key beyond id, so reuse by name rather than upserting.
  const level =
    (await prisma.level.findFirst({ where: { courseId: course.id, name: LEVEL_NAME } })) ??
    (await prisma.level.create({ data: { name: LEVEL_NAME, courseId: course.id, sortOrder: 0 } }));
  console.log(`  ✓ level ${level.name}`);

  for (const [index, lesson] of LESSONS.entries()) {
    const saved = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: course.id, slug: lesson.slug } },
      create: {
        slug: lesson.slug,
        name: lesson.name,
        levelId: level.id,
        courseId: course.id,
        sortOrder: index,
        isActive: true,
      },
      update: { name: lesson.name, levelId: level.id, sortOrder: index },
    });

    if (lesson.blocks) {
      await prisma.lessonContent.upsert({
        where: { lessonId: saved.id },
        create: { lessonId: saved.id, title: lesson.name, blocks: lesson.blocks as never },
        update: { title: lesson.name, blocks: lesson.blocks as never },
      });
      console.log(`  ✓ lesson ${lesson.slug} (${lesson.blocks.length} blocks)`);
    } else {
      // Left without LessonContent on purpose: the player shows "chưa có nội dung"
      // and the admin editor opens on an empty canvas.
      console.log(`  ✓ lesson ${lesson.slug} (no content — blank canvas)`);
    }
  }

  console.log(`\n  Done. Sửa tại /admin/courses → ${COURSE.name}\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
