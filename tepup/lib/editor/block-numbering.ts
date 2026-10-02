/**
 * Block numbers for the editor's left gutter.
 *
 * Publish errors say "Block #7 (question) — …", counting from 1 over the blocks that
 * are actually saved: `trimEmptyBlocks(toContentBlocks(editor.document)).blocks`. This
 * maps each top-level BlockNote block to that number, so the editor can show it.
 *
 * - A run of list items of the same kind is saved as one list block: only its first
 *   item gets a number.
 * - Empty lines (and anything else `trimEmptyBlocks` drops) and blocks the converter
 *   can't convert get no number.
 * - Nested blocks (toggle children, list item children) never get a number of their own.
 *
 * The converter and the trimmer decide everything here; nothing about which blocks
 * group or count is repeated by hand. Pure and DOM-free.
 */
import { toContentBlocks, type BNBlock } from './blocknote-converter';
import { trimEmptyBlocks } from './trim-empty-blocks';

/** How many saved blocks a group of consecutive top-level blocks turns into. */
function savedCount(group: BNBlock[]): number {
  return trimEmptyBlocks(toContentBlocks(group)).blocks.length;
}

/**
 * Returns BlockNote block id → 1-based block number, for every top-level block that
 * starts a saved block. Blocks without an id still advance the count, so the numbers
 * stay aligned with what is saved.
 */
export function numberTopLevelBlocks(doc: BNBlock[]): Map<string, number> {
  const numbers = new Map<string, number>();
  if (!Array.isArray(doc)) return numbers;

  // Split the document into the groups the converter turns into one block each. Two
  // neighbours belong to the same group when the converter merges them: each one alone
  // converts to one block, but together they still convert to one (a list run). Only
  // blocks of the same type can merge, so other pairs are never converted together.
  const groups: BNBlock[][] = [];
  let prevAlone = 0;
  for (let i = 0; i < doc.length; i++) {
    const block = doc[i];
    const alone = toContentBlocks([block]).length;
    const prev = doc[i - 1];
    const merges =
      i > 0 &&
      prev.type === block.type &&
      prevAlone === 1 &&
      alone === 1 &&
      toContentBlocks([prev, block]).length === 1;
    if (merges) groups[groups.length - 1].push(block);
    else groups.push([block]);
    prevAlone = alone;
  }

  let next = 1;
  for (const group of groups) {
    const count = savedCount(group);
    if (count === 0) continue;
    const id = group[0].id;
    if (id) numbers.set(id, next);
    next += count;
  }
  return numbers;
}
