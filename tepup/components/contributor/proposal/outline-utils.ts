import type { CourseOutline } from '@/lib/types/outline';
import {
  outlineToProposal,
  proposalToOutline,
  validateCourseOutlineProposal,
  type CourseOutlineProposal,
} from '@/lib/schemas/contribution-types/course-outline';

/**
 * Pure helpers for EDIT_COURSE screens (editor, review, previews): the base snapshot is
 * `{ outline, hash }` (lib/services/outline-proposal.ts), the data is a CourseOutlineProposal.
 */

/** Same check as isOutlineBaseSnapshot in outline-proposal.ts (server-only module). */
function isOutlineSnapshot(v: unknown): v is { outline: CourseOutline; hash: string } {
  if (!v || typeof v !== 'object') return false;
  const o = v as { outline?: unknown; hash?: unknown };
  return typeof o.hash === 'string' && !!o.outline && typeof o.outline === 'object';
}

/** The CourseOutline inside a base/live snapshot, or null. */
export function outlineOfSnapshot(snapshot: unknown): CourseOutline | null {
  return isOutlineSnapshot(snapshot) ? snapshot.outline : null;
}

/** The proposal as data, or null when it doesn't have the proposal shape. */
export function asOutlineProposal(data: unknown): CourseOutlineProposal | null {
  const checked = validateCourseOutlineProposal(data);
  return checked.ok ? checked.value : null;
}

export { outlineToProposal, proposalToOutline };
