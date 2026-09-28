/**
 * Script to ADD Thuế 101 course to the database WITHOUT deleting any existing data.
 * Run with: npx tsx scripts/add-thue101-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { lessonContents } from '../data/courses';

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

// Thuế 101 course definition
const THUE101_COURSE = {
  slug: 'thue-101',
  name: 'Thuế 101 - Thuế & Quyền Công Dân',
  description: 'Hiểu thuế là gì, ai đóng, tại sao phải đóng, và trách nhiệm của công dân',
  icon: 'shield',
  isNew: true,
  levels: [
    {
      name: 'Thuế ơi thuế à (WHAT)',
      lessons: [
        { id: 'thue101-1', name: 'Bạn đang đóng thuế gì?' },
        { id: 'thue101-2', name: 'Ai đang đóng thuế?' },
        { id: 'thue101-3', name: 'Ai thực sự gánh chịu thuế?' },
        { id: 'thue101-4', name: 'Thuế là gì?' },
        { id: 'thue101-5', name: 'Phân loại thuế' },
        { id: 'thue101-6', name: 'Suy ngẫm về thuế' },
      ],
    },
    {
      name: 'Tại sao đóng thuế? (WHY)',
      lessons: [
        { id: 'thue101-7', name: 'Mục đích của thuế' },
        { id: 'thue101-8', name: 'Khế ước xã hội' },
        { id: 'thue101-9', name: 'Nguyên tắc thu thuế' },
      ],
    },
    {
      name: 'Thuế và Trách nhiệm',
      lessons: [
        { id: 'thue101-10', name: 'Thuế và minh bạch' },
        { id: 'thue101-11', name: 'Làm sao để có minh bạch?' },
        { id: 'thue101-12', name: 'Thuế và chính trị' },
      ],
    },
  ],
};

async function main() {
  console.log('=== Adding Thuế 101 course (NO DELETE, ADD ONLY) ===\n');

  // Build slug→ID map for library documents
  console.log('Loading library documents for slug resolution...');
  const libraryDocs = await prisma.libraryDocument.findMany({ select: { id: true, slug: true } });
  const slugToId: Record<string, string> = {};
  for (const doc of libraryDocs) {
    slugToId[doc.slug] = doc.id;
  }
  console.log(`  Found ${libraryDocs.length} library documents.\n`);

  // Check if course already exists
  const existing = await prisma.course.findUnique({ where: { slug: 'thue-101' } });
  if (existing) {
    console.log('⚠️  Course "thue-101" already exists! Skipping to avoid duplicates.');
    console.log('    If you want to recreate it, delete it manually first.');
    return;
  }

  // Find the "Kinh tế & Thuế" category
  const category = await prisma.category.findUnique({ where: { slug: 'economics' } });
  if (!category) {
    console.error('❌ Category "economics" not found! Cannot add course.');
    return;
  }
  console.log(`Found category: ${category.name} (${category.id})\n`);

  // Get current max sortOrder for courses in this category
  const maxSortOrder = await prisma.course.aggregate({
    where: { categoryId: category.id },
    _max: { sortOrder: true },
  });
  const courseSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  // Create the course
  const course = await prisma.course.create({
    data: {
      slug: THUE101_COURSE.slug,
      name: THUE101_COURSE.name,
      description: THUE101_COURSE.description,
      icon: THUE101_COURSE.icon,
      isNew: THUE101_COURSE.isNew,
      isActive: true,
      categoryId: category.id,
      sortOrder: courseSortOrder,
    },
  });
  console.log(`✅ Created course: ${course.name} (slug: ${course.slug})\n`);

  // Create levels and lessons
  for (let levelIndex = 0; levelIndex < THUE101_COURSE.levels.length; levelIndex++) {
    const lvlDef = THUE101_COURSE.levels[levelIndex];
    const level = await prisma.level.create({
      data: {
        name: lvlDef.name,
        courseId: course.id,
        sortOrder: levelIndex,
      },
    });
    console.log(`  📁 Level: ${level.name}`);

    for (let lessonIndex = 0; lessonIndex < lvlDef.lessons.length; lessonIndex++) {
      const lesDef = lvlDef.lessons[lessonIndex];
      const lesson = await prisma.lesson.create({
        data: {
          slug: lesDef.id,
          name: lesDef.name,
          levelId: level.id,
          courseId: level.courseId,
          sortOrder: lessonIndex,
          isActive: true,
        },
      });
      console.log(`    📄 Lesson: ${lesson.name} (slug: ${lesson.slug})`);

      // Add lesson content if exists in static data
      const content = lessonContents[lesDef.id];
      if (content) {
        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            title: content.title,
            blocks: resolveLibraryDocSlugs(content.blocks as any[], slugToId) as any,
          },
        });
        console.log(`      ✍️  Content added for: ${lesson.name}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Thuế 101 added successfully!');
  console.log('='.repeat(50));

  const lessonCount = await prisma.lesson.count({ where: { level: { courseId: course.id } } });
  const contentCount = await prisma.lessonContent.count({ where: { lesson: { level: { courseId: course.id } } } });
  console.log(`  Lessons: ${lessonCount}`);
  console.log(`  Lessons with content: ${contentCount}`);
  console.log('\n⚠️  No existing data was deleted or modified.');
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
