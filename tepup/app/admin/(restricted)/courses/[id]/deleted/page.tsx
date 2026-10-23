import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { prisma } from '@/lib/prisma';
import { formatTime, historyHref } from '@/components/history/types';
import { nameOf, USER_NAME_SELECT } from '@/app/api/history/_lib/access';
import CopyRevisionButton from './CopyRevisionButton';

export const metadata: Metadata = { title: 'Bài đã xóa' };

/**
 * Admin → Courses → (course) → "Bài đã xóa" (proposal §6.10): DELETED lesson revisions of
 * the course. Undelete is not built; the last content can be viewed or copied (JSON) into a
 * new lesson. Admin only ((restricted) layout).
 */
export default async function DeletedLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, rows] = await Promise.all([
    prisma.course.findUnique({ where: { id }, select: { name: true } }),
    prisma.contentRevision.findMany({
      where: { courseId: id, targetType: 'LESSON', source: 'DELETED' },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, targetId: true, label: true, createdAt: true, actor: { select: USER_NAME_SELECT } },
    }),
  ]);
  if (!course && rows.length === 0) notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <header>
        <p className="text-sm text-gray-600">
          <Link href={`/admin/courses/${id}`} className="text-blue-700 underline">
            {course?.name ?? 'Khóa học đã xóa'}
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Bài đã xóa</h1>
        <p className="mt-1 text-sm text-gray-600">
          Nội dung cuối cùng của các bài đã xóa. Không khôi phục trực tiếp được: sao chép nội dung (JSON) rồi dán vào một bài mới.
        </p>
      </header>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">Chưa có bài nào bị xóa.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{r.label}</p>
                <p className="text-gray-600">
                  Xóa lúc <time dateTime={r.createdAt.toISOString()}>{formatTime(r.createdAt.toISOString())}</time>
                  {r.actor ? ` · bởi ${nameOf(r.actor)}` : ''}
                </p>
              </div>
              <Link href={historyHref('admin', 'LESSON', r.targetId, r.id)} className="text-blue-700 underline">
                Xem<span className="sr-only"> nội dung bài {r.label}</span>
              </Link>
              <CopyRevisionButton revisionId={r.id} label={r.label} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
