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

/** Same as LICENCE_VERSION in lib/licence.ts (scripts don't import app code). */
const LICENCE = 'CC-BY-SA-4.0/2026-10';

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
    create: {
      username: 'admin',
      name: 'Admin (local)',
      role: 'ADMIN',
      password: await bcrypt.hash(password, 10),
      licenceVersion: LICENCE,
      licenceAcceptedAt: new Date(),
      publicHandle: 'adm01',
    },
    update: { role: 'ADMIN', isBanned: false, password: await bcrypt.hash(password, 10) },
  });

  // Real content was imported (scripts/docker-import-content.sh): keep the admin account
  // but don't mix the demo course and story into it.
  const otherCourses = await prisma.course.count({ where: { slug: { not: 'demo-101' } } });
  const demoExists = (await prisma.course.count({ where: { slug: 'demo-101' } })) > 0;
  if (otherCourses > 0 && !demoExists) {
    console.log('Seeded: admin. Skipped demo content: the database already holds imported courses.');
    return;
  }

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

  await seedContributorDemo(course.id, category.id);

  console.log('Seeded: admin, course demo-101 (1 visible + 1 hidden lesson), story cau-chuyen-mau (1 chapter).');
}

/**
 * Demo accounts for the contributor system (local only; password `tepup-local-demo`):
 *   ctv, ctv2        AUTHOR
 *   ctvtincay        TRUSTED_AUTHOR
 *   duytri           AUTHOR, COURSE_LEAD of demo-101
 *   chuyengia        AUTHOR, TRUSTED_REVIEWER of demo-101 (profile: "Luật sư", not verified)
 *   nguoiduyet       REVIEWER (global)
 *   admin2           ADMIN (a second admin, for the last-admin rules)
 * Plus course demo-202 (one visible, one hidden lesson; nobody has a role on it), a library
 * entry `muc-tu-mau`, and an ACCEPTED reader suggestion on bai-hoc-mau to claim.
 */
async function seedContributorDemo(demoCourseId: string, categoryId: string) {
  const demoPassword = await bcrypt.hash('tepup-local-demo', 10);
  const accounts: { username: string; role: 'AUTHOR' | 'TRUSTED_AUTHOR' | 'REVIEWER' | 'ADMIN'; handle: string }[] = [
    { username: 'ctv', role: 'AUTHOR', handle: 'ctv01' },
    { username: 'ctv2', role: 'AUTHOR', handle: 'ctv02' },
    { username: 'ctvtincay', role: 'TRUSTED_AUTHOR', handle: 'tin01' },
    { username: 'duytri', role: 'AUTHOR', handle: 'dtr01' },
    { username: 'chuyengia', role: 'AUTHOR', handle: 'cgi01' },
    { username: 'nguoiduyet', role: 'REVIEWER', handle: 'ngd01' },
    { username: 'admin2', role: 'ADMIN', handle: 'adm02' },
  ];
  const ids: Record<string, string> = {};
  for (const a of accounts) {
    const u = await prisma.user.upsert({
      where: { username: a.username },
      create: {
        username: a.username,
        name: a.username,
        role: a.role,
        password: demoPassword,
        licenceVersion: LICENCE,
        licenceAcceptedAt: new Date(),
        publicHandle: a.handle,
      },
      update: {},
    });
    ids[a.username] = u.id;
  }

  for (const [username, role] of [
    ['duytri', 'COURSE_LEAD'],
    ['chuyengia', 'TRUSTED_REVIEWER'],
  ] as const) {
    await prisma.courseMember.upsert({
      where: { courseId_userId: { courseId: demoCourseId, userId: ids[username] } },
      create: { courseId: demoCourseId, userId: ids[username], role },
      update: {},
    });
  }
  await prisma.reviewerProfile.upsert({
    where: { userId: ids.chuyengia },
    create: { userId: ids.chuyengia, credential: 'Luật sư', affiliation: 'Đoàn luật sư (mẫu)', disclosure: 'CREDENTIAL' },
    update: {},
  });

  // A second course nobody has a role on: for "maintainer of A can't touch B".
  const other = await prisma.course.upsert({
    where: { slug: 'demo-202' },
    create: { slug: 'demo-202', name: 'Demo 202', description: 'Khoá học mẫu thứ hai (local)', categoryId },
    update: {},
  });
  let level = await prisma.level.findFirst({ where: { courseId: other.id } });
  level ??= await prisma.level.create({ data: { courseId: other.id, name: 'Cấp 1', sortOrder: 0 } });
  for (const [i, l] of [
    { slug: 'bai-202', name: 'Bài 202', isActive: true },
    { slug: 'bai-202-an', name: 'Bài 202 đang ẩn', isActive: false },
  ].entries()) {
    const lesson = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: other.id, slug: l.slug } },
      create: { slug: l.slug, name: l.name, isActive: l.isActive, sortOrder: i, courseId: other.id, levelId: level.id },
      update: {},
    });
    await prisma.lessonContent.upsert({
      where: { lessonId: lesson.id },
      create: { lessonId: lesson.id, title: l.name, blocks: [text('Nội dung', `Nội dung của ${l.name}.`)] },
      update: {},
    });
  }

  await prisma.libraryEntry.upsert({
    where: { slug: 'muc-tu-mau' },
    create: {
      slug: 'muc-tu-mau',
      type: 'CONCEPT',
      title: 'Mục từ mẫu',
      summary: 'Một mục từ mẫu để thử đề xuất sửa thư viện.',
      body: { sections: [{ heading: 'Định nghĩa', paragraphs: ['Đoạn mô tả mẫu.'] }] },
      meta: {},
    },
    update: {},
  });

  const sample = await prisma.lesson.findFirst({ where: { courseId: demoCourseId, slug: 'bai-hoc-mau' } });
  if (sample && !(await prisma.suggestion.count({ where: { targetId: sample.id, status: 'ACCEPTED' } }))) {
    await prisma.suggestion.create({
      data: {
        targetType: 'LESSON',
        targetId: sample.id,
        quote: 'Đoạn văn mẫu để thử trình soạn thảo.',
        proposal: 'Nên thêm một ví dụ cụ thể về thuế thu nhập cá nhân.',
        reason: 'Người học dễ hiểu hơn với ví dụ.',
        status: 'ACCEPTED',
      },
    });
  }
  console.log('Seeded demo accounts (password tepup-local-demo): ' + accounts.map((a) => a.username).join(', '));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
