import Link from '@/components/ui/AppLink';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '@/components/staff/PageHeader';
import Card from '@/components/staff/Card';
import Badge from '@/components/staff/Badge';
import { ButtonLink } from '@/components/staff/Button';
import {
  blockFunnel,
  courseCompletions,
  featureUsage,
  lessonTotals,
  optionTally,
  questionStats,
  retention,
  sessionsByDay,
  topErrors,
} from '@/lib/analytics/reports';

export const metadata = { title: 'Số liệu học ẩn danh' };
export const dynamic = 'force-dynamic';

const RANGES = [7, 30, 90] as const;

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '—');

/** Màu chỉ để nhìn nhanh; chữ trong nhãn (con số %) mới là thông tin. */
function rateTone(n: number, d: number): 'green' | 'warning' | 'wrong' | 'neutral' {
  if (d < 10) return 'neutral';
  const r = n / d;
  return r >= 0.6 ? 'green' : r >= 0.3 ? 'warning' : 'wrong';
}

function Table({
  title,
  description,
  head,
  rows,
}: {
  title: string;
  description?: string;
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <Card as="section" flat className="overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              {head.map((h) => (
                <th key={h} scope="col" className="text-left px-5 py-2.5 text-xs font-medium text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={head.length} className="px-5 py-4 text-gray-600">
                  Chưa có số liệu.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  {r.map((c, j) => (
                    <td key={j} className="px-5 py-2.5 text-gray-800 align-top">
                      {c}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
      {note && <p className="text-xs text-gray-600 mt-1">{note}</p>}
    </Card>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; lesson?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.days) ?? 30;
  const lesson = sp.lesson && /^[A-Za-z0-9_-]{1,64}$/.test(sp.lesson) ? sp.lesson : null;

  const [lessons, courses, errors, features, sessions, ret] = await Promise.all([
    lessonTotals(days),
    courseCompletions(days),
    topErrors(days),
    featureUsage(days),
    sessionsByDay(days),
    retention(Math.max(days, 14)),
  ]);
  const detail = lesson
    ? await Promise.all([blockFunnel(lesson, days), questionStats(lesson, days), optionTally(lesson)])
    : null;
  const selected = lessons.find((l) => l.contentId === lesson);
  const totalSessions = sessions.reduce((a, s) => a + s.sessions, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="Hệ thống"
        title="Số liệu học ẩn danh"
        description={
          <>
            Không IP, không tài khoản. Số tổng gồm cả người đã tắt tracking; drop-off và retention chỉ tính người
            đang bật. <Link href="/du-lieu" className="underline underline-offset-2">Xem trang công khai</Link>.
          </>
        }
        actions={
          <nav aria-label="Khoảng thời gian" className="flex gap-2">
            {RANGES.map((r) => (
              <ButtonLink
                key={r}
                href={`/admin/analytics?days=${r}${lesson ? `&lesson=${lesson}` : ''}`}
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

      <section aria-label="Tổng quan" className="grid gap-4 sm:grid-cols-3">
        <Stat label={`Phiên học (${days} ngày)`} value={totalSessions.toLocaleString('vi-VN')} />
        <Stat label="Quay lại sau ≥1 ngày" value={pct(ret.d1, ret.cohort)} note={`trên ${ret.cohort} mã mới`} />
        <Stat label="Quay lại sau ≥7 ngày" value={pct(ret.d7, ret.cohort)} note="mã tự đổi sau 30 ngày" />
      </section>

      <Table
        title="Bài học và chương"
        description="Bắt đầu → học xong, số tổng (gồm cả người đã tắt tracking)."
        head={['Bài / chương', 'Khoá', 'Bắt đầu', 'Học xong', 'Tỉ lệ', '']}
        rows={lessons.map((l) => [
          l.name,
          l.course,
          l.starts,
          l.completes,
          <Badge key="r" tone={rateTone(l.completes, l.starts)}>{pct(l.completes, l.starts)}</Badge>,
          <Link
            key={l.contentId}
            href={`/admin/analytics?days=${days}&lesson=${l.contentId}`}
            aria-current={l.contentId === lesson ? 'true' : undefined}
            className="underline underline-offset-2 text-gray-800 hover:text-gray-900"
          >
            Chi tiết<span className="sr-only">: {l.name}</span>
          </Link>,
        ])}
      />

      {detail && (
        <section aria-labelledby="detail" className="space-y-4">
          <h2 id="detail" className="text-xl font-semibold text-gray-900">
            Chi tiết: {selected?.name ?? lesson}
          </h2>
          <Table
            title="Drop-off"
            description="Số phiên đã thấy từng block, so với block đầu tiên."
            head={['Block #', 'Loại', 'Phiên', 'So với block đầu']}
            rows={detail[0].map((b) => [b.blockIndex + 1, b.blockType, b.sessions, pct(b.sessions, detail[0][0]?.sessions ?? 0)])}
          />
          <Table
            title="Câu hỏi"
            description="Tỉ lệ trả lời đúng ở lần kiểm tra đầu."
            head={['Block #', 'Lượt trả lời', 'Đúng', 'Tỉ lệ đúng']}
            rows={detail[1].map((q) => [q.blockIndex + 1, q.answers, q.correct, pct(q.correct, q.answers)])}
          />
          <Table
            title="Phân bố đáp án"
            description="Toàn thời gian. Bộ đếm này không gắn ngày hay mã nào."
            head={['Block', 'Đáp án', 'Số lượt chọn']}
            rows={detail[2].map((o) => {
              const [block, option] = o.key.split(':');
              // `i<n>`: block không có id, n là chỉ số 0-based → hiện như "Block #" ở các bảng khác.
              const m = /^i(\d+)$/.exec(block);
              return [m ? `#${Number(m[1]) + 1}` : block, option, o.count];
            })}
          />
        </section>
      )}

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
