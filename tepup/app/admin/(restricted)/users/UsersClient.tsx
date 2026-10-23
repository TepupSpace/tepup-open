'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Search } from 'lucide-react';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import AdminDialog from '@/app/admin/_components/AdminDialog';
import { staffName } from '@/lib/credit-display';
import { ROLE_LABEL, TERMS } from '@/lib/terms';

interface UserData {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  role: string;
  isBanned: boolean;
  deletedAt: string | null;
  publicHandle: string | null;
  createdAt: string;
  _count: { contributions: number };
}

const ROLE_OPTIONS = ['LEARNER', 'AUTHOR', 'TRUSTED_AUTHOR', 'REVIEWER', 'ADMIN'];

// Tên vai trò hiển thị cho admin (giá trị gửi lên API vẫn là mã vai trò): lib/terms.ts.
const ROLE_LABELS: Record<string, string> = ROLE_LABEL;

const ROLE_COLORS: Record<string, string> = {
  LEARNER: 'bg-gray-100 text-gray-700',
  AUTHOR: 'bg-teal-100 text-teal-700',
  TRUSTED_AUTHOR: 'bg-emerald-100 text-emerald-700',
  REVIEWER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

async function errorText(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === 'string' && data.error ? data.error : fallback;
}

/** Hộp xác nhận xóa tài khoản: phải gõ đúng tên tài khoản (§6.13). */
function DeleteUserDialog({
  user,
  label,
  onCancel,
  onDeleted,
}: {
  user: UserData;
  label: string;
  onCancel: () => void;
  /** Reloads the list; the dialog stays open (busy) until it is done, see the caller. */
  onDeleted: () => void | Promise<void>;
}) {
  const descId = useId();
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const expected = (user.username ?? '').toLowerCase();

  const confirm = async () => {
    if (busy) return;
    if (!expected || typed.trim().toLowerCase() !== expected) {
      setError('Tên tài khoản nhập lại không khớp.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError(await errorText(res, 'Không xóa được tài khoản.'));
        return;
      }
      await onDeleted();
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      title={`Xóa tài khoản ${label}?`}
      role="alertdialog"
      describedBy={descId}
      onClose={onCancel}
      busy={busy}
      initialFocus={`#${CSS.escape(inputId)}`}
    >
      <div id={descId} className="mb-4 space-y-2 text-sm text-gray-700">
        <p>
          <strong>Không thể hoàn tác.</strong> Tên tài khoản, mật khẩu và mọi thông tin cá nhân bị xóa; tên
          tài khoản được giải phóng để người khác đăng ký. Bản nháp bị xóa, đề xuất đang chờ duyệt bị đóng,
          vai trò trong khoá học bị gỡ.
        </p>
        <p>
          Nội dung đã xuất bản, lịch sử sửa đổi và các đánh giá vẫn được giữ, ghi công dưới bút danh{' '}
          <strong>{TERMS.pseudonymPrefix} #{user.publicHandle ?? '…'}</strong>.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          confirm();
        }}
      >
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          Gõ <span className="font-mono">{user.username}</span> để xác nhận
        </label>
        <input
          id={inputId}
          type="text"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            if (error) setError('');
          }}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(error) || undefined}
          className="mb-4 w-full rounded-xl border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 aria-[invalid=true]:border-red-600"
        />
        <div role="alert" className="empty:hidden mb-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            aria-disabled={busy || undefined}
            className="rounded-xl bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 aria-disabled:cursor-wait aria-disabled:opacity-70"
          >
            {busy ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export default function UsersClient() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  // Ô tìm kiếm chỉ có hiệu lực khi bấm tìm (không tìm theo từng phím gõ).
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Kept apart from action errors: a later successful load clears it, but must not wipe an
  // action error (updateRole reloads right after setting one).
  const [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState<UserData | null>(null);
  const [message, announce] = useAnnouncer();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const params = new URLSearchParams({ page: String(page) });
    if (appliedSearch) params.set('search', appliedSearch);
    if (roleFilter) params.set('role', roleFilter);
    if (showDeleted) params.set('deleted', '1');

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        setLoadError(await errorText(res, 'Không tải được danh sách người dùng.'));
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setLoadError('Không tải được danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, [page, appliedSearch, roleFilter, showDeleted]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trang 1 với từ khoá mới. Nếu cả hai không đổi thì effect không chạy lại, nên tải lại ở đây.
    if (page === 1 && search === appliedSearch) fetchUsers();
    setPage(1);
    setAppliedSearch(search);
  };

  const displayName = (u: UserData) =>
    u.deletedAt
      ? staffName({ username: u.username ?? null, publicHandle: u.publicHandle, deletedAt: new Date(u.deletedAt) })
      : u.username || u.name || 'Chưa đặt tên';

  const updateRole = async (user: UserData, role: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        setError(await errorText(res, `Không đổi được vai trò của ${displayName(user)}.`));
      } else {
        announce(`Đã đổi vai trò của ${displayName(user)} thành ${ROLE_LABELS[role] ?? role}.`);
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
    // Tải lại cả khi lỗi, để ô chọn quay về vai trò thật.
    fetchUsers();
  };

  const toggleBan = async (user: UserData, isBanned: boolean) => {
    // Hộp prompt gốc của trình duyệt vừa hỏi lý do vừa là bước xác nhận (Huỷ = không khoá).
    const bannedReason = isBanned ? prompt(`Lý do khoá tài khoản ${displayName(user)}:`) : undefined;
    if (isBanned && bannedReason === null) return; // cancelled

    setError('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned, bannedReason }),
      });
      if (!res.ok) {
        setError(await errorText(res, isBanned ? 'Không khoá được tài khoản.' : 'Không mở khoá được tài khoản.'));
        return;
      }
      announce(isBanned ? `Đã khoá ${displayName(user)}.` : `Đã mở khoá ${displayName(user)}.`);
      fetchUsers();
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      {/* Luôn có mặt, để lỗi được đọc khi xuất hiện. */}
      <div role="alert" className="empty:hidden mb-4 space-y-2">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        {loadError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[12rem] relative" role="search">
          <label htmlFor="users-search" className="sr-only">
            Tìm người dùng
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          <input
            id="users-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên đăng nhập, tên, email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>
        <label htmlFor="users-role-filter" className="sr-only">
          Lọc theo vai trò
        </label>
        <select
          id="users-role-filter"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <input
            id="users-show-deleted"
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }}
            className="h-4 w-4 accent-blue-600"
          />
          <label htmlFor="users-show-deleted">Hiện tài khoản đã xóa</label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Danh sách người dùng, trang {page}</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Người dùng</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Vai trò</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Đóng góp</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Ngày tạo</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const deleted = Boolean(user.deletedAt);
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className={deleted ? 'bg-gray-50' : user.isBanned ? 'bg-red-50/50' : ''}>
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${deleted ? 'text-gray-600' : 'text-gray-900'}`}>
                          {displayName(user)}
                          {!deleted && user.isBanned && <span className="ml-1 text-xs text-red-700">(Đã khoá)</span>}
                          {isSelf && <span className="ml-1 text-xs text-gray-600">(bạn)</span>}
                        </p>
                        <p className="text-xs text-gray-600">
                          {deleted
                            ? `Đã xóa ${new Date(user.deletedAt!).toLocaleDateString('vi-VN')} · ${user.username ?? ''}`
                            : user.email || 'Ẩn danh'}
                        </p>
                      </div>
                    </div>
                  </th>
                  <td className="px-4 py-3">
                    {deleted ? (
                      <span className="text-xs text-gray-600">{ROLE_LABELS[user.role] ?? user.role}</span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user, e.target.value)}
                        aria-label={`Vai trò của ${displayName(user)}`}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${ROLE_COLORS[user.role] || ''}`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user._count.contributions}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    {deleted ? (
                      <span className="text-xs text-gray-600">(đã xóa)</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => toggleBan(user, !user.isBanned)}
                            className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              user.isBanned
                                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                : 'text-red-700 bg-red-50 hover:bg-red-100'
                            }`}
                          >
                            {user.isBanned ? 'Mở khoá' : 'Khoá'}
                            <span className="sr-only"> {displayName(user)}</span>
                          </button>
                        )}
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => { setError(''); setDeleting(user); }}
                            className="text-xs px-2 py-1 rounded-lg font-medium text-red-700 border border-red-200 hover:bg-red-50"
                          >
                            Xóa tài khoản
                            <span className="sr-only"> {displayName(user)}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div role="status" className="empty:hidden">
          {isLoading && <div className="p-8 text-center text-gray-500 text-sm">Đang tải...</div>}
          {!isLoading && users.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">Không tìm thấy người dùng</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <nav aria-label="Phân trang người dùng" className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Tổng: {total} người dùng</span>
        <div className="flex gap-2">
          <button
            type="button"
            // aria-disabled, không phải disabled: bấm tới trang đầu không làm mất focus.
            onClick={() => { if (page > 1) setPage(page - 1); }}
            aria-disabled={page <= 1 || undefined}
            className="px-3 py-1 border border-gray-500 rounded-lg aria-disabled:opacity-50 aria-disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-3 py-1" aria-current="page">Trang {page}</span>
          <button
            type="button"
            onClick={() => { if (users.length >= 20) setPage(page + 1); }}
            aria-disabled={users.length < 20 || undefined}
            className="px-3 py-1 border border-gray-500 rounded-lg aria-disabled:opacity-50 aria-disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </nav>

      {deleting && (
        <DeleteUserDialog
          user={deleting}
          label={displayName(deleting)}
          onCancel={() => setDeleting(null)}
          onDeleted={async () => {
            announce(`Đã xóa tài khoản ${displayName(deleting)}.`);
            // Reload first, then close: the dialog returns focus once the row (and its
            // "Xóa tài khoản" button) is already gone, so it falls back to the page heading
            // instead of focusing a button that the reload removes a moment later.
            await fetchUsers();
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
