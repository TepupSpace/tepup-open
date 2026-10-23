import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getLiveTarget } from '@/lib/services/proposal-service';
import ProposeEditSection from '@/components/contributor/hub/ProposeEditSection';
import HistorySection from '@/components/history/HistorySection';
import DiscussionThread from '@/components/discussion/DiscussionThread';

export const metadata: Metadata = { title: 'Công cụ cho chương truyện' };

/**
 * Chapter hub for contributors: propose an edit, history and discussion. 404 for a chapter
 * the user may not see (hidden chapter, story or character: global reviewers only).
 */
export default async function ChapterHubPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireContributor();
  const { id } = await params;
  const live = await getLiveTarget({ id: session.user.id, role: session.user.role as UserRole }, 'EDIT_CHAPTER_CONTENT', id);
  if (!live) notFound();

  const context = await prisma.chapter.findUnique({
    where: { id },
    select: { part: { select: { name: true } }, story: { select: { title: true } } },
  });
  if (!context) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <p className="text-sm text-gray-600">
          {context.story.title} › {context.part.name}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{live.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <Link href={live.href} className="text-teal-800 underline">
            Mở chương
          </Link>
          {live.hidden && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Đang ẩn với người đọc
            </span>
          )}
        </p>
      </header>

      <ProposeEditSection targetType="CHAPTER" targetId={id} />
      <HistorySection targetType="CHAPTER" targetId={id} />

      <section aria-labelledby="hub-discussion">
        <h2 id="hub-discussion" className="mb-3 text-lg font-semibold text-gray-900">
          Thảo luận
        </h2>
        <DiscussionThread targetType="CHAPTER" targetId={id} />
      </section>
    </div>
  );
}
