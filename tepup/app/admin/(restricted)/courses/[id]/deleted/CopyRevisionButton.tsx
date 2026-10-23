'use client';

import { useState } from 'react';

/** "Sao chép nội dung": copies a revision's snapshot (JSON) to the clipboard, with a textarea fallback. */
export default function CopyRevisionButton({ revisionId, label }: { revisionId: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState<string | null>(null);

  const copy = async () => {
    if (busy) return;
    setBusy(true);
    setStatus('');
    setError('');
    try {
      const res = await fetch(`/api/history/revisions/${encodeURIComponent(revisionId)}`, { cache: 'no-store' });
      const body = res.ok ? ((await res.json().catch(() => null)) as { data?: { snapshot: unknown } } | null) : null;
      const data = body?.data;
      if (!data) {
        setError(res.ok ? 'Không tải được nội dung.' : `Không tải được nội dung (lỗi ${res.status}).`);
        return;
      }
      const text = JSON.stringify(data.snapshot, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        setFallback(null);
        setStatus('Đã sao chép.');
      } catch {
        setFallback(text);
        setStatus('Hãy chọn và sao chép nội dung trong ô bên dưới.');
      }
    } catch {
      setError('Không tải được nội dung. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={copy}
        aria-disabled={busy || undefined}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 aria-disabled:opacity-70"
      >
        {busy ? 'Đang tải…' : 'Sao chép nội dung'}
        <span className="sr-only"> bài {label}</span>
      </button>
      <span role="status" aria-live="polite" className="text-xs text-gray-700">
        {status}
      </span>
      <span role="alert" className="text-xs text-red-700 empty:hidden">
        {error}
      </span>
      {fallback !== null && (
        <label className="w-full text-xs text-gray-800">
          Nội dung (JSON) bài {label}
          <textarea readOnly value={fallback} rows={6} className="mt-1 w-80 max-w-full rounded-lg border border-gray-300 p-2 font-mono text-xs" />
        </label>
      )}
    </div>
  );
}
