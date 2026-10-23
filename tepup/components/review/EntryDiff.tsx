'use client';

import { useMemo } from 'react';
import { diffEntry, entryFieldLabel, type EntryLinkLike } from '@/lib/diff';
import { ChangeBadge, Del, FieldChanges, Ins } from '@/components/history/DiffParts';

/**
 * Diff of two versions of a library entry's editable fields (title, summary, body
 * sections, meta, links). Snapshots: lib/library/entry-snapshot.ts. `before` null = first
 * version. `linkTitles` (id → title) names link targets; unknown ids show the id.
 */
const LINK_KIND_LABELS: Record<string, string> = {
  RELATED: 'Liên quan',
  CITES: 'Trích nguồn',
  EXPANDS_TO: 'Viết tắt của',
};

export default function EntryDiff({
  before,
  after,
  linkTitles = {},
}: {
  before: unknown | null;
  after: unknown;
  linkTitles?: Record<string, string>;
}) {
  const diff = useMemo(() => diffEntry(before, after), [before, after]);
  const { fields, linksAdded, linksRemoved, linksReordered } = diff.summary;
  const name = (l: EntryLinkLike) => `${LINK_KIND_LABELS[l.kind] ?? l.kind}: ${linkTitles[l.toId] ?? l.toId}`;
  const nothing = !fields && !linksAdded && !linksRemoved && !linksReordered;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-800">
        {before == null ? 'Phiên bản đầu tiên: ' : ''}
        {fields} trường thay đổi, {linksAdded} liên kết thêm, {linksRemoved} liên kết xóa
        {linksReordered ? `, ${linksReordered} liên kết đổi thứ tự` : ''}.
      </p>
      {nothing && <p className="text-sm text-gray-600">Không có thay đổi.</p>}
      {(diff.fields.length > 0 || diff.truncated > 0) && (
        <FieldChanges changes={diff.fields} truncated={diff.truncated} labelOf={entryFieldLabel} />
      )}
      {(linksAdded > 0 || linksRemoved > 0 || linksReordered > 0) && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Liên kết</h3>
          <ul className="space-y-1 text-sm">
            {diff.links.added.map((l) => (
              <li key={`a-${l.kind}-${l.toId}`} className="flex flex-wrap items-center gap-2">
                <ChangeBadge kind="added" />
                <Ins>{name(l)}</Ins>
              </li>
            ))}
            {diff.links.removed.map((l) => (
              <li key={`r-${l.kind}-${l.toId}`} className="flex flex-wrap items-center gap-2">
                <ChangeBadge kind="removed" />
                <Del>{name(l)}</Del>
              </li>
            ))}
            {diff.links.reordered.map((l) => (
              <li key={`o-${l.kind}-${l.toId}`} className="flex flex-wrap items-center gap-2">
                <ChangeBadge kind="changed" label="Đổi thứ tự" />
                <span>{name(l)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
