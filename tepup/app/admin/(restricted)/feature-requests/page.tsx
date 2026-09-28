'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, MessageSquare } from 'lucide-react';

interface FeatureRequestData {
  id: string;
  role: string;
  title: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user: { id: string; username: string } | null;
}

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED'];
const ROLE_OPTIONS = ['LEARNER', 'CONTRIBUTOR'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  DONE: 'Hoàn thành',
  REJECTED: 'Từ chối',
};

const ROLE_COLORS: Record<string, string> = {
  LEARNER: 'bg-purple-100 text-purple-700',
  CONTRIBUTOR: 'bg-teal-100 text-teal-700',
};

const ROLE_LABELS: Record<string, string> = {
  LEARNER: 'Người học',
  CONTRIBUTOR: 'Người đóng góp',
};

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequestData[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set('status', statusFilter);
    if (roleFilter) params.set('role', roleFilter);

    try {
      const res = await fetch(`/api/feature-requests?${params}`);
      const data = await res.json();
      setRequests(data.data);
      setTotal(data.total);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, roleFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/feature-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  };

  const updateNote = async (id: string) => {
    const current = requests.find((r) => r.id === id)?.adminNote || '';
    const note = prompt('Ghi chú admin:', current);
    if (note === null) return;

    await fetch(`/api/feature-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote: note }),
    });
    fetchRequests();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu tính năng</h1>
        <span className="text-sm text-gray-400">({total})</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tiêu đề</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Vai trò</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Người gửi</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ngày gửi</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((req) => (
              <>
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{req.title}</p>
                    {req.adminNote && (
                      <p className="text-xs text-amber-600 mt-0.5 line-clamp-1">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {req.adminNote}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[req.role] || ''}`}>
                      {ROLE_LABELS[req.role] || req.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={req.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(req.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[req.status] || ''}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.user?.username || 'Ẩn danh'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateNote(req.id); }}
                      className="text-xs px-2 py-1 rounded-lg font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      Ghi chú
                    </button>
                  </td>
                </tr>
                {expandedId === req.id && (
                  <tr key={`${req.id}-detail`}>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.description}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        )}

        {!isLoading && requests.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có yêu cầu nào</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Tổng: {total} yêu cầu</span>
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
            disabled={requests.length < 20}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
