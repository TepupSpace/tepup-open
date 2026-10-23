'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import Spinner from '@/components/ui/Spinner';
import type { ClaimableSuggestion } from '@/app/api/contributor/suggestions/claimable/list-claimable';

const TARGET_LABEL: Record<ClaimableSuggestion['targetType'], string> = {
  LESSON: 'Bài học',
  CHAPTER: 'Chương truyện',
  LIBRARY_ENTRY: 'Mục thư viện',
};

const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const primaryButton =
  'inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-70';
const secondaryButton =
  'inline-flex items-center gap-2 rounded-xl border border-gray-400 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70';

export default function SuggestionsClient({ initialItems }: { initialItems: ClaimableSuggestion[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // After a reload moves a card to another section (React remounts it), focus goes to the
  // card's main action button, or to the "Chưa có người nhận" heading if the card is gone.
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    (document.getElementById(`sg-act-${id}`) ?? document.getElementById('sg-free'))?.focus();
  }, [items]);

  const reload = async (focusId?: string) => {
    const res = await fetch('/api/contributor/suggestions/claimable', { cache: 'no-store' });
    if (!res.ok) return;
    const next = ((await res.json()) as { items: ClaimableSuggestion[] }).items;
    if (focusId) pendingFocus.current = focusId;
    setItems(next);
  };

  const claim = async (s: ClaimableSuggestion) => {
    if (busy) return;
    setBusy(s.id);
    setError('');
    setStatus('Đang nhận góp ý…');
    try {
      const res = await fetch(`/api/contributor/suggestions/${s.id}/claim`, { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { href?: string; error?: string };
      if (res.ok && body.href) {
        setStatus('Đã nhận. Đang mở đề xuất…');
        router.push(body.href);
        return;
      }
      setStatus('');
      setError(body.error || 'Không nhận được góp ý này. Vui lòng thử lại.');
      await reload(s.id);
    } catch {
      setStatus('');
      setError('Không kết nối được máy chủ. Vui lòng thử lại.');
    }
    setBusy(null);
  };

  const release = async (s: ClaimableSuggestion) => {
    if (busy) return;
    setBusy(s.id);
    setError('');
    try {
      const res = await fetch(`/api/contributor/suggestions/${s.id}/claim`, { method: 'DELETE' });
      if (res.ok) {
        setStatus('Đã bỏ nhận góp ý. Người khác có thể nhận làm.');
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error || 'Không bỏ nhận được. Vui lòng thử lại.');
      }
      await reload(s.id);
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại.');
    }
    setBusy(null);
  };

  const mine = items.filter((s) => s.claim.state === 'mine');
  const free = items.filter((s) => s.claim.state === 'free');
  const taken = items.filter((s) => s.claim.state === 'taken');

  const card = (s: ClaimableSuggestion) => {
    const isBusy = busy === s.id;
    const busyProps = busy ? { 'aria-disabled': true as const } : {};
    return (
      <li key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {TARGET_LABEL[s.targetType]}
          </span>
          {s.target.viewHref ? (
            <Link href={s.target.viewHref} className="font-semibold text-teal-800 underline underline-offset-2">
              {s.target.title}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900">{s.target.title}</span>
          )}
          {s.target.context && <span className="text-gray-600">· {s.target.context}</span>}
          <span className="text-gray-600">· gửi ngày {dateFmt.format(new Date(s.createdAt))}</span>
        </div>

        <dl className="space-y-2 text-sm">
          {s.quote && (
            <div>
              <dt className="font-medium text-gray-700">Đoạn được góp ý</dt>
              <dd className="mt-1 whitespace-pre-line border-l-4 border-gray-300 pl-3 text-gray-800">{s.quote}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-700">Đề xuất</dt>
            <dd className="mt-1 whitespace-pre-line text-gray-900">{s.proposal}</dd>
          </div>
          {s.reason && (
            <div>
              <dt className="font-medium text-gray-700">Lý do / nguồn</dt>
              <dd className="mt-1 whitespace-pre-line text-gray-800">{s.reason}</dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {s.claim.state === 'free' && (
            <button id={`sg-act-${s.id}`} type="button" className={primaryButton} {...busyProps} onClick={() => claim(s)}>
              {isBusy && <Spinner size="sm" tone="onDark" />}
              Nhận làm
              <span className="sr-only">: {s.target.title}</span>
            </button>
          )}
          {s.claim.state === 'mine' && (
            <>
              {s.claim.myProposalId ? (
                <Link
                  id={`sg-act-${s.id}`}
                  href={`/contributor/contributions/${s.claim.myProposalId}/edit`}
                  className={primaryButton}
                >
                  Mở đề xuất của bạn
                  <span className="sr-only">: {s.target.title}</span>
                </Link>
              ) : (
                <button id={`sg-act-${s.id}`} type="button" className={primaryButton} {...busyProps} onClick={() => claim(s)}>
                  {isBusy && <Spinner size="sm" tone="onDark" />}
                  Tạo đề xuất
                  <span className="sr-only">: {s.target.title}</span>
                </button>
              )}
              <button type="button" className={secondaryButton} {...busyProps} onClick={() => release(s)}>
                {isBusy && <Spinner size="sm" tone="muted" />}
                Bỏ nhận
                <span className="sr-only">: {s.target.title}</span>
              </button>
              {s.claim.claimedAt && (
                <span className="text-xs text-gray-600">Nhận ngày {dateFmt.format(new Date(s.claim.claimedAt))}</span>
              )}
            </>
          )}
          {s.claim.state === 'taken' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Đã có người nhận{s.claim.claimerName ? `: ${s.claim.claimerName}` : ''}
            </span>
          )}
        </div>
      </li>
    );
  };

  const section = (id: string, title: string, list: ClaimableSuggestion[], empty: string) => (
    <section aria-labelledby={id} className="mb-8">
      <h2 id={id} tabIndex={-1} className="mb-3 text-lg font-semibold text-gray-900">
        {title} ({list.length})
      </h2>
      {list.length === 0 ? <p className="text-sm text-gray-600">{empty}</p> : <ul className="space-y-3">{list.map(card)}</ul>}
    </section>
  );

  return (
    <div>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      <div role="alert" className="empty:hidden mb-4">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-600">
          Hiện chưa có góp ý nào chờ người làm.
        </p>
      ) : (
        <>
          {mine.length > 0 && section('sg-mine', 'Bạn đang nhận', mine, '')}
          {section('sg-free', 'Chưa có người nhận', free, 'Mọi góp ý đều đã có người nhận.')}
          {taken.length > 0 && section('sg-taken', 'Đã có người nhận', taken, '')}
        </>
      )}
    </div>
  );
}
