import type { Metadata } from 'next';
import { listEntries } from '@/lib/library/entry-service';
import { tvHref } from '@/lib/library/refs';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Viết tắt | Thư viện Tepup' };

/** Danh sách chữ viết tắt, tách riêng khỏi mục từ (§7.4). */
export default async function AcronymsPage() {
  const items = await listEntries('ACRONYM');
  return (
    <section aria-labelledby="tab-heading" className="lib-card">
      <h2 id="tab-heading" className="lib-card__title paper-serif">
        Viết tắt
      </h2>
      <p className="lib-intro">Chữ viết tắt gặp trong các bài học, kèm dạng đầy đủ và mục mà nó chỉ tới.</p>
      {items.length === 0 ? (
        <p className="lib-empty">Chưa có chữ viết tắt nào.</p>
      ) : (
        <table className="lib-table">
          <caption className="sr-only">Chữ viết tắt và dạng đầy đủ</caption>
          <thead>
            <tr>
              <th scope="col" className="lib-table__abbr">
                Viết tắt
              </th>
              <th scope="col">
                Dạng đầy đủ
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.slug}>
                <th scope="row" className="lib-table__abbr">
                  <a href={tvHref(a.slug)} data-tv={a.slug} className="lib-term">
                    {a.title}
                  </a>
                </th>
                <td>
                  <span className="block">{a.subtitle}</span>
                  <span className="block lib-muted">{a.summary}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
