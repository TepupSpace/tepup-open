/**
 * Content diffs for review and history (proposal §6.5, §6.10). Pure functions, no deps;
 * safe in client and server code. Results are plain data: text is never rendered as HTML.
 */
export { align, BLOCK_MAX_CELLS, type AlignOp, type AlignResult } from './lcs';
export { stripTags, tokenize, wordDiff, excerpt, WORD_MAX_CELLS, type Segment, type SegmentOp } from './text';
export { stableStringify, flatten, diffFields, humanizePath, MAX_FIELD_CHANGES, type FieldChange, type Leaf } from './fields';
export {
  diffBlockLists,
  diffBlocksVersion,
  collapseSame,
  blockText,
  blockType,
  type BlockDiffEntry,
  type BlockListDiff,
  type BlocksVersionDiff,
  type BlocksVersionLike,
  type DisplayEntry,
} from './blocks';
export { diffEntry, normalizeEntrySnapshot, entryFieldLabel, type EntryDiffResult, type EntrySnapshotLike, type EntryLinkLike } from './entry';
export { diffOutline, normalizeOutline, type OutlineChange, type OutlineDiffResult } from './outline';
