import type { Metadata } from 'next';
import { listEntries, type EntryPreview } from '@/lib/library/entry-service';
import { tvHref } from '@/lib/library/refs';
import Citation from '@/components/reference/Citation';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Nguồn | Thư viện Tepup' };

/** Mọi nguồn trong thư viện, theo loại (sách, bài báo khoa học, báo chí…), kèm trích dẫn ngắn. */
export default async function SourcesPage() {
  const sources = await listEntries('SOURCE');
  const byKind = new Map<string, EntryPreview[]>();
  for (const s of sources) {
    const kind = s.citation?.typeLabel ?? 'Khác';
    byKind.set(kind, [...(byKind.get(kind) ?? []), s]);
  }
  return (
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Nguồn
      </h2>
      <p className="text-gray-700 mt-1 mb-4">
        Sách, nghiên cứu, bài báo và văn bản mà các bài học dựa vào. Mỗi nguồn có một mục duy nhất; mở mục để xem trích dẫn đầy
        đủ và những mục từ dùng nó.
      </p>
      {sources.length === 0 ? (
        <p className="text-gray-600">Chưa có nguồn nào.</p>
      ) : (
        [...byKind].map(([kind, list], i) => (
          <section key={kind} aria-labelledby={`nguon-${i}`} className="mb-8">
            <h3 id={`nguon-${i}`} className="text-lg font-bold text-purple-700 border-b border-gray-200 pb-1 mb-3">
              {kind}
            </h3>
            <ul className="space-y-3">
              {list.map((s) => (
                <li key={s.slug}>
                  <a href={tvHref(s.slug)} data-tv={s.slug} className="font-semibold">
                    {s.title}
                  </a>
                  {s.citation && (
                    <p className="text-sm text-gray-700">
                      <Citation citation={s.citation} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}
