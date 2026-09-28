import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { clientIp, rateLimit } from './security/rate-limit';
import type { Adapter } from 'next-auth/adapters';
import type { UserRole } from '@prisma/client';

// How often a signed-in session re-reads role/ban status from the database.
const SESSION_RECHECK_MS = 60_000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Username/Password login. Google OAuth was removed on purpose: it would store real
    // names, emails and OAuth tokens, contradicting the pseudonymous-by-default promise.
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email hoặc Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Vui lòng nhập thông tin đăng nhập');
        }

        const identifier = credentials.identifier as string;

        // Brute-force protection: per IP and per username.
        const ip = clientIp(request.headers);
        const byIp = rateLimit('login-ip', ip, 20, 15 * 60_000);
        const byUser = rateLimit('login-user', identifier.toLowerCase(), 8, 15 * 60_000);
        if (!byIp.ok || !byUser.ok) {
          throw new Error('Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.');
        }

        const user = await prisma.user.findUnique({ where: { username: identifier } });

        if (!user || !user.password) {
          throw new Error('Thông tin đăng nhập không đúng');
        }

        if (user.isBanned) {
          throw new Error('Tài khoản của bạn đã bị khóa');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Thông tin đăng nhập không đúng');
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
