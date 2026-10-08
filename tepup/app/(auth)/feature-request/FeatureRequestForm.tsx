'use client';

import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Lightbulb, Send, CheckCircle, GraduationCap, PenTool } from 'lucide-react';

type Role = 'LEARNER' | 'CONTRIBUTOR';

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

const ROLES: { value: Role; label: string; icon: typeof GraduationCap }[] = [
  { value: 'LEARNER', label: 'Người học', icon: GraduationCap },
  { value: 'CONTRIBUTOR', label: 'Người đóng góp', icon: PenTool },
];

const fieldClass =
  'w-full px-4 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all';

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
  // The pressed button disappears when the screen switches: say where focus goes next.
  const [focusNext, setFocusNext] = useState<'thanks' | 'title' | null>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusNext === 'thanks') thanksRef.current?.focus();
    if (focusNext === 'title') titleRef.current?.focus();
  }, [focusNext, isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, title, description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Đã xảy ra lỗi');
        return;
      }

      setIsSubmitted(true);
      setFocusNext('thanks');
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const backLink = (
    <header className="p-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        <span>Quay lại</span>
      </Link>
    </header>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {backLink}
        <main id="main-content" className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <CheckCircle className="w-8 h-8 text-green-700" aria-hidden="true" />
            </div>
            {/* Focused after sending: the "Gửi yêu cầu" button is gone, and this is the result. */}
            <h1 ref={thanksRef} tabIndex={-1} className="text-2xl font-bold text-gray-900 mb-2">
              Cảm ơn bạn!
            </h1>
            <p className="text-gray-600 mb-6">
              Yêu cầu của bạn đã được gửi. Đội ngũ Tépup đọc mọi đề xuất để cân nhắc cho các bản cập nhật sau.
              Trang này không gửi phản hồi riêng cho từng đề xuất.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setTitle('');
                  setDescription('');
                  setFocusNext('title');
                }}
                className="px-4 py-2 text-teal-800 border border-teal-700 rounded-xl hover:bg-teal-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                Gửi yêu cầu khác
              </button>
              <Link
                href={signedIn?.isContributor ? '/contributor' : '/'}
                className="px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                {signedIn?.isContributor ? 'Về khu đóng góp' : 'Về trang chủ'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {backLink}

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
              <Lightbulb className="w-6 h-6 text-amber-700" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đề xuất tính năng mới</h1>
            <p className="mt-2 text-gray-600">Giúp Tépup tốt hơn bằng ý tưởng của bạn</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Always mounted, so the text is read when it appears. */}
            <div
              id="feature-request-error"
              role="alert"
              className={error ? 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
            >
              {error}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector: real radios (arrow keys, announced state), styled as cards. */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Bạn đang là...</legend>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all border-gray-200 text-gray-600 hover:border-gray-500 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-700 has-[:focus-visible]:ring-offset-2"
                    >
                      <input
                        type="radio"
                        name="feature-request-role"
                        value={value}
                        checked={role === value}
                        onChange={() => setRole(value)}
                        className="h-4 w-4 shrink-0 accent-teal-700"
                      />
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  ref={titleRef}
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thêm chế độ tối cho giao diện học"
                  required
                  maxLength={TITLE_MAX}
                  aria-describedby={error ? 'title-hint feature-request-error' : 'title-hint'}
                  className={fieldClass}
                />
                <p id="title-hint" className="mt-1 text-xs text-gray-600">
                  Tối đa {TITLE_MAX} ký tự.
                </p>
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
                  maxLength={DESCRIPTION_MAX}
                  aria-describedby={error ? 'description-hint feature-request-error' : 'description-hint'}
                  className={`${fieldClass} resize-none`}
                />
                <p id="description-hint" className="mt-1 flex justify-between gap-2 text-xs text-gray-600">
                  <span>Tối đa {DESCRIPTION_MAX} ký tự.</span>
                  {/* Visual counter only: reading it on every keystroke would be noise. */}
                  <span aria-hidden="true">
                    {description.length}/{DESCRIPTION_MAX}
                  </span>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                // aria-disabled, not disabled: the pressed button keeps focus while sending.
                aria-disabled={isLoading || undefined}
                className="w-full py-3 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 aria-disabled:opacity-60 aria-disabled:cursor-wait transition-all inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-600" data-testid="feature-request-identity">
              {signedIn
                ? `Bạn đang đăng nhập (${signedIn.displayName}): đề xuất sẽ gắn với tài khoản này để đội ngũ biết ai gửi. Muốn gửi ẩn danh, hãy đăng xuất trước.`
                : 'Không cần đăng nhập, đề xuất không gắn với tài khoản nào.'}{' '}
              Đội ngũ Tépup đọc mọi đề xuất, nhưng không có phản hồi riêng qua trang này.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
