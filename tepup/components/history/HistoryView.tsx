'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import Spinner from '@/components/ui/Spinner';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import BlockDiff, { type BlocksVersion } from '@/components/review/BlockDiff';
import EntryDiff from '@/components/review/EntryDiff';
import OutlineDiff from '@/components/review/OutlineDiff';
import { normalizeOutline } from '@/lib/diff';
import {
  SOURCE_LABELS,
  TARGET_LABELS,
  formatTime,
  targetHref,
  type HistoryArea,
  type HistoryListResponse,
  type HistoryTargetType,
  type RevisionDetailResponse,
  type RevisionListItem,
} from './types';

/**
 * Full history of one target (proposal §6.10): the revision list, the diff of a selected
 * revision against the previous one (or against the live version), "Khôi phục bản này"
 * when allowed, and "Sao chép nội dung" for a deleted lesson. Mounted at
 * /admin/history/… and /contributor/history/…; the API checks every permission itself.
 */

const ACCENT: Record<HistoryArea, { btn: string; link: string; ring: string; selected: string }> = {
  admin: {
    btn: 'bg-blue-600 text-white hover:bg-blue-700',
    link: 'text-blue-700 underline',
    ring: 'focus-visible:ring-blue-600',
    selected: 'border-blue-500 bg-blue-50',
  },
  contributor: {
    btn: 'bg-teal-700 text-white hover:bg-teal-800',
    link: 'text-teal-800 underline',
    ring: 'focus-visible:ring-teal-700',
    selected: 'border-teal-600 bg-teal-50',
  },
};

function asBlocksVersion(v: unknown): BlocksVersion {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  return { title: typeof o.title === 'string' ? o.title : '', blocks: Array.isArray(o.blocks) ? o.blocks : [] };
}

export function SnapshotDiff({
  targetType,
  before,
  after,
  linkTitles,
}: {
  targetType: HistoryTargetType;
  before: unknown | null;
  after: unknown;
  linkTitles?: Record<string, string>;
}) {
  if (targetType === 'LIBRARY_ENTRY') return <EntryDiff before={before} after={after} linkTitles={linkTitles} />;
  if (targetType === 'COURSE_OUTLINE') {
    return <OutlineDiff before={before == null ? null : normalizeOutline(before)} after={normalizeOutline(after)} />;
  }
  return <BlockDiff before={before == null ? null : asBlocksVersion(before)} after={asBlocksVersion(after)} />;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return [body.error, body.hint].filter(Boolean).join(' ') || `Lỗi ${res.status}`;
  } catch {
    return `Lỗi ${res.status}`;
  }
}

