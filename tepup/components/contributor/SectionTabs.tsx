import type { ReactNode } from 'react';
import { PlusCircle } from 'lucide-react';
import Link from '@/components/ui/AppLink';

/**
 * Sub-navigation between the pages of one sidebar group in the Khu đóng góp ("Đóng góp của
 * tôi", "Tìm bài để sửa", "Việc duyệt"). Server-safe (no hooks): each page passes its own
 * href as `current`. Tabs with `show: false` are left out (the pages still check access).
 * `children` (e.g. a "Tạo khóa học mới" button) sits at the end of the row.
 */
export interface SectionTab {
  href: string;
  label: string;
  /** Default true. */
  show?: boolean;
}

export default function SectionTabs({
  label,
  tabs,
  current,
  children,
}: {
  /** Accessible name of the <nav>. */
  label: string;
  tabs: SectionTab[];
  /** Href of the page this is mounted on. */
  current: string;
  children?: ReactNode;
}) {
  const visible = tabs.filter((t) => t.show !== false);
  // A single tab is no navigation; still render the action, if any.
  if (visible.length < 2 && !children) return null;

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200">
      {visible.length >= 2 ? (
        <nav aria-label={label}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {visible.map((t) => {
              const active = t.href === current;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={active ? 'page' : undefined}
                    className={`-mb-px inline-block border-b-2 px-1 pb-2 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 ${
                      active ? 'border-teal-700 text-teal-800' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <span />
      )}
      {children && <div className="pb-2">{children}</div>}
    </div>
  );
}

/** "Đóng góp của tôi": everyone. */
export const MY_CONTRIBUTIONS_TABS: SectionTab[] = [
  { href: '/contributor/drafts', label: 'Bản nháp' },
  { href: '/contributor/submissions', label: 'Đã gửi' },
];

/** "Tìm bài để sửa": everyone. */
export const FIND_WORK_TABS: SectionTab[] = [
  { href: '/contributor/courses', label: 'Khóa học và thư viện' },
  { href: '/contributor/suggestions', label: 'Góp ý chờ người làm' },
];

/** "Việc duyệt": `reviewer` = global reviewer or any course role; `requests` = global reviewer or trusted reviewer. */
export function reviewTabs({ reviewer, requests }: { reviewer: boolean; requests: boolean }): SectionTab[] {
  return [
    { href: '/contributor/reviews', label: 'Đề xuất', show: reviewer },
    { href: '/contributor/review-requests', label: 'Yêu cầu duyệt', show: requests },
    { href: '/contributor/recent-changes', label: 'Thay đổi gần đây', show: reviewer },
    { href: '/contributor/flags', label: 'Cờ bảo trì', show: reviewer },
  ];
}

/** Primary "Tạo khóa học mới" link for the "Tìm bài để sửa" pages. */
export function NewCourseButton() {
  return (
    <Link
      href="/contributor/courses/new"
      className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
    >
      <PlusCircle className="h-4 w-4" aria-hidden="true" />
      Tạo khóa học mới
    </Link>
  );
}
