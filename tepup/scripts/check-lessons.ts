import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function check() {
  // Check where thue-ct-1 lesson belongs
  const lesson = await prisma.lesson.findFirst({
    where: { slug: 'thue-ct-1' },
    include: {
      level: {
        include: {
          course: true
        }
      }
    }
  });
  console.log('Lesson thue-ct-1 belongs to:');
  console.log('  Course:', lesson?.level?.course?.name, '(slug:', lesson?.level?.course?.slug, ')');
  console.log('  Level:', lesson?.level?.name);

  // Check the new course
  const newCourse = await prisma.course.findUnique({
    where: { slug: 'thue-kinh-te-chinh-tri' },
    include: {
      levels: {
        include: {
          lessons: true
        }
      }
    }
  });
  console.log('\nNew course "thue-kinh-te-chinh-tri":');
  console.log('  Total levels:', newCourse?.levels?.length);
  const totalLessons = newCourse?.levels?.reduce((sum, l) => sum + l.lessons.length, 0) || 0;
  console.log('  Total lessons:', totalLessons);

  // List all courses
  const courses = await prisma.course.findMany({
    select: { slug: true, name: true }
  });
  console.log('\nAll courses in database:');
  courses.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

  await prisma.$disconnect();
}

check().catch(console.error);
