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
