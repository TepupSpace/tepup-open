import { changeLabel, type PeriodPair } from './period';
import {
  courseReach,
  newBrowserCountingSince,
  reachBreakdown,
  reachSummary,
  type BreakdownRow,
  type CourseReachRow,
  type ReachSummary,
} from './reports';

/**
 * Báo cáo nhà tài trợ: Tiếp cận + Gắn kết (quyết định 2026-11-22, docs/data-tracking-docs/du-lieu-va-bao-cao.md).
 * Dùng chung cho trang /admin/analytics/report và file CSV. Không chứa mã nào.
 */

export type FunderMetric = {
  group: 'Tiếp cận' | 'Gắn kết';
  label: string;
  note: string;
  current: number;
  previous: number;
  /** `ratio`: 0..1, hiển thị %, thay đổi tính bằng điểm %. */
  format: 'count' | 'ratio';
  /** Tỉ lệ có mẫu số bằng 0 ở kỳ trước: không so được, hiện "—". */
  noPrevious?: boolean;
};

export type FunderReport = {
  pair: PeriodPair;
  metrics: FunderMetric[];
  courses: CourseReachRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  countingSince: string | null;
};

const ratio = (n: number, d: number) => (d > 0 ? n / d : 0);

function metrics(cur: ReachSummary, prev: ReachSummary): FunderMetric[] {
  return [
    {
      group: 'Tiếp cận',
      label: 'Người học',
      note: 'Số trình duyệt có học trong kỳ. Không gồm người đã tắt số liệu; một người dùng hai máy tính là hai.',
      current: cur.learners,
      previous: prev.learners,
      format: 'count',
    },
    {
      group: 'Tiếp cận',
      label: 'Người học mới',
      note: 'Trình duyệt lần đầu ghé Tepup trong kỳ (gồm cả người đã tắt số liệu).',
      current: cur.newBrowsers,
      previous: prev.newBrowsers,
      format: 'count',
    },
    {
      group: 'Tiếp cận',
      label: 'Tổng người học (cộng dồn)',
      note: 'Tổng trình duyệt mới từ khi bắt đầu đếm đến cuối kỳ.',
      current: cur.cumulativeBrowsers,
      previous: prev.cumulativeBrowsers,
      format: 'count',
    },
    {
      group: 'Tiếp cận',
      label: 'Phiên học',
      note: 'Một phiên kết thúc sau 30 phút không hoạt động.',
      current: cur.sessions,
      previous: prev.sessions,
      format: 'count',
    },
    {
      group: 'Gắn kết',
      label: 'Người quay lại',
      note: 'Người học có học vào ít nhất 2 ngày khác nhau trong kỳ.',
      current: cur.returning,
      previous: prev.returning,
      format: 'count',
    },
    {
      group: 'Gắn kết',
      label: 'Tỉ lệ quay lại',
      note: 'Người quay lại / người học.',
      current: ratio(cur.returning, cur.learners),
      previous: ratio(prev.returning, prev.learners),
      format: 'ratio',
      noPrevious: prev.learners === 0,
    },
    {
      group: 'Gắn kết',
      label: 'Lượt bắt đầu bài',
      note: 'Bài học và chương truyện, gồm cả người đã tắt số liệu.',
      current: cur.starts,
      previous: prev.starts,
      format: 'count',
    },
    {
      group: 'Gắn kết',
      label: 'Lượt học xong bài',
      note: 'Bài học và chương truyện, gồm cả người đã tắt số liệu.',
      current: cur.completes,
      previous: prev.completes,
      format: 'count',
    },
    {
      group: 'Gắn kết',
      label: 'Tỉ lệ học xong',
      note: 'Lượt học xong / lượt bắt đầu.',
      current: ratio(cur.completes, cur.starts),
      previous: ratio(prev.completes, prev.starts),
      format: 'ratio',
      noPrevious: prev.starts === 0,
    },
    {
      group: 'Gắn kết',
      label: 'Lượt học xong cả khoá',
      note: 'Gồm cả người đã tắt số liệu.',
      current: cur.courseCompletes,
      previous: prev.courseCompletes,
      format: 'count',
    },
  ];
}

export async function buildFunderReport(pair: PeriodPair): Promise<FunderReport> {
  const { current: c, previous: p } = pair;
  const [cur, prev, courses, countries, devices, countingSince] = await Promise.all([
    reachSummary(c.from, c.to),
    reachSummary(p.from, p.to),
    courseReach(c.from, c.to),
    reachBreakdown('country', c.from, c.to),
    reachBreakdown('device', c.from, c.to),
    newBrowserCountingSince(),
  ]);
  return { pair, metrics: metrics(cur, prev), courses, countries, devices, countingSince };
}

// --- hiển thị --------------------------------------------------------------------------------

export function formatValue(m: Pick<FunderMetric, 'format'>, v: number): string {
  return m.format === 'ratio' ? `${Math.round(v * 100)}%` : v.toLocaleString('vi-VN');
}

export function formatChange(m: FunderMetric): string {
  if (m.format === 'count') return changeLabel(m.current, m.previous);
  if (m.noPrevious) return '—';
  const d = Math.round((m.current - m.previous) * 100);
  return d > 0 ? `+${d} điểm %` : d < 0 ? `−${Math.abs(d)} điểm %` : '0 điểm %';
}

const DEVICE_LABELS: Record<string, string> = { mobile: 'Điện thoại', tablet: 'Máy tính bảng', desktop: 'Máy tính' };

export function deviceLabel(key: string): string {
  return DEVICE_LABELS[key] ?? (key || 'Không rõ');
}

let regionNames: Intl.DisplayNames | null | undefined;

export function countryLabel(code: string): string {
  if (!code) return 'Không rõ';
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['vi'], { type: 'region' });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

// --- CSV -------------------------------------------------------------------------------------

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function line(cells: (string | number)[]): string {
  return cells.map(cell).join(',');
}

/** CSV UTF-8 có BOM (Excel mở đúng tiếng Việt). Số thô, không định dạng hàng nghìn. */
export function funderReportCsv(r: FunderReport): string {
  const { current: c, previous: p } = r.pair;
  const raw = (m: FunderMetric, v: number, prev = false) =>
    prev && m.noPrevious ? '—' : m.format === 'ratio' ? `${Math.round(v * 100)}%` : v;
  const out: string[] = [
    line(['Báo cáo Tepup', `${c.from} đến ${c.to}`]),
    line(['So với kỳ trước', `${p.from} đến ${p.to}`]),
    '',
    line(['Nhóm', 'Chỉ số', 'Kỳ này', 'Kỳ trước', 'Thay đổi', 'Ghi chú']),
    ...r.metrics.map((m) => line([m.group, m.label, raw(m, m.current), raw(m, m.previous, true), formatChange(m), m.note])),
    '',
    line(['Khoá học', 'Người học', 'Lượt bắt đầu bài', 'Lượt học xong bài', 'Học xong cả khoá']),
    ...r.courses.map((x) => line([x.name, x.learners, x.starts, x.completes, x.courseCompletes])),
    '',
    line(['Quốc gia', 'Người học']),
    ...r.countries.map((x) => line([countryLabel(x.key), x.learners])),
    '',
    line(['Thiết bị', 'Người học']),
    ...r.devices.map((x) => line([deviceLabel(x.key), x.learners])),
  ];
  return `﻿${out.join('\r\n')}\r\n`;
}
