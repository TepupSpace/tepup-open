/**
 * Export data from staging DB for production seeding
 * Exports: Characters, Stories (with parts, chapters, content), Dan Chu 101 course
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();

  try {
    // 1. Characters
    const characters = (await client.query(`SELECT * FROM "Character" ORDER BY "sortOrder"`)).rows;
    console.log(`\n=== Characters (${characters.length}) ===`);
    for (const c of characters) {
      console.log(`  ${c.sortOrder}. ${c.name} (${c.slug}) - ${c.role}`);
    }

    // 2. Stories with parts, chapters, content
    const stories = (await client.query(`SELECT * FROM "Story" ORDER BY "characterId", "sortOrder"`)).rows;
    console.log(`\n=== Stories (${stories.length}) ===`);
    for (const s of stories) {
      const char = characters.find((c: any) => c.id === s.characterId);
      console.log(`  ${char?.name}: "${s.title}" (${s.slug})`);
    }

    const parts = (await client.query(`SELECT * FROM "StoryPart" ORDER BY "storyId", "sortOrder"`)).rows;
    console.log(`\n=== StoryParts (${parts.length}) ===`);

    const chapters = (await client.query(`SELECT * FROM "Chapter" ORDER BY "partId", "sortOrder"`)).rows;
    console.log(`\n=== Chapters (${chapters.length}) ===`);

    const chapterContents = (await client.query(`SELECT * FROM "ChapterContent"`)).rows;
    console.log(`\n=== ChapterContents (${chapterContents.length}) ===`);

    // 3. Dan Chu 101 course
    const course = (await client.query(`SELECT * FROM "Course" WHERE slug = 'dan-chu-101'`)).rows[0];
    if (!course) {
      console.error('Course dan-chu-101 not found!');
      return;
    }
    console.log(`\n=== Course: ${course.name} (${course.slug}) ===`);

    // Category for this course
    const category = (await client.query(`SELECT * FROM "Category" WHERE id = $1`, [course.categoryId])).rows[0];
    console.log(`  Category: ${category.name} (${category.slug})`);

    const levels = (await client.query(`SELECT * FROM "Level" WHERE "courseId" = $1 ORDER BY "sortOrder"`, [course.id])).rows;
    console.log(`  Levels: ${levels.length}`);

    const levelIds = levels.map((l: any) => l.id);
    const lessons = (await client.query(
      `SELECT * FROM "Lesson" WHERE "levelId" = ANY($1) ORDER BY "levelId", "sortOrder"`,
      [levelIds]
    )).rows;
    console.log(`  Lessons: ${lessons.length}`);

    const lessonIds = lessons.map((l: any) => l.id);
    const lessonContents = (await client.query(
      `SELECT * FROM "LessonContent" WHERE "lessonId" = ANY($1)`,
      [lessonIds]
    )).rows;
    console.log(`  LessonContents: ${lessonContents.length}`);

    // 4. CourseStoryRecommendations for dan-chu-101
    const recommendations = (await client.query(
      `SELECT * FROM "CourseStoryRecommendation" WHERE "courseId" = $1`,
      [course.id]
    )).rows;
    console.log(`  Recommendations: ${recommendations.length}`);

    // Export everything as JSON
    const exportData = {
      characters,
      stories,
      storyParts: parts,
      chapters,
      chapterContents,
      category,
      course,
      levels,
      lessons,
      lessonContents,
      recommendations,
    };

    const outputPath = '/Users/macbookpro/Desktop/Dev Projects/Project - Tepup/tepup/scripts/staging-export.json';
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`\n✅ Exported to staging-export.json`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
