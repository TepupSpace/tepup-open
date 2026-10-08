'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from '@/components/ui/AppLink';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft, BookOpen, KeyRound } from 'lucide-react';
import { PASSWORD_MIN_LENGTH } from '@/lib/security/password-policy';
import PasswordToggle from '../PasswordToggle';

type Field = 'username' | 'password' | 'confirmPassword';

const inputClass =
  'w-full pl-10 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all aria-[invalid=true]:border-red-600';

export default function RegisterContributorForm() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // Which field the error is about: gets aria-invalid and points at the message.
  const [errorField, setErrorField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fail = (text: string, field: Field | null) => {
    setError(text);
    setErrorField(field);
  };

  // Editing any field clears a stale error such as "Mật khẩu xác nhận không khớp".
  const edit = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) fail('', null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    fail('', null);

    if (password !== confirmPassword) {
      fail('Mật khẩu xác nhận không khớp', 'confirmPassword');
      setIsLoading(false);
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      fail(`Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`, 'password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, mode: 'contributor' }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const text: string = data?.error || 'Đã xảy ra lỗi khi đăng ký';
        fail(text, /^Tên tài khoản/.test(text) ? 'username' : /^Mật khẩu/.test(text) ? 'password' : null);
        return;
      }

      const result = await signIn('credentials', {
        // The server stores the username lowercase; log in with exactly what it saved.
        identifier: data?.user?.username ?? username,
        password,
        redirect: false,
      });

      if (result?.error) {
        // The account exists: say so on the login page (a message set here would vanish with
        // the navigation).
        router.push('/login?registered=1');
      } else {
        router.push('/contributor');
        router.refresh();
      }
    } catch {
      fail('Đã xảy ra lỗi. Vui lòng thử lại.', null);
    } finally {
      setIsLoading(false);
    }
  };

  const describedBy = (field: Field, hint?: string) =>
    [hint, errorField === field ? 'register-error' : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
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
              className="inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <span className="w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl" aria-hidden="true">T</span>
                <span className="sr-only">Tepup</span>
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Đóng góp ẩn danh</h1>
            <p className="mt-2 text-gray-600">Tạo tài khoản cộng tác viên — không cần email, hoàn toàn ẩn danh</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Always mounted, so the text is read when it appears. */}
            <div
              id="register-error"
              role="alert"
              className={error ? 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
            >
              {error}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
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
                    aria-invalid={errorField === 'username' || undefined}
                    aria-describedby={describedBy('username', 'username-hint')}
                    className={`${inputClass} pr-4`}
                  />
                </div>
                <p id="username-hint" className="mt-1 text-xs text-gray-600">
                  Chỉ chữ cái, số và dấu gạch dưới (3-20 ký tự). Không phân biệt hoa thường: tên được lưu bằng chữ thường.
                </p>
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
                    onChange={edit(setPassword)}
                    autoComplete="new-password"
                    placeholder={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự`}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    aria-invalid={errorField === 'password' || undefined}
                    aria-describedby={describedBy('password', 'password-hint')}
                    className={`${inputClass} pr-12`}
                  />
                  <PasswordToggle
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    controls="password confirmPassword"
                  />
                </div>
                <p id="password-hint" className="mt-1 text-xs text-gray-600">
                  Ít nhất {PASSWORD_MIN_LENGTH} ký tự.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={edit(setConfirmPassword)}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    required
                    aria-invalid={errorField === 'confirmPassword' || undefined}
                    aria-describedby={describedBy('confirmPassword')}
                    className={`${inputClass} pr-4`}
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
                // aria-disabled, not disabled: the pressed button keeps focus while the account is created.
                aria-disabled={isLoading || undefined}
                className="w-full py-3 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 aria-disabled:opacity-60 aria-disabled:cursor-wait transition-all"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản cộng tác viên'}
              </button>
            </form>

            {/* Guide link */}
            <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg">
              <Link
                href="/contributor-guide"
                className="flex items-center gap-2 text-teal-800 text-sm hover:text-teal-900 hover:underline"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Tìm hiểu cách đóng góp</span>
              </Link>
            </div>

            {/* Login link */}
            <p className="mt-6 text-center text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-teal-700 font-medium hover:text-teal-800 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
