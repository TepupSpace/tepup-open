/** Public lesson notices (pure types: safe in client and server). */

/** Flag kinds that show a learner banner. NEEDS_ACCESSIBILITY is staff-only. */
export type PublicFlagKind = 'NEEDS_SOURCES' | 'UNDER_REVIEW' | 'OUTDATED';

export const PUBLIC_FLAG_TEXT: Record<PublicFlagKind, string> = {
  NEEDS_SOURCES: 'Bài này đang được bổ sung nguồn.',
  UNDER_REVIEW: 'Bài này đang được người duyệt xem lại.',
  OUTDATED: 'Một số thông tin trong bài có thể đã cũ.',
};

/**
 * A reviewer's endorsement of the live version, as much as they chose to disclose.
 * ANONYMOUS: no details. CREDENTIAL: verified credential only (no name, no affiliation).
 * FULL: name + verified credential (+ affiliation). Unverified credentials never appear.
 */
export interface PublicEndorsement {
  disclosure: 'ANONYMOUS' | 'CREDENTIAL' | 'FULL';
  publicName?: string;
  credential?: string;
  affiliation?: string;
}

export interface LessonNoticesData {
  flags: PublicFlagKind[];
  endorsements: PublicEndorsement[];
}
