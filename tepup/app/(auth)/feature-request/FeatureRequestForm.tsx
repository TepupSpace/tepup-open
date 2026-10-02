'use client';

import { useState } from 'react';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Lightbulb, Send, CheckCircle, GraduationCap, PenTool } from 'lucide-react';

type Role = 'LEARNER' | 'CONTRIBUTOR';

export interface SignedInUser {
  displayName: string;
  isContributor: boolean;
}

/**
 * The server (`POST /api/feature-requests`) attaches the account of a signed-in sender
 * to the request. Say so on the form, so nobody believes they're writing anonymously.
 * There is no way to receive an answer here, so don't promise one.
 */
export default function FeatureRequestForm({ signedIn }: { signedIn: SignedInUser | null }) {
  const [role, setRole] = useState<Role>(signedIn?.isContributor ? 'CONTRIBUTOR' : 'LEARNER');
  const backHref = signedIn?.isContributor ? '/contributor' : '/contributor-guide';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, title, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Đã xảy ra lỗi');
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="p-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cảm ơn bạn!</h1>
            <p className="text-gray-600 mb-6">
              Yêu cầu của bạn đã được gửi. Đội ngũ Tépup đọc mọi đề xuất để cân nhắc cho các bản cập nhật sau.
              Trang này không gửi phản hồi riêng cho từng đề xuất.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setTitle('');
                  setDescription('');
                }}
                className="px-4 py-2 text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors"
              >
                Gửi yêu cầu khác
              </button>
              <Link
                href={signedIn?.isContributor ? '/contributor' : '/'}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
              >
                {signedIn?.isContributor ? 'Về khu đóng góp' : 'Về trang chủ'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đề xuất tính năng mới</h1>
            <p className="mt-2 text-gray-600">Giúp Tépup tốt hơn bằng ý tưởng của bạn</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bạn đang là...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('LEARNER')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === 'LEARNER'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium text-sm">Người học</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CONTRIBUTOR')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === 'CONTRIBUTOR'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <PenTool className="w-5 h-5" />
                    <span className="font-medium text-sm">Người đóng góp</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thêm chế độ tối cho giao diện học"
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tính năng bạn mong muốn, vấn đề bạn gặp, hoặc ý tưởng cải thiện..."
                  required
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{description.length}/2000</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-500" data-testid="feature-request-identity">
              {signedIn
                ? `Bạn đang đăng nhập (${signedIn.displayName}): đề xuất sẽ gắn với tài khoản này để đội ngũ biết ai gửi. Muốn gửi ẩn danh, hãy đăng xuất trước.`
                : 'Không cần đăng nhập, đề xuất không gắn với tài khoản nào.'}{' '}
              Đội ngũ Tépup đọc mọi đề xuất, nhưng không có phản hồi riêng qua trang này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
