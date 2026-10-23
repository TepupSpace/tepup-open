'use client';

import BlockDiff, { type BlocksVersion } from '@/components/review/BlockDiff';
import EntryDiff from '@/components/review/EntryDiff';
import OutlineDiff from '@/components/review/OutlineDiff';
import { useEntryTitles } from '@/components/review/ContributionPreview';
import { asOutlineProposal, outlineOfSnapshot, proposalToOutline } from './outline-utils';

/**
 * The right diff for an edit proposal's type (proposal §6.5). `before`/`after` are base
 * snapshots or proposal data:
 *  - lessons/chapters: `{ title, blocks }` → BlockDiff;
 *  - library entries: the editable subset → EntryDiff;
 *  - course outlines: `{ outline, hash }` snapshots or proposal data → OutlineDiff.
 */
export default function ProposalDiff({ type, before, after }: { type: string; before: unknown; after: unknown }) {
  if (type === 'EDIT_LESSON_CONTENT' || type === 'EDIT_CHAPTER_CONTENT') {
    return <BlockDiff before={asBlocksVersion(before)} after={asBlocksVersion(after) ?? { title: '', blocks: [] }} />;
  }
  if (type === 'EDIT_LIBRARY_ENTRY') {
    return <EntryDiffWithTitles before={before ?? null} after={after} />;
  }
  if (type === 'EDIT_COURSE') {
    const b = toOutline(before, null);
    const a = toOutline(after, b);
    if (!a) return <p className="text-sm text-gray-600">Không đọc được mục lục.</p>;
    return <OutlineDiff before={b} after={a} />;
  }
  return null;
}

function asBlocksVersion(v: unknown): BlocksVersion | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as { title?: unknown; blocks?: unknown };
  return { title: typeof o.title === 'string' ? o.title : '', blocks: Array.isArray(o.blocks) ? o.blocks : [] };
}

function toOutline(v: unknown, base: ReturnType<typeof outlineOfSnapshot>) {
  const snap = outlineOfSnapshot(v);
  if (snap) return snap;
  const p = asOutlineProposal(v);
  return p ? proposalToOutline(p, base) : null;
}

function EntryDiffWithTitles({ before, after }: { before: unknown; after: unknown }) {
  const titles = useEntryTitles();
  return <EntryDiff before={before} after={after} linkTitles={Object.fromEntries(titles)} />;
}
