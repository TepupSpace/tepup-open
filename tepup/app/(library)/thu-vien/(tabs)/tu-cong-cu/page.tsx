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
    <section aria-labelledby="tab-heading" className="lib-card">
      <h2 id="tab-heading" className="lib-card__title paper-serif">
        Tủ công cụ
      </h2>
      <p className="lib-intro">
        Công cụ và cách cài đặt thay đổi nhanh; ý tưởng trong bài học thì không. Mỗi mục ghi ngày cập nhật. Nếu một mục đã cũ
        và nói khác bài học, hãy tin bài học hơn tin tủ.
      </p>
      {tools.length === 0 ? (
        <p className="lib-empty">Tủ đang trống.</p>
      ) : (
        <ul className="lib-tools">
          {tools.map((t) => (
            <li key={t.slug} className="lib-tool">
              <h3>
                <a href={tvHref(t.slug)} data-tv={t.slug} className="lib-term">
                  {t.title}
                </a>
              </h3>
              <p className="lib-desc">{t.summary}</p>
              <p className="lib-tool__meta">
                Cập nhật {t.updatedAt}
                {t.overdue && (
                  <span className="lib-overdue">
                    <AlertTriangle aria-hidden="true" /> Cần rà soát
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
