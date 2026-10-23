'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import AdminDialog from '@/app/admin/_components/AdminDialog';

/**
 * "Chuyển quản trị viên" (proposal §6.20): asks every admin to decide. While escalated,
 * only an admin can approve the item; others can still comment. The API checks who may
 * escalate; render this only where the viewer may review the item.
 */
export default function EscalateButton({
  targetType,
  id,
  escalated,
  accent = 'teal',
  onEscalated,
}: {
  targetType: 'CONTRIBUTION' | 'REVIEW_REQUEST';
  id: string;
  escalated: boolean;
  /** Contributor pages teal, admin pages blue. */
  accent?: 'teal' | 'blue';
  onEscalated?: () => void;
}) {
  const router = useRouter();
  const noteId = useId();
  const helpId = useId();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(escalated);
  const [status, setStatus] = useState('');
  // The button is replaced by the "Đã chuyển" badge on success; the dialog returns focus here.
  const doneRef = useRef<HTMLParagraphElement>(null);

  const ring = accent === 'teal' ? 'focus:ring-teal-700' : 'focus:ring-blue-600';
  const primary = accent === 'teal' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-600 hover:bg-blue-700';

  async function submit() {
    if (busy) return;
    if (!note.trim()) {
      setError('Hãy ghi lý do chuyển quản trị viên.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/contributor/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, id, note }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || 'Không thể chuyển quản trị viên');
        return;
      }
      setDone(true);
      setOpen(false);
      setStatus(
        data?.data?.already
          ? 'Mục này đã được chuyển quản trị viên trước đó.'
          : 'Đã chuyển quản trị viên. Từ giờ chỉ quản trị viên duyệt được mục này.'
      );
      onEscalated?.();
      router.refresh();
    } catch {
      setError('Không thể chuyển quản trị viên');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {done ? (
        <p
          ref={doneRef}
          tabIndex={-1}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Đã chuyển quản trị viên
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError('');
            setOpen(true);
          }}
          className={`inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-50 focus:outline-none focus:ring-2 ${ring}`}
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Chuyển quản trị viên
        </button>
      )}
      <p role="status" className="sr-only">
        {status}
      </p>

      {open && (
        <AdminDialog
          title="Chuyển quản trị viên"
          onClose={() => setOpen(false)}
          busy={busy}
          describedBy={helpId}
          fallbackFocus={() => doneRef.current}
          initialFocus={`#${CSS.escape(noteId)}`}
        >
          <p id={helpId} className="mb-3 text-sm text-gray-600">
            Mọi quản trị viên sẽ được báo. Trong lúc chờ, chỉ quản trị viên duyệt được mục này; mọi
            người vẫn bình luận được. Dùng khi có bất đồng, nghi vấn về giấy phép, hoặc bạn không
            muốn tự quyết.
          </p>
          <label htmlFor={noteId} className="mb-1 block text-sm font-medium text-gray-700">
            Lý do <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={2000}
            required
            aria-invalid={!!error}
            aria-describedby={error ? `${noteId}-error` : undefined}
            className={`w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ring}`}
          />
          <div role="alert" id={`${noteId}-error`} className="mt-2 text-sm text-red-700 empty:hidden">
            {error}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!busy) setOpen(false);
              }}
              aria-disabled={busy}
              className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              aria-disabled={busy}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white aria-disabled:opacity-60 ${primary}`}
            >
              {busy ? 'Đang gửi…' : 'Chuyển quản trị viên'}
            </button>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
