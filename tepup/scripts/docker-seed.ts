/**
 * Demo content for the local Docker stack (compose.yaml): an admin account, a visible and a
 * hidden lesson, and a story chapter, enough to exercise the learner pages and the admin
 * editors. Idempotent (upserts by slug).
 *
 * Unlike the other scripts there is no --env: it only ever runs inside the Docker stack,
 * and refuses anything else (TEPUP_LOCAL_DOCKER=1 and a database host of `db`).
 * docker/entrypoint.mjs runs it with --apply; without --apply it only prints the target.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const APPLY = process.argv.includes('--apply');
const url = process.env.DIRECT_URL || '';
const host = url ? new URL(url).hostname : '';

if (process.env.TEPUP_LOCAL_DOCKER !== '1' || host !== 'db') {
  console.error('docker-seed.ts only runs inside the local Docker stack (compose.yaml). Refusing.');
  process.exit(1);
}
console.log(`Target: LOCAL DOCKER database (host ${host})${APPLY ? '' : ' (dry run: pass --apply)'}`);
if (!APPLY) process.exit(0);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const text = (title: string, ...paragraphs: string[]) => ({ type: 'text' as const, title, paragraphs });
const question = (q: string, options: [string, boolean][]) => ({
  type: 'question' as const,
  question: q,
  options: options.map(([t, isCorrect], i) => ({ id: `o${i + 1}`, text: t, isCorrect })),
  explanation: 'Đây là bài học mẫu cho môi trường thử nghiệm local.',
});

async function main() {
  const password = process.env.LOCAL_ADMIN_PASSWORD || 'tepup-local-admin';
  await prisma.user.upsert({
    where: { username: 'admin' },
    create: { username: 'admin', name: 'Admin (local)', role: 'ADMIN', password: await bcrypt.hash(password, 10) },
    update: { role: 'ADMIN', isBanned: false, password: await bcrypt.hash(password, 10) },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'demo' },
    create: { slug: 'demo', name: 'Demo', description: 'Nội dung mẫu cho local' },
    update: {},
  });
  const course = await prisma.course.upsert({
    where: { slug: 'demo-101' },
    create: { slug: 'demo-101', name: 'Demo 101', description: 'Khoá học mẫu (local)', categoryId: category.id },
    update: {},
  });
  let level = await prisma.level.findFirst({ where: { courseId: course.id, name: 'Cấp 1' } });
  level ??= await prisma.level.create({ data: { courseId: course.id, name: 'Cấp 1', sortOrder: 0 } });

  const lessons = [
    {
      slug: 'bai-hoc-mau',
      name: 'Bài học mẫu',
      isActive: true,
      blocks: [
        question('Câu hỏi mở đầu: thuế là gì?', [['Một khoản đóng góp bắt buộc', true], ['Một món quà', false], ['Một khoản vay', false], ['Không gì cả', false]]),
        text('Ý chính', 'Đoạn văn mẫu để thử trình soạn thảo.', 'Đoạn thứ hai.'),
        { type: 'callout' as const, variant: 'success' as const, title: 'Tóm tắt', text: 'Kết thúc bài học mẫu.' },
      ],
    },
    { slug: 'bai-hoc-an', name: 'Bài học đang ẩn', isActive: false, blocks: [text('Bản nháp', 'Bài này đang ẩn với người học.')] },
  ];
  for (const [i, l] of lessons.entries()) {
    const lesson = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: course.id, slug: l.slug } },
      create: { slug: l.slug, name: l.name, isActive: l.isActive, sortOrder: i, courseId: course.id, levelId: level.id },
      update: {},
    });
    await prisma.lessonContent.upsert({
      where: { lessonId: lesson.id },
      create: { lessonId: lesson.id, title: l.name, blocks: l.blocks },
      update: {},
    });
  }

  const character = await prisma.character.upsert({
    where: { slug: 'nhan-vat-mau' },
    create: { slug: 'nhan-vat-mau', name: 'Nhân vật mẫu', role: 'Sinh viên' },
    update: {},
  });
  const story = await prisma.story.upsert({
    where: { slug: 'cau-chuyen-mau' },
    create: { slug: 'cau-chuyen-mau', title: 'Câu chuyện mẫu', characterId: character.id },
    update: {},
  });
  let part = await prisma.storyPart.findFirst({ where: { storyId: story.id } });
  part ??= await prisma.storyPart.create({ data: { storyId: story.id, name: 'Phần 1' } });
  const chapter = await prisma.chapter.upsert({
    where: { storyId_slug: { storyId: story.id, slug: 'chuong-1' } },
    create: { slug: 'chuong-1', title: 'Chương 1', partId: part.id, storyId: story.id },
    update: {},
  });
  await prisma.chapterContent.upsert({
    where: { chapterId: chapter.id },
    create: { chapterId: chapter.id, title: 'Chương 1', blocks: [text('Mở đầu', 'Chương mẫu để thử trình soạn thảo chương.')] },
    update: {},
  });

  console.log('Seeded: admin, course demo-101 (1 visible + 1 hidden lesson), story cau-chuyen-mau (1 chapter).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
