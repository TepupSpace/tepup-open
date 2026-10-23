import type { CreditMode } from '@prisma/client';
import { TERMS } from './terms';

/**
 * Pure display helpers for public credit (proposal §6.12). Client-safe: no node:crypto,
 * no Prisma client. `lib/credit.ts` re-exports these for server code.
 *
 * Credit is ALWAYS keyed by user id, never by username: a deleted account's username can
 * be registered again by a stranger.
 */

export function pseudonym(publicHandle: string | null | undefined): string {
  return `${TERMS.pseudonymPrefix} #${publicHandle ?? '?????'}`;
}

/** What learners see for a contributor. Deleted accounts are always the pseudonym. */
export function publicCredit(u: {
  username: string | null;
  creditMode: CreditMode;
  publicHandle: string | null;
  deletedAt: Date | null;
}): string {
  if (u.deletedAt || u.creditMode === 'PSEUDONYM' || !u.username) return pseudonym(u.publicHandle);
  return u.username;
}

/** What staff screens show for an account (reviews by a deleted account etc.). */
export function staffName(u: {
  username: string | null;
  name?: string | null;
  publicHandle: string | null;
  deletedAt: Date | null;
}): string {
  if (u.deletedAt) return `${pseudonym(u.publicHandle)} (đã xóa)`;
  return u.username || u.name || pseudonym(u.publicHandle);
}
