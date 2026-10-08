'use client';

import { useState, useEffect } from 'react';
import { User, Search } from 'lucide-react';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';

interface UserData {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: { contributions: number };
}

const ROLE_OPTIONS = ['USER', 'CONTRIBUTOR', 'TRUSTED_CONTRIBUTOR', 'REVIEWER', 'ADMIN'];

// Tên vai trò hiển thị cho admin (giá trị gửi lên API vẫn là mã vai trò).
const ROLE_LABELS: Record<string, string> = {
  USER: 'Người học',
  CONTRIBUTOR: 'Người đóng góp',
  TRUSTED_CONTRIBUTOR: 'Người đóng góp tin cậy',
  REVIEWER: 'Người duyệt',
  ADMIN: 'Quản trị viên',
};

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-700',
  CONTRIBUTOR: 'bg-teal-100 text-teal-700',
  TRUSTED_CONTRIBUTOR: 'bg-emerald-100 text-emerald-700',
  REVIEWER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

export default function UsersClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, announce] = useAnnouncer();

  const fetchUsers = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const displayName = (u: UserData) => u.username || u.name || 'Chưa đặt tên';

  const updateRole = async (user: UserData, role: string) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    announce(`Đã đổi vai trò của ${displayName(user)} thành ${ROLE_LABELS[role] ?? role}.`);
    fetchUsers();
  };

  const toggleBan = async (user: UserData, isBanned: boolean) => {
    // Hộp prompt gốc của trình duyệt vừa hỏi lý do vừa là bước xác nhận (Huỷ = không khoá).
    const bannedReason = isBanned ? prompt(`Lý do khoá tài khoản ${displayName(user)}:`) : undefined;
    if (isBanned && bannedReason === null) return; // cancelled

    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned, bannedReason }),
    });
    announce(isBanned ? `Đã khoá ${displayName(user)}.` : `Đã mở khoá ${displayName(user)}.`);
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative" role="search">
          <label htmlFor="users-search" className="sr-only">
            Tìm người dùng
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
            {users.map((user) => (
              <tr key={user.id} className={user.isBanned ? 'bg-red-50/50' : ''}>
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {displayName(user)}
                        {user.isBanned && <span className="ml-1 text-xs text-red-700">(Đã khoá)</span>}
                      </p>
                      <p className="text-xs text-gray-600">{user.email || 'Ẩn danh'}</p>
                    </div>
                  </div>
                </th>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user._count.contributions}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
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
    </div>
  );
}
