'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import { useEditorMode } from './EditorModeContext';
import QuickCreateEntry from './QuickCreateEntry';

export interface PickedEntry {
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  /** Khớp đúng khoá chống trùng của link/số hiệu vừa dán (mục Nguồn đã có). */
  exact?: boolean;
}

/**
 * Ô tìm mục thư viện để chèn tham chiếu `/tv/<slug>` (docs/design-reference-library.md §5.1).
 * Dùng ở nút "Tham chiếu" trên thanh định dạng BlockNote và trong ngăn sửa block.
 * Tìm qua /api/tv/search (công khai) nên chạy được cả ở chế độ cộng tác viên. Quản trị
 * viên còn tạo được mục mới ngay tại đây (QuickCreateEntry) khi chưa có mục cần dùng.
 */
export default function ReferencePicker({
  onPick,
  autoFocus = true,
  initialQuery = '',
}: {
  onPick: (e: PickedEntry) => void;
  autoFocus?: boolean;
  /** Chữ đang bôi đen: tìm sẵn, và làm tiêu đề nếu tạo mục mới. */
  initialQuery?: string;
}) {
  const mode = useEditorMode();
  const inputId = useId();
  const listId = useId();
  const [q, setQ] = useState(initialQuery.trim().slice(0, 100));
  const [results, setResults] = useState<PickedEntry[]>([]);
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tv/search?q=${encodeURIComponent(term)}`);
        const json = await res.json();
        const data: PickedEntry[] = res.ok ? json.data : [];
        setResults(data);
        setStatus(data.length ? `${data.length} mục` : 'Không có mục nào khớp');
      } catch {
        setStatus('Không tìm được, thử lại');
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  if (creating) {
    return (
      <QuickCreateEntry
        initialText={q}
        onCreated={(e) => onPick(e)}
        onCancel={() => {
          setCreating(false);
          requestAnimationFrame(() => createBtnRef.current?.focus() ?? inputRef.current?.focus());
        }}
      />
    );
  }

  const shown = q.trim() ? results : [];
  const hint =
    mode === 'admin'
      ? 'Gõ để tìm. Chưa có mục cần dùng? Tạo mới ngay bên dưới.'
      : 'Gõ để tìm. Chưa có mục cần dùng? Ghi rõ trong lời nhắn khi gửi duyệt, người duyệt sẽ tạo.';

  return (
    <div className="space-y-2 text-sm text-gray-700">
      <label htmlFor={inputId} className="block font-medium">
        Tìm mục thư viện
      </label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the user just opened the picker to search
          autoFocus={autoFocus}
          aria-describedby={`${listId}-status`}
          placeholder="Mục từ, nguồn, viết tắt, hoặc dán link…"
          className="w-full rounded-md border border-gray-500 bg-white pl-8 pr-2 py-1.5 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        />
      </div>
      <p id={`${listId}-status`} role="status" className="text-xs text-gray-600 min-h-4">
        {q.trim() ? status : hint}
      </p>
      {shown.length > 0 && (
        <ul id={listId} className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
          {shown.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="w-full text-left px-2.5 py-2 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {r.exact && (
                  <span className="block text-xs font-semibold text-green-800">Đã có nguồn cho link này</span>
                )}
                <span className="block text-gray-900">
                  <span className="text-gray-600">{TYPE_LABELS[r.type]}:</span> {r.title}
                </span>
                <span className="block text-xs text-gray-600 line-clamp-1">{r.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {mode === 'admin' && shown[0]?.exact && /^https?:\/\//i.test(q.trim()) && (
        <p className="text-xs text-gray-700">Link này đã có mục Nguồn (ở trên). Chọn mục đó để không tạo trùng.</p>
      )}
      {mode === 'admin' && !(shown[0]?.exact && /^https?:\/\//i.test(q.trim())) && (
        <button
          ref={createBtnRef}
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {/^https?:\/\//i.test(q.trim()) ? 'Tạo mục Nguồn từ link này' : q.trim() ? `Tạo mục mới “${q.trim()}”` : 'Tạo mục mới'}
        </button>
      )}
    </div>
  );
}
