'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [error, setError] = useState('');
  const proposalRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuote(initialQuote.slice(0, SUGGESTION_LIMITS.quote));
    setProposal('');
    setReason('');
    setWebsite('');
    setStatus('idle');
    setError('');
    const t = setTimeout(() => proposalRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, initialQuote, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (proposal.trim().length < SUGGESTION_LIMITS.proposalMin) {
      setError(`Vui lòng mô tả điều cần sửa (ít nhất ${SUGGESTION_LIMITS.proposalMin} ký tự).`);
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
      setError(err instanceof Error ? err.message : 'Không gửi được góp ý. Vui lòng thử lại.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggest-edit-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h2 id="suggest-edit-title" className="text-lg font-semibold text-gray-900">
              Góp ý chỉnh sửa
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 -m-1.5 rounded-lg hover:bg-gray-100" aria-label="Đóng">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="px-5 py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-gray-900">Cảm ơn bạn! Góp ý đã được gửi.</p>
            <p className="text-sm text-gray-500 mt-1">
              Người duyệt nội dung sẽ xem xét trước khi bài học được cập nhật.
            </p>
            <button
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

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Đoạn cần sửa (không bắt buộc)</span>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                maxLength={SUGGESTION_LIMITS.quote}
                rows={2}
                placeholder="Dán hoặc bôi đen đoạn văn trong bài trước khi mở hộp này"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nên sửa thế nào? *</span>
              <textarea
                ref={proposalRef}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                maxLength={SUGGESTION_LIMITS.proposal}
                rows={4}
                required
                placeholder="Ví dụ: Con số này đã cũ, mức hiện hành là … / Câu này dễ gây hiểu nhầm vì …"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Lý do hoặc nguồn (không bắt buộc)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={SUGGESTION_LIMITS.reason}
                rows={2}
                placeholder="Đường dẫn tới văn bản luật, số liệu chính thức…"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </label>

            {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
              >
                {status === 'sending' ? 'Đang gửi…' : 'Gửi góp ý'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
