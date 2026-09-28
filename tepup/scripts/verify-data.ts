import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function verify() {
  console.log('='.repeat(60));
  console.log('VERIFICATION REPORT - Tepup Staging Database');
  console.log('='.repeat(60));

  // 1. Characters
  console.log('\n📌 CHARACTERS');
  const characters = await prisma.character.findMany({
    include: { stories: true },
    orderBy: { sortOrder: 'asc' }
  });
  characters.forEach(char => {
    console.log(`  ✓ ${char.name} (${char.slug}) - ${char.role}`);
    console.log(`    Stories: ${char.stories.length}`);
  });
  console.log(`  Total: ${characters.length} characters`);

  // 2. Stories
  console.log('\n📖 STORIES');
  const stories = await prisma.story.findMany({
    include: {
      character: true,
      parts: {
        include: {
          chapters: {
            include: { content: true }
          }
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });
  stories.forEach(story => {
    const totalChapters = story.parts.reduce((sum, p) => sum + p.chapters.length, 0);
    const chaptersWithContent = story.parts.reduce(
      (sum, p) => sum + p.chapters.filter(c => c.content).length, 0
    );
    console.log(`  ✓ ${story.title} (${story.slug})`);
    console.log(`    Character: ${story.character.name}`);
    console.log(`    Parts: ${story.parts.length}, Chapters: ${totalChapters}, With Content: ${chaptersWithContent}`);
  });
  console.log(`  Total: ${stories.length} stories`);

  // 3. Course "Thuế 102"
  console.log('\n📚 COURSE "Thuế 102"');
  const thue102 = await prisma.course.findFirst({
    where: {
      OR: [
        { slug: 'thue-102' },
        { slug: 'thue-kinh-te-chinh-tri' }
      ]
    },
    include: {
      category: true,
      levels: {
        include: {
          lessons: {
            include: { content: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (thue102) {
    console.log(`  ✓ ${thue102.name} (${thue102.slug})`);
    console.log(`    Category: ${thue102.category?.name}`);
    console.log(`    Levels: ${thue102.levels.length}`);

    let totalLessons = 0;
    let lessonsWithContent = 0;

    thue102.levels.forEach(level => {
      const levelLessonsWithContent = level.lessons.filter(l => l.content).length;
      totalLessons += level.lessons.length;
      lessonsWithContent += levelLessonsWithContent;
      console.log(`      - ${level.name}: ${level.lessons.length} lessons (${levelLessonsWithContent} with content)`);
    });

    console.log(`    Total Lessons: ${totalLessons}`);
    console.log(`    Lessons with Content: ${lessonsWithContent}`);
  } else {
    console.log('  ✗ Course not found!');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Characters: ${characters.length}/3 expected`);
  console.log(`  Stories: ${stories.length}/6 expected`);
  console.log(`  Thuế 102 Course: ${thue102 ? 'EXISTS' : 'MISSING'}`);
  console.log(`    - Levels: ${thue102?.levels.length || 0}/6 expected`);

  const totalExpectedLessons = 25;
  const actualLessons = thue102?.levels.reduce((sum, l) => sum + l.lessons.length, 0) || 0;
  console.log(`    - Lessons: ${actualLessons}/${totalExpectedLessons} expected`);

  const allGood = characters.length === 3 && stories.length === 6 && thue102 && actualLessons === 25;
  console.log('\n' + (allGood ? '✅ All data verified successfully!' : '⚠️ Some data may be missing'));

  await prisma.$disconnect();
}

verify().catch(console.error);
