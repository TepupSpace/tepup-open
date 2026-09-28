/**
 * Migration script: Merge Đức's 2 stories into 1 story with 2 parts
 *
 * Before: duc-canhlao (1 part, 4 chapters) + duc-thuattoan (1 part, 3 chapters)
 * After:  duc-canhlao (2 parts, 7 chapters)
 *
 * Run: DOTENV_CONFIG_PATH=.env.staging npx tsx scripts/merge-duc-stories.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== Merging Đức stories: duc-thuattoan → duc-canhlao ===\n');

  // 1. Find both stories
  const storyKeep = await prisma.story.findUnique({
    where: { slug: 'duc-canhlao' },
    include: { parts: { orderBy: { sortOrder: 'asc' } } },
  });
  const storyRemove = await prisma.story.findUnique({
    where: { slug: 'duc-thuattoan' },
    include: { parts: { include: { chapters: true }, orderBy: { sortOrder: 'asc' } } },
  });

  if (!storyKeep || !storyRemove) {
    console.error('One or both stories not found!');
    console.log('duc-canhlao:', storyKeep ? 'FOUND' : 'NOT FOUND');
    console.log('duc-thuattoan:', storyRemove ? 'FOUND' : 'NOT FOUND');
    return;
  }

  console.log(`Found duc-canhlao: ${storyKeep.parts.length} part(s)`);
  console.log(`Found duc-thuattoan: ${storyRemove.parts.length} part(s), ${storyRemove.parts.reduce((sum, p) => sum + p.chapters.length, 0)} chapter(s)\n`);

  // 2. Move StoryPart(s) from duc-thuattoan to duc-canhlao
  //    MUST happen BEFORE deleting the old story (onDelete: Cascade)
  const maxSortOrder = Math.max(...storyKeep.parts.map(p => p.sortOrder), -1);

  for (let i = 0; i < storyRemove.parts.length; i++) {
    const part = storyRemove.parts[i];
    const newSortOrder = maxSortOrder + 1 + i;
    await prisma.storyPart.update({
      where: { id: part.id },
      data: {
        storyId: storyKeep.id,
        sortOrder: newSortOrder,
      },
    });
    console.log(`[MOVE] Part "${part.name}" → duc-canhlao (sortOrder: ${newSortOrder}, ${part.chapters.length} chapters)`);
  }

  // 3. Move CourseStoryRecommendations (skip duplicates)
  const existingRecs = await prisma.courseStoryRecommendation.findMany({
    where: { storyId: storyKeep.id },
  });
  const existingCourseIds = new Set(existingRecs.map(r => r.courseId));

  const recsToMove = await prisma.courseStoryRecommendation.findMany({
    where: { storyId: storyRemove.id },
  });

  for (const rec of recsToMove) {
    if (existingCourseIds.has(rec.courseId)) {
      await prisma.courseStoryRecommendation.delete({ where: { id: rec.id } });
      console.log(`[DELETE] Duplicate recommendation for courseId: ${rec.courseId}`);
    } else {
      await prisma.courseStoryRecommendation.update({
        where: { id: rec.id },
        data: { storyId: storyKeep.id },
      });
      console.log(`[MOVE] Recommendation for courseId: ${rec.courseId} → duc-canhlao`);
    }
  }

  // 4. Merge relatedCourses + update estimatedTime
  const mergedCourses = [...new Set([
    ...storyKeep.relatedCourses,
    ...storyRemove.relatedCourses,
  ])];

  await prisma.story.update({
    where: { id: storyKeep.id },
    data: {
      relatedCourses: mergedCourses,
      estimatedTime: '~45 phút',
    },
  });
  console.log(`\n[UPDATE] relatedCourses: ${mergedCourses.join(', ')}`);
  console.log('[UPDATE] estimatedTime: ~45 phút');

  // 5. Delete the now-empty story duc-thuattoan
  await prisma.story.delete({ where: { id: storyRemove.id } });
  console.log('\n[DELETE] Story duc-thuattoan');

  // 6. Verify
  const result = await prisma.story.findUnique({
    where: { slug: 'duc-canhlao' },
    include: {
      parts: {
        orderBy: { sortOrder: 'asc' },
        include: { chapters: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });

  console.log('\n=== Verification ===');
  console.log(`Story: ${result!.title} (slug: ${result!.slug})`);
  console.log(`Parts: ${result!.parts.length}`);
  for (const part of result!.parts) {
    console.log(`  Part ${part.sortOrder}: "${part.name}" (${part.chapters.length} chapters)`);
    for (const ch of part.chapters) {
      console.log(`    - ${ch.title} (slug: ${ch.slug})`);
    }
  }

  console.log('\n=== Merge complete! ===');
}

main()
  .catch((e) => {
    console.error('Merge failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
