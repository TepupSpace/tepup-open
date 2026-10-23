'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

/**
 * "Ẩn bài" / "Hiện bài" for a maintainer (POST /api/contributor/lessons/[id]/visibility).
 * The server checks the permission again; this button is only shown where it is allowed.
 */
export default function LessonVisibilityToggle({
  lessonId,
  lessonName,
  isActive,
}: {
  lessonId: string;
  lessonName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/contributor/lessons/${lessonId}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không cập nhật được.');
      setMessage(!isActive ? `Đã hiện bài “${lessonName}”.` : `Đã ẩn bài “${lessonName}”.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không cập nhật được.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-disabled={busy || undefined}
        aria-label={isActive ? `Ẩn bài “${lessonName}” với người học` : `Hiện bài “${lessonName}” cho người học`}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
      >
        {isActive ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
        {busy ? 'Đang lưu…' : isActive ? 'Ẩn bài' : 'Hiện bài'}
      </button>
      <p role="status" className={message ? 'text-xs text-green-800' : 'sr-only'}>
        {message}
      </p>
      <p role="alert" className={error ? 'text-xs text-red-700' : 'sr-only'}>
        {error}
      </p>
    </div>
  );
}
