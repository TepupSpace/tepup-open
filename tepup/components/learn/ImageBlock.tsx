'use client';

import { useEffect, useRef, useState } from 'react';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { BlockedMedia } from './BlockedMedia';
import { imageAltText } from '@/lib/a11y/content-warnings';

type ImageBlockProps = {
  block: { type: 'image'; src: string; alt: string; caption?: string; decorative?: boolean };
  /** Gọi khi ảnh đã tải xong (hoặc lỗi) — lúc này chiều cao khối mới là thật. */
  onSettled?: () => void;
};

export function ImageBlockComponent({ block, onSettled }: ImageBlockProps) {
  // Ảnh ngoài allowlist là tracking pixel tiềm năng: không bao giờ để trình duyệt tải.
  if (!isAllowedMediaUrl(block.src)) {
    return <BlockedMedia kind="image" label={imageAltText(block)} onSettled={onSettled} />;
  }
  return <AllowedImage block={block} onSettled={onSettled} />;
}

function AllowedImage({ block, onSettled }: ImageBlockProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  // Ảnh trang trí → ""; thiếu mô tả → chú thích; không bao giờ là tên tệp.
  const alt = imageAltText(block);

  const settle = (next: 'loaded' | 'error') => {
    setState(next);
    onSettled?.();
  };

  // Ảnh đã nằm trong cache (LessonPlayer nạp trước cả bài) có thể phát `load`
  // xong trước khi React gắn handler — lúc đó skeleton sẽ treo mãi.
  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    settle(img.naturalWidth > 0 ? 'loaded' : 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <figure className="mb-6">
      <div className="relative">
        {state === 'loading' && (
          // Giữ chỗ theo tỉ lệ 16/9 để khối không bị "sập" rồi giãn ra khi ảnh về.
          <div
            className="w-full rounded-xl bg-gray-100 animate-pulse"
            style={{ aspectRatio: '16 / 9' }}
            aria-hidden="true"
          />
        )}
        {state === 'error' ? (
          <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            Không tải được ảnh{alt ? `: ${alt}` : ''}
          </div>
        ) : (
          // onLoad/onError là sự kiện tải ảnh, không phải tương tác của người học. <img> thay cho
          // next/image có chủ ý: ảnh của tác giả, không đưa qua bộ tối ưu ảnh của Vercel (hạn mức gói Hobby).
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element -- xem trên
          <img
            ref={imgRef}
            src={block.src}
            alt={alt}
            // content-image: in dark mode reader.css puts a white backing behind it (diagrams).
            className={`content-image rounded-xl w-full ${state === 'loaded' ? '' : 'absolute inset-0 opacity-0'}`}
            onLoad={() => settle('loaded')}
            onError={() => settle('error')}
          />
        )}
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-500 mt-2 text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
