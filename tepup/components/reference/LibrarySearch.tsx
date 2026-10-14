'use client';

import { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import { tvHref } from '@/lib/library/refs';

type Hit = { slug: string; type: EntryType; title: string; summary: string; exact?: boolean };

/**
 * Ô tìm trên trang /thu-vien: tìm mọi mục đang hiển thị (mục từ, nguồn, viết
 * tắt, công cụ) qua /api/tv/search. Kết quả là link /tv/ thường nên trình đọc
 * tham chiếu bao quanh tự mở xem nhanh và bảng bên; dán link một tài liệu cũng tìm được
 * mục Nguồn của nó.
 */
export default function LibrarySearch() {
  const inputId = useId();
  const statusId = useId();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tv/search?q=${encodeURIComponent(term)}`);
        const data: Hit[] = res.ok ? (await res.json()).data : [];
        setHits(data);
        setStatus(data.length ? `${data.length} mục` : 'Không có mục nào khớp');
      } catch {
        setStatus('Không tìm được, thử lại');
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const shown = q.trim() ? hits : [];

  return (
    <div role="search" className="mb-3">
      <label htmlFor={inputId} className="block font-medium text-gray-900 mb-1">
        Tìm trong thư viện
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-describedby={statusId}
          placeholder="Mục từ, nguồn, viết tắt, hoặc dán link…"
          className="w-full rounded-lg border border-gray-500 bg-white pl-9 pr-3 py-2 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
        />
      </div>
      <p id={statusId} role="status" className="text-sm text-gray-600 mt-1 min-h-5">
        {q.trim() ? status : ''}
      </p>
      {shown.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {shown.map((h) => (
            <li key={h.slug} className="px-3 py-2">
              <span className="text-sm text-gray-600">{TYPE_LABELS[h.type]}: </span>
              <a href={tvHref(h.slug)} data-tv={h.slug} className="font-medium">
                {h.title}
              </a>
              {h.exact && <span className="ml-2 text-xs font-semibold text-green-800">Đúng tài liệu của link này</span>}
              <p className="text-sm text-gray-700 line-clamp-2">{h.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
