import NextAuth, { CredentialsSignin } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import {
  clientIp,
  peekRateLimit,
  rateLimit,
  refundRateLimit,
  resetRateLimit,
  retryAfterMinutes,
} from './security/rate-limit';
import { LOGIN_CODE, rateLimitedCode } from './auth-messages';
import type { Adapter } from 'next-auth/adapters';
import type { UserRole } from '@prisma/client';

// How often a signed-in session re-reads role/ban status from the database.
const SESSION_RECHECK_MS = 60_000;

/**
 * A login refusal the client may see. NextAuth hides the message of any other error
 * (`error=Configuration`), but passes `code` through to `signIn(...).code`.
 * See `lib/auth-messages.ts` for the codes and their Vietnamese messages.
 */
class LoginRefused extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

/**
 * Brute-force protection. Only FAILED attempts count; a successful login clears the
 * username's counters, so a user who mistypes a few times is never locked out by
 * their own successes.
 *
 * - `login-fail-user-ip` (username + IP, 5 / 15 min): the normal lock. It's keyed on the IP
 *   too, so someone who knows a username can't lock its owner out from their own network.
 * - `login-fail-user` (username, any IP, 50 / 15 min): caps guessing spread over many IPs.
 *   Trade-off: an attacker with 10+ IPs can still lock a known username out for up to
 *   15 minutes. Without this cap the same attacker could guess without limit.
 * - `login-fail-ip` (IP, any username, 20 / 15 min): stops one client spraying passwords
 *   across many usernames. Not cleared by a success (an attacker could log in to their own
 *   account to reset it).
 */
const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_LIMITS = { userIp: 5, user: 50, ip: 20 } as const;

// Compared against when the username doesn't exist, so a wrong username takes as long as
// a wrong password and response times don't reveal which usernames exist. (Cost 12, like real hashes.)
const DUMMY_HASH = '$2b$12$khuJk5vInnvDMVwiCmfCBe6ToPA.TMaTtm7Z5RJ5Y7ljnZf4FLHP2';

/**
 * Usernames are stored lowercase since the case-insensitivity fix (`app/api/register`).
 * Older accounts may be mixed-case, so: exact match first, then a case-insensitive match
 * only when exactly one account fits (two accounts differing only in case stay reachable
 * by their exact spelling, and an ambiguous spelling matches neither).
 */
async function findLoginUser(identifier: string) {
  const exact = await prisma.user.findUnique({ where: { username: identifier } });
  if (exact) return exact;
  const matches = await prisma.user.findMany({
    where: { username: { equals: identifier, mode: 'insensitive' } },
    take: 2,
  });
  return matches.length === 1 ? matches[0] : null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Username/Password login. Google OAuth was removed on purpose: it would store real
    // names, emails and OAuth tokens, contradicting the pseudonymous-by-default promise.
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const identifier = typeof credentials?.identifier === 'string' ? credentials.identifier.trim() : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!identifier || !password || identifier.length > 64 || password.length > 1024) {
          throw new LoginRefused(LOGIN_CODE.invalid);
        }

        const ip = clientIp(request.headers);
        const userKey = identifier.toLowerCase();
        const userIpKey = `${userKey}|${ip}`;

        // Check all three limits, then count this attempt as a failure up front, in one
        // synchronous step: parallel requests can't slip past the limit while bcrypt runs.
        // A blocked attempt isn't counted, so hammering a locked bucket doesn't extend or
        // spill into the others. A success refunds/clears the counts below.
        const blocked = [
          peekRateLimit('login-fail-user-ip', userIpKey, LOGIN_LIMITS.userIp),
          peekRateLimit('login-fail-user', userKey, LOGIN_LIMITS.user),
          peekRateLimit('login-fail-ip', ip, LOGIN_LIMITS.ip),
        ].filter((r) => !r.ok);
        if (blocked.length > 0) {
          const wait = Math.max(...blocked.map((r) => r.retryAfterSeconds));
          throw new LoginRefused(rateLimitedCode(retryAfterMinutes(wait)));
        }
        rateLimit('login-fail-user-ip', userIpKey, LOGIN_LIMITS.userIp, LOGIN_WINDOW_MS);
        rateLimit('login-fail-user', userKey, LOGIN_LIMITS.user, LOGIN_WINDOW_MS);
        rateLimit('login-fail-ip', ip, LOGIN_LIMITS.ip, LOGIN_WINDOW_MS);

        const user = await findLoginUser(identifier);
        const isPasswordValid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !user.password || !isPasswordValid) {
          throw new LoginRefused(LOGIN_CODE.invalid);
        }

        // Correct password: not a failed attempt.
        resetRateLimit('login-fail-user-ip', userIpKey);
        resetRateLimit('login-fail-user', userKey);
        refundRateLimit('login-fail-ip', ip);

        // Checked only after the password, so the ban status of an account isn't public.
        if (user.isBanned) {
          throw new LoginRefused(LOGIN_CODE.banned);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  logger: {
    // A refused login (wrong password, lockout, ban) is routine: don't print a stack trace
    // for it. Everything else is logged as NextAuth's default logger would.
    error(error) {
      if (error instanceof CredentialsSignin) return;
      const name = (error as { type?: string }).type ?? error.name;
      console.error(`[auth][error] ${name}: ${error.message}`);
      const cause = (error as { cause?: unknown }).cause;
      if (cause && typeof cause === 'object' && 'err' in cause && cause.err instanceof Error) {
        console.error('[auth][cause]:', cause.err.stack);
      } else if (error.stack) {
        console.error(error.stack);
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (default was 30)
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.checkedAt = Date.now();
        return token;
      }

      // Re-read role and ban status so demotions and bans take effect within a minute,
      // instead of lasting until the token expires.
      if (token.id && Date.now() - ((token.checkedAt as number | undefined) ?? 0) > SESSION_RECHECK_MS) {
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, username: true, isBanned: true },
        });
        if (!current || current.isBanned) return null; // ends the session
        token.role = current.role;
        token.username = current.username;
        token.checkedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});
