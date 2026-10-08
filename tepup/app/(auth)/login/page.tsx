import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { homePathForRole } from '@/lib/role-utils';
import { safeRedirectPath } from '@/lib/security/safe-redirect';
import LoginForm from './LoginForm';

export const metadata = { title: 'Đăng nhập | Tepup' };

// Reads the session, so it's always dynamic (and /login is never edge-cached; see next.config.ts).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; registered?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user) {
    // Already signed in: same destination as right after logging in.
    const { callbackUrl } = await searchParams;
    const target = safeRedirectPath(typeof callbackUrl === 'string' ? callbackUrl : null);
    // `?callbackUrl=/login` would redirect to itself forever.
    const loops = target !== null && /^\/login(?:[/?#]|$)/.test(target);
    redirect(target && !loops ? target : homePathForRole(session.user.role));
  }

  return (
    <Suspense
      fallback={
        <main id="main-content" className="min-h-screen bg-gray-50 flex items-center justify-center">
          <h1 className="sr-only">Đăng nhập vào Tepup</h1>
          <div role="status">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            <span className="sr-only">Đang tải…</span>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
