/**
 * Seed script to add characters, stories, and "Thuế 102" course to the database
 * WITHOUT deleting existing data (uses upsert logic)
 *
 * Run with: npx tsx scripts/seed-stories-and-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { characters, stories, categories, lessonContents } from '../data/courses';
import { allStoryContents } from '../data/story-contents';

async function main() {
  console.log('Starting seed process (upsert mode - preserving existing data)...\n');

  // 1. Seed Characters
  console.log('=== Seeding Characters ===');
  const characterIdMap: Record<string, string> = {};

  for (let charIndex = 0; charIndex < characters.length; charIndex++) {
    const char = characters[charIndex];

    const existingChar = await prisma.character.findUnique({
      where: { slug: char.id }
    });

    if (existingChar) {
      console.log(`  [SKIP] Character "${char.name}" already exists`);
      characterIdMap[char.id] = existingChar.id;
    } else {
      const newChar = await prisma.character.create({
        data: {
          slug: char.id,
          name: char.name,
          role: char.role,
          description: char.description,
          icon: char.icon,
          color: char.color,
          bgColor: char.bgColor,
          sortOrder: charIndex,
          isActive: true,
        },
      });
      characterIdMap[char.id] = newChar.id;
      console.log(`  [CREATE] Character: ${newChar.name} (slug: ${newChar.slug})`);
    }
  }
  console.log('');

  // 2. Seed Stories with Parts, Chapters, and ChapterContents
  console.log('=== Seeding Stories ===');

  for (let storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    const s = stories[storyIndex];
    const characterDbId = characterIdMap[s.characterId];

    if (!characterDbId) {
      console.error(`  [ERROR] Character not found for story: ${s.title}`);
      continue;
    }

    const existingStory = await prisma.story.findUnique({
      where: { slug: s.slug }
    });

    if (existingStory) {
      console.log(`  [SKIP] Story "${s.title}" already exists`);
      continue;
    }

    // Create story with nested parts, chapters, and content
    const story = await prisma.story.create({
      data: {
        slug: s.slug,
        characterId: characterDbId,
        title: s.title,
        teaser: s.teaser,
        icon: s.icon,
        estimatedTime: s.estimatedTime,
        relatedCourses: s.relatedCourses,
        sortOrder: storyIndex,
        isActive: true,
      },
    });
    console.log(`  [CREATE] Story: ${story.title}`);

    // Create parts
    for (let partIndex = 0; partIndex < s.parts.length; partIndex++) {
      const p = s.parts[partIndex];
      const part = await prisma.storyPart.create({
        data: {
          storyId: story.id,
          name: p.name,
          sortOrder: partIndex,
        },
      });
      console.log(`    [CREATE] Part: ${part.name}`);

      // Create chapters
      for (let chapIndex = 0; chapIndex < p.chapters.length; chapIndex++) {
        const ch = p.chapters[chapIndex];
        const chapter = await prisma.chapter.create({
          data: {
            slug: ch.id,
            partId: part.id,
            storyId: part.storyId,
            title: ch.title,
            sortOrder: chapIndex,
            isActive: true,
          },
        });
        console.log(`      [CREATE] Chapter: ${chapter.title} (slug: ${chapter.slug})`);

        // Create chapter content if exists
        const chapterContent = allStoryContents[ch.id];
        if (chapterContent) {
          await prisma.chapterContent.create({
            data: {
              chapterId: chapter.id,
              title: chapterContent.title,
              blocks: chapterContent.blocks as any,
            },
          });
          console.log(`        [CREATE] ChapterContent for: ${chapter.title}`);
        }
      }
    }
  }
  console.log('');

  // 3. Seed "Thuế 102" course (Thuế dưới Góc nhìn Kinh tế Chính trị)
  console.log('=== Seeding Course "Thuế 102" ===');

  // Find the course data
  const philosophyCategory = categories.find(c => c.id === 'philosophy');
  const thue102Course = philosophyCategory?.courses.find(c => c.slug === 'thue-kinh-te-chinh-tri');

  if (!thue102Course) {
    console.error('  [ERROR] Course "thue-kinh-te-chinh-tri" not found in static data');
    return;
  }

  // Check if course already exists
  let existingCourse = await prisma.course.findUnique({
    where: { slug: 'thue-kinh-te-chinh-tri' },
    include: { levels: { include: { lessons: true } } }
  });

  // If course exists but is incomplete (no lessons), delete and recreate
  if (existingCourse) {
    const totalLessons = existingCourse.levels.reduce((sum, l) => sum + l.lessons.length, 0);
    if (totalLessons === 0) {
      console.log(`  [CLEANUP] Course exists but has no lessons, deleting and recreating...`);
      await prisma.course.delete({ where: { slug: 'thue-kinh-te-chinh-tri' } });
      existingCourse = null;
    } else {
      console.log(`  [SKIP] Course "Thuế dưới Góc nhìn Kinh tế Chính trị" already exists with ${totalLessons} lessons`);
    }
  }

  if (!existingCourse) {
    // First, ensure the category exists
    let category = await prisma.category.findUnique({
      where: { slug: 'philosophy' }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          slug: 'philosophy',
          name: philosophyCategory!.name,
          description: philosophyCategory!.description,
          icon: philosophyCategory!.icon,
          sortOrder: 2,
          isActive: true,
        },
      });
      console.log(`  [CREATE] Category: ${category.name}`);
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        slug: thue102Course.slug,
        name: thue102Course.name,
        description: thue102Course.description,
        icon: thue102Course.icon,
        isNew: thue102Course.isNew,
        isActive: true,
        categoryId: category.id,
        sortOrder: 3,
      },
    });
    console.log(`  [CREATE] Course: ${course.name}`);

    // Create levels and lessons
    for (let levelIndex = 0; levelIndex < thue102Course.levels.length; levelIndex++) {
      const lvl = thue102Course.levels[levelIndex];
      const level = await prisma.level.create({
        data: {
          name: lvl.name,
          courseId: course.id,
          sortOrder: levelIndex,
        },
      });
      console.log(`    [CREATE] Level: ${level.name}`);

      // Create lessons
      for (let lessonIndex = 0; lessonIndex < lvl.lessons.length; lessonIndex++) {
        const les = lvl.lessons[lessonIndex];

        // Check if lesson already exists (might be in another course)
        const existingLesson = await prisma.lesson.findFirst({
          where: { slug: les.id }
        });

        if (existingLesson) {
          console.log(`      [SKIP] Lesson "${les.name}" already exists (slug: ${les.id})`);
          continue;
        }

        const lesson = await prisma.lesson.create({
          data: {
            slug: les.id,
            name: les.name,
            levelId: level.id,
            courseId: level.courseId,
            sortOrder: lessonIndex,
            isActive: true,
          },
        });
        console.log(`      [CREATE] Lesson: ${lesson.name} (slug: ${lesson.slug})`);

        // Create lesson content if exists
        const content = lessonContents[les.id];
        if (content) {
          await prisma.lessonContent.create({
            data: {
              lessonId: lesson.id,
              title: content.title,
              blocks: content.blocks as any,
            },
          });
          console.log(`        [CREATE] LessonContent for: ${lesson.name}`);
        }
      }
    }
  }
  console.log('');

  // 4. Summary
  const counts = {
    characters: await prisma.character.count(),
    stories: await prisma.story.count(),
    storyParts: await prisma.storyPart.count(),
    chapters: await prisma.chapter.count(),
    chapterContents: await prisma.chapterContent.count(),
    categories: await prisma.category.count(),
    courses: await prisma.course.count(),
    levels: await prisma.level.count(),
    lessons: await prisma.lesson.count(),
    lessonContents: await prisma.lessonContent.count(),
  };

  console.log('='.repeat(50));
  console.log('Seed completed successfully!');
  console.log('='.repeat(50));
  console.log('Current database counts:');
  console.log(`  Characters: ${counts.characters}`);
  console.log(`  Stories: ${counts.stories}`);
  console.log(`  Story Parts: ${counts.storyParts}`);
  console.log(`  Chapters: ${counts.chapters}`);
  console.log(`  Chapter Contents: ${counts.chapterContents}`);
  console.log(`  Categories: ${counts.categories}`);
  console.log(`  Courses: ${counts.courses}`);
  console.log(`  Levels: ${counts.levels}`);
  console.log(`  Lessons: ${counts.lessons}`);
  console.log(`  Lesson Contents: ${counts.lessonContents}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
