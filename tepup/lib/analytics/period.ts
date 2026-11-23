/**
 * Kỳ báo cáo (theo ngày giờ Việt Nam) cho báo cáo nhà tài trợ. Thuần, không đụng DB, để test được.
 * Ngày dạng 'YYYY-MM-DD', hai đầu đều tính.
 */

const DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET = 7 * 60 * 60 * 1000;
/** Dữ liệu chi tiết bị xoá sau 365 ngày (cron), nên kỳ dài hơn không có nghĩa. */
export const MAX_PERIOD_DAYS = 366;

export type Period = { from: string; to: string; days: number };
export type PeriodPair = { current: Period; previous: Period };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function toMs(day: string): number {
  return Date.parse(`${day}T00:00:00Z`);
}

function toDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function vnToday(now = Date.now()): string {
  return toDay(now + VN_OFFSET);
}

function isValidDay(s: string | undefined): s is string {
  return !!s && ISO.test(s) && !Number.isNaN(toMs(s)) && toDay(toMs(s)) === s;
}

function make(from: string, to: string): Period {
  return { from, to, days: Math.round((toMs(to) - toMs(from)) / DAY) + 1 };
}

/** Kỳ liền trước, cùng độ dài. */
export function previousOf(p: Period): Period {
  const to = toDay(toMs(p.from) - DAY);
  return make(toDay(toMs(to) - (p.days - 1) * DAY), to);
}

function monthStart(day: string, offsetMonths = 0): string {
  const d = new Date(toMs(day));
  return toDay(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offsetMonths, 1));
}

function quarterStart(day: string, offsetQuarters = 0): string {
  const d = new Date(toMs(day));
  const q = Math.floor(d.getUTCMonth() / 3) + offsetQuarters;
  return toDay(Date.UTC(d.getUTCFullYear(), q * 3, 1));
}

export type PresetKey = 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'last-12-months';

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'this-month', label: 'Tháng này' },
  { key: 'last-month', label: 'Tháng trước' },
  { key: 'this-quarter', label: 'Quý này' },
  { key: 'last-quarter', label: 'Quý trước' },
  { key: 'last-12-months', label: '12 tháng qua' },
];

export function presetPeriod(key: PresetKey, today: string): Period {
  switch (key) {
    case 'this-month':
      return make(monthStart(today), today);
    case 'last-month':
      return make(monthStart(today, -1), toDay(toMs(monthStart(today)) - DAY));
    case 'this-quarter':
      return make(quarterStart(today), today);
    case 'last-quarter':
      return make(quarterStart(today, -1), toDay(toMs(quarterStart(today)) - DAY));
    case 'last-12-months':
      return make(toDay(toMs(today) - 364 * DAY), today);
  }
}

/**
 * Đọc kỳ từ query (`from`, `to`). Sai định dạng, ngược chiều, vượt hôm nay hay dài quá
 * MAX_PERIOD_DAYS thì về "tháng này". Trả về cả kỳ trước để so sánh.
 */
export function resolvePeriod(from: string | undefined, to: string | undefined, today: string): PeriodPair {
  let current = presetPeriod('this-month', today);
  if (isValidDay(from) && isValidDay(to) && from <= to) {
    const clampedTo = to > today ? today : to;
    if (from <= clampedTo) {
      const p = make(from, clampedTo);
      if (p.days <= MAX_PERIOD_DAYS) current = p;
    }
  }
  return { current, previous: previousOf(current) };
}

/** Thay đổi so với kỳ trước, dạng "+12%" / "−5%"; kỳ trước bằng 0 thì "—". */
export function changeLabel(current: number, previous: number): string {
  if (previous <= 0) return '—';
  const r = Math.round(((current - previous) / previous) * 100);
  return r > 0 ? `+${r}%` : r < 0 ? `−${Math.abs(r)}%` : '0%';
}
