'use client';

import { useEffect, useState } from 'react';

export interface DuplicateSource {
  id: string;
  slug: string;
  title: string;
  type: 'SOURCE';
  summary: string;
  isActive: boolean;
}

/**
 * Hỏi server xem link/số hiệu vừa dán đã có mục Nguồn chưa (so bằng khoá chuẩn hoá,
 * lib/library/source-key.ts). Chỉ để cảnh báo sớm; lưu trùng vẫn bị chặn ở server.
 */
export function useSourceDuplicate(url: string, identifier: string, excludeId?: string): DuplicateSource | null {
  const [match, setMatch] = useState<{ key: string; entry: DuplicateSource | null } | null>(null);
  const query = `${url.trim()}|${identifier.trim()}|${excludeId ?? ''}`;

  useEffect(() => {
    if (!url.trim() && !identifier.trim()) return;
    const t = setTimeout(async () => {
      const p = new URLSearchParams();
      if (url.trim()) p.set('url', url.trim());
      if (identifier.trim()) p.set('identifier', identifier.trim());
      if (excludeId) p.set('exclude', excludeId);
      try {
        const res = await fetch(`/api/admin/library-entries/check-source?${p}`);
        const json = res.ok ? await res.json() : { match: null };
        setMatch({ key: query, entry: json.match });
      } catch {
        // Không kiểm tra được thì thôi: server vẫn chặn khi lưu.
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, url, identifier, excludeId]);

  // Kết quả của lần gõ trước không còn đúng khi ô đã đổi.
  return match && match.key === query && (url.trim() || identifier.trim()) ? match.entry : null;
}
