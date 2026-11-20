import type { Metadata } from 'next';
import { listEntries, type EntryPreview } from '@/lib/library/entry-service';
import { tvHref } from '@/lib/library/refs';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Thư viện | Tepup',
  description: 'Mục từ, nguồn, viết tắt và công cụ dùng chung cho mọi khoá học trên Tepup, nối với nhau thành một mạng.',
};

/** Chữ cái để gom nhóm: bỏ dấu (Đ giữ riêng), số và ký tự khác vào "#". */
function letterOf(word: string): string {
  const first = word.trim().charAt(0);
  if (/[đĐ]/.test(first)) return 'Đ';
  const base = first.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  return /[A-Z]/.test(base) ? base : '#';
}

/**
 * Mục từ A–Z: một loại cho mọi khái niệm, thuật ngữ, chủ đề (không chia cấp). Các mục nối
 * với nhau bằng liên kết — xem trong từng mục hoặc ở Bản đồ (docs/design-reference-library.md §7.4).
 */
export default async function ConceptsPage() {
  const items = await listEntries('CONCEPT');
  const byLetter = new Map<string, EntryPreview[]>();
  for (const it of items) {
    const l = letterOf(it.title);
    byLetter.set(l, [...(byLetter.get(l) ?? []), it]);
  }
  const letters = [...byLetter.keys()];

  return (
    <section aria-labelledby="tab-heading" className="lib-card">
      <h2 id="tab-heading" className="lib-card__title paper-serif">
        Mục từ
      </h2>
      <p className="lib-intro">
        Mỗi khái niệm, thuật ngữ hay chủ đề là một mục. Các mục dẫn sang nhau như một mạng lưới; cùng một từ mang nghĩa khác
        thì có mục riêng, ghi rõ trong ngoặc.
      </p>
      {items.length === 0 ? (
        <p className="lib-empty">Chưa có mục nào.</p>
      ) : (
        <>
          <nav aria-label="Theo chữ cái" className="lib-letters">
            <ul>
              {letters.map((l) => (
                <li key={l}>
                  <a href={`#chu-${l}`}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {[...byLetter].map(([letter, list]) => (
            <section key={letter} aria-labelledby={`chu-${letter}`} className="lib-group">
              <h3 id={`chu-${letter}`} className="lib-group__title paper-serif">
                {letter}
              </h3>
              <dl className="lib-list">
                {list.map((m) => (
                  <div key={m.slug}>
                    <dt>
                      <a href={tvHref(m.slug)} data-tv={m.slug} className="lib-term">
                        {m.title}
                      </a>
                      {m.subtitle && <span className="lib-muted"> ({m.subtitle})</span>}
                    </dt>
                    <dd className="lib-desc">{m.summary}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </section>
  );
}
