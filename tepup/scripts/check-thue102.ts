import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function check() {
  // Check course "Thuế 102" (slug: thue-102)
  const thue102 = await prisma.course.findUnique({
    where: { slug: 'thue-102' },
    include: {
      levels: {
        include: {
          lessons: {
            include: {
              content: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      },
      category: true
    }
  });

  if (thue102) {
    console.log('=== Course "Thuế 102" (thue-102) ===');
    console.log('Name:', thue102.name);
    console.log('Category:', thue102.category?.name);
    console.log('Total levels:', thue102.levels.length);

    let totalLessons = 0;
    let lessonsWithContent = 0;

    thue102.levels.forEach(level => {
      console.log(`\n  Level: ${level.name}`);
      level.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.content) lessonsWithContent++;
        console.log(`    - ${lesson.name} (${lesson.slug}) ${lesson.content ? '✓ has content' : '✗ no content'}`);
      });
    });

    console.log(`\nTotal lessons: ${totalLessons}`);
    console.log(`Lessons with content: ${lessonsWithContent}`);
  }

  // Delete the empty course if exists
  const emptyCourse = await prisma.course.findUnique({
    where: { slug: 'thue-kinh-te-chinh-tri' },
    include: { levels: { include: { lessons: true } } }
  });

  if (emptyCourse) {
    const lessonCount = emptyCourse.levels.reduce((sum, l) => sum + l.lessons.length, 0);
    console.log(`\n=== Course "thue-kinh-te-chinh-tri" ===`);
    console.log(`Lessons: ${lessonCount}`);

    if (lessonCount === 0) {
      console.log('This course is empty, will delete it...');
      await prisma.course.delete({ where: { slug: 'thue-kinh-te-chinh-tri' } });
      console.log('Deleted empty course.');
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);
