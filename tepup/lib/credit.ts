import { randomInt } from 'node:crypto';
import type { Prisma } from '@prisma/client';

/**
 * Public credit (proposal §6.12). Credit is ALWAYS keyed by user id, never by username:
 * a deleted account's username can be registered again by a stranger.
 */

// No 0/o/1/l/i: easy to read aloud and to tell apart.
const HANDLE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const HANDLE_LENGTH = 5;

/** Random public handle. Never derived from the username or the id. */
export function newPublicHandle(): string {
  let out = '';
  for (let i = 0; i < HANDLE_LENGTH; i++) out += HANDLE_ALPHABET[randomInt(HANDLE_ALPHABET.length)];
  return out;
}

type Db = Prisma.TransactionClient | { user: Prisma.TransactionClient['user'] };

/** Gives the user a handle if they have none (accounts from before the feature). Returns it. */
export async function ensurePublicHandle(db: Db, userId: string): Promise<string> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { publicHandle: true } });
  if (u?.publicHandle) return u.publicHandle;
  for (let attempt = 0; attempt < 5; attempt++) {
    const handle = newPublicHandle();
    try {
      const updated = await db.user.update({ where: { id: userId }, data: { publicHandle: handle } });
      return updated.publicHandle!;
    } catch (e) {
      if ((e as { code?: string }).code !== 'P2002') throw e; // unique clash: try another
    }
  }
  throw new Error('Could not allocate a public handle');
}

// Pure display helpers live in a client-safe module (this file imports node:crypto).
export { pseudonym, publicCredit, staffName } from './credit-display';
