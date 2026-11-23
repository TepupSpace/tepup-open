import type { ReactNode } from 'react';
import Card from '@/components/staff/Card';
import { ButtonLink } from '@/components/staff/Button';

/** Thành phần chung của các trang /admin/analytics/** (server components). */

export const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '—');

/** Màu chỉ để nhìn nhanh; chữ trong nhãn (con số %) mới là thông tin. */
export function rateTone(n: number, d: number): 'green' | 'warning' | 'wrong' | 'neutral' {
  if (d < 10) return 'neutral';
  const r = n / d;
  return r >= 0.6 ? 'green' : r >= 0.3 ? 'warning' : 'wrong';
}

export function formatSeconds(s: number | null): string {
  if (s === null || !Number.isFinite(s)) return '—';
  const r = Math.round(s);
  if (r < 60) return `${r} giây`;
  const m = Math.floor(r / 60);
  const sec = r % 60;
  return sec ? `${m} phút ${sec} giây` : `${m} phút`;
}

export function Table({
  title,
  description,
  head,
  rows,
  empty = 'Chưa có số liệu.',
  headingLevel = 2,
}: {
  title: string;
  description?: ReactNode;
  head: string[];
  rows: ReactNode[][];
  empty?: string;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Card as="section" flat className="overflow-hidden break-inside-avoid">
      <div className="px-5 pt-4 pb-3">
        <H className="text-lg font-semibold text-gray-900">{title}</H>
        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              {head.map((h, i) => (
                <th key={`${h}-${i}`} scope="col" className="text-left px-5 py-2.5 text-xs font-medium text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={head.length} className="px-5 py-4 text-gray-600">
                  {empty}
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

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
      {note && <p className="text-xs text-gray-600 mt-1">{note}</p>}
    </Card>
  );
}

const TABS = [
  { href: '/admin/analytics', label: 'Tổng quan' },
  { href: '/admin/analytics/report', label: 'Báo cáo nhà tài trợ' },
  { href: '/admin/analytics/journey', label: 'Hành trình' },
  // Không prefetch: mỗi lần mở trang này ghi một dòng AuditLog, chỉ khi người dùng thật sự bấm.
  { href: '/admin/analytics/learners', label: 'Người học', prefetch: false },
] as const;

export type AnalyticsTab = (typeof TABS)[number]['href'];

/** Thanh chuyển giữa các trang số liệu. Ẩn khi in. */
export function AnalyticsNav({ current }: { current: AnalyticsTab }) {
  return (
    <nav aria-label="Các trang số liệu" className="flex flex-wrap gap-2 print:hidden">
      {TABS.map((t) => (
        <ButtonLink
          key={t.href}
          href={t.href}
          variant={t.href === current ? 'primary' : 'secondary'}
          size="sm"
          aria-current={t.href === current ? 'page' : undefined}
          prefetch={'prefetch' in t ? t.prefetch : undefined}
        >
          {t.label}
        </ButtonLink>
      ))}
    </nav>
  );
}
