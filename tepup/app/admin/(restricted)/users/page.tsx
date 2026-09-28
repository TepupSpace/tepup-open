'use client';

import { useState, useEffect } from 'react';
import { User, Search, Shield, Ban, CheckCircle } from 'lucide-react';

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

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-700',
  CONTRIBUTOR: 'bg-teal-100 text-teal-700',
  TRUSTED_CONTRIBUTOR: 'bg-emerald-100 text-emerald-700',
  REVIEWER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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

  const updateRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    const bannedReason = isBanned ? prompt('Lý do ban:') : undefined;
    if (isBanned && bannedReason === null) return; // cancelled

    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned, bannedReason }),
    });
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm username, tên, email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Người dùng</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Đóng góp</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ngày tạo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className={user.isBanned ? 'bg-red-50/50' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.username || user.name || 'N/A'}
                        {user.isBanned && <span className="ml-1 text-xs text-red-500">(Banned)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{user.email || 'Ẩn danh'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${ROLE_COLORS[user.role] || ''}`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user._count.contributions}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleBan(user.id, !user.isBanned)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      user.isBanned
                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">Không tìm thấy người dùng</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Tổng: {total} người dùng</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-3 py-1">Trang {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={users.length < 20}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
