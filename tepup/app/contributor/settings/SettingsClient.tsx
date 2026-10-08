'use client';

import { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { PASSWORD_MIN_LENGTH } from '@/lib/security/password-policy';

type Field = 'current' | 'new' | 'confirm';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 aria-[invalid=true]:border-red-600';

export default function SettingsClient() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // Which field the error is about, so it gets aria-invalid and points at the message.
  const [errorField, setErrorField] = useState<Field | null>(null);

  const fail = (text: string, field: Field | null) => {
    setError(text);
    setErrorField(field);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    fail('', null);
    setMessage('');

    if (newPassword !== confirmPassword) {
      fail('Mật khẩu xác nhận không khớp', 'confirm');
      setIsLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      fail('Mật khẩu mới phải khác mật khẩu hiện tại', 'new');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      fail(`Mật khẩu mới phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`, 'new');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const text: string = data?.error || 'Lỗi đổi mật khẩu';
        fail(text, /hiện tại không đúng/.test(text) ? 'current' : /mật khẩu mới/i.test(text) ? 'new' : null);
        return;
      }

      setMessage('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      fail('Đã xảy ra lỗi', null);
    } finally {
      setIsLoading(false);
    }
  };

  // The error is described on the field it concerns; the hint always on the new password.
  const describedBy = (field: Field, extra?: string) =>
    [extra, errorField === field ? 'password-error' : null].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>

        {/* Always mounted, so the text is read when it appears. */}
        <div
          id="password-error"
          role="alert"
          className={error ? 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
        >
          {error}
        </div>
        <div
          role="status"
          className={message ? 'mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm' : 'sr-only'}
        >
          {message}
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                aria-invalid={errorField === 'current' || undefined}
                aria-describedby={describedBy('current')}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
                aria-invalid={errorField === 'new' || undefined}
                aria-describedby={describedBy('new', 'new-password-hint')}
                className={inputClass}
              />
            </div>
            <p id="new-password-hint" className="mt-1 text-xs text-gray-600">
              Ít nhất {PASSWORD_MIN_LENGTH} ký tự, khác mật khẩu hiện tại.
            </p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-invalid={errorField === 'confirm' || undefined}
                aria-describedby={describedBy('confirm')}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            // aria-disabled, not disabled: the pressed button keeps focus while saving.
            aria-disabled={isLoading || undefined}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 aria-disabled:opacity-60 aria-disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {isLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
