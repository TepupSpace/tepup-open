'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SUGGESTION_LIMITS } from '@/lib/suggestions';

interface SuggestEditDialogProps {
  open: boolean;
  onClose: () => void;
  contentType: 'lesson' | 'chapter';
  contentId: string;
  title: string;
  /** Pre-filled from the learner's text selection, if any. */
  initialQuote?: string;
}

/** Fields: grey-500 border (3:1 against white) and a teal-700 focus ring that is easy to see. */
const FIELD_CLASS =
  'mt-1 w-full rounded-xl border border-gray-500 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-red-600';

/**
 * Anonymous "suggest a fix" form (Wikipedia-style edit request). No account, nothing
 * identifying stored; the suggestion goes to the reviewer queue, never straight into the lesson.
 */
export default function SuggestEditDialog({
  open,
  onClose,
  contentType,
  contentId,
  title,
  initialQuote = '',
}: SuggestEditDialogProps) {
  const [quote, setQuote] = useState(initialQuote);
  const [proposal, setProposal] = useState('');
  const [reason, setReason] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  // `field` set when the error is about one field, so that field can point at it.
  const [error, setError] = useState<{ text: string; field?: 'proposal' } | null>(null);
  const proposalRef = useRef<HTMLTextAreaElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const ids = {
    quote: useId(),
    proposal: useId(),
    reason: useId(),
    website: useId(),
    error: useId(),
  };

  useEffect(() => {
    if (!open) return;
    setQuote(initialQuote.slice(0, SUGGESTION_LIMITS.quote));
    setProposal('');
    setReason('');
    setWebsite('');
    setStatus('idle');
    setError(null);
  }, [open, initialQuote]);

  // The thank-you message replaces the form, and with it the focused submit button.
  useEffect(() => {
    if (status === 'sent') thanksRef.current?.focus();
  }, [status]);

  // Where focus goes back on close. Opened from the selection bar, nothing had focus (the bar
  // keeps the text selected), so remember the paragraph holding the selection instead. This
  // runs before focus-trap moves focus in (its initial focus is deferred), while the
  // selection still exists.
  const returnRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      returnRef.current = active;
      return;
    }
    const node = window.getSelection()?.anchorNode ?? null;
    const el = node instanceof Element ? node : node?.parentElement;
    returnRef.current =
      el?.closest<HTMLElement>('p, li, h2, h3, h4, blockquote, figcaption, td, th') ?? null;
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setError(null);
    if (proposal.trim().length < SUGGESTION_LIMITS.proposalMin) {
      setError({
        text: `Vui lòng mô tả điều cần sửa (ít nhất ${SUGGESTION_LIMITS.proposalMin} ký tự).`,
        field: 'proposal',
      });
      proposalRef.current?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: contentType, targetId: contentId, quote, proposal, reason, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Không gửi được góp ý. Vui lòng thử lại.');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError({ text: err instanceof Error ? err.message : 'Không gửi được góp ý. Vui lòng thử lại.' });
    }
  };

  const proposalInvalid = error?.field === 'proposal';

  return (
    <>
      {/* Backdrop: a sibling of the dialog, hidden from assistive tech (it's a mouse shortcut;
          Escape and the close buttons cover everyone else). */}
      <div className="fixed inset-0 z-[70] bg-black/40" onMouseDown={onClose} aria-hidden="true" />

      {/* Trap: Tab stays inside, Escape closes (handled by focus-trap), and focus goes back to
          whatever opened the dialog. */}
      <FocusTrap
        focusTrapOptions={{
          allowOutsideClick: true,
          initialFocus: () => proposalRef.current ?? undefined,
          // Neither opening nor closing may scroll the lesson: the learner should land back on
          // the block they were reading (returning focus to the page heading used to jump to the top).
          preventScroll: true,
          setReturnFocus: () => {
            const el = returnRef.current;
            if (!el?.isConnected) return false;
            // A paragraph isn't focusable: make it so for this one focus, then tidy up.
            if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) {
              el.setAttribute('tabindex', '-1');
              el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
            }
            return el;
          },
          onDeactivate: onClose,
        }}
      >
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggest-edit-title"
            className="pointer-events-auto w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                <h2 id="suggest-edit-title" className="text-lg font-semibold text-gray-900">
                  Góp ý chỉnh sửa
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{title}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 -m-1.5 rounded-lg hover:bg-gray-100" aria-label="Đóng">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {status === 'sent' ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                {/* Receives focus after sending, so screen readers read the confirmation. */}
                <div ref={thanksRef} tabIndex={-1} className="rounded-lg">
                  <p className="font-medium text-gray-900">Cảm ơn bạn! Góp ý đã được gửi.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Người duyệt nội dung sẽ xem xét trước khi bài học được cập nhật.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-5 pb-5 pt-4 space-y-4">
                <div className="flex gap-2 rounded-xl bg-teal-50 text-teal-800 text-xs p-3">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Không cần tài khoản. TepUp không lưu địa chỉ IP hay thông tin nhận dạng của bạn.
                    Đừng ghi tên thật hay thông tin cá nhân vào góp ý.
                  </p>
                </div>

                <label htmlFor={ids.quote} className="block">
                  <span className="text-sm font-medium text-gray-700">Đoạn cần sửa (không bắt buộc)</span>
                  <textarea
                    id={ids.quote}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    maxLength={SUGGESTION_LIMITS.quote}
                    rows={2}
                    placeholder="Dán hoặc bôi đen đoạn văn trong bài trước khi mở hộp này"
                    className={FIELD_CLASS}
                  />
                </label>

                <label htmlFor={ids.proposal} className="block">
                  <span className="text-sm font-medium text-gray-700">Nên sửa thế nào? *</span>
                  <textarea
                    id={ids.proposal}
                    ref={proposalRef}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    maxLength={SUGGESTION_LIMITS.proposal}
                    rows={4}
                    required
                    aria-invalid={proposalInvalid || undefined}
                    aria-describedby={proposalInvalid ? ids.error : undefined}
                    placeholder="Ví dụ: Con số này đã cũ, mức hiện hành là … / Câu này dễ gây hiểu nhầm vì …"
                    className={FIELD_CLASS}
                  />
                </label>

                <label htmlFor={ids.reason} className="block">
                  <span className="text-sm font-medium text-gray-700">Lý do hoặc nguồn (không bắt buộc)</span>
                  <textarea
                    id={ids.reason}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={SUGGESTION_LIMITS.reason}
                    rows={2}
                    placeholder="Đường dẫn tới văn bản luật, số liệu chính thức…"
                    className={FIELD_CLASS}
                  />
                </label>

                {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label htmlFor={ids.website}>
                    Website
                    <input id={ids.website} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </div>

                {/* Always mounted so the alert is announced when its text appears; empty:mb-0
                    stops the empty paragraph from adding a gap. */}
                <p id={ids.error} role="alert" className="text-sm text-red-600 empty:mb-0">
                  {error?.text}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Huỷ
                  </button>
                  {/* aria-disabled, not disabled: a disabled button drops keyboard focus while sending. */}
                  <button
                    type="submit"
                    aria-disabled={status === 'sending' || undefined}
                    className="flex-1 py-3 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 aria-disabled:opacity-60 aria-disabled:cursor-wait"
                  >
                    {status === 'sending' ? 'Đang gửi…' : 'Gửi góp ý'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </FocusTrap>
    </>
  );
}
