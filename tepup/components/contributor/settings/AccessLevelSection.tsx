'use client';

import { useCallback, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import { ROLE_LABEL } from '@/lib/terms';

type Role = 'LEARNER' | 'AUTHOR' | 'TRUSTED_AUTHOR' | 'REVIEWER' | 'ADMIN';
type RequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';

interface RoleRequest {
  id: string;
  roleAtRequest: Role;
  requestedRole: Role;
  message: string;
  status: RequestStatus;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
}

const MESSAGE_MAX = 1000;

/** What each level lets you do — keep in step with the code, not wishes (see role-utils). */
const LEVEL_NOTES: Record<Role, string> = {
  LEARNER: 'Chỉ học, không vào được Khu đóng góp.',
  AUTHOR: 'Đề xuất khóa học mới và sửa nội dung; mỗi đề xuất đều qua người duyệt.',
  TRUSTED_AUTHOR: 'Như Người soạn thảo, nhưng đề xuất được ưu tiên duyệt và được mở nhiều đề xuất hơn.',
  REVIEWER: 'Duyệt đề xuất của mọi khóa học và truy cập khu quản trị nội dung.',
  ADMIN: 'Quản lý toàn bộ trang (do tổ chức bổ nhiệm, không qua yêu cầu).',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Đang chờ',
  APPROVED: 'Đã chấp nhận',
  DECLINED: 'Đã từ chối',
  CANCELLED: 'Đã rút lại',
};

/**
 * Settings → "Quyền truy cập": shows the user's global access level, what the levels mean,
 * and lets them send the admins a role-change request ("Yêu cầu thay đổi quyền").
 * One pending request at a time; it can be withdrawn while it waits.
 */
export default function AccessLevelSection() {
  const [role, setRole] = useState<Role | null>(null);
  const [pending, setPending] = useState<RoleRequest | null>(null);
  const [history, setHistory] = useState<RoleRequest[]>([]);
  const [loadError, setLoadError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [requestedRole, setRequestedRole] = useState<Role | ''>('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/user/role-requests', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRole(data.role);
      setPending(data.pending);
      setHistory(data.history);
      setLoadError('');
    } catch {
      setLoadError('Không tải được thông tin quyền truy cập.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setStatus('');
    if (!requestedRole) {
      setError('Hãy chọn quyền bạn muốn.');
      return;
    }
    if (!message.trim()) {
      setError('Hãy cho quản trị viên biết lý do bạn cần quyền này.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/user/role-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedRole, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không gửi được yêu cầu.');
      setStatus('Đã gửi yêu cầu. Quản trị viên sẽ xem và trả lời qua thông báo.');
      setFormOpen(false);
      setRequestedRole('');
      setMessage('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gửi được yêu cầu.');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!pending || withdrawBusy) return;
    setWithdrawBusy(true);
    setWithdrawError('');
    try {
      const res = await fetch(`/api/user/role-requests/${encodeURIComponent(pending.id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không rút lại được yêu cầu.');
      setStatus('Đã rút lại yêu cầu.');
      await load();
      setWithdrawing(false);
    } catch (e) {
      setWithdrawError(e instanceof Error ? e.message : 'Không rút lại được yêu cầu.');
    } finally {
      setWithdrawBusy(false);
    }
  };

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {loadError}
      </p>
    );
  }
  if (!role) return null;

  // Admins change roles themselves; the section only shows their level.
  const requestable = (['AUTHOR', 'TRUSTED_AUTHOR', 'REVIEWER', 'LEARNER'] as Role[]).filter((r) => r !== role);
  const lastDecided = history[0] ?? null;

  return (
    <section
      id="access-level"
      aria-labelledby="access-level-heading"
      className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl scroll-mt-20"
    >
      <h2 id="access-level-heading" tabIndex={-1} className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Shield className="w-5 h-5 text-teal-700" aria-hidden="true" />
        Quyền truy cập
      </h2>
      <p className="text-sm text-gray-700 mb-1">
        Quyền hiện tại của bạn: <strong>{ROLE_LABEL[role]}</strong>.
      </p>
      <p className="text-sm text-gray-600 mb-4">{LEVEL_NOTES[role]}</p>

      <p role="status" className={status ? 'mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800' : 'sr-only'}>
        {status}
      </p>
      <p role="alert" className={error ? 'mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' : 'sr-only'}>
        {error}
      </p>

      {role === 'ADMIN' ? null : pending ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            Yêu cầu quyền {ROLE_LABEL[pending.requestedRole]} — đang chờ quản trị viên
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Gửi ngày {new Date(pending.createdAt).toLocaleDateString('vi-VN')}. Lý do của bạn: “{pending.message}”
          </p>
          <button
            type="button"
            onClick={() => {
              setWithdrawError('');
              setWithdrawing(true);
            }}
            className="mt-3 rounded-lg border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            Rút lại yêu cầu
          </button>
        </div>
      ) : formOpen ? (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="role-request-role" className="block text-sm font-medium text-gray-700 mb-1">
              Quyền bạn muốn
            </label>
            <select
              id="role-request-role"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as Role)}
              required
              aria-describedby="role-request-role-hint"
              className="w-full max-w-sm rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="">— Chọn quyền —</option>
              {requestable.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <p id="role-request-role-hint" className="mt-1 text-xs text-gray-600">
              {requestedRole ? LEVEL_NOTES[requestedRole] : 'Quyền Quản trị viên do tổ chức bổ nhiệm, không qua yêu cầu.'}
            </p>
          </div>
          <div>
            <label htmlFor="role-request-message" className="block text-sm font-medium text-gray-700 mb-1">
              Lý do
            </label>
            <textarea
              id="role-request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              maxLength={MESSAGE_MAX}
              aria-describedby="role-request-message-hint"
              className="w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            <p id="role-request-message-hint" className="mt-1 text-xs text-gray-600">
              Ví dụ: các đóng góp đã được duyệt, chuyên môn của bạn, hoặc việc bạn muốn làm (kể cả vai trò trong một
              khóa học cụ thể). Tối đa {MESSAGE_MAX} ký tự.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              aria-disabled={busy || undefined}
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              {busy ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setError('');
              }}
              className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setFormOpen(true);
          }}
          className="rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          Yêu cầu thay đổi quyền
        </button>
      )}

      {lastDecided && !pending && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p>
            Yêu cầu gần nhất: quyền {ROLE_LABEL[lastDecided.requestedRole]} —{' '}
            <strong>{STATUS_LABEL[lastDecided.status]}</strong>
            {lastDecided.decidedAt ? ` ngày ${new Date(lastDecided.decidedAt).toLocaleDateString('vi-VN')}` : ''}.
          </p>
          {lastDecided.decisionNote && <p className="mt-1">Ghi chú của quản trị viên: “{lastDecided.decisionNote}”</p>}
          {lastDecided.status === 'APPROVED' && (
            <p className="mt-1 text-xs text-gray-600">Quyền mới có hiệu lực trong vòng một phút sau khi được chấp nhận.</p>
          )}
        </div>
      )}

      {withdrawing && pending && (
        <ConfirmDialog
          title="Rút lại yêu cầu thay đổi quyền?"
          confirmLabel="Rút lại"
          busyLabel="Đang rút…"
          busy={withdrawBusy}
          error={withdrawError}
          onConfirm={withdraw}
          onCancel={() => setWithdrawing(false)}
          fallbackFocus={() => document.getElementById('access-level-heading')}
        >
          Yêu cầu quyền {ROLE_LABEL[pending.requestedRole]} sẽ bị rút lại. Bạn có thể gửi yêu cầu mới bất cứ lúc nào.
        </ConfirmDialog>
      )}
    </section>
  );
}
