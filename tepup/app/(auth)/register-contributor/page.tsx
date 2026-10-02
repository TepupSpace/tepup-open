'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from '@/components/ui/AppLink';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowLeft, BookOpen, KeyRound } from 'lucide-react';
import { PASSWORD_MIN_LENGTH } from '@/lib/security/password-policy';

export default function RegisterContributorPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Editing any field clears a stale error such as "Mật khẩu xác nhận không khớp".
  const edit = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, mode: 'contributor' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Đã xảy ra lỗi khi đăng ký');
        return;
      }

      const result = await signIn('credentials', {
        // The server stores the username lowercase; log in with exactly what it saved.
        identifier: data.user?.username ?? username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Đăng ký thành công nhưng không thể đăng nhập tự động. Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        router.push('/contributor');
        router.refresh();
      }
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
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Đóng góp ẩn danh</h1>
            <p className="mt-2 text-gray-600">Tạo tài khoản contributor — không cần email, hoàn toàn ẩn danh</p>
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={edit(setUsername)}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="vd: contributor_abc"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]{3,20}"
                    title="Chỉ chữ cái, số và dấu gạch dưới (3-20 ký tự)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Chỉ chữ cái, số và dấu gạch dưới (3-20 ký tự). Không phân biệt hoa thường: tên được lưu bằng chữ thường.</p>
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
                    onChange={edit(setPassword)}
                    autoComplete="new-password"
                    placeholder={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự`}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={edit(setConfirmPassword)}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* No recovery: there is no email to send a reset link to. */}
              <div
                id="no-recovery-note"
                className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900"
              >
                <KeyRound className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  <strong>Không có cách lấy lại mật khẩu.</strong> Tepup không thu email nên không thể gửi
                  link đặt lại. Nếu quên mật khẩu, bạn sẽ mất tài khoản này. Hãy lưu tên tài khoản và mật
                  khẩu ở nơi an toàn, ví dụ trình quản lý mật khẩu.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Contributor'}
              </button>
            </form>

            {/* Guide link */}
            <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg">
              <Link
                href="/contributor-guide"
                className="flex items-center gap-2 text-teal-700 text-sm hover:text-teal-800"
              >
                <BookOpen className="w-4 h-4" />
                <span>Tìm hiểu cách đóng góp</span>
              </Link>
            </div>

            {/* Login link */}
            <p className="mt-6 text-center text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-teal-600 font-medium hover:text-teal-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
