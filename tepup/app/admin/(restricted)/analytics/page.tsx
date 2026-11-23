import Link from '@/components/ui/AppLink';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '@/components/staff/PageHeader';
import Badge from '@/components/staff/Badge';
import { ButtonLink } from '@/components/staff/Button';
import { AnalyticsNav, pct, rateTone, Stat, Table } from '@/components/admin/analytics/AnalyticsUi';
import { presetPeriod, vnToday } from '@/lib/analytics/period';
import {
  courseCompletions,
  featureUsage,
  lessonTotals,
  reachSummary,
  retention,
  sessionsByDay,
  topErrors,
} from '@/lib/analytics/reports';

export const metadata = { title: 'Số liệu học ẩn danh' };
export const dynamic = 'force-dynamic';

const RANGES = [7, 30, 90] as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.days) ?? 30;
  const month = presetPeriod('this-month', vnToday());

  const [lessons, courses, errors, features, sessions, ret, reach] = await Promise.all([
    lessonTotals(days),
    courseCompletions(days),
    topErrors(days),
    featureUsage(days),
    sessionsByDay(days),
    retention(Math.max(days, 14)),
    reachSummary(month.from, month.to),
  ]);
  const totalSessions = sessions.reduce((a, s) => a + s.sessions, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="Hệ thống"
        title="Số liệu học ẩn danh"
        description={
          <>
            Không IP, không tài khoản. Số tổng gồm cả người đã tắt số liệu; hành trình và tỉ lệ quay lại chỉ tính
            người đang bật. Quyết định và định nghĩa: <code>docs/data-tracking-docs/du-lieu-va-bao-cao.md</code>.{' '}
            <Link href="/du-lieu" className="underline underline-offset-2">Xem trang công khai</Link>.
          </>
        }
        actions={
          <nav aria-label="Khoảng thời gian" className="flex gap-2">
            {RANGES.map((r) => (
              <ButtonLink
                key={r}
                href={`/admin/analytics?days=${r}`}
                variant={r === days ? 'primary' : 'secondary'}
                size="sm"
                aria-current={r === days ? 'page' : undefined}
              >
                {r} ngày
              </ButtonLink>
            ))}
          </nav>
        }
      />
      <AnalyticsNav current="/admin/analytics" />

      <section aria-labelledby="reach-month" className="space-y-3">
        <h2 id="reach-month" className="text-lg font-semibold text-gray-900">
          Tháng này ({month.from} đến {month.to})
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Người học" value={reach.learners.toLocaleString('vi-VN')} note="trình duyệt có học, không gồm người đã tắt" />
          <Stat label="Người học mới" value={reach.newBrowsers.toLocaleString('vi-VN')} note="trình duyệt lần đầu ghé Tepup" />
          <Stat label="Tổng người học (cộng dồn)" value={reach.cumulativeBrowsers.toLocaleString('vi-VN')} note="từ khi bắt đầu đếm" />
        </div>
      </section>

      <section aria-labelledby="engagement" className="space-y-3">
        <h2 id="engagement" className="text-lg font-semibold text-gray-900">
          {days} ngày qua
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Phiên học" value={totalSessions.toLocaleString('vi-VN')} />
          <Stat label="Quay lại sau ≥1 ngày" value={pct(ret.d1, ret.cohort)} note={`trên ${ret.cohort} người mới`} />
          <Stat label="Quay lại sau ≥7 ngày" value={pct(ret.d7, ret.cohort)} note={`trên ${ret.cohort} người mới`} />
          <Stat label="Quay lại sau ≥30 ngày" value={pct(ret.d30, ret.cohort30)} note={`trên ${ret.cohort30} người mới`} />
        </div>
      </section>

      <Table
        title="Bài học và chương"
        description="Bắt đầu → học xong, số tổng (gồm cả người đã tắt số liệu). Bấm “Hành trình” để xem từng block."
        head={['Bài / chương', 'Khoá', 'Bắt đầu', 'Học xong', 'Tỉ lệ', '']}
        rows={lessons.map((l) => [
          l.name,
          l.course,
          l.starts,
          l.completes,
          <Badge key="r" tone={rateTone(l.completes, l.starts)}>{pct(l.completes, l.starts)}</Badge>,
          <Link
            key={l.contentId}
            href={`/admin/analytics/journey?lesson=${l.contentId}&days=${days}`}
            className="underline underline-offset-2 text-gray-800 hover:text-gray-900"
          >
            Hành trình<span className="sr-only">: {l.name}</span>
          </Link>,
        ])}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Học xong cả khoá" description="Số tổng." head={['Khoá', 'Lượt']} rows={courses.map((c) => [c.name, c.n])} />
        <Table
          title="Tính năng"
          head={['Tính năng', 'Lượt', 'Phiên']}
          rows={features.map((f) => [f.feature, f.events, f.sessions])}
        />
      </div>

      <Table
        title="Phiên theo ngày"
        head={['Ngày', 'Phiên', 'Trong đó quay lại']}
        rows={sessions.map((s) => [s.day, s.sessions, s.returning])}
      />

      <Table
        title="Lỗi thường gặp"
        head={['Lỗi', 'Thông báo', 'Trang', 'Nguồn', 'Lượt']}
        rows={errors.map((e) => [e.errorName, e.message, e.routeType ?? '', e.source, e.n])}
      />
    </div>
  );
}