export default function HistoryView({
  targetType,
  targetId,
  area,
  initialRevisionId,
}: {
  targetType: HistoryTargetType;
  targetId: string;
  area: HistoryArea;
  initialRevisionId?: string | null;
}) {
  const accent = ACCENT[area];
  const [list, setList] = useState<HistoryListResponse | null>(null);
  const [listError, setListError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialRevisionId ?? null);
  const [detail, setDetail] = useState<RevisionDetailResponse | null>(null);
  const [detailError, setDetailError] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [compare, setCompare] = useState<'previous' | 'live'>('previous');
  const [status, setStatus] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [patrolling, setPatrolling] = useState(false);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const focusDetail = useRef(false);
  // After "Đánh dấu đã kiểm tra" the button disappears: focus moves to the "Kiểm tra" value.
  const patrolledRef = useRef<HTMLElement>(null);
  const focusPatrolled = useRef(false);
  // "Tải thêm" stays mounted (as "Đã hết") once a further page was loaded, so focus isn't dropped.
  const [paged, setPaged] = useState(false);
  const [moreError, setMoreError] = useState('');

  const base = `/api/history/${targetType}/${encodeURIComponent(targetId)}`;

  const loadList = useCallback(async () => {
    setListError('');
    try {
      const res = await fetch(base, { cache: 'no-store' });
      if (!res.ok) {
        setListError(res.status === 404 ? 'Không tìm thấy lịch sử, hoặc bạn không có quyền xem.' : await readError(res));
        return null;
      }
      const { data } = (await res.json()) as { data: HistoryListResponse };
      setPaged(false);
      setList(data);
      return data;
    } catch {
      setListError('Không kết nối được máy chủ.');
      return null;
    }
  }, [base]);

  useEffect(() => {
    let cancelled = false;
    loadList().then((data) => {
      if (!cancelled && data && !initialRevisionId && data.revisions[0]) setSelectedId(data.revisions[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, [loadList, initialRevisionId]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingDetail(true);
    setDetailError('');
    fetch(`/api/history/revisions/${encodeURIComponent(selectedId)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setDetail(null);
          setDetailError(await readError(res));
          return;
        }
        const { data } = (await res.json()) as { data: RevisionDetailResponse };
        if (!cancelled) setDetail(data);
      })
      .catch(() => !cancelled && setDetailError('Không tải được phiên bản.'))
      .finally(() => {
        if (cancelled) return;
        setLoadingDetail(false);
        if (focusDetail.current) {
          focusDetail.current = false;
          requestAnimationFrame(() => detailHeading.current?.focus());
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const select = (id: string) => {
    focusDetail.current = true;
    setCopyFallback(null);
    setSelectedId(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('rev', id);
      window.history.replaceState(window.history.state, '', url);
    } catch {
      // Not important.
    }
  };

  const loadMore = async () => {
    if (!list?.nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      setMoreError('');
      const res = await fetch(`${base}?cursor=${encodeURIComponent(list.nextCursor)}`, { cache: 'no-store' });
      if (!res.ok) {
        setMoreError(await readError(res));
        return;
      }
      const { data } = (await res.json()) as { data: HistoryListResponse };
      setPaged(true);
      setList((l) => (l ? { ...l, revisions: [...l.revisions, ...data.revisions], nextCursor: data.nextCursor } : data));
    } catch {
      setMoreError('Không kết nối được máy chủ.');
    } finally {
      setLoadingMore(false);
    }
  };

  const restore = async () => {
    if (!detail || restoring) return;
    setRestoring(true);
    setRestoreError('');
    try {
      const res = await fetch(`/api/history/revisions/${encodeURIComponent(detail.revision.id)}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseRevisionId: list?.revisions[0]?.id ?? detail.latestRevisionId }),
      });
      if (!res.ok) {
        setRestoreError(await readError(res));
        return;
      }
      const { data } = (await res.json()) as { data: { revisionId: string | null } };
      setConfirming(false);
      setStatus('Đã khôi phục. Phiên bản khôi phục được ghi thành một mục mới trong lịch sử.');
      await loadList();
      if (data.revisionId) select(data.revisionId);
    } catch {
      setRestoreError('Không kết nối được máy chủ.');
    } finally {
      setRestoring(false);
    }
  };

  const patrol = async () => {
    if (!detail || patrolling) return;
    setPatrolling(true);
    try {
      const res = await fetch(`/api/history/revisions/${encodeURIComponent(detail.revision.id)}/patrol`, { method: 'POST' });
      if (!res.ok) {
        setStatus(await readError(res));
        return;
      }
      const { data } = (await res.json()) as { data: { patrolledBy: string | null; patrolledAt: string } };
      const mark = (r: RevisionListItem) =>
        r.id === detail.revision.id ? { ...r, patrolled: true, patrolledBy: data.patrolledBy, patrolledAt: data.patrolledAt } : r;
      focusPatrolled.current = true;
      setDetail((d) => (d ? { ...d, revision: { ...d.revision, ...mark(d.revision) } } : d));
      setList((l) => (l ? { ...l, revisions: l.revisions.map(mark) } : l));
      setStatus('Đã đánh dấu đã kiểm tra.');
    } catch {
      setStatus('Không kết nối được máy chủ.');
    } finally {
      setPatrolling(false);
    }
  };

  const copyContent = async () => {
    if (!detail) return;
    const text = JSON.stringify(detail.snapshot, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Đã sao chép nội dung (JSON) vào bộ nhớ tạm.');
      setCopyFallback(null);
    } catch {
      setCopyFallback(text);
      setStatus('Trình duyệt không cho sao chép tự động. Hãy chọn và sao chép nội dung trong ô bên dưới.');
    }
  };

  useEffect(() => {
    if (!focusPatrolled.current) return;
    focusPatrolled.current = false;
    patrolledRef.current?.focus();
  }, [detail]);

  if (listError) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {listError}
      </p>
    );
  }
  if (!list) {
    return (
      <p className="flex items-center gap-2 text-sm text-gray-600">
        <Spinner size="sm" tone="muted" /> Đang tải lịch sử…
      </p>
    );
  }

  const latestId = list.revisions[0]?.id ?? null;
  const rev = detail?.revision;
  const isLatest = !!rev && rev.id === detail?.latestRevisionId;
  const canRestoreThis = !!detail && detail.viewer.canRestore && detail.targetExists && !isLatest && rev?.source !== 'DELETED';
  const deletedLesson = !!detail && !detail.targetExists && targetType === 'LESSON';
  const before = compare === 'live' ? detail?.live ?? null : detail?.previous?.snapshot ?? null;
  const after = detail?.snapshot;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-700">{TARGET_LABELS[targetType]}</span>
        {list.target.exists ? (
          <Link href={targetHref(area, list.viewer.isAdmin, targetType, targetId)} className={accent.link}>
            Mở {TARGET_LABELS[targetType].toLowerCase()}
          </Link>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Đã bị xóa</span>
        )}
        <span className="text-gray-600">{list.revisions.length}{list.nextCursor ? '+' : ''} phiên bản</span>
      </div>

      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-gray-800">
        {status}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
        <section aria-labelledby="history-list-heading">
          <h2 id="history-list-heading" className="mb-2 text-base font-semibold text-gray-900">
            Các phiên bản
          </h2>
          {list.revisions.length === 0 ? (
            <p className="text-sm text-gray-600">Chưa có phiên bản nào được ghi.</p>
          ) : (
            <ol className="space-y-2">
              {list.revisions.map((r) => {
                const selected = r.id === selectedId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => select(r.id)}
                      aria-current={selected ? 'true' : undefined}
                      className={`w-full rounded-xl border p-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 ${accent.ring} ${
                        selected ? accent.selected : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="block font-medium text-gray-900">
                        {formatTime(r.createdAt)}
                        {r.id === latestId ? ' · hiện tại' : ''}
                      </span>
                      <span className="block text-gray-700">{SOURCE_LABELS[r.source]}</span>
                      {(r.actor || r.author) && (
                        <span className="block text-gray-600">
                          {r.actor ? `Bởi ${r.actor}` : ''}
                          {r.author && r.author !== r.actor ? ` · tác giả ${r.author}` : ''}
                        </span>
                      )}
                      <span className="block text-xs text-gray-600">{r.patrolled ? 'Đã kiểm tra' : 'Chưa kiểm tra'}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {/* Stays mounted after the last page arrives ("Đã hết"), so focus isn't dropped. */}
          {(list.nextCursor || paged) && (
            <button
              type="button"
              onClick={loadMore}
              aria-disabled={loadingMore || !list.nextCursor || undefined}
              className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 aria-disabled:opacity-60"
            >
              {loadingMore ? 'Đang tải…' : list.nextCursor ? 'Tải thêm' : 'Đã hết'}
            </button>
          )}
          <div role="alert" className="mt-2 text-sm text-red-700 empty:hidden">
            {moreError}
          </div>
        </section>

        <section aria-labelledby="history-detail-heading" className="min-w-0">
          <h2 id="history-detail-heading" ref={detailHeading} tabIndex={-1} className="mb-2 text-base font-semibold text-gray-900 focus:outline-none">
            {rev ? `Phiên bản ${formatTime(rev.createdAt)}` : 'Chọn một phiên bản'}
          </h2>
          {loadingDetail && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner size="sm" tone="muted" /> Đang tải…
            </p>
          )}
          {detailError && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{detailError}</p>}
          {detail && rev && !loadingDetail && (
            <div className="space-y-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-gray-600">Nguồn</dt>
                <dd className="text-gray-900">{SOURCE_LABELS[rev.source]}</dd>
                {rev.actor && (
                  <>
                    <dt className="text-gray-600">Người đưa lên</dt>
                    <dd className="text-gray-900">{rev.actor}</dd>
                  </>
                )}
                {rev.author && (
                  <>
                    <dt className="text-gray-600">Tác giả</dt>
                    <dd className="text-gray-900">{rev.author}</dd>
                  </>
                )}
                {rev.contributionId && (
                  <>
                    <dt className="text-gray-600">Đề xuất</dt>
                    <dd>
                      <Link href={`/${area}/reviews/${rev.contributionId}`} className={accent.link}>
                        Xem đề xuất
                      </Link>
                    </dd>
                  </>
                )}
                <dt className="text-gray-600">Kiểm tra</dt>
                <dd
                  ref={patrolledRef}
                  tabIndex={-1}
                  className="text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
                >
                  {rev.patrolled
                    ? `Đã kiểm tra${rev.patrolledBy ? ` bởi ${rev.patrolledBy}` : ''}${rev.patrolledAt ? `, ${formatTime(rev.patrolledAt)}` : ''}`
                    : 'Chưa kiểm tra'}
                </dd>
              </dl>

              <div className="flex flex-wrap gap-2">
                {canRestoreThis && (
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreError('');
                      setConfirming(true);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${accent.btn}`}
                  >
                    Khôi phục bản này
                  </button>
                )}
                {detail.viewer.canPatrol && !rev.patrolled && (
                  <button
                    type="button"
                    onClick={patrol}
                    aria-disabled={patrolling || undefined}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 aria-disabled:opacity-70"
                  >
                    {patrolling ? 'Đang đánh dấu…' : 'Đánh dấu đã kiểm tra'}
                  </button>
                )}
                {deletedLesson && (
                  <button
                    type="button"
                    onClick={copyContent}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    Sao chép nội dung
                  </button>
                )}
              </div>
              {deletedLesson && (
                <p className="text-sm text-gray-700">
                  Bài học này đã bị xóa nên không khôi phục được. Sao chép nội dung (JSON) để dán vào một bài mới.
                </p>
              )}
              {copyFallback !== null && (
                <label className="block text-sm text-gray-800">
                  Nội dung (JSON)
                  <textarea readOnly value={copyFallback} rows={8} className="mt-1 w-full rounded-lg border border-gray-300 p-2 font-mono text-xs" />
                </label>
              )}

              <fieldset className="flex flex-wrap gap-4 text-sm">
                <legend className="sr-only">So sánh với</legend>
                <label className="flex items-center gap-2">
                  <input type="radio" name="history-compare" checked={compare === 'previous'} onChange={() => setCompare('previous')} />
                  So với bản trước
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="history-compare"
                    checked={compare === 'live'}
                    onChange={() => setCompare('live')}
                    disabled={!detail.targetExists}
                  />
                  So với bản đang chạy (khôi phục sẽ đổi những gì)
                </label>
              </fieldset>

              {compare === 'previous' && !detail.previous && (
                <p className="text-sm text-gray-600">Đây là phiên bản đầu tiên được ghi.</p>
              )}
              {compare === 'live' && detail.targetExists && detail.live == null && (
                <p className="text-sm text-gray-600">Hiện chưa có nội dung đang chạy.</p>
              )}
              {after !== undefined && (
                <SnapshotDiff targetType={targetType} before={before} after={after} linkTitles={detail.linkTitles} />
              )}
            </div>
          )}
        </section>
      </div>

      {confirming && detail && rev && (
        <ConfirmDialog
          title="Khôi phục phiên bản này?"
          confirmLabel="Khôi phục"
          busyLabel="Đang khôi phục…"
          busy={restoring}
          error={restoreError}
          onConfirm={restore}
          onCancel={() => setConfirming(false)}
        >
          <p>
            Nội dung đang chạy sẽ được thay bằng phiên bản {formatTime(rev.createdAt)}. Thay đổi này hiện ngay với người học và
            được ghi vào lịch sử, nên có thể hoàn tác bằng cách khôi phục lại bản trước.
          </p>
          {targetType === 'COURSE_OUTLINE' && (
            <p className="mt-2">
              Chỉ tên, thứ tự, level và trạng thái ẩn/hiện của các level và bài còn tồn tại được đặt lại. Bài đã xóa không được tạo
              lại; bài mới thêm sau đó vẫn giữ nguyên.
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
