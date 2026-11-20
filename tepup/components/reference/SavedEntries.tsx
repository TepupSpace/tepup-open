'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { EntryPreview } from '@/lib/library/entry-service';
import { removeSaved, useSavedEntries } from '@/lib/library/saved';
import { tvHref } from '@/lib/library/refs';

/**
 * Danh sách đã lưu (localStorage), với tiêu đề và phần xem nhanh mới nhất từ server.
 * Link mở bằng trình đọc tham chiếu của layout thư viện.
 */
export default function SavedEntries() {
  const saved = useSavedEntries();
  const key = saved.map((s) => s.slug).join(',');
  const [previews, setPreviews] = useState<Record<string, EntryPreview | null> | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/tv/preview?slugs=${key}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j: { data: EntryPreview[] }) => {
        if (cancelled) return;
        const found = Object.fromEntries(j.data.map((p) => [p.slug, p]));
        setPreviews(Object.fromEntries(key.split(',').map((s) => [s, found[s] ?? null])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (saved.length === 0) {
    return <p className="lib-empty">Bạn chưa lưu mục nào. Mở một mục trong bài học hoặc thư viện rồi bấm ☆ Lưu.</p>;
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      <ul className="lib-saved">
        {saved.map((s) => {
          const p = previews?.[s.slug];
          return (
            <li key={s.slug}>
              <div className="flex-1 min-w-0">
                {p === null ? (
                  <p className="lib-muted">Mục này không còn trong thư viện.</p>
                ) : (
                  <>
                    <p className="lib-kicker">{p?.typeLabel ?? ''}</p>
                    <a href={tvHref(s.slug)} data-tv={s.slug} className="lib-term">
                      {p?.title ?? s.slug}
                    </a>
                    {p?.summary && <p className="lib-desc">{p.summary}</p>}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  removeSaved(s.slug);
                  setMessage(`Đã bỏ “${p?.title ?? s.slug}” khỏi danh sách`);
                }}
                className="lib-remove"
                aria-label={`Bỏ “${p?.title ?? s.slug}” khỏi danh sách đã lưu`}
              >
                <X aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
