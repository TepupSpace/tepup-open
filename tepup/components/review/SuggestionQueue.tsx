'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquareQuote, ExternalLink, PencilLine, Check, X, CheckCheck } from 'lucide-react';
import { SUGGESTION_LIMITS, SUGGESTION_STATUS_LABELS, type SuggestionStatusValue } from '@/lib/suggestions';

interface SuggestionItem {
  id: string;
  targetType: 'LESSON' | 'CHAPTER';
  quote: string | null;
  proposal: string;
  reason: string | null;
  status: SuggestionStatusValue;
  reviewNote: string | null;
  reviewer: string | null;
  createdAt: string;
  target: { title: string; context: string; viewHref: string | null; editHref: string | null };
}

const STATUS_STYLES: Record<SuggestionStatusValue, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-amber-100 text-amber-700',
  APPLIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-gray-100 text-gray-600',
};

/**
 * Reviewer queue for anonymous suggestions. Reviewers decide; changing the lesson is done
 * in the content editor (admins get a direct link), then the suggestion is marked applied.
 * All visitor text is rendered as plain text.
 */
export default function SuggestionQueue({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<SuggestionItem[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/contributor/suggestions?status=open', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setItems((await res.json()).items);
      setError('');
    } catch {
      setError('Không tải được danh sách góp ý.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: string, status: 'ACCEPTED' | 'APPLIED' | 'REJECTED') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contributor/suggestions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: notes[id] ?? '' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Không cập nhật được.');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-teal-600" />
          Góp ý ẩn danh từ người học
        </h2>
        {items && <span className="text-sm text-gray-500">{items.length} đang mở</span>}
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Người gửi không cần tài khoản và không để lại thông tin nhận dạng. Hãy kiểm chứng trước khi áp dụng.
        {canEdit
          ? ' Sửa bài trong trình chỉnh sửa, rồi đánh dấu “Đã áp dụng”.'
          : ' Góp ý được chấp nhận sẽ do quản trị viên áp dụng vào bài.'}
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {items === null ? (
        <p className="text-sm text-gray-400">Đang tải…</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
          Không có góp ý nào đang chờ.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                  {SUGGESTION_STATUS_LABELS[s.status]}
                </span>
                <span className="text-xs text-gray-400">
                  {s.targetType === 'LESSON' ? 'Bài học' : 'Chương truyện'} · {s.target.context}
                </span>
                <span className="text-xs text-gray-400">
                  · {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900">{s.target.title}</h3>

              {s.quote && (
                <blockquote className="mt-3 border-l-4 border-gray-200 pl-3 text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {s.quote}
                </blockquote>
              )}
              <p className="mt-3 text-sm text-gray-900 whitespace-pre-wrap break-words">{s.proposal}</p>
              {s.reason && (
                <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap break-words">
                  <span className="font-medium">Lý do / nguồn:</span> {s.reason}
                </p>
              )}
              {s.status === 'ACCEPTED' && s.reviewer && (
                <p className="mt-2 text-xs text-amber-700">
                  Chấp nhận bởi {s.reviewer}
                  {s.reviewNote ? ` — ${s.reviewNote}` : ''}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {s.target.viewHref && (
                  <a
                    href={s.target.viewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Xem bài
                  </a>
                )}
                {canEdit && s.target.editHref && (
                  <a
                    href={s.target.editHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <PencilLine className="w-3.5 h-3.5" /> Mở trình chỉnh sửa
                  </a>
                )}
                <input
                  value={notes[s.id] ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                  maxLength={SUGGESTION_LIMITS.reviewNote}
                  placeholder="Ghi chú (không bắt buộc)"
                  className="flex-1 min-w-[10rem] text-xs rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-teal-500"
                />
                {s.status === 'PENDING' && (
                  <button
                    disabled={busyId === s.id}
                    onClick={() => decide(s.id, 'ACCEPTED')}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Chấp nhận
                  </button>
                )}
                {canEdit && (
                  <button
                    disabled={busyId === s.id}
                    onClick={() => decide(s.id, 'APPLIED')}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Đã áp dụng
                  </button>
                )}
                <button
                  disabled={busyId === s.id}
                  onClick={() => decide(s.id, 'REJECTED')}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Không áp dụng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
