'use client';

import { forwardRef } from 'react';
import { AlertTriangle, Info, Lightbulb, RefreshCw } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import ProposalDiff from './ProposalDiff';

/** "bài «X»", "chương «X»", … for the target of an edit proposal. */
export function targetNoun(type: string): string {
  switch (type) {
    case 'EDIT_CHAPTER_CONTENT':
      return 'chương';
    case 'EDIT_LIBRARY_ENTRY':
      return 'mục thư viện';
    case 'EDIT_COURSE':
      return 'mục lục khóa';
    default:
      return 'bài';
  }
}

/** HH:mm dd/mm, local time. */
export function formatBaseTime(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

/** "Bạn đang đề xuất sửa bài «X». Bản này bắt đầu từ phiên bản lúc HH:mm dd/mm." */
export function ProposalBanner({
  type,
  name,
  href,
  baseUpdatedAt,
}: {
  type: string;
  name: string;
  href: string | null;
  baseUpdatedAt: string | null;
}) {
  const noun = targetNoun(type);
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        Bạn đang đề xuất sửa {noun} «{name}».{' '}
        {type === 'EDIT_COURSE'
          ? 'Bản này bắt đầu từ mục lục đang chạy lúc bạn tạo (hoặc cập nhật) đề xuất.'
          : baseUpdatedAt
            ? `Bản này bắt đầu từ phiên bản lúc ${formatBaseTime(baseUpdatedAt)}.`
            : `Khi bạn bắt đầu, ${noun} này chưa có nội dung.`}
        {href && (
          <>
            {' '}
            <Link href={href} target="_blank" className="font-medium underline underline-offset-2">
              Xem bản đang chạy<span className="sr-only"> (mở trong thẻ mới)</span>
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export interface RebaseResult {
  oldBase: unknown;
  newBase: unknown;
  outlineAdjusted?: boolean;
}

/**
 * "Bài đã thay đổi": the live version moved on since the proposal's base. Offers
 * "Cập nhật theo bản mới" (rebase) and, once done, shows what changed live (old base → new
 * base) so the author can merge by hand.
 */
export const StaleNotice = forwardRef<
  HTMLDivElement,
  {
    type: string;
    stale: boolean;
    editable: boolean;
    busy: boolean;
    error: string;
    result: RebaseResult | null;
    onRebase: () => void;
    onDismissResult: () => void;
  }
>(function StaleNotice({ type, stale, editable, busy, error, result, onRebase, onDismissResult }, ref) {
  const noun = targetNoun(type);
  return (
    <>
      {stale && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" data-testid="stale-notice">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {noun === 'bài' ? 'Bài đã thay đổi' : `${noun[0].toUpperCase()}${noun.slice(1)} đã thay đổi`}
          </p>
          <p className="mt-1">
            Bản đang chạy đã được sửa sau khi bạn bắt đầu. Người duyệt sẽ được báo điều này. Bấm &ldquo;Cập nhật theo bản
            mới&rdquo; để xem những gì đã đổi và đặt đề xuất của bạn lên bản mới nhất; nội dung bạn đã soạn được giữ nguyên.
          </p>
          {editable && (
            <button
              type="button"
              onClick={onRebase}
              aria-disabled={busy || undefined}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {busy ? 'Đang cập nhật…' : 'Cập nhật theo bản mới'}
            </button>
          )}
        </div>
      )}
      <div role="alert" className={error ? 'mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' : 'sr-only'}>
        {error}
      </div>
      {result && (
        <div
          ref={ref}
          tabIndex={-1}
          className="mb-4 rounded-lg border border-teal-200 bg-white p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          data-testid="rebase-result"
        >
          <h2 className="font-semibold text-gray-900">Đã cập nhật theo bản mới</h2>
          <p className="mt-1 text-gray-700">
            Dưới đây là những gì đã thay đổi trên bản đang chạy kể từ khi bạn bắt đầu. Đề xuất của bạn được giữ nguyên: hãy
            xem lại và sửa cho khớp nếu cần.
            {result.outlineAdjusted &&
              ' Cấp độ hoặc bài học mới được thêm vào mục lục của bạn; mục đã bị xóa trên bản đang chạy được bỏ khỏi đề xuất.'}
          </p>
          <div className="mt-3">
            <ProposalDiff type={type} before={result.oldBase} after={result.newBase} />
          </div>
          <button
            type="button"
            onClick={onDismissResult}
            className="mt-3 text-sm text-teal-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            Ẩn phần này
          </button>
        </div>
      )}
    </>
  );
});

export interface SuggestionInfo {
  quote: string | null;
  proposal: string;
  reason: string | null;
}

/** The reader suggestion this proposal was made from (plain text, identity-free). */
export function SuggestionPanel({ suggestion }: { suggestion: SuggestionInfo }) {
  return (
    <aside aria-labelledby="suggestion-panel-title" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 lg:sticky lg:top-6">
      <h2 id="suggestion-panel-title" className="mb-2 flex items-center gap-2 font-semibold">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        Góp ý của người học
      </h2>
      {suggestion.quote && (
        <div className="mb-2">
          <p className="text-xs font-medium text-amber-900">Đoạn được nhắc tới</p>
          <blockquote className="mt-1 whitespace-pre-line break-words border-l-4 border-amber-300 pl-3">{suggestion.quote}</blockquote>
        </div>
      )}
      <div className="mb-2">
        <p className="text-xs font-medium text-amber-900">Đề xuất</p>
        <p className="mt-1 whitespace-pre-line break-words">{suggestion.proposal}</p>
      </div>
      {suggestion.reason && (
        <div>
          <p className="text-xs font-medium text-amber-900">Lý do / nguồn</p>
          <p className="mt-1 whitespace-pre-line break-words">{suggestion.reason}</p>
        </div>
      )}
    </aside>
  );
}
