'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { UserCheck } from 'lucide-react';
import AdminDialog from '@/app/admin/_components/AdminDialog';
import { ROLE_LABEL } from '@/lib/terms';

type Role = 'LEARNER' | 'AUTHOR' | 'TRUSTED_AUTHOR' | 'REVIEWER' | 'ADMIN';

interface PendingRequest {
  id: string;
  roleAtRequest: Role;
  requestedRole: Role;
  message: string;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    role: Role;
    isBanned: boolean;
    deletedAt: string | null;
    createdAt: string;
    contributionCount: number;
    approvedCount: number;
  };
}

const NOTE_MAX = 500;

function Decide({
  request,
  action,
  onCancel,
  onDone,
}: {
  request: PendingRequest;
  action: 'APPROVE' | 'DECLINE';
  onCancel: () => void;
  /** Reloads the lists; the dialog stays open (busy) until it is done. */
  onDone: () => void | Promise<void>;
}) {
  const descId = useId();
  const noteId = useId();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const name = request.user.username || request.user.name || 'Ẩn danh';
  const approve = action === 'APPROVE';

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/role-requests/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === 'string' && data.error ? data.error : 'Không xử lý được yêu cầu.');
        return;
      }
      await onDone();
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      title={approve ? `Giao quyền ${ROLE_LABEL[request.requestedRole]} cho ${name}?` : `Từ chối yêu cầu của ${name}?`}
      describedBy={descId}
      onClose={onCancel}
      busy={busy}
    >
      <p id={descId} className="mb-4 text-sm text-gray-700">
        {approve ? (
          <>
            {name} chuyển từ {ROLE_LABEL[request.roleAtRequest]} thành{' '}
            <strong>{ROLE_LABEL[request.requestedRole]}</strong>. Quyền mới có hiệu lực trong vòng một phút; thay đổi
            được ghi vào nhật ký quản trị.
          </>
        ) : (
          <>Quyền của {name} giữ nguyên ({ROLE_LABEL[request.user.role]}). Họ nhận được thông báo kèm ghi chú của bạn.</>
        )}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          confirm();
        }}
      >
        <label htmlFor={noteId} className="mb-1 block text-sm font-medium text-gray-700">
          Ghi chú cho người gửi {approve ? '(tuỳ chọn)' : '(nên có, để họ biết cần gì)'}
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={NOTE_MAX}
          className="mb-4 w-full rounded-xl border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <div role="alert" className="empty:hidden mb-4">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="staff-btn staff-btn--ghost">
            Hủy
          </button>
          <button
            type="submit"
            aria-disabled={busy || undefined}
            className={`rounded-xl px-4 py-2 text-white transition-colors aria-disabled:cursor-wait aria-disabled:opacity-70 ${
              approve ? 'bg-teal-700 hover:bg-teal-800' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {busy ? 'Đang lưu…' : approve ? 'Chấp nhận' : 'Từ chối'}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

/**
 * "Yêu cầu thay đổi quyền" from contributors (Settings → Quyền truy cập), pending ones,
 * oldest first. Approving applies the role change; both decisions notify the requester.
 */
export default function RoleRequestsPanel({ onDecided }: { onDecided?: () => void | Promise<void> }) {
  const [requests, setRequests] = useState<PendingRequest[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [deciding, setDeciding] = useState<{ request: PendingRequest; action: 'APPROVE' | 'DECLINE' } | null>(null);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/role-requests', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.requests);
      setLoadError('');
    } catch {
      setLoadError('Không tải được danh sách yêu cầu thay đổi quyền.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return (
      <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {loadError}
      </p>
    );
  }
  // Keep the live region mounted so "đã xử lý" is still read once the list empties.
  if (!requests || requests.length === 0) {
    return (
      <p id="role-requests" role="status" className={status ? 'mb-6 text-sm text-green-800' : 'sr-only'}>
        {status}
      </p>
    );
  }

  return (
    <section id="role-requests" aria-labelledby="role-requests-heading" className="mb-8 scroll-mt-20">
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <h2 id="role-requests-heading" tabIndex={-1} className="flex items-center gap-2 text-lg font-semibold text-teal-900">
          <UserCheck className="w-5 h-5" aria-hidden="true" />
          {requests.length} yêu cầu thay đổi quyền đang chờ
        </h2>
        <p role="status" className={status ? 'mt-2 text-sm text-green-800' : 'sr-only'}>
          {status}
        </p>
        <ul className="mt-4 space-y-4">
          {requests.map((r) => {
            const name = r.user.username || r.user.name || 'Ẩn danh';
            return (
              <li key={r.id} className="rounded-xl border border-teal-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {name}: {ROLE_LABEL[r.user.role]} → {ROLE_LABEL[r.requestedRole]}
                      {r.user.isBanned && <span className="ml-1 text-xs text-red-700">(đang bị khoá)</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      Gửi {new Date(r.createdAt).toLocaleDateString('vi-VN')} · thành viên từ{' '}
                      {new Date(r.user.createdAt).toLocaleDateString('vi-VN')} · {r.user.approvedCount}/
                      {r.user.contributionCount} đóng góp được duyệt
                    </p>
                    <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">“{r.message}”</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('');
                        setDeciding({ request: r, action: 'APPROVE' });
                      }}
                      className="staff-btn staff-btn--primary staff-btn--sm"
                    >
                      Chấp nhận<span className="sr-only"> yêu cầu của {name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('');
                        setDeciding({ request: r, action: 'DECLINE' });
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Từ chối<span className="sr-only"> yêu cầu của {name}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {deciding && (
        <Decide
          request={deciding.request}
          action={deciding.action}
          onCancel={() => setDeciding(null)}
          onDone={async () => {
            const name = deciding.request.user.username || deciding.request.user.name || 'Ẩn danh';
            setStatus(
              deciding.action === 'APPROVE'
                ? `Đã giao quyền ${ROLE_LABEL[deciding.request.requestedRole]} cho ${name}.`
                : `Đã từ chối yêu cầu của ${name}.`
            );
            // Reload first, then close: focus falls back cleanly once the row is gone.
            await load();
            await onDecided?.();
            setDeciding(null);
          }}
        />
      )}
    </section>
  );
}
