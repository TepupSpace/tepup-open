'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Hiện thay cho ảnh/video/audio/tệp có URL ngoài allowlist (`isAllowedMediaUrl`).
 *
 * Không bao giờ tải URL gốc — mục đích chính là để trình duyệt người học không gửi
 * request (và IP) tới máy chủ lạ. Vẫn gọi `onSettled` để `LessonPlayer` tính lại bố
 * cục như khi một media thật tải xong.
 */
export function BlockedMedia({
  kind,
  label,
  onSettled,
}: {
  kind: 'image' | 'video' | 'audio' | 'file';
  label?: string;
  onSettled?: () => void;
}) {
  useEffect(() => {
    onSettled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noun = { image: 'Ảnh', video: 'Video', audio: 'Âm thanh', file: 'Tệp' }[kind];
  return (
    <div
      className="mb-6 flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500"
      role="note"
    >
      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
      <span>
        {noun} này bị ẩn vì nguồn không nằm trong danh sách được phép
        {label ? `: ${label}` : ''}.
      </span>
    </div>
  );
}
