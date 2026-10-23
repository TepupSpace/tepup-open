'use client';

import { useId, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Lock } from 'lucide-react';
import AdminDialog from '@/app/admin/_components/AdminDialog';
import { TERMS } from '@/lib/terms';

/**
 * Settings: self-service account deletion (proposal §6.13a). Needs the current password and
 * the username typed. Hidden for admins (another admin deletes them).
 */

type Field = 'password' | 'username';

const inputClass =
  'w-full px-3 py-2.5 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 aria-[invalid=true]:border-red-600';

function DeleteAccountDialog({ username, onCancel }: { username: string; onCancel: () => void }) {
  const descId = useId();
  const passwordId = useId();
  const usernameId = useId();
  const errorId = useId();
  const [password, setPassword] = useState('');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<Field | null>(null);

  const fail = (text: string, field: Field | null) => {
    setError(text);
    setErrorField(field);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || done) return;
    if (!password) return fail('Vui lòng nhập mật khẩu.', 'password');
    if (typed.trim().toLowerCase() !== username.toLowerCase()) {
      return fail('Tên tài khoản nhập lại không khớp.', 'username');
    }
    setBusy(true);
    fail('', null);
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmUsername: typed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        fail(data?.error || 'Không xóa được tài khoản.', data?.field === 'password' || data?.field === 'username' ? data.field : null);
        setBusy(false);
        return;
      }
      setDone(true);
      await signOut({ callbackUrl: '/' });
    } catch {
      fail('Đã xảy ra lỗi. Vui lòng thử lại.', null);
      setBusy(false);
    }
  };

  const describedBy = (field: Field) => (errorField === field ? errorId : undefined);

  return (
    <AdminDialog
      title="Xóa vĩnh viễn tài khoản của bạn?"
      role="alertdialog"
      describedBy={descId}
      onClose={onCancel}
      busy={busy || done}
      initialFocus={`#${CSS.escape(passwordId)}`}
    >
      <p id={descId} className="mb-4 text-sm text-gray-700">
        <strong>Không thể hoàn tác.</strong> Bạn sẽ bị đăng xuất và không thể đăng nhập lại bằng tài khoản này.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) fail('', null);
              }}
              aria-invalid={errorField === 'password' || undefined}
              aria-describedby={describedBy('password')}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <div>
          <label htmlFor={usernameId} className="block text-sm font-medium text-gray-700 mb-1">
            Gõ tên tài khoản <span className="font-mono">{username}</span> để xác nhận
          </label>
          <input
            id={usernameId}
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              if (error) fail('', null);
            }}
            aria-invalid={errorField === 'username' || undefined}
            aria-describedby={describedBy('username')}
            className={inputClass}
          />
        </div>
        <div id={errorId} role="alert" className="empty:hidden">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <div role="status" className="sr-only">
          {done ? 'Đã xóa tài khoản. Đang đăng xuất…' : ''}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (!busy && !done) onCancel();
            }}
            className="rounded-xl px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            aria-disabled={busy || done || undefined}
            className="rounded-xl bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 aria-disabled:cursor-wait aria-disabled:opacity-70"
          >
            {done ? 'Đang đăng xuất…' : busy ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export default function DeleteAccountSection() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status !== 'authenticated' || !session?.user || session.user.role === 'ADMIN') return null;
  const username = session.user.username;
  if (!username) return null;

  return (
    <section aria-labelledby="delete-account-heading" className="bg-white rounded-xl border border-red-200 p-6 max-w-lg">
      <h2 id="delete-account-heading" className="text-lg font-semibold text-gray-900 mb-2">
        Xóa tài khoản
      </h2>
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <strong>Việc này không thể hoàn tác.</strong> Giống Wikipedia: tài khoản bị xóa, nhưng những gì đã
          đóng góp cho cộng đồng vẫn ở lại.
        </p>
        <div>
          <p className="font-medium text-gray-900">Bị xóa:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>tên tài khoản và mật khẩu (tên được giải phóng, người khác có thể đăng ký lại);</li>
            <li>các bản nháp chưa gửi;</li>
            <li>vai trò trong các khoá học, hồ sơ người duyệt và hộp thông báo;</li>
            <li>các đề xuất đang chờ duyệt (bị đóng lại) và các góp ý bạn đã nhận làm (được trả lại).</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-900">Được giữ lại:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              nội dung đã xuất bản, lịch sử sửa đổi, đánh giá và bình luận, ghi công dưới bút danh{' '}
              <em>{TERMS.pseudonymPrefix} #…</em> (không bao giờ dưới tên tài khoản cũ).
            </li>
          </ul>
        </div>
        <p>Bạn cần nhập mật khẩu hiện tại và gõ lại tên tài khoản để xác nhận.</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 px-4 py-2 rounded-xl border border-red-600 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        Xóa tài khoản…
      </button>
      {open && <DeleteAccountDialog username={username} onCancel={() => setOpen(false)} />}
    </section>
  );
}
