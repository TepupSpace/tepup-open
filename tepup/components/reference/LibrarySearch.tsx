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
    <div role="search" className="lib-search">
      <label htmlFor={inputId} className="sr-only">
        Tìm trong thư viện
      </label>
      <div className="lib-search__box">
        <Search aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-describedby={statusId}
          placeholder="Tìm mục từ, nguồn, viết tắt, hoặc dán link…"
        />
      </div>
      <p id={statusId} role="status" className="lib-search__status">
        {q.trim() ? status : ''}
      </p>
      {shown.length > 0 && (
        <ul className="lib-search__hits">
          {shown.map((h) => (
            <li key={h.slug}>
              <span className="lib-kicker">{TYPE_LABELS[h.type]}</span>
              <a href={tvHref(h.slug)} data-tv={h.slug} className="lib-term">
                {h.title}
              </a>
              {h.exact && <span className="lib-exact">Đúng tài liệu của link này</span>}
              <p className="lib-muted line-clamp-2">{h.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
