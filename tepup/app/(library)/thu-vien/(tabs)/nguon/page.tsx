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
    <section aria-labelledby="tab-heading" className="lib-card">
      <h2 id="tab-heading" className="lib-card__title paper-serif">
        Nguồn
      </h2>
      <p className="lib-intro">
        Sách, nghiên cứu, bài báo và văn bản mà các bài học dựa vào. Mỗi nguồn có một mục duy nhất; mở mục để xem trích dẫn đầy
        đủ và những mục từ dùng nó.
      </p>
      {sources.length === 0 ? (
        <p className="lib-empty">Chưa có nguồn nào.</p>
      ) : (
        [...byKind].map(([kind, list], i) => (
          <section key={kind} aria-labelledby={`nguon-${i}`} className="lib-group">
            <h3 id={`nguon-${i}`} className="lib-group__title paper-serif">
              {kind}
            </h3>
            <ul className="lib-list">
              {list.map((s) => (
                <li key={s.slug}>
                  <a href={tvHref(s.slug)} data-tv={s.slug} className="lib-term">
                    {s.title}
                  </a>
                  {s.citation && (
                    <p className="lib-desc">
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
