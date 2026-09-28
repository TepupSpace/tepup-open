'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, SquareStack } from 'lucide-react';
import type { FlipCardBlock as FlipCardBlockType, FlipCardFace } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import BlockShell from './BlockShell';

interface Props {
  block: FlipCardBlockType;
  onComplete?: () => void;
}

/**
 * Trần chiều cao vùng chữ của một mặt thẻ. Cộng với đệm (16px trên, 28px dưới) thì
 * không thẻ nào vượt quá 300px, nên một thẻ viết quá dài không kéo cả bộ phỏng lên.
 */
const FACE_SCROLL_MAX = 'max-h-[256px]';

function CardFace({ face }: { face: FlipCardFace }) {
  if (face.kind === 'image') {
    if (!face.src) return null;
    // Same media allowlist as ImageBlock — never let a learner's browser fetch an
    // arbitrary host (tracking pixel).
    if (!isAllowedMediaUrl(face.src)) {
      return (
        <span className="block text-center text-xs text-gray-500">
          Ảnh bị ẩn vì nguồn không nằm trong danh sách được phép{face.alt ? `: ${face.alt}` : ''}.
        </span>
      );
    }
    return (
      // Plain <img> like ImageBlockComponent: uploads live on Supabase Storage and
      // next.config declares no remotePatterns, so next/image would throw on them.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={face.src}
        // An author who left alt blank meant the image as decoration — inventing
        // a description would be worse than announcing nothing.
        alt={face.alt ?? ''}
        className="mx-auto max-h-[220px] w-auto max-w-full object-contain rounded-lg"
      />
    );
  }
  return (
    <span className="block text-center text-sm sm:text-base leading-relaxed">
      {renderInlineMarkdown(face.text)}
    </span>
  );
}

/** One side of the card: its own border and background, since both are visible mid-turn. */
function Face({
  face,
  label,
  seen,
  className,
  fadeClass,
}: {
  face: FlipCardFace;
  label: string;
  seen?: boolean;
  className: string;
  /** Màu bắt đầu của dải mờ báo hiệu còn nội dung — phải khớp nền của mặt thẻ. */
  fadeClass: string;
}) {
  const scrollRef = useRef<HTMLSpanElement>(null);
  /** Chỉ đúng khi nội dung chạm trần và thật sự phải cuộn. */
  const [overflowing, setOverflowing] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    measure();
    // Lưới cân chiều cao các thẻ sau khi bố cục xong, và chữ xuống dòng lại mỗi khi
    // bề ngang đổi — cả hai đều có thể bật/tắt trạng thái cuộn sau lần đo đầu.
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <span className={`flip-card-face rounded-xl border-2 p-4 pb-7 pr-9 ${className}`}>
      <span ref={scrollRef} className={`w-full overflow-y-auto ${FACE_SCROLL_MAX}`}>
        <CardFace face={face} />
      </span>
      {overflowing && (
        // Không có dải này thì thẻ chạm trần trông như bị cắt mất chữ, vì trên mobile
        // thanh cuộn chỉ hiện lúc đang cuộn.
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-xl bg-gradient-to-t ${fadeClass} to-transparent`}
        />
      )}
      {seen && (
        <span className="absolute top-2 right-2 text-green-500">
          <Check className="w-4 h-4" />
        </span>
      )}
      <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">{label}</span>
    </span>
  );
}

export default function FlipCardBlockComponent({ block, onComplete }: Props) {
  /** Cards currently showing their back. */
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  /** Cards flipped at least once — this, not `flipped`, is what unlocks Continue. */
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  const seenCount = Object.keys(seen).length;
  // A block with no cards has nothing to flip — completing immediately beats
  // leaving the lesson's Continue button permanently disabled.
  const finished = seenCount === block.cards.length;

  useEffect(() => {
    if (finished) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const toggle = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
    setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  return (
    <BlockShell>
      <div className="flex items-center gap-2 mb-1">
        <SquareStack className="w-5 h-5 text-pink-500" />
        <h3 className="font-semibold text-gray-900">{block.title || 'Lật thẻ'}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {block.instruction || 'Chạm vào từng thẻ để xem nội dung phía sau.'}
      </p>

      {/*
        `minmax(150px, 1fr)`: mọi hàng cùng cao bằng hàng có nội dung dài nhất, nên cả
        block trông như một bộ bài đều tăm tắp thay vì cao thấp so le — chiều cao đến từ
        nội dung chứ không phải một con số chọn tay. Sàn 150px giữ cho bộ toàn thẻ ngắn
        không bị bẹt thành dải ngang.
        Giữ 1 cột trên mobile: 2 cột cho ra ~150px mỗi thẻ, một mặt sau 230 ký tự sẽ
        thành ~16 dòng — tệ hơn hẳn.
      */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        style={{ gridAutoRows: 'minmax(150px, 1fr)' }}
      >
        {block.cards.map((card) => {
          const isFlipped = Boolean(flipped[card.id]);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggle(card.id)}
              aria-pressed={isFlipped}
              className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
            >
              <div className="flip-card-inner">
                <Face
                  face={card.front}
                  label="Mặt trước"
                  seen={seen[card.id]}
                  className="border-gray-200 bg-gray-50 text-gray-800"
                  fadeClass="from-gray-50"
                />
                <Face
                  face={card.back}
                  label="Mặt sau"
                  seen={seen[card.id]}
                  className="flip-card-back border-pink-300 bg-pink-50 text-pink-900"
                  fadeClass="from-pink-50"
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm">
        {finished ? (
          <span className="flex items-center gap-1.5 font-medium text-green-600">
            <Check className="w-4 h-4" />
            Đã xem hết {block.cards.length} thẻ!
          </span>
        ) : (
          <span className="text-gray-500">
            Đã xem {seenCount}/{block.cards.length} thẻ
          </span>
        )}
      </div>
    </BlockShell>
  );
}
