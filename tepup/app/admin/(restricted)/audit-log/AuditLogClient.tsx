'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AuditAction } from '@/lib/services/audit-service';

/**
 * Nhật ký quản trị (proposal §6.19): chỉ đọc, chỉ quản trị viên. Lọc theo hành động, người
 * thực hiện, loại và mã đối tượng; tải thêm theo con trỏ.
 */

interface Entry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: unknown;
  createdAt: string;
  actorId: string | null;
  actorUsername: string | null;
  actorName: string | null;
  targetName: string | null;
}

interface Filters {
  action: string;
  actor: string;
  targetType: string;
  targetId: string;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  USER_ROLE_CHANGED: 'Đổi vai trò người dùng',
  USER_BANNED: 'Khoá tài khoản',
  USER_UNBANNED: 'Mở khoá tài khoản',
  USER_DELETED: 'Quản trị viên xóa tài khoản',
  USER_SELF_DELETED: 'Người dùng tự xóa tài khoản',
  COURSE_ROLE_ADDED: 'Thêm vai trò khoá học',
  COURSE_ROLE_REMOVED: 'Gỡ vai trò khoá học',
  COURSE_ROLE_CHANGED: 'Đổi vai trò khoá học',
  COURSE_BLOCK_ADDED: 'Chặn trong khoá học',
  COURSE_BLOCK_REMOVED: 'Bỏ chặn trong khoá học',
  REVIEWER_VERIFIED: 'Xác minh người duyệt',
  REVIEWER_UNVERIFIED: 'Bỏ xác minh người duyệt',
  LESSON_VISIBILITY_CHANGED: 'Ẩn/hiện bài học',
  LESSON_DELETED: 'Xóa bài học',
  LEVEL_DELETED: 'Xóa cấp độ',
  COURSE_DELETED: 'Xóa khoá học',
  CONTENT_ROLLED_BACK: 'Khôi phục phiên bản',
  CONTRIBUTION_FORCE_APPROVED: 'Duyệt ép (bỏ qua xung đột)',
  CONTRIBUTION_ESCALATED: 'Chuyển đề xuất cho quản trị viên',
  REVIEW_REQUEST_ESCALATED: 'Chuyển yêu cầu duyệt cho quản trị viên',
  COMMENT_HIDDEN: 'Ẩn bình luận',
  REVISION_PATROLLED: 'Đánh dấu đã kiểm tra',
  FLAG_SET: 'Gắn cờ bảo trì',
  FLAG_RESOLVED: 'Gỡ cờ bảo trì',
};

const TARGET_TYPES = ['USER', 'COURSE', 'LESSON', 'LEVEL', 'CHAPTER', 'LIBRARY_ENTRY', 'CONTRIBUTION', 'REVIEW_REQUEST', 'COMMENT', 'REVISION', 'FLAG'];

const EMPTY: Filters = { action: '', actor: '', targetType: '', targetId: '' };

const inputClass =
  'w-full px-3 py-2 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600';

function formatDetails(details: unknown): string {
  if (details === null || details === undefined) return '';
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

export default function AuditLogClient() {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) if (v.trim()) params.set(k, v.trim());
      if (cursor) params.set('cursor', cursor);
      try {
        const res = await fetch(`/api/admin/audit-log?${params}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          setError(data?.error || 'Không tải được nhật ký.');
          return;
        }
        setEntries((prev) => (cursor ? [...prev, ...data.entries] : data.entries));
        setNextCursor(data.nextCursor);
      } catch {
        setError('Không tải được nhật ký.');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    load(null);
  }, [load]);

  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhật ký quản trị</h1>
      <p className="text-sm text-gray-600 mb-6">
        Các thao tác đặc quyền (vai trò, khoá, xóa tài khoản, xóa nội dung, khôi phục…). Chỉ đọc: không ai sửa
        hay xóa được dòng nào.
      </p>

      <form
        role="search"
        aria-label="Lọc nhật ký"
        onSubmit={(e) => {
          e.preventDefault();
          // Same filters again: reload explicitly, since the effect won't re-run.
          if (JSON.stringify(draft) === JSON.stringify(filters)) load(null);
          else setFilters(draft);
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end mb-6"
      >
        <div>
          <label htmlFor="audit-action" className="block text-xs font-medium text-gray-700 mb-1">
            Hành động
          </label>
          <select id="audit-action" value={draft.action} onChange={set('action')} className={inputClass}>
            <option value="">Tất cả</option>
            {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="audit-actor" className="block text-xs font-medium text-gray-700 mb-1">
            Người thực hiện (tên tài khoản)
          </label>
          <input
            id="audit-actor"
            type="text"
            value={draft.actor}
            onChange={set('actor')}
            autoCapitalize="none"
            spellCheck={false}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="audit-target-type" className="block text-xs font-medium text-gray-700 mb-1">
            Loại đối tượng
          </label>
          <select id="audit-target-type" value={draft.targetType} onChange={set('targetType')} className={inputClass}>
            <option value="">Tất cả</option>
            {TARGET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="audit-target-id" className="block text-xs font-medium text-gray-700 mb-1">
            Mã đối tượng
          </label>
          <input
            id="audit-target-id"
            type="text"
            value={draft.targetId}
            onChange={set('targetId')}
            autoCapitalize="none"
            spellCheck={false}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Lọc
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY);
              setFilters(EMPTY);
            }}
            className="px-4 py-2 border border-gray-500 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
          >
            Xóa lọc
          </button>
        </div>
      </form>

      <div role="alert" className="empty:hidden mb-4">
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Nhật ký quản trị, mới nhất trước</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Thời gian</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Người thực hiện</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Hành động</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Đối tượng</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-gray-600">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 align-top">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  <time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleString('vi-VN')}</time>
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {e.actorName ?? (e.actorId ? <span className="font-mono text-xs">{e.actorId}</span> : 'Hệ thống')}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {ACTION_LABELS[e.action as AuditAction] ?? e.action}
                  <span className="block font-mono text-xs text-gray-600">{e.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <span className="text-xs font-medium text-gray-600">{e.targetType}</span>
                  {e.targetName && <span className="block text-gray-900">{e.targetName}</span>}
                  <span className="block font-mono text-xs break-all">{e.targetId}</span>
                </td>
                <td className="px-4 py-3">
                  {e.details !== null && e.details !== undefined ? (
                    <pre className="max-w-md overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-2 font-mono text-xs text-gray-800">
                      {formatDetails(e.details)}
                    </pre>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div role="status" className="empty:hidden">
          {loading && <p className="p-6 text-center text-sm text-gray-600">Đang tải…</p>}
          {!loading && !error && entries.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-600">Không có mục nào.</p>
          )}
        </div>
      </div>

      {/* Stays mounted once shown, so focus isn't dropped when the last page arrives. */}
      {entries.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (!loading && nextCursor) load(nextCursor);
            }}
            aria-disabled={loading || !nextCursor || undefined}
            className="px-4 py-2 border border-gray-500 rounded-xl text-sm text-gray-700 hover:bg-gray-50 aria-disabled:opacity-60 aria-disabled:cursor-wait"
          >
            {nextCursor ? 'Tải thêm' : 'Đã hết'}
          </button>
        </div>
      )}
    </div>
  );
}
