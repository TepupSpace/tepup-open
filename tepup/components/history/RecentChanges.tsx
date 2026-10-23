'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import Spinner from '@/components/ui/Spinner';
import {
  SOURCE_LABELS,
  TARGET_LABELS,
  formatTime,
  historyHref,
  targetHref,
  type HistoryArea,
  type HistoryTargetType,
  type RecentChangeRow,
  type RecentChangesResponse,
} from './types';

/**
 * "Thay đổi gần đây" list with filters and the patrol button ("Đánh dấu đã kiểm tra").
 * Data: GET /api/history/recent (scope enforced there); patrol: POST
 * /api/history/revisions/[id]/patrol.
 */

const ACCENT: Record<HistoryArea, { link: string; btn: string }> = {
  admin: { link: 'text-blue-700 underline', btn: 'border-blue-600 text-blue-800 hover:bg-blue-50' },
  contributor: { link: 'text-teal-800 underline', btn: 'border-teal-700 text-teal-800 hover:bg-teal-50' },
};

interface Filters {
  courseId: string;
  targetType: HistoryTargetType | '';
  unpatrolled: boolean;
}

function query(f: Filters, cursor?: string | null) {
  const q = new URLSearchParams();
  if (f.courseId) q.set('courseId', f.courseId);
  if (f.targetType) q.set('targetType', f.targetType);
  if (f.unpatrolled) q.set('unpatrolled', '1');
  if (cursor) q.set('cursor', cursor);
  return q.toString();
}

