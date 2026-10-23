// Shared by the public suggestion form, its API route and the reviewer queue.

export const SUGGESTION_LIMITS = {
  quote: 1_000,
  proposal: 4_000,
  proposalMin: 10,
  reason: 2_000,
  reviewNote: 2_000,
} as const;

/**
 * Normalise free text from an anonymous visitor: strip control characters, collapse runs
 * of blank lines, trim. Returns '' for missing/non-string input and `undefined` when the
 * text is longer than `max` (so callers can reject rather than silently truncate).
 */
export function cleanSuggestionText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return '';
  const text = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > max ? undefined : text;
}

export type SuggestionStatusValue = 'PENDING' | 'ACCEPTED' | 'APPLIED' | 'REJECTED';

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatusValue, string> = {
  PENDING: 'Chờ xem xét',
  ACCEPTED: 'Đã chấp nhận — chờ áp dụng',
  APPLIED: 'Đã áp dụng',
  REJECTED: 'Không áp dụng',
};

/** Allowed reviewer transitions. APPLIED/REJECTED are final. */
export const SUGGESTION_TRANSITIONS: Record<SuggestionStatusValue, SuggestionStatusValue[]> = {
  PENDING: ['ACCEPTED', 'APPLIED', 'REJECTED'],
  ACCEPTED: ['APPLIED', 'REJECTED'],
  APPLIED: [],
  REJECTED: [],
};

// --- Claiming accepted suggestions (proposal §6.9) ---

/** A claim with no submitted proposal lapses after this many days; the suggestion is free again. */
export const CLAIM_TTL_DAYS = 14;

/** Statuses of a linked proposal (Contribution.suggestionId) that keep a claim alive past the TTL. */
export const CLAIM_KEEPING_STATUSES = ['PENDING_REVIEW', 'CHANGES_REQUESTED'] as const;

/**
 * Is this claim still active? Active = someone claimed it AND (the claim is younger than
 * CLAIM_TTL_DAYS, OR a linked proposal has been submitted and is still open:
 * PENDING_REVIEW / CHANGES_REQUESTED). A draft alone doesn't keep a claim: it lapses after
 * 14 days without a submitted proposal. Pure: the caller looks up `hasSubmittedProposal`.
 */
export function isClaimActive(
  s: { claimedById: string | null; claimedAt: Date | string | null },
  opts: { hasSubmittedProposal?: boolean; now?: Date } = {}
): boolean {
  if (!s.claimedById) return false;
  if (opts.hasSubmittedProposal) return true;
  if (!s.claimedAt) return false;
  const at = typeof s.claimedAt === 'string' ? new Date(s.claimedAt) : s.claimedAt;
  const now = opts.now ?? new Date();
  return now.getTime() - at.getTime() < CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000;
}

/** Cut-off date: claims made before it have expired (unless a submitted proposal keeps them). */
export function claimCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000);
}
