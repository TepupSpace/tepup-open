import { Download } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '@/components/staff/PageHeader';
import Card from '@/components/staff/Card';
import { ButtonLink, staffButtonClass } from '@/components/staff/Button';
import { AnalyticsNav, Table } from '@/components/admin/analytics/AnalyticsUi';
import PrintButton from '@/components/admin/analytics/PrintButton';
import { PRESETS, presetPeriod, resolvePeriod, vnToday } from '@/lib/analytics/period';
import { buildFunderReport, countryLabel, deviceLabel, formatChange, formatValue, type FunderMetric } from '@/lib/analytics/funder';

export const metadata = { title: 'Báo cáo nhà tài trợ — Số liệu học' };
export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60 * 1000;

function MetricTable({ group, metrics }: { group: FunderMetric['group']; metrics: FunderMetric[] }) {
  return (
    <Table
      title={group}
      head={['Chỉ số', 'Kỳ này', 'Kỳ trước', 'Thay đổi', 'Cách tính']}
      rows={metrics
        .filter((m) => m.group === group)
        .map((m) => [
          <span key="l" className="font-medium">{m.label}</span>,
          formatValue(m, m.current),
          m.noPrevious ? '—' : formatValue(m, m.previous),
          formatChange(m),
          <span key="n" className="text-gray-600">{m.note}</span>,
        ])}
    />
  );
}

export default async function FunderReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const today = vnToday();
  const pair = resolvePeriod(sp.from, sp.to, today);
  const { current: c, previous: p } = pair;
  const report = await buildFunderReport(pair);
  const qs = `from=${c.from}&to=${c.to}`;
  const oldestKept = new Date(Date.parse(`${today}T00:00:00Z`) - 365 * DAY).toISOString().slice(0, 10);
  const tooOld = p.from < oldestKept;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="Số liệu học"
        title="Báo cáo nhà tài trợ"
        description={
          <>
            Kỳ <strong>{c.from}</strong> đến <strong>{c.to}</strong> ({c.days} ngày), so với kỳ trước {p.from} đến {p.to}.
            Tiếp cận và gắn kết, theo giờ Việt Nam. Không chứa mã người học.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <PrintButton />
            <a href={`/api/admin/analytics/report?${qs}`} download className={staffButtonClass('secondary', 'sm')}>
              <Download className="w-4 h-4" aria-hidden="true" />
              Tải CSV
            </a>
          </div>
        }
      />
      <AnalyticsNav current="/admin/analytics/report" />

      <Card className="p-5 space-y-4 print:hidden">
        <nav aria-label="Chọn nhanh kỳ báo cáo" className="flex flex-wrap gap-2">
          {PRESETS.map((pr) => {
            const pp = presetPeriod(pr.key, today);
            const active = pp.from === c.from && pp.to === c.to;
            return (
              <ButtonLink
                key={pr.key}
                href={`/admin/analytics/report?from=${pp.from}&to=${pp.to}`}
                variant={active ? 'primary' : 'secondary'}
                size="sm"
                aria-current={active ? 'page' : undefined}
              >
                {pr.label}
              </ButtonLink>
            );
          })}
        </nav>
        <form method="get" action="/admin/analytics/report" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="report-from" className="block text-xs font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              id="report-from"
              name="from"
              type="date"
              defaultValue={c.from}
              max={today}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="report-to" className="block text-xs font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              id="report-to"
              name="to"
              type="date"
              defaultValue={c.to}
              max={today}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
            />
          </div>
          <button type="submit" className={staffButtonClass('secondary', 'sm')}>
            Xem kỳ này
          </button>
          <p className="text-xs text-gray-600 basis-full">Tối đa 366 ngày. Ngày sau hôm nay được tính đến hôm nay.</p>
        </form>
      </Card>

      {tooOld && (
        <Card className="p-4 border-l-4 border-amber-500">
          <p className="text-sm text-gray-800">
            Một phần kỳ trước nằm ngoài 365 ngày gần nhất. Số liệu chi tiết cũ hơn đã bị xoá, nên “Người học”,
            “Người quay lại” và “Phiên học” của kỳ trước thấp hơn thực tế. Các số đếm tổng vẫn đủ.
          </p>
        </Card>
      )}

      <MetricTable group="Tiếp cận" metrics={report.metrics} />
      <MetricTable group="Gắn kết" metrics={report.metrics} />

      <Table
        title="Theo khoá học"
        description="Người học: trình duyệt đã mở ít nhất một bài của khoá trong kỳ. Lượt: gồm cả người đã tắt số liệu."
        head={['Khoá', 'Người học', 'Lượt bắt đầu bài', 'Lượt học xong bài', 'Học xong cả khoá']}
        rows={report.courses.map((x) => [
          x.name,
          x.learners.toLocaleString('vi-VN'),
          x.starts.toLocaleString('vi-VN'),
          x.completes.toLocaleString('vi-VN'),
          x.courseCompletes.toLocaleString('vi-VN'),
        ])}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Table
          title="Theo quốc gia"
          head={['Quốc gia', 'Người học']}
          rows={report.countries.map((x) => [countryLabel(x.key), x.learners.toLocaleString('vi-VN')])}
        />
        <Table
          title="Theo thiết bị"
          head={['Thiết bị', 'Người học']}
          rows={report.devices.map((x) => [deviceLabel(x.key), x.learners.toLocaleString('vi-VN')])}
        />
      </div>

      <Card as="section" flat className="p-5 break-inside-avoid" aria-labelledby="report-notes">
        <h2 id="report-notes" className="text-lg font-semibold text-gray-900 mb-2">
          Đọc số liệu này thế nào
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>
            Tepup không có tài khoản người học. “Người học” là số trình duyệt, nên là con số ước tính: một người
            dùng hai máy được tính hai lần, người xoá dữ liệu trình duyệt được tính lại từ đầu.
          </li>
          <li>
            “Người học”, “Người quay lại” và “Phiên học” không gồm những người đã tắt “Đóng góp số liệu ẩn danh”.
            Các lượt bắt đầu, học xong và người học mới thì gồm cả họ.
          </li>
          <li>
            Bộ đếm người học mới bắt đầu từ {report.countingSince ?? 'khi có lượt đầu tiên'}; trước đó chưa đếm,
            nên số cộng dồn thấp hơn thực tế.
          </li>
          <li>Không có IP, tên hay tài khoản nào đứng sau các con số này.</li>
        </ul>
      </Card>
    </div>
  );
}
