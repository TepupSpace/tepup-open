'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Undo2 } from 'lucide-react';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';

/**
 * "Rút lại để sửa" on a PENDING_REVIEW submission: takes it back to Bản nháp and opens the
 * editor. If a reviewer decided in the same moment, the API answers 409 and the dialog says so.
 */
export default function WithdrawSubmissionButton({ contributionId, name }: { contributionId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const withdraw = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/contributor/contributions/${contributionId}/withdraw`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không rút lại được.');
      router.push(`/contributor/contributions/${contributionId}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không rút lại được.');
      setBusy(false);
    }
    // Thành công thì giữ busy: trang chuyển sang trình soạn thảo ngay sau đó.
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('');
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-500 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
      >
        <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
        Rút lại để sửa<span className="sr-only">: {name}</span>
      </button>
      {open && (
        <ConfirmDialog
          title="Rút lại đóng góp này?"
          confirmLabel="Rút lại để sửa"
          busyLabel="Đang rút…"
          busy={busy}
          error={error}
          onConfirm={withdraw}
          onCancel={() => setOpen(false)}
        >
          &ldquo;{name}&rdquo; rời hàng chờ duyệt và quay về Bản nháp. Bạn sửa xong thì gửi duyệt lại như bình thường.
        </ConfirmDialog>
      )}
    </>
  );
}
