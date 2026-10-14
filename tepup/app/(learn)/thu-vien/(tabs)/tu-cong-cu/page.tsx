import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { listEntries } from '@/lib/library/entry-service';
import { tvHref } from '@/lib/library/refs';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Tủ công cụ | Thư viện Tepup' };

/**
 * Tủ công cụ: các khuyến nghị có hạn dùng (ứng dụng, cài đặt), tách khỏi bài học để
 * bài học không phải sửa mỗi khi công cụ đổi (docs/design-reference-library.md §9.1).
 */
export default async function ToolboxPage() {
  const tools = await listEntries('TOOL');
  return (
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Tủ công cụ
      </h2>
      <p className="text-gray-700 mt-1 mb-4">
        Công cụ và cách cài đặt thay đổi nhanh; ý tưởng trong bài học thì không. Mỗi mục ghi ngày cập nhật. Nếu một mục đã cũ
        và nói khác bài học, hãy tin bài học hơn tin tủ.
      </p>
      {tools.length === 0 ? (
        <p className="text-gray-600">Tủ đang trống.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tools.map((t) => (
            <li key={t.slug} className="p-4 rounded-2xl border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900">
                <a href={tvHref(t.slug)} data-tv={t.slug}>
                  {t.title}
                </a>
              </h3>
              <p className="mt-1 text-sm text-gray-700">{t.summary}</p>
              <p className="mt-2 text-xs text-gray-600">
                Cập nhật {t.updatedAt}
                {t.overdue && (
                  <span className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Cần rà soát
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
