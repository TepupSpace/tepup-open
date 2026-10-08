'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Lightbulb, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';

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
  PENDING: 'bg-yellow-100 text-yellow-800',
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

export default function FeatureRequestsClient() {
  const [requests, setRequests] = useState<FeatureRequestData[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, announce] = useAnnouncer();

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
    announce(`Đã đổi trạng thái thành ${STATUS_LABELS[status] ?? status}.`);
    fetchRequests();
  };

  const updateNote = async (id: string) => {
    const current = requests.find((r) => r.id === id)?.adminNote || '';
    const note = prompt('Ghi chú của quản trị viên:', current);
    if (note === null) return;

    await fetch(`/api/feature-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote: note }),
    });
    announce('Đã lưu ghi chú.');
    fetchRequests();
  };

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu tính năng</h1>
        <span className="text-sm text-gray-600">({total})</span>
      </div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <label htmlFor="fr-status-filter" className="sr-only">
          Lọc theo trạng thái
        </label>
        <select
          id="fr-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <label htmlFor="fr-role-filter" className="sr-only">
          Lọc theo vai trò người gửi
        </label>
        <select
          id="fr-role-filter"
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
          <caption className="sr-only">Danh sách yêu cầu tính năng, trang {page}. Bấm tiêu đề để xem mô tả.</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Tiêu đề</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Vai trò</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Trạng thái</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Người gửi</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Ngày gửi</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((req) => {
              const expanded = expandedId === req.id;
              const detailId = `fr-detail-${req.id}`;
              return (
                <Fragment key={req.id}>
                  {/* Bấm cả hàng để mở là tiện cho chuột; bàn phím dùng nút tiêu đề (aria-expanded). */}
                  <tr className="hover:bg-gray-50/50 cursor-pointer" onClick={() => toggle(req.id)}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={expanded ? detailId : undefined}
                        onClick={(e) => { e.stopPropagation(); toggle(req.id); }}
                        className="flex items-start gap-1 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{req.title}</span>
                      </button>
                      {req.adminNote && (
                        <p className="text-xs text-amber-700 mt-0.5 line-clamp-1">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          <span className="sr-only">Ghi chú: </span>
                          {req.adminNote}
                        </p>
                      )}
                    </th>
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
                        aria-label={`Trạng thái của “${req.title}”`}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[req.status] || ''}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.user?.username || 'Ẩn danh'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateNote(req.id); }}
                        className="text-xs px-2 py-1 rounded-lg font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Ghi chú<span className="sr-only"> cho “{req.title}”</span>
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr id={detailId}>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.description}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        <div role="status" className="empty:hidden">
          {isLoading && <div className="p-8 text-center text-gray-500 text-sm">Đang tải...</div>}
          {!isLoading && requests.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">Chưa có yêu cầu nào</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <nav aria-label="Phân trang yêu cầu" className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Tổng: {total} yêu cầu</span>
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
            onClick={() => { if (requests.length >= 20) setPage(page + 1); }}
            aria-disabled={requests.length < 20 || undefined}
            className="px-3 py-1 border border-gray-500 rounded-lg aria-disabled:opacity-50 aria-disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </nav>
    </div>
  );
}
