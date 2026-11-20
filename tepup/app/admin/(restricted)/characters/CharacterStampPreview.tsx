'use client';

import { fraunces, beVietnam } from '@/lib/fonts/paper';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';

/**
 * Bản xem trước tĩnh của "tem" nhân vật ở /courses (design demo-course-stories,
 * `.stamp`), thu nhỏ 60%: khung tem giấy, ảnh tem, tên, vai trò, câu trích dẫn.
 * Chỉ minh hoạ (`aria-hidden`); các ô nhập ở trên mới là nội dung thật.
 */
export default function CharacterStampPreview({
  name,
  role,
  quote,
  imageUrl,
}: {
  name: string;
  role: string;
  quote: string;
  imageUrl: string;
}) {
  const photo = isAllowedMediaUrl(imageUrl) ? imageUrl : null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">Xem trước tem</p>
      <div
        className={`relative w-[210px] h-[305px] text-gray-800 ${fraunces.variable} ${beVietnam.variable}`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- khung tem tĩnh trong public/ */}
        <img src="/paper/stamp-back.webp" alt="" className="absolute inset-0 w-full h-full" />
        <div className="absolute left-[23px] top-[27px] w-[158px] h-[160px] overflow-hidden bg-gray-200">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh tem từ Supabase Storage (host đã kiểm tra)
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="flex w-full h-full items-center justify-center text-xs text-gray-600">
              Chưa có ảnh tem
            </span>
          )}
        </div>
        <div className="absolute left-[23px] top-[196px] w-[158px] flex flex-col gap-0.5">
          <span
            className="block text-lg leading-tight truncate italic font-semibold"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            {name || 'Tên nhân vật'}
          </span>
          <span
            className="block text-xs font-medium truncate"
            style={{ fontFamily: 'var(--font-be-vietnam), sans-serif' }}
          >
            {role || 'Vai trò'}
          </span>
          <span
            className="text-xs leading-4 line-clamp-3"
            style={{ fontFamily: 'var(--font-be-vietnam), sans-serif' }}
          >
            {quote || 'Câu trích dẫn trên tem'}
          </span>
        </div>
      </div>
    </div>
  );
}
