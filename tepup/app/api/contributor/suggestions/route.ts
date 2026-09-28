import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canReviewContent } from '@/lib/role-utils';
import type { SuggestionStatus, UserRole } from '@prisma/client';

const STATUSES: SuggestionStatus[] = ['PENDING', 'ACCEPTED', 'APPLIED', 'REJECTED'];

/** Reviewer queue of anonymous suggestions, with a link to the live page and the editor. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !canReviewContent(session.user.role as UserRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const param = req.nextUrl.searchParams.get('status');
  const statuses: SuggestionStatus[] =
    param === 'open' || !param
      ? ['PENDING', 'ACCEPTED']
      : STATUSES.includes(param as SuggestionStatus)
        ? [param as SuggestionStatus]
        : ['PENDING', 'ACCEPTED'];

  const suggestions = await prisma.suggestion.findMany({
    where: { status: { in: statuses } },
    orderBy: { createdAt: 'asc' },
    take: 200,
    include: { reviewer: { select: { username: true } } },
  });

  const lessonIds = suggestions.filter((s) => s.targetType === 'LESSON').map((s) => s.targetId);
  const chapterIds = suggestions.filter((s) => s.targetType === 'CHAPTER').map((s) => s.targetId);
  const [lessons, chapters] = await Promise.all([
    prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
      select: { id: true, name: true, slug: true, course: { select: { name: true, slug: true } } },
    }),
    prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        story: { select: { title: true, slug: true, character: { select: { slug: true } } } },
      },
    }),
  ]);
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const chapterById = new Map(chapters.map((c) => [c.id, c]));

  const items = suggestions.map((s) => {
    let target: { title: string; context: string; viewHref: string | null; editHref: string | null };
    if (s.targetType === 'LESSON') {
      const l = lessonById.get(s.targetId);
      target = l
        ? {
            title: l.name,
            context: l.course.name,
            viewHref: `/courses/${l.course.slug}/${l.slug}`,
            editHref: `/admin/lessons/${l.id}/content`,
          }
        : { title: '(bài học đã bị xoá)', context: '', viewHref: null, editHref: null };
    } else {
      const c = chapterById.get(s.targetId);
      target = c
        ? {
            title: c.title,
            context: c.story.title,
            viewHref: `/story/${c.story.character.slug}/${c.story.slug}/${c.slug}`,
            editHref: `/admin/chapters/${c.id}/content`,
          }
        : { title: '(chương đã bị xoá)', context: '', viewHref: null, editHref: null };
    }
    return {
      id: s.id,
      targetType: s.targetType,
      quote: s.quote,
      proposal: s.proposal,
      reason: s.reason,
      status: s.status,
      reviewNote: s.reviewNote,
      reviewer: s.reviewer?.username ?? null,
      createdAt: s.createdAt,
      resolvedAt: s.resolvedAt,
      target,
    };
  });

  return NextResponse.json({ items });
}
