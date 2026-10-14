import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canReviewContent } from '@/lib/role-utils';
import type { SuggestionStatus, UserRole } from '@prisma/client';
import { TYPE_LABELS } from '@/lib/library/schemas';

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

  // A new-term suggestion (NEW_ENTRY) points at the lesson or chapter it was made from.
  const lessonIds = suggestions.filter((s) => s.targetType === 'LESSON' || s.targetType === 'NEW_ENTRY').map((s) => s.targetId);
  const chapterIds = suggestions.filter((s) => s.targetType === 'CHAPTER' || s.targetType === 'NEW_ENTRY').map((s) => s.targetId);
  const entryIds = suggestions.filter((s) => s.targetType === 'LIBRARY_ENTRY').map((s) => s.targetId);
  const [lessons, chapters, entries] = await Promise.all([
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
    prisma.libraryEntry.findMany({
      where: { id: { in: entryIds } },
      select: { id: true, slug: true, title: true, type: true },
    }),
  ]);
  const entryById = new Map(entries.map((e) => [e.id, e]));
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const chapterById = new Map(chapters.map((c) => [c.id, c]));

  const items = suggestions.map((s) => {
    let target: { title: string; context: string; viewHref: string | null; editHref: string | null };
    if (s.targetType === 'LIBRARY_ENTRY') {
      const e = entryById.get(s.targetId);
      target = e
        ? {
            title: e.title,
            context: `Mục thư viện · ${TYPE_LABELS[e.type]}`,
            viewHref: `/thu-vien/muc/${e.slug}`,
            editHref: `/admin/library-entries/${e.id}`,
          }
        : { title: '(mục thư viện đã bị xoá)', context: '', viewHref: null, editHref: null };
    } else if (s.targetType === 'NEW_ENTRY') {
      const l = lessonById.get(s.targetId);
      const c = chapterById.get(s.targetId);
      target = {
        title: `Đề xuất ${TYPE_LABELS[s.suggestedType ?? 'CONCEPT'].toLowerCase()} mới`,
        context: l ? `từ bài “${l.name}”` : c ? `từ chương “${c.title}”` : 'từ thư viện',
        viewHref: l ? `/courses/${l.course.slug}/${l.slug}` : c ? `/story/${c.story.character.slug}/${c.story.slug}/${c.slug}` : null,
        editHref: `/admin/library-entries/new?type=${s.suggestedType ?? 'CONCEPT'}`,
      };
    } else if (s.targetType === 'LESSON') {
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
