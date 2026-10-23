import type { ContentBlock } from '@/components/admin/editor/BlockEditor';
import { slugifyUnique } from '@/lib/utils/slug';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { rebuildUsage } from '@/lib/library/usage-service';
import { blocksSnapshot, recordRevision } from '@/lib/services/revision-service';
import { recordOutlineRevision } from '@/lib/services/outline-service';
import { ContributionInvalidError, type Publisher } from './types';

interface CourseContributionData {
  course: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    icon: string;
  };
  levels: {
    name: string;
    sortOrder: number;
    lessons: {
      name: string;
      sortOrder: number;
      content: {
        title: string;
        blocks: ContentBlock[];
      };
    }[];
  }[];
}

/**
 * NEW_COURSE: creates the course HIDDEN (an admin activates it), makes the author its
 * maintainer, and records each lesson's first version and the first outline.
 */
export const publishNewCourse: Publisher = async ({ tx, contribution, data, reviewerId }) => {
  const { course, levels } = data as CourseContributionData;
  const contributorId = contribution.contributorId;

  const category = await tx.category.findUnique({ where: { id: course.categoryId }, select: { id: true } });
  if (!category) throw new ContributionInvalidError('Category not found');

  const maxSortOrder = await tx.course.aggregate({
    _max: { sortOrder: true },
    where: { categoryId: course.categoryId },
  });

  // The slug is a public URL, so derive it server-side rather than trusting the
  // contributor's value, and never let it collide with an existing course.
  const existingSlugs = (await tx.course.findMany({ select: { slug: true } })).map((c) => c.slug);
  const courseSlug = slugifyUnique(course.name, existingSlugs, 'khoa-hoc');

  // Hidden until an admin reviews it in Admin → Courses and activates it.
  const newCourse = await tx.course.create({
    data: {
      name: course.name,
      slug: courseSlug,
      description: course.description,
      icon: course.icon || 'book-open',
      categoryId: course.categoryId,
      sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
      isActive: false,
      isNew: true,
      // Tác giả khoá: cho phép contributor xem bài đang ẩn trong khoá của mình.
      createdById: contributorId,
    },
  });

  // The author maintains the course they wrote (proposal §6.8); addedById null = automatic.
  await tx.courseMember.create({
    data: { courseId: newCourse.id, userId: contributorId, role: 'COURSE_LEAD' },
  });

  // Link the contribution to the course it created (activation status, admin dashboard).
  await tx.contribution.update({ where: { id: contribution.id }, data: { targetId: newCourse.id } });

  // The course is brand new, so lesson slugs only have to avoid each other.
  const takenLessonSlugs = new Set<string>();

  for (const level of levels) {
    const newLevel = await tx.level.create({
      data: { name: level.name, courseId: newCourse.id, sortOrder: level.sortOrder },
    });

    for (const lesson of level.lessons) {
      const lessonSlug = slugifyUnique(lesson.name, takenLessonSlugs, 'bai-hoc');
      takenLessonSlugs.add(lessonSlug);

      const newLesson = await tx.lesson.create({
        data: {
          name: lesson.name,
          slug: lessonSlug,
          levelId: newLevel.id,
          courseId: newCourse.id,
          sortOrder: lesson.sortOrder,
          isActive: true,
        },
      });

      if (lesson.content.blocks.length > 0 || lesson.content.title) {
        const blocks = JSON.parse(JSON.stringify(trimEmptyBlocks(lesson.content.blocks).blocks));
        const title = lesson.content.title || lesson.name;
        await tx.lessonContent.create({ data: { lessonId: newLesson.id, title, blocks } });
        await recordRevision(tx, {
          targetType: 'LESSON',
          targetId: newLesson.id,
          courseId: newCourse.id,
          label: lesson.name,
          snapshot: blocksSnapshot(title, blocks),
          source: 'CONTRIBUTION',
          actorId: reviewerId,
          authorId: contributorId,
          contributionId: contribution.id,
        });
        await rebuildUsage(tx, 'LESSON', newLesson.id, blocks);
      }
    }
  }

  await recordOutlineRevision(tx, newCourse.id, {
    source: 'CONTRIBUTION',
    actorId: reviewerId,
    authorId: contributorId,
    contributionId: contribution.id,
  });

  return { forced: false, courseId: newCourse.id };
};
