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
    return <p className="text-gray-600">Bạn chưa lưu mục nào. Mở một mục trong bài học hoặc thư viện rồi bấm ☆ Lưu.</p>;
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      <ul className="divide-y divide-gray-100">
        {saved.map((s) => {
          const p = previews?.[s.slug];
          return (
            <li key={s.slug} className="py-3 flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                {p === null ? (
                  <p className="text-gray-600">Mục này không còn trong thư viện.</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{p?.typeLabel ?? ''}</p>
                    <a href={tvHref(s.slug)} data-tv={s.slug} className="font-semibold">
                      {p?.title ?? s.slug}
                    </a>
                    {p?.summary && <p className="text-sm text-gray-700 mt-0.5">{p.summary}</p>}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  removeSaved(s.slug);
                  setMessage(`Đã bỏ “${p?.title ?? s.slug}” khỏi danh sách`);
                }}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                aria-label={`Bỏ “${p?.title ?? s.slug}” khỏi danh sách đã lưu`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
