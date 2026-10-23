import type { LucideIcon } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import Link from '@/components/ui/AppLink';

export interface WaitingItem {
  key: string;
  Icon: LucideIcon;
  count: number;
  /** What the count is, read after the number ("yêu cầu duyệt chờ ý kiến của bạn"). */
  label: string;
  href: string;
  /** Link text for the item, e.g. "Mở hộp yêu cầu duyệt". */
  action: string;
  /** Up to a few named items under the row (lesson names, proposal names). */
  details?: { id: string; href: string; text: string; context?: string | null }[];
}

/**
 * Dashboard: "Việc chờ bạn", only things that need this user's action. Items with a count of
 * 0 are left out; with nothing left, a friendly empty state. Data comes from the page (the
 * same services the linked pages use, so the counts match).
 */
const ACCENTS = {
  teal: { row: 'border-teal-200 bg-teal-50', text: 'text-teal-900', link: 'text-teal-800 hover:text-teal-700', icon: 'text-teal-700' },
  blue: { row: 'border-blue-200 bg-blue-50', text: 'text-blue-900', link: 'text-blue-800 hover:text-blue-700', icon: 'text-blue-700' },
} as const;

export default function WaitingForYou({
  items,
  accent = 'teal',
  emptyText = 'Hiện không có việc gì chờ bạn. Bạn có thể tìm một bài để sửa hoặc bắt đầu một khóa học mới.',
}: {
  items: WaitingItem[];
  /** teal in the contributor area, blue in the admin area. */
  accent?: keyof typeof ACCENTS;
  emptyText?: string;
}) {
  const shown = items.filter((i) => i.count > 0);
  const a = ACCENTS[accent];

  return (
    <section aria-labelledby="waiting-for-you-title" className="mb-8" data-testid="waiting-for-you">
      <h2 id="waiting-for-you-title" className="text-lg font-semibold text-gray-900 mb-3">
        Việc chờ bạn
      </h2>
      {shown.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-5">
          <CheckCircle2 className={`h-6 w-6 shrink-0 ${a.icon}`} aria-hidden="true" />
          <p className="text-sm text-gray-700">{emptyText}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map(({ key, Icon, count, label, href, action, details }) => (
            <li
              key={key}
              className={`rounded-xl border p-4 ${a.row}`}
              data-testid={`waiting-${key}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`flex items-center gap-2 text-sm ${a.text}`}>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="text-lg font-bold">{count}</span> {label}
                  </span>
                </p>
                <Link
                  href={href}
                  className={`text-sm font-medium underline underline-offset-2 ${a.link}`}
                >
                  {action}
                </Link>
              </div>
              {details && details.length > 0 && (
                <ul className="mt-2 space-y-1 pl-7">
                  {details.map((d) => (
                    <li key={d.id} className="text-sm">
                      <Link
                        href={d.href}
                        className={`font-medium underline underline-offset-2 ${a.text}`}
                      >
                        {d.text}
                      </Link>
                      {d.context && <span className="text-gray-600"> — {d.context}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
