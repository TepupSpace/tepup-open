import type { Metadata } from 'next';
import { listEntries } from '@/lib/library/entry-service';
import { tvHref } from '@/lib/library/refs';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Viết tắt | Thư viện Tepup' };

/** Danh sách chữ viết tắt, tách riêng khỏi mục từ (§7.4). */
export default async function AcronymsPage() {
  const items = await listEntries('ACRONYM');
  return (
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Viết tắt
      </h2>
      <p className="text-gray-700 mt-1 mb-4">Chữ viết tắt gặp trong các bài học, kèm dạng đầy đủ và mục mà nó chỉ tới.</p>
      {items.length === 0 ? (
        <p className="text-gray-600">Chưa có chữ viết tắt nào.</p>
      ) : (
        <table className="w-full text-left">
          <caption className="sr-only">Chữ viết tắt và dạng đầy đủ</caption>
          <thead className="border-b border-gray-200 text-sm text-gray-600">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                Viết tắt
              </th>
              <th scope="col" className="py-2 font-medium">
                Dạng đầy đủ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((a) => (
              <tr key={a.slug}>
                <th scope="row" className="py-3 pr-4 align-top">
                  <a href={tvHref(a.slug)} data-tv={a.slug} className="font-semibold">
                    {a.title}
                  </a>
                </th>
                <td className="py-3 text-gray-700">
                  <span className="block">{a.subtitle}</span>
                  <span className="block text-sm text-gray-600">{a.summary}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
