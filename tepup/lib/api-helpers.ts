import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { getAdminSession } from './admin-auth';
import { slugifyUnique } from './utils/slug';

/**
 * Slug for a lesson, unique within its course (the scope its URL disambiguates).
 * Pass `preferred` to honour an admin-supplied slug; otherwise it is derived from
 * the lesson name. `excludeId` skips the lesson being edited.
 */
export async function lessonSlugInCourse(
  courseId: string,
  name: string,
  preferred?: string | null,
  excludeId?: string
): Promise<string> {
  const siblings = await prisma.lesson.findMany({
    where: { courseId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const taken = siblings.map((s) => s.slug);
  return slugifyUnique(preferred?.trim() || name, taken, 'bai-hoc');
}

/**
 * Slug for a top-level entity whose slug is globally unique (course, story, …).
 * Derived from `name` unless the caller supplied one — so creating a course never
 * requires typing a slug by hand.
 */
export async function uniqueSlugForModel(
  model: 'course' | 'story' | 'category' | 'character',
  name: string,
  preferred?: string | null,
  excludeId?: string
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaModel = (prisma as any)[model];
  const rows: { slug: string }[] = await prismaModel.findMany({
    where: excludeId ? { id: { not: excludeId } } : {},
    select: { slug: true },
  });
  return slugifyUnique(preferred?.trim() || name, rows.map((r) => r.slug), model);
}

/** Slug for a chapter, unique within its story. Mirror of `lessonSlugInCourse`. */
export async function chapterSlugInStory(
  storyId: string,
  title: string,
  preferred?: string | null,
  excludeId?: string
): Promise<string> {
  const siblings = await prisma.chapter.findMany({
    where: { storyId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const taken = siblings.map((s) => s.slug);
  return slugifyUnique(preferred?.trim() || title, taken, 'chuong');
}

/** Check admin session, return 401 response if unauthorized */
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

/** Validate required fields, return 400 response if missing */
export function validateRequired(
  fields: Record<string, unknown>,
  messages: Record<string, string>
): NextResponse | null {
  for (const [key, message] of Object.entries(messages)) {
    const value = fields[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }
  return null;
}

/** Check if slug is unique for a model, return 400 response if exists */
export async function validateSlugUnique(
  model: 'course' | 'story' | 'category' | 'character',
  slug: string,
  excludeId?: string
): Promise<NextResponse | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaModel = (prisma as any)[model];
  const existing = await prismaModel.findFirst({
    where: {
      slug: slug.trim(),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Slug đã tồn tại. Vui lòng chọn slug khác.' },
      { status: 400 }
    );
  }
  return null;
}

/** Get next sortOrder for a model */
export async function getNextSortOrder(
  model: 'course' | 'story' | 'category' | 'character',
  where?: Record<string, unknown>
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaModel = (prisma as any)[model];
  const result = await prismaModel.aggregate({
    where,
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? 0) + 1;
}
