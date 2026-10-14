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
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Mục từ
      </h2>
      <p className="text-gray-700 mt-1 mb-4">
        Mỗi khái niệm, thuật ngữ hay chủ đề là một mục. Các mục dẫn sang nhau như một mạng lưới; cùng một từ mang nghĩa khác
        thì có mục riêng, ghi rõ trong ngoặc.
      </p>
      {items.length === 0 ? (
        <p className="text-gray-600">Chưa có mục nào.</p>
      ) : (
        <>
          <nav aria-label="Theo chữ cái" className="mb-6">
            <ul className="flex flex-wrap gap-1">
              {letters.map((l) => (
                <li key={l}>
                  <a
                    href={`#chu-${l}`}
                    className="inline-flex min-w-8 justify-center px-2 py-1 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {[...byLetter].map(([letter, list]) => (
            <section key={letter} aria-labelledby={`chu-${letter}`} className="mb-8">
              <h3 id={`chu-${letter}`} className="text-lg font-bold text-purple-700 border-b border-gray-200 pb-1 mb-3 scroll-mt-20">
                {letter}
              </h3>
              <dl className="space-y-4">
                {list.map((m) => (
                  <div key={m.slug}>
                    <dt className="font-semibold text-gray-900">
                      <a href={tvHref(m.slug)} data-tv={m.slug}>
                        {m.title}
                      </a>
                      {m.subtitle && <span className="font-normal text-gray-600"> ({m.subtitle})</span>}
                    </dt>
                    <dd className="mt-1 text-gray-700 leading-relaxed">{m.summary}</dd>
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
