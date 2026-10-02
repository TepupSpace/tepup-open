import { prisma } from '@/lib/prisma';
import type { ContentBlock } from '@/components/admin/editor/BlockEditor';
import { slugifyUnique } from '@/lib/utils/slug';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { isSupportedContributionType, validateContributionData } from '@/lib/schemas/content-validation';

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

export async function publishContribution(contributionId: string, reviewerId: string) {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) throw new Error('Contribution not found');
  if (contribution.status !== 'PENDING_REVIEW') throw new Error('Contribution is not pending review');

  // Claim it atomically so two reviewers clicking "approve" can't publish it twice.
  const claimed = await prisma.contribution.updateMany({
    where: { id: contributionId, status: 'PENDING_REVIEW' },
    data: { status: 'APPROVED', resolvedAt: new Date() },
  });
  if (claimed.count !== 1) throw new Error('Contribution is not pending review');

  // Re-validate at publish time (defence in depth): rows saved before validation existed,
  // or written some other way, must not reach learners unchecked.
  if (!isSupportedContributionType(contribution.type)) {
    await releaseClaim(contributionId);
    throw new Error(`Unsupported contribution type: ${contribution.type}`);
  }
  const checked = validateContributionData(contribution.type, contribution.data, { allowCustom: false });
  if (!checked.ok) {
    await releaseClaim(contributionId);
    throw new Error(`Contribution content failed validation: ${checked.issues.map((i) => i.path).join(', ')}`);
  }
  const data = checked.value;

  try {
    switch (contribution.type) {
      case 'NEW_COURSE':
        await publishNewCourse(data as CourseContributionData, contribution.contributorId, contributionId);
        break;
      case 'EDIT_LESSON_CONTENT':
        await publishEditLessonContent(contribution.targetId!, data as { blocks: ContentBlock[] });
        break;
      default:
        throw new Error(`Unsupported contribution type: ${contribution.type}`);
    }
  } catch (error) {
    await releaseClaim(contributionId);
    throw error;
  }

  // Create review record
  await prisma.review.create({
    data: {
      contributionId,
      reviewerId,
      action: 'APPROVED',
    },
  });

  // Promotion to TRUSTED_CONTRIBUTOR is a manual admin decision (Admin → Users);
  // automatic promotion after N approvals was removed as too easy to game.
}

/** Publishing failed after the claim: put the contribution back in the review queue. */
async function releaseClaim(contributionId: string) {
  await prisma.contribution.update({
    where: { id: contributionId },
    data: { status: 'PENDING_REVIEW', resolvedAt: null },
  });
}

async function publishNewCourse(data: CourseContributionData, contributorId: string, contributionId: string) {
  const { course, levels } = data;

  const category = await prisma.category.findUnique({ where: { id: course.categoryId }, select: { id: true } });
  if (!category) throw new Error('Category not found');

  // Get next sortOrder for the category
  const maxSortOrder = await prisma.course.aggregate({
    _max: { sortOrder: true },
    where: { categoryId: course.categoryId },
  });

  // The slug is a public URL, so derive it server-side rather than trusting the
  // contributor's value, and never let it collide with an existing course.
  const existingSlugs = (await prisma.course.findMany({ select: { slug: true } })).map((c) => c.slug);
  const courseSlug = slugifyUnique(course.name, existingSlugs, 'khoa-hoc');

  await prisma.$transaction(async (tx) => {
    // Create course — hidden until an admin reviews it in Admin → Courses and activates it.
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

    // Link the contribution to the course it created, so the contributor can see
    // whether it is still waiting for activation (and get a link once it's live), and
    // admins can list approved courses that are still hidden.
    await tx.contribution.update({ where: { id: contributionId }, data: { targetId: newCourse.id } });

    // Create levels and lessons. The course is brand new, so lesson slugs only have
    // to avoid colliding with each other — track them as we go.
    const takenLessonSlugs = new Set<string>();

    for (const level of levels) {
      const newLevel = await tx.level.create({
        data: {
          name: level.name,
          courseId: newCourse.id,
          sortOrder: level.sortOrder,
        },
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
          await tx.lessonContent.create({
            data: {
              lessonId: newLesson.id,
              title: lesson.content.title || lesson.name,
              blocks: JSON.parse(JSON.stringify(trimEmptyBlocks(lesson.content.blocks).blocks)),
            },
          });
        }
      }
    }
  });
}

async function publishEditLessonContent(lessonId: string, data: { blocks: ContentBlock[] }) {
  await prisma.lessonContent.update({
    where: { lessonId },
    data: {
      // Empty lines would be blank steps in the player (lib/editor/trim-empty-blocks.ts).
      blocks: JSON.parse(JSON.stringify(trimEmptyBlocks(data.blocks).blocks)),
    },
  });
}

export async function rejectContribution(
  contributionId: string,
  reviewerId: string,
  feedback: string,
  action: 'REJECTED' | 'CHANGES_REQUESTED'
) {
  const updated = await prisma.contribution.updateMany({
    where: { id: contributionId, status: 'PENDING_REVIEW' },
    data: {
      status: action,
      resolvedAt: new Date(),
    },
  });
  if (updated.count !== 1) throw new Error('Contribution is not pending review');

  await prisma.review.create({
    data: {
      contributionId,
      reviewerId,
      action,
      feedback,
    },
  });
}

export interface ContributionCourse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

/**
 * The course each approved NEW_COURSE contribution created, keyed by contribution id.
 * New approvals store it in `targetId`; for approvals from before that, fall back to the
 * contributor's own course with the same name (`Course.createdById`).
 */
export async function getCoursesForContributions(
  contributions: { id: string; type: string; status: string; targetId: string | null; contributorId: string; data: unknown }[]
): Promise<Map<string, ContributionCourse>> {
  const approved = contributions.filter((c) => c.type === 'NEW_COURSE' && c.status === 'APPROVED');
  const out = new Map<string, ContributionCourse>();
  if (!approved.length) return out;

  const select = { id: true, name: true, slug: true, isActive: true, createdById: true, createdAt: true } as const;
  const ids = approved.map((c) => c.targetId).filter((id): id is string => !!id);
  const byId = new Map(
    (ids.length ? await prisma.course.findMany({ where: { id: { in: ids } }, select }) : []).map((c) => [c.id, c])
  );

  const legacy = approved.filter((c) => !c.targetId);
  const nameOf = (data: unknown) => {
    const course = data && typeof data === 'object' ? (data as { course?: { name?: unknown } }).course : undefined;
    return typeof course?.name === 'string' ? course.name : '';
  };
  const legacyCourses = legacy.length
    ? await prisma.course.findMany({
        where: {
          createdById: { in: [...new Set(legacy.map((c) => c.contributorId))] },
          name: { in: legacy.map((c) => nameOf(c.data)).filter(Boolean) },
        },
        orderBy: { createdAt: 'desc' },
        select,
      })
    : [];

  for (const c of approved) {
    const course = c.targetId
      ? byId.get(c.targetId)
      : legacyCourses.find((k) => k.createdById === c.contributorId && k.name === nameOf(c.data));
    if (course) out.set(c.id, { id: course.id, name: course.name, slug: course.slug, isActive: course.isActive });
  }
  return out;
}
