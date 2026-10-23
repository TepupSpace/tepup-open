'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { LessonFlagKind } from '@prisma/client';
import Spinner from '@/components/ui/Spinner';
import type { LessonFlagView } from '@/lib/services/flags-service';
import { FLAG_KIND_LABELS, FLAG_KIND_ORDER, learnerBanner } from './flag-kinds';

type Flags = { open: LessonFlagView[]; resolved: LessonFlagView[] };

const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const NOTE_MAX = 1_000;

const inputClass =
  'w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700';

export default function FlagsSectionClient({
  lessonId,
  canFlag,
  initial,
}: {
  lessonId: string;
  canFlag: boolean;
  initial: Flags;
}) {
  const uid = useId();
  const [flags, setFlags] = useState<Flags>(initial);
  const openKinds = new Set(flags.open.map((f) => f.kind));
  const firstFree = FLAG_KIND_ORDER.find((k) => !openKinds.has(k)) ?? 'NEEDS_SOURCES';
  const [kind, setKind] = useState<LessonFlagKind>(firstFree);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  // "Gỡ cờ" moves the flag out of the open list, removing the pressed button. After the
  // reload, focus goes to the "Gỡ cờ" button now at the same position (or the one before),
  // or to the heading when no open flag is left.
  const focusIndex = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const i = focusIndex.current;
    if (i === null) return;
    focusIndex.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-resolve]') ?? [];
    const target = buttons[Math.min(i, buttons.length - 1)];
    (target ?? headingRef.current)?.focus();
  }, [flags]);

  const reload = async (): Promise<boolean> => {
    const res = await fetch(`/api/contributor/lessons/${lessonId}/flags`, { cache: 'no-store' });
    if (!res.ok) return false;
    const body = (await res.json()) as Flags;
    setFlags({ open: body.open, resolved: body.resolved });
    return true;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy('add');
    setError('');
    try {
      const res = await fetch(`/api/contributor/lessons/${lessonId}/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, note }),
      });
      if (res.ok) {
        setNote('');
        setStatus(`Đã gắn cờ «${FLAG_KIND_LABELS[kind]}».`);
        await reload();
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error || 'Không gắn cờ được. Vui lòng thử lại.');
      }
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại.');
    }
    setBusy(null);
  };

  const resolve = async (f: LessonFlagView) => {
    if (busy) return;
    setBusy(f.id);
    setError('');
    try {
      const res = await fetch(`/api/contributor/flags/${f.id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus(`Đã gỡ cờ «${FLAG_KIND_LABELS[f.kind]}».`);
        focusIndex.current = Math.max(0, flags.open.findIndex((o) => o.id === f.id));
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error || 'Không gỡ cờ được. Vui lòng thử lại.');
      }
      // No new list, no re-render: the button is still there, so don't move focus later.
      if (!(await reload())) focusIndex.current = null;
    } catch {
      focusIndex.current = null;
      setError('Không kết nối được máy chủ. Vui lòng thử lại.');
    }
    setBusy(null);
  };

  const busyProps = busy ? { 'aria-disabled': true as const } : {};

  const flagMeta = (f: LessonFlagView) => {
    const banner = learnerBanner(f.kind);
    return (
      <>
        <p className="font-medium text-gray-900">{FLAG_KIND_LABELS[f.kind]}</p>
        <p className="mt-1 text-sm text-gray-700">
          {banner ? <>Người học thấy: «{banner}»</> : 'Chỉ người làm nội dung thấy, người học không thấy.'}
        </p>
        {f.note && <p className="mt-1 whitespace-pre-line text-sm text-gray-800">Ghi chú: {f.note}</p>}
        <p className="mt-1 text-xs text-gray-600">
          Gắn ngày {dateFmt.format(new Date(f.createdAt))}
          {f.createdBy ? ` bởi ${f.createdBy}` : ''}
          {f.resolvedAt && <> · gỡ ngày {dateFmt.format(new Date(f.resolvedAt))}{f.resolvedBy ? ` bởi ${f.resolvedBy}` : ''}</>}
        </p>
      </>
    );
  };

  return (
    <section aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} ref={headingRef} tabIndex={-1} className="mb-3 text-lg font-semibold text-gray-900">
        Cờ bảo trì
      </h2>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      <div role="alert" className="empty:hidden mb-3">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>

      {flags.open.length === 0 ? (
        <p className="text-sm text-gray-600">Bài này không có cờ nào đang mở.</p>
      ) : (
        <ul ref={listRef} className="space-y-2">
          {flags.open.map((f) => (
            <li key={f.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="min-w-0 flex-1">{flagMeta(f)}</div>
              {canFlag && (
                <button
                  type="button"
                  data-resolve
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
                  {...busyProps}
                  onClick={() => resolve(f)}
                >
                  {busy === f.id && <Spinner size="sm" tone="muted" />}
                  Gỡ cờ
                  <span className="sr-only">: {FLAG_KIND_LABELS[f.kind]}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canFlag && (
        <form onSubmit={add} className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">Gắn cờ mới</h3>
          <div>
            <label htmlFor={`${uid}-kind`} className="mb-1 block text-sm font-medium text-gray-700">
              Loại cờ
            </label>
            <select
              id={`${uid}-kind`}
              className={`${inputClass} w-auto`}
              value={kind}
              onChange={(e) => setKind(e.target.value as LessonFlagKind)}
              aria-describedby={`${uid}-kind-hint`}
            >
              {FLAG_KIND_ORDER.map((k) => (
                <option key={k} value={k}>
                  {FLAG_KIND_LABELS[k]}
                  {openKinds.has(k) ? ' (đang mở)' : ''}
                </option>
              ))}
            </select>
            <p id={`${uid}-kind-hint`} className="mt-1 text-sm text-gray-600">
              {learnerBanner(kind) ? <>Người học sẽ thấy: «{learnerBanner(kind)}»</> : 'Cờ này chỉ người làm nội dung thấy.'}
            </p>
          </div>
          <div>
            <label htmlFor={`${uid}-note`} className="mb-1 block text-sm font-medium text-gray-700">
              Ghi chú (không bắt buộc, người học không thấy)
            </label>
            <textarea
              id={`${uid}-note`}
              className={`${inputClass} min-h-20`}
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
            {...busyProps}
          >
            {busy === 'add' && <Spinner size="sm" tone="onDark" />}
            Gắn cờ
          </button>
        </form>
      )}

      {flags.resolved.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-teal-800 underline">
            Cờ đã gỡ gần đây ({flags.resolved.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {flags.resolved.map((f) => (
              <li key={f.id} className="rounded-xl border border-gray-200 bg-white p-4">
                {flagMeta(f)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
