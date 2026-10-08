'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import Link from '@/components/ui/AppLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, ArrowLeft, BookOpen } from 'lucide-react';
import { LOGIN_CODE, loginErrorMessage } from '@/lib/auth-messages';
import { homePathForRole } from '@/lib/role-utils';
import { safeRedirectPath } from '@/lib/security/safe-redirect';
import PasswordToggle from '../PasswordToggle';

const inputClass =
  'w-full pl-10 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all aria-[invalid=true]:border-red-600';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only same-site paths: `?callbackUrl=https://evil.example` must not redirect off-site.
  const callbackUrl = safeRedirectPath(searchParams.get('callbackUrl'));
  // Set by the sign-up page when the account was created but the automatic sign-in failed.
  const justRegistered = searchParams.get('registered') === '1';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // Wrong username/password (not a lockout or server error): mark both fields invalid.
  const [badCredentials, setBadCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setBadCredentials(false);

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // `code` carries the reason (wrong password, lockout + wait time, ban); see lib/auth-messages.ts.
        setError(loginErrorMessage(result.code));
        setBadCredentials(result.code === LOGIN_CODE.invalid || result.code === 'credentials');
        return;
      }

      // No (valid) callbackUrl: go to the signed-in user's own area instead of the learner homepage.
      let target = callbackUrl;
      if (!target) {
        const session = await getSession();
        target = homePathForRole(session?.user?.role);
      }
      router.replace(target);
      router.refresh();
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const describedBy = error ? 'login-error' : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Quay lại</span>
        </Link>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl" aria-hidden="true">T</span>
                <span className="sr-only">Tepup</span>
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Đăng nhập vào Tepup</h1>
            <p className="mt-2 text-gray-600">Dành cho người đóng góp, người duyệt bài và quản trị viên. Học trên Tepup không cần tài khoản.</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {justRegistered && (
              // Server-rendered with the page (it came in the URL), so it's in the reading order
              // right before the form rather than announced.
              <p className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Đã tạo tài khoản nhưng chưa đăng nhập tự động được. Hãy đăng nhập bằng tên tài khoản và mật khẩu vừa tạo.
              </p>
            )}
            {/* Always mounted, so the text is read when it appears. */}
            <div
              id="login-error"
              role="alert"
              className={error ? 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
            >
              {error}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài khoản
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Tên tài khoản của bạn"
                    required
                    aria-invalid={badCredentials || undefined}
                    aria-describedby={describedBy}
                    className={`${inputClass} pr-4`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    aria-invalid={badCredentials || undefined}
                    aria-describedby={describedBy}
                    className={`${inputClass} pr-12`}
                  />
                  <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} controls="password" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                // aria-disabled, not disabled: the pressed button keeps focus while signing in.
                aria-disabled={isLoading || undefined}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 aria-disabled:opacity-60 aria-disabled:cursor-wait transition-all"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register-contributor" className="text-teal-700 font-medium underline-offset-2 hover:underline hover:text-teal-800">
                Tạo tài khoản
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-600">
              <Link href="/contributor-guide" className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 hover:underline">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Tìm hiểu cách đóng góp
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
