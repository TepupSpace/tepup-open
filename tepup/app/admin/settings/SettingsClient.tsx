'use client';

import { useState } from 'react';
import { KeyRound, CheckCircle } from 'lucide-react';
import PasswordToggle from '@/app/(auth)/PasswordToggle';

const INPUT_CLASS =
  'w-full px-4 py-2.5 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent aria-[invalid=true]:border-red-600';

export default function SettingsClient() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Ô nào gây lỗi (để đánh dấu aria-invalid); null = lỗi chung từ máy chủ.
  const [errorField, setErrorField] = useState<'new' | 'confirm' | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút "Lưu" không bị `disabled` khi đang lưu (để không mất focus): chặn ở đây.
    if (loading) return;
    setError('');
    setErrorField(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      setErrorField('confirm');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      setErrorField('new');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
      } else {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="max-w-md">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
          </div>

          {/* Vùng thông báo luôn có mặt, chỉ đổi nội dung: trình đọc màn hình mới đọc. */}
          <div role="status" className="empty:hidden mb-4">
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">Đổi mật khẩu thành công!</span>
              </div>
            )}
          </div>

          <div role="alert" id="admin-password-error" className="empty:hidden mb-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-current-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  id="admin-current-password"
                  autoComplete="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={`${INPUT_CLASS} pr-10`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <PasswordToggle shown={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} controls="admin-current-password" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="admin-new-password"
                  autoComplete="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={10}
                  aria-invalid={errorField === 'new' || undefined}
                  aria-describedby={
                    errorField === 'new' ? 'admin-new-password-hint admin-password-error' : 'admin-new-password-hint'
                  }
                  className={`${INPUT_CLASS} pr-10`}
                  placeholder="Tối thiểu 10 ký tự"
                />
                <PasswordToggle shown={showNew} onToggle={() => setShowNew(!showNew)} controls="admin-new-password" />
              </div>
              <p id="admin-new-password-hint" className="mt-1 text-xs text-gray-500">
                Tối thiểu 10 ký tự.
              </p>
            </div>

            <div>
              <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="admin-confirm-password"
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-invalid={errorField === 'confirm' || undefined}
                aria-describedby={errorField === 'confirm' ? 'admin-password-error' : undefined}
                className={INPUT_CLASS}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button
              type="submit"
              aria-disabled={loading || undefined}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors aria-disabled:opacity-70 aria-disabled:cursor-wait text-sm"
            >
              {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
