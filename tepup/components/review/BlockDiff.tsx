'use client';

import { useMemo, useState } from 'react';
import { collapseSame, diffBlocksVersion, humanizePath, type DisplayEntry } from '@/lib/diff';
import { getBlockLabel } from '@/components/admin/editor/block-utils';
import { ChangeBadge, Del, FieldChanges, Ins, WordDiffText } from '@/components/history/DiffParts';

/**
 * Block-level diff of two versions of lesson/chapter content (proposal §6.5):
 * LCS over normalised block JSON; a removed+added block of the same type at the same
 * position is shown as CHANGED with a word-level diff of its text fields; interactive
 * blocks list changed fields. Changes are announced as text, not only colour.
 * `before` null = there was no content. Block numbers are 1-based like the editor gutter.
 */
export interface BlocksVersion {
  title: string;
  blocks: unknown[];
}

/** Rows rendered at first; huge diffs show the rest on request. */
const FIRST_ROWS = 150;

export default function BlockDiff({
  before,
  after,
  heading,
}: {
  before: BlocksVersion | null;
  after: BlocksVersion;
  /** Optional heading level for the summary (default: none, a paragraph). */
  heading?: string;
}) {
  const diff = useMemo(() => diffBlocksVersion(before, after), [before, after]);
  const rows = useMemo(() => collapseSame(diff.entries), [diff]);
  const [limit, setLimit] = useState(FIRST_ROWS);
  const { added, removed, changed, unchanged } = diff.summary;
  const nothing = !added && !removed && !changed && !diff.title.changed;

  return (
    <div className="space-y-3">
      {heading && <h3 className="text-base font-semibold text-gray-900">{heading}</h3>}
      <p className="text-sm text-gray-800">
        {before === null ? 'Phiên bản đầu tiên: ' : ''}
        {added} block thêm, {removed} block xóa, {changed} block sửa, {unchanged} block không đổi
        {diff.title.changed ? '; tiêu đề đã đổi' : ''}.
      </p>
      {diff.approximate && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">
          Bài rất dài: các block được so theo vị trí nên kết quả có thể kém chính xác.
        </p>
      )}
      {nothing && <p className="text-sm text-gray-600">Không có thay đổi nội dung.</p>}

      {diff.title.changed && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Tiêu đề</span>
            <ChangeBadge kind="changed" />
          </div>
          <WordDiffText segments={diff.title.words} />
        </div>
      )}

      {!nothing && (
        <ol className="space-y-2">
          {rows.slice(0, limit).map((row, i) => (
            <BlockRow key={i} row={row} />
          ))}
        </ol>
      )}
      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 300)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
        >
          Hiện thêm ({rows.length - limit} dòng còn lại)
        </button>
      )}
    </div>
  );
}

function BlockRow({ row }: { row: DisplayEntry }) {
  if (row.kind === 'same-run') {
    const range = row.fromAfter === row.toAfter ? `#${row.fromAfter + 1}` : `#${row.fromAfter + 1}–#${row.toAfter + 1}`;
    return (
      <li className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-600">
        Không đổi ({row.count} block, {range})
      </li>
    );
  }
  const label = getBlockLabel(row.type);
  if (row.kind === 'added') {
    return (
      <li className="rounded-xl border border-green-200 bg-white p-3">
        <RowHead kind="added" text={`Block #${row.afterIndex + 1} · ${label}`} />
        <p className="text-sm">{row.text ? <Ins>{row.text}</Ins> : <span className="text-gray-600">(không có chữ)</span>}</p>
      </li>
    );
  }
  if (row.kind === 'removed') {
    return (
      <li className="rounded-xl border border-red-200 bg-white p-3">
        <RowHead kind="removed" text={`Block #${row.beforeIndex + 1} (bản cũ) · ${label}`} />
        <p className="text-sm">{row.text ? <Del>{row.text}</Del> : <span className="text-gray-600">(không có chữ)</span>}</p>
      </li>
    );
  }
  return (
    <li className="rounded-xl border border-amber-200 bg-white p-3">
      <RowHead
        kind="changed"
        text={`Block #${row.afterIndex + 1}${row.beforeIndex !== row.afterIndex ? ` (trước là #${row.beforeIndex + 1})` : ''} · ${label}`}
      />
      <FieldChanges changes={row.fields} truncated={row.truncated} labelOf={(p) => humanizePath(p, BLOCK_FIELD_LABELS)} />
    </li>
  );
}

function RowHead({ kind, text }: { kind: 'added' | 'removed' | 'changed'; text: string }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <ChangeBadge kind={kind} />
      <span className="text-sm font-medium text-gray-900">{text}</span>
    </div>
  );
}

const BLOCK_FIELD_LABELS: Record<string, string> = {
  html: 'Nội dung',
  title: 'Tiêu đề',
  text: 'Chữ',
  question: 'Câu hỏi',
  options: 'Lựa chọn',
  isCorrect: 'đáp án đúng',
  explanation: 'Giải thích',
  tolerance: 'Sai số cho phép',
  items: 'Mục',
  alt: 'Mô tả ảnh',
  url: 'Đường dẫn',
  caption: 'Chú thích',
};
