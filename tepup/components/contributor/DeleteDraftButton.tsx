'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';

/**
 * Delete a DRAFT contribution from the drafts list. The API refuses anything but DRAFT,
 * so a CHANGES_REQUESTED proposal (which carries review history) never shows this button.
 */
export default function DeleteDraftButton({ contributionId, name }: { contributionId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/contributor/contributions/${contributionId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không xóa được bản nháp.');
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được bản nháp.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('');
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        Xóa<span className="sr-only"> bản nháp: {name}</span>
      </button>
      {open && (
        <ConfirmDialog
          title="Xóa bản nháp này?"
          confirmLabel="Xóa bản nháp"
          busyLabel="Đang xóa…"
          busy={busy}
          error={error}
          onConfirm={remove}
          onCancel={() => setOpen(false)}
        >
          &ldquo;{name}&rdquo; bị xóa vĩnh viễn, không hoàn tác được. Xóa bản nháp cũng giải phóng một chỗ trong giới
          hạn đề xuất đang mở của bạn.
        </ConfirmDialog>
      )}
    </>
  );
}
