import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { getLiveTarget } from '@/lib/services/proposal-service';
import { TYPE_LABELS } from '@/lib/library/schemas';
import ProposeEditSection from '@/components/contributor/hub/ProposeEditSection';
import HistorySection from '@/components/history/HistorySection';
import DiscussionThread from '@/components/discussion/DiscussionThread';

export const metadata: Metadata = { title: 'Công cụ cho mục thư viện' };

/**
 * Library entry hub for contributors: propose an edit, history and discussion. 404 for an
 * entry the user may not see (hidden entries: global reviewers only).
 */
export default async function LibraryEntryHubPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireContributor();
  const { id } = await params;
  const live = await getLiveTarget({ id: session.user.id, role: session.user.role as UserRole }, 'EDIT_LIBRARY_ENTRY', id);
  if (!live) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <p className="text-sm text-gray-600">Thư viện › {live.entryType ? TYPE_LABELS[live.entryType] : 'Mục'}</p>
        <h1 className="text-2xl font-bold text-gray-900">{live.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {!live.hidden && (
            <Link href={live.href} className="text-teal-800 underline">
              Mở mục trong thư viện
            </Link>
          )}
          {live.hidden && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Đang ẩn với người đọc
            </span>
          )}
        </p>
      </header>

      <ProposeEditSection targetType="LIBRARY_ENTRY" targetId={id} />
      <HistorySection targetType="LIBRARY_ENTRY" targetId={id} />

      <section aria-labelledby="hub-discussion">
        <h2 id="hub-discussion" className="mb-3 text-lg font-semibold text-gray-900">
          Thảo luận
        </h2>
        <DiscussionThread targetType="LIBRARY_ENTRY" targetId={id} />
      </section>
    </div>
  );
}
