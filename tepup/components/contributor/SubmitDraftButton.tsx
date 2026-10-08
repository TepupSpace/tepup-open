'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { CheckCircle, Send } from 'lucide-react';

/** Sent when a draft was submitted; `DraftSubmitResult` shows it and takes focus. */
const SUBMITTED_EVENT = 'tepup:draft-submitted';

export default function SubmitDraftButton({
  contributionId,
  courseName,
  label = 'Gửi duyệt',
}: {
  contributionId: string;
  /** Read after the label by screen readers, so "Gửi duyệt" says which draft. */
  courseName?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    if (!confirm('Gửi bản nháp này để duyệt?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/contributor/contributions/${contributionId}/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        // The draft leaves this list on refresh, taking this button with it: hand the result
        // (and focus) to the always-mounted result panel first, so focus is never dropped.
        window.dispatchEvent(new CustomEvent(SUBMITTED_EVENT, { detail: courseName ?? '' }));
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      alert(data?.error || 'Lỗi khi gửi duyệt');
    } catch {
      alert('Đã xảy ra lỗi');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleSubmit}
      // aria-disabled, not disabled: the button keeps focus while the request runs.
      aria-disabled={loading || undefined}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors aria-disabled:opacity-60 aria-disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <Send className="w-3.5 h-3.5" aria-hidden="true" />
      {loading ? 'Đang gửi...' : label}
      {courseName && <span className="sr-only">: {courseName}</span>}
    </button>
  );
}

/**
 * Result of a "Gửi duyệt" on the drafts list. Mounted above the list (it survives the refresh
 * that removes the submitted draft) and focused when a result arrives, so keyboard and
 * screen-reader users land on the outcome instead of on <body>.
 */
export function DraftSubmitResult() {
  const [result, setResult] = useState<{ name: string; n: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSubmitted = (e: Event) =>
      setResult((prev) => ({ name: (e as CustomEvent<string>).detail, n: (prev?.n ?? 0) + 1 }));
    window.addEventListener(SUBMITTED_EVENT, onSubmitted);
    return () => window.removeEventListener(SUBMITTED_EVENT, onSubmitted);
  }, []);

  useEffect(() => {
    if (result) ref.current?.focus();
  }, [result]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={
        result
          ? 'mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700'
          : 'sr-only'
      }
    >
      {result && (
        <>
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Đã gửi duyệt{result.name ? ` “${result.name}”` : ''}. Theo dõi kết quả ở trang{' '}
            <Link href="/contributor/submissions" className="font-medium underline underline-offset-2">
              Đã gửi
            </Link>
            .
          </span>
        </>
      )}
    </div>
  );
}
