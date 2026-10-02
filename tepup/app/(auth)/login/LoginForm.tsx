'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import Link from '@/components/ui/AppLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Lock, ArrowLeft, BookOpen } from 'lucide-react';
import { loginErrorMessage } from '@/lib/auth-messages';
import { homePathForRole } from '@/lib/role-utils';
import { safeRedirectPath } from '@/lib/security/safe-redirect';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only same-site paths: `?callbackUrl=https://evil.example` must not redirect off-site.
  const callbackUrl = safeRedirectPath(searchParams.get('callbackUrl'));

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // `code` carries the reason (wrong password, lockout + wait time, ban); see lib/auth-messages.ts.
        setError(loginErrorMessage(result.code));
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Đăng nhập vào Tepup</h1>
            <p className="mt-2 text-gray-600">Dành cho người đóng góp, người duyệt bài và quản trị viên. Học trên Tepup không cần tài khoản.</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài khoản
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register-contributor" className="text-teal-600 font-medium hover:text-teal-700">
                Tạo tài khoản
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">
              <Link href="/contributor-guide" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700">
                <BookOpen className="w-4 h-4" />
                Tìm hiểu cách đóng góp
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