export default function RecentChanges({ area, initial }: { area: HistoryArea; initial: Filters }) {
  const accent = ACCENT[area];
  const ids = { course: useId(), type: useId(), unp: useId() };
  const [filters, setFilters] = useState<Filters>(initial);
  const [data, setData] = useState<RecentChangesResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  // "Tải thêm" stays mounted (as "Đã hết") once a further page was loaded, so focus isn't dropped.
  const [paged, setPaged] = useState(false);
  // Row whose patrol button was just replaced by "Đã kiểm tra": focus moves there.
  const focusRow = useRef<string | null>(null);
  // Only the newest list request may write state: filters can change faster than responses arrive.
  const seq = useRef(0);

  const load = useCallback(async (f: Filters) => {
    const my = ++seq.current;
    setLoading(true);
    setError('');
    setPaged(false);
    try {
      const res = await fetch(`/api/history/recent?${query(f)}`, { cache: 'no-store' });
      if (my !== seq.current) return;
      if (!res.ok) {
        setError(`Không tải được danh sách (lỗi ${res.status}).`);
        return;
      }
      const next = ((await res.json()) as { data: RecentChangesResponse }).data;
      if (my !== seq.current) return;
      setData(next);
    } catch {
      if (my === seq.current) setError('Không kết nối được máy chủ.');
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!focusRow.current) return;
    document.getElementById(`${ids.unp}-patrolled-${focusRow.current}`)?.focus();
    focusRow.current = null;
  }, [data, ids.unp]);

  useEffect(() => {
    load(filters);
    try {
      const url = new URL(window.location.href);
      url.search = query(filters);
      window.history.replaceState(window.history.state, '', url);
    } catch {
      // Not important.
    }
  }, [filters, load]);

  const more = async () => {
    if (!data?.nextCursor || loadingMore) return;
    const my = seq.current;
    setLoadingMore(true);
    setError('');
    try {
      const res = await fetch(`/api/history/recent?${query(filters, data.nextCursor)}`, { cache: 'no-store' });
      // The filters changed while this page loaded: it belongs to the old list.
      if (my !== seq.current) return;
      if (!res.ok) {
        setError(`Không tải thêm được (lỗi ${res.status}).`);
        return;
      }
      const next = ((await res.json()) as { data: RecentChangesResponse }).data;
      if (my !== seq.current) return;
      setPaged(true);
      setData((d) => (d ? { ...d, rows: [...d.rows, ...next.rows], nextCursor: next.nextCursor } : next));
    } catch {
      if (my === seq.current) setError('Không kết nối được máy chủ.');
    } finally {
      setLoadingMore(false);
    }
  };

  const patrol = async (row: RecentChangeRow) => {
    if (busy) return;
    setBusy(row.id);
    try {
      const res = await fetch(`/api/history/revisions/${encodeURIComponent(row.id)}/patrol`, { method: 'POST' });
      if (!res.ok) {
        setStatus('Không đánh dấu được.');
        return;
      }
      const { data: p } = (await res.json()) as { data: { patrolledBy: string | null; patrolledAt: string } };
      focusRow.current = row.id;
      setData((d) =>
        d
          ? {
              ...d,
              rows: d.rows.map((r) =>
                r.id === row.id ? { ...r, patrolled: true, patrolledBy: p.patrolledBy, patrolledAt: p.patrolledAt } : r
              ),
            }
          : d
      );
      setStatus(`Đã đánh dấu đã kiểm tra: ${row.label}.`);
    } catch {
      setStatus('Không kết nối được máy chủ.');
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = data?.viewer.isAdmin ?? false;
  const typeOptions: HistoryTargetType[] = data?.viewer.global
    ? ['LESSON', 'COURSE_OUTLINE', 'CHAPTER', 'LIBRARY_ENTRY']
    : ['LESSON', 'COURSE_OUTLINE'];

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-3 text-sm"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Lọc thay đổi"
      >
        <div>
          <label htmlFor={ids.type} className="block text-gray-700">
            Loại
          </label>
          <select
            id={ids.type}
            value={filters.targetType}
            onChange={(e) => setFilters((f) => ({ ...f, targetType: e.target.value as HistoryTargetType | '' }))}
            className="mt-1 rounded-lg border border-gray-300 bg-white px-2 py-1"
          >
            <option value="">Tất cả</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {TARGET_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.course} className="block text-gray-700">
            Khóa học
          </label>
          <select
            id={ids.course}
            value={filters.courseId}
            onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
            className="mt-1 max-w-xs rounded-lg border border-gray-300 bg-white px-2 py-1"
          >
            <option value="">Tất cả</option>
            {filters.courseId && !data?.courses.some((c) => c.id === filters.courseId) && (
              <option value={filters.courseId}>Khóa đang lọc</option>
            )}
            {data?.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label htmlFor={ids.unp} className="flex items-center gap-2 pb-1 text-gray-800">
          <input
            id={ids.unp}
            type="checkbox"
            checked={filters.unpatrolled}
            onChange={(e) => setFilters((f) => ({ ...f, unpatrolled: e.target.checked }))}
          />
          Chỉ thay đổi chưa kiểm tra
        </label>
      </form>

      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-gray-800">
        {status}
      </p>

      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 empty:hidden">
        {error}
      </div>
      {loading && !data && (
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner size="sm" tone="muted" /> Đang tải…
        </p>
      )}
      {data && data.rows.length === 0 && !loading && <p className="text-sm text-gray-600">Không có thay đổi nào.</p>}

      {data && data.rows.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white" aria-busy={loading || undefined}>
          {data.rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600">
                  <time dateTime={r.createdAt}>{formatTime(r.createdAt)}</time> · {TARGET_LABELS[r.targetType]}
                  {r.courseName && r.targetType === 'LESSON' ? ` · ${r.courseName}` : ''}
                </p>
                <p className="font-medium text-gray-900">
                  {r.targetExists ? (
                    <Link href={targetHref(area, isAdmin, r.targetType, r.targetId)} className={accent.link}>
                      {r.label}
                    </Link>
                  ) : (
                    <>
                      {r.label} <span className="text-xs font-normal text-gray-600">(đã xóa)</span>
                    </>
                  )}
                </p>
                <p className="text-gray-700">
                  {SOURCE_LABELS[r.source]}
                  {r.actor ? ` · bởi ${r.actor}` : ''}
                  {r.author && r.author !== r.actor ? ` · tác giả ${r.author}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={historyHref(area, r.targetType, r.targetId, r.id)} className={accent.link}>
                  Xem thay đổi<span className="sr-only">: {r.label}</span>
                </Link>
                {r.patrolled ? (
                  <span
                    id={`${ids.unp}-patrolled-${r.id}`}
                    tabIndex={-1}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
                  >
                    <span aria-hidden="true">✓ </span>Đã kiểm tra{r.patrolledBy ? ` (${r.patrolledBy})` : ''}
                  </span>
                ) : r.canPatrol ? (
                  <button
                    type="button"
                    onClick={() => patrol(r)}
                    aria-disabled={busy === r.id || undefined}
                    className={`rounded-lg border bg-white px-2 py-1 text-xs font-medium aria-disabled:opacity-70 ${accent.btn}`}
                  >
                    {busy === r.id ? 'Đang đánh dấu…' : 'Đánh dấu đã kiểm tra'}
                    <span className="sr-only">: {r.label}</span>
                  </button>
                ) : (
                  <span className="text-xs text-gray-600">Chưa kiểm tra</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Stays mounted after the last page arrives ("Đã hết"), so focus isn't dropped. */}
      {data && (data.nextCursor || paged) && (
        <button
          type="button"
          onClick={more}
          aria-disabled={loadingMore || !data.nextCursor || undefined}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 aria-disabled:opacity-60"
        >
          {loadingMore ? 'Đang tải…' : data.nextCursor ? 'Tải thêm' : 'Đã hết'}
        </button>
      )}
    </div>
  );
}
