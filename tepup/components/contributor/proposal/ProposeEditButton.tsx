'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine } from 'lucide-react';

/**
 * "Đề xuất sửa": creates an edit proposal (POST /api/contributor/contributions) and opens
 * the editor. 409 = the user already has one open for this target: open that one instead.
 * 403 (blocked), 404, 422 (admin-only content) and 429 (cap or hourly limit) show the
 * server's message.
 */
export default function ProposeEditButton({
  type,
  targetId,
  label = 'Đề xuất sửa',
  className,
}: {
  type: 'EDIT_LESSON_CONTENT' | 'EDIT_CHAPTER_CONTENT' | 'EDIT_LIBRARY_ENTRY' | 'EDIT_COURSE';
  targetId: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/contributor/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.id) {
        router.push(`/contributor/contributions/${body.id}/edit`);
        return;
      }
      if (res.status === 409 && body?.existingId) {
        router.push(`/contributor/contributions/${body.existingId}/edit`);
        return;
      }
      setError(body?.error || 'Không tạo được đề xuất. Vui lòng thử lại.');
      setBusy(false);
    } catch {
      setError('Mất kết nối — chưa tạo được đề xuất. Vui lòng thử lại.');
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void start()}
        aria-disabled={busy || undefined}
        className={
          className ??
          'inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2'
        }
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" />
        {busy ? 'Đang mở…' : label}
      </button>
      <p role="alert" className={error ? 'mt-2 text-sm text-red-700 whitespace-pre-line break-words' : 'sr-only'}>
        {error}
      </p>
    </div>
  );
}
