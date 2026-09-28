/**
 * Migration script to transfer static data from /data/*.ts files to the database.
 * Run with: npx tsx scripts/migrate-static-to-db.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { categories, characters, stories, exercises, lessonContents } from '../data/courses';
import { allStoryContents } from '../data/story-contents';

// Helper: resolve documentSlug → documentId in content blocks
function resolveLibraryDocSlugs(blocks: any[], slugToId: Record<string, string>): any[] {
  return blocks.map(block => {
    if (block.type === 'library-document' && block.documentSlug) {
      const docId = slugToId[block.documentSlug];
      if (!docId) {
        console.warn(`    ⚠️  Library document slug not found: "${block.documentSlug}"`);
        return block;
      }
      const { documentSlug, ...rest } = block;
      return { ...rest, documentId: docId };
    }
    return block;
  });
}

async function main() {
  console.log('Starting migration of static data to database...\n');

  // Build slug→ID map for library documents
  console.log('Loading library documents for slug resolution...');
  const libraryDocs = await prisma.libraryDocument.findMany({ select: { id: true, slug: true } });
  const slugToId: Record<string, string> = {};
  for (const doc of libraryDocs) {
    slugToId[doc.slug] = doc.id;
  }
  console.log(`  Found ${libraryDocs.length} library documents for slug resolution.\n`);

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.chapterContent.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.storyPart.deleteMany();
  await prisma.story.deleteMany();
  await prisma.character.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lessonContent.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.level.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  console.log('Existing data cleared.\n');

  // 1. Migrate Categories
  console.log('Migrating categories...');
  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const cat = categories[catIndex];
    const category = await prisma.category.create({
      data: {
        slug: cat.id, // Use the static id as slug
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: catIndex,
        isActive: true,
      },
    });
    console.log(`  Created category: ${category.name}`);

    // 2. Migrate Courses for this category
    for (let courseIndex = 0; courseIndex < cat.courses.length; courseIndex++) {
      const c = cat.courses[courseIndex];
      const course = await prisma.course.create({
        data: {
          slug: c.slug,
          name: c.name,
          description: c.description,
          icon: c.icon,
          isNew: c.isNew,
          isActive: true,
          categoryId: category.id,
          sortOrder: courseIndex,
        },
      });
      console.log(`    Created course: ${course.name}`);

      // 3. Migrate Levels for this course
      for (let levelIndex = 0; levelIndex < c.levels.length; levelIndex++) {
        const lvl = c.levels[levelIndex];
        const level = await prisma.level.create({
          data: {
            name: lvl.name,
            courseId: course.id,
            sortOrder: levelIndex,
          },
        });
        console.log(`      Created level: ${level.name}`);

        // 4. Migrate Lessons for this level
        for (let lessonIndex = 0; lessonIndex < lvl.lessons.length; lessonIndex++) {
          const les = lvl.lessons[lessonIndex];
          const lesson = await prisma.lesson.create({
            data: {
              slug: les.id, // Use the static id as slug
              name: les.name,
              levelId: level.id,
              courseId: level.courseId,
              sortOrder: lessonIndex,
              isActive: true,
            },
          });
          console.log(`        Created lesson: ${lesson.name} (slug: ${lesson.slug})`);

          // 5. Migrate LessonContent if exists
          const content = lessonContents[les.id];
          if (content) {
            await prisma.lessonContent.create({
              data: {
                lessonId: lesson.id,
                title: content.title,
                blocks: resolveLibraryDocSlugs(content.blocks as any[], slugToId) as any,
              },
            });
            console.log(`          Created lesson content for: ${lesson.name}`);
          }

          // 6. Migrate Exercises if exists
          const lessonExercises = exercises[les.id];
          if (lessonExercises) {
            for (let exIndex = 0; exIndex < lessonExercises.length; exIndex++) {
              const ex = lessonExercises[exIndex];
              await prisma.exercise.create({
                data: {
                  lessonId: lesson.id,
                  type: ex.type,
                  title: ex.title,
                  instruction: ex.instruction,
                  options: ex.options as any,
                  visualData: ex.visualData as any,
                  sortOrder: exIndex,
                },
              });
            }
            console.log(`          Created ${lessonExercises.length} exercises for: ${lesson.name}`);
          }
        }
      }
    }
  }
  console.log('Categories, courses, levels, lessons migrated.\n');

  // 7. Migrate Characters
  console.log('Migrating characters...');
  const characterIdMap: Record<string, string> = {};
  for (let charIndex = 0; charIndex < characters.length; charIndex++) {
    const char = characters[charIndex];
    const character = await prisma.character.create({
      data: {
        slug: char.id, // Use the static id as slug
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
    characterIdMap[char.id] = character.id;
    console.log(`  Created character: ${character.name} (slug: ${character.slug})`);
  }
  console.log('Characters migrated.\n');

  // 8. Migrate Stories
  console.log('Migrating stories...');
  for (let storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    const s = stories[storyIndex];
    const characterDbId = characterIdMap[s.characterId];
    if (!characterDbId) {
      console.error(`  Character not found for story: ${s.title}`);
      continue;
    }

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
    console.log(`  Created story: ${story.title}`);

    // 9. Migrate StoryParts
    for (let partIndex = 0; partIndex < s.parts.length; partIndex++) {
      const p = s.parts[partIndex];
      const part = await prisma.storyPart.create({
        data: {
          storyId: story.id,
          name: p.name,
          sortOrder: partIndex,
        },
      });
      console.log(`    Created part: ${part.name}`);

      // 10. Migrate Chapters
      for (let chapIndex = 0; chapIndex < p.chapters.length; chapIndex++) {
        const ch = p.chapters[chapIndex];
        const chapter = await prisma.chapter.create({
          data: {
            slug: ch.id, // Use the static id as slug
            partId: part.id,
            storyId: part.storyId,
            title: ch.title,
            sortOrder: chapIndex,
            isActive: true,
          },
        });
        console.log(`      Created chapter: ${chapter.title} (slug: ${chapter.slug})`);

        // 11. Migrate ChapterContent if exists
        const chapterContent = allStoryContents[ch.id];
        if (chapterContent) {
          await prisma.chapterContent.create({
            data: {
              chapterId: chapter.id,
              title: chapterContent.title,
              blocks: resolveLibraryDocSlugs(chapterContent.blocks as any[], slugToId) as any,
            },
          });
          console.log(`        Created chapter content for: ${chapter.title}`);
        }
      }
    }
  }
  console.log('Stories, parts, chapters migrated.\n');

  // Summary
  const counts = {
    categories: await prisma.category.count(),
    courses: await prisma.course.count(),
    levels: await prisma.level.count(),
    lessons: await prisma.lesson.count(),
    lessonContents: await prisma.lessonContent.count(),
    exercises: await prisma.exercise.count(),
    characters: await prisma.character.count(),
    stories: await prisma.story.count(),
    storyParts: await prisma.storyPart.count(),
    chapters: await prisma.chapter.count(),
    chapterContents: await prisma.chapterContent.count(),
  };

  console.log('='.repeat(50));
  console.log('Migration completed successfully!');
  console.log('='.repeat(50));
  console.log('Summary:');
  console.log(`  Categories: ${counts.categories}`);
  console.log(`  Courses: ${counts.courses}`);
  console.log(`  Levels: ${counts.levels}`);
  console.log(`  Lessons: ${counts.lessons}`);
  console.log(`  Lesson Contents: ${counts.lessonContents}`);
  console.log(`  Exercises: ${counts.exercises}`);
  console.log(`  Characters: ${counts.characters}`);
  console.log(`  Stories: ${counts.stories}`);
  console.log(`  Story Parts: ${counts.storyParts}`);
  console.log(`  Chapters: ${counts.chapters}`);
  console.log(`  Chapter Contents: ${counts.chapterContents}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
