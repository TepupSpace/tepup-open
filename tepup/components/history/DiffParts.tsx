import type { ReactNode } from 'react';
import type { FieldChange, Segment } from '@/lib/diff';

/**
 * Building blocks for diffs. Everything is rendered as TEXT (React escapes it); diffs never
 * render HTML. Insertions and deletions are distinct without colour too (underline /
 * strike-through), and screen readers hear "thêm:" / "xóa:" around each change.
 */

export function Ins({ children }: { children: ReactNode }) {
  return (
    <ins className="rounded-sm bg-green-100 text-green-900 underline decoration-green-700 decoration-2 underline-offset-2">
      <span className="sr-only">[thêm: </span>
      {children}
      <span className="sr-only">]</span>
    </ins>
  );
}

export function Del({ children }: { children: ReactNode }) {
  return (
    <del className="rounded-sm bg-red-100 text-red-900 line-through decoration-red-700 decoration-2">
      <span className="sr-only">[xóa: </span>
      {children}
      <span className="sr-only">]</span>
    </del>
  );
}

/** Word diff as running text. */
export function WordDiffText({ segments }: { segments: Segment[] }) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((s, i) =>
        s.op === 'eq' ? (
          <span key={i}>{s.text}</span>
        ) : s.op === 'ins' ? (
          <Ins key={i}>{s.text}</Ins>
        ) : (
          <Del key={i}>{s.text}</Del>
        )
      )}
    </span>
  );
}

export type ChangeKind = 'added' | 'removed' | 'changed' | 'same' | 'info';

const BADGE: Record<ChangeKind, { label: string; cls: string; mark: string }> = {
  added: { label: 'Đã thêm', cls: 'border-green-300 bg-green-50 text-green-900', mark: '+' },
  removed: { label: 'Đã xóa', cls: 'border-red-300 bg-red-50 text-red-900', mark: '−' },
  changed: { label: 'Đã sửa', cls: 'border-amber-300 bg-amber-50 text-amber-900', mark: '~' },
  same: { label: 'Không đổi', cls: 'border-gray-300 bg-gray-50 text-gray-700', mark: '=' },
  info: { label: '', cls: 'border-blue-300 bg-blue-50 text-blue-900', mark: '•' },
};

/** Text label (with a symbol) for a change: never colour alone. */
export function ChangeBadge({ kind, label }: { kind: ChangeKind; label?: string }) {
  const b = BADGE[kind];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${b.cls}`}>
      <span aria-hidden="true">{b.mark}</span>
      {label ?? b.label}
    </span>
  );
}

/** "before → after" for a non-text value. */
export function ValueChange({ before, after }: { before?: string; after?: string }) {
  return (
    <span className="break-words">
      {before !== undefined && <Del>{before || '(trống)'}</Del>}
      {before !== undefined && after !== undefined && (
        <span aria-hidden="true" className="mx-1 text-gray-600">
          →
        </span>
      )}
      {after !== undefined && <Ins>{after || '(trống)'}</Ins>}
    </span>
  );
}

/** List of changed fields (interactive blocks, entry fields). */
export function FieldChanges({
  changes,
  truncated = 0,
  labelOf,
}: {
  changes: FieldChange[];
  truncated?: number;
  labelOf: (path: string) => string;
}) {
  if (!changes.length && !truncated) {
    return <p className="text-sm text-gray-600">Chỉ đổi thứ tự hoặc định dạng bên trong.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {changes.map((c) => (
        <li key={c.path} className="rounded-lg border border-gray-200 bg-white p-2">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-900">{labelOf(c.path)}</span>
            <ChangeBadge kind={c.kind} />
          </div>
          <div className="text-gray-800">
            {c.kind === 'added' ? (
              <Ins>{c.after || '(trống)'}</Ins>
            ) : c.kind === 'removed' ? (
              <Del>{c.before || '(trống)'}</Del>
            ) : c.markupOnly ? (
              <span className="text-gray-600">Chỉ đổi định dạng (đậm, nghiêng, liên kết…); chữ giữ nguyên.</span>
            ) : c.words ? (
              <WordDiffText segments={c.words} />
            ) : (
              <ValueChange before={c.before} after={c.after} />
            )}
          </div>
        </li>
      ))}
      {truncated > 0 && <li className="text-gray-600">… và {truncated} thay đổi khác.</li>}
    </ul>
  );
}
