import Link from '@/components/ui/AppLink';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/services/audit-service';
import PageHeader from '@/components/staff/PageHeader';
import { AnalyticsNav } from '@/components/admin/analytics/AnalyticsUi';
import LearnerJourneyBrowser, { type LearnerListRow } from '@/components/admin/analytics/LearnerJourneyBrowser';
import { contentInfo } from '@/lib/analytics/journey';
import { recentLearners } from '@/lib/analytics/learners';
import { countryLabel, deviceLabel } from '@/lib/analytics/funder';

export const metadata = { title: 'Người học — Số liệu học' };
export const dynamic = 'force-dynamic';

const ID = /^[A-Za-z0-9_-]{1,64}$/;

const hourFmt = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Danh sách mã gần đây (quyết định 2026-11-22, docs/data-tracking-docs/du-lieu-va-bao-cao.md). Chỉ admin; mỗi lần
 * xem ghi AuditLog (không ghi mã). Hành trình mở qua POST, mã không lên URL.
 */
export default async function LearnersPage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const lessonId = sp.lesson && ID.test(sp.lesson) ? sp.lesson : null;

  const [learners, info] = await Promise.all([recentLearners(lessonId), lessonId ? contentInfo(lessonId) : null]);
  await audit(prisma, {
    actorId: session.user.id,
    action: 'ANALYTICS_LEARNERS_LISTED',
    targetType: 'ANALYTICS',
    targetId: 'learners',
  });

  const rows: LearnerListRow[] = learners.map((l) => ({
    anonId: l.anonId,
    short: l.anonId.slice(0, 8),
    lastAt: hourFmt.format(new Date(l.lastAt)),
    firstAt: hourFmt.format(new Date(l.firstAt)),
    sessions: l.sessions,
    started: l.started,
    completed: l.completed,
    country: countryLabel(l.country ?? ''),
    device: deviceLabel(l.device ?? ''),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="Số liệu học"
        title="Người học"
        description={
          <>
            Hành trình của từng trình duyệt, để hiểu người học đi qua bài thế nào. Chỉ quản trị viên xem được; mỗi lần
            xem danh sách hay một hành trình đều được ghi vào{' '}
            <Link href="/admin/audit-log" className="underline underline-offset-2">nhật ký kiểm toán</Link>. Không có
            IP, tên hay tài khoản nào ở đây. Đừng chép mã ra ngoài.
          </>
        }
      />
      <AnalyticsNav current="/admin/analytics/learners" />

      {lessonId && (
        <p className="text-gray-800">
          Đang lọc: người đã mở <strong>{info ? `${info.parentName} › ${info.name}` : 'bài đã xoá'}</strong>.{' '}
          <Link href="/admin/analytics/learners" className="underline underline-offset-2">
            Bỏ lọc
          </Link>
        </p>
      )}

      <LearnerJourneyBrowser rows={rows} />
    </div>
  );
}
