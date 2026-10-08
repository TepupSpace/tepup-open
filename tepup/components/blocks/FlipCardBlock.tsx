'use client';

import { useEffect, useState } from 'react';
import { Check, SquareStack } from 'lucide-react';
import type { FlipCardBlock as FlipCardBlockType, FlipCardFace } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer } from './useAnnouncer';

interface Props {
  block: FlipCardBlockType;
  onComplete?: () => void;
}

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
        className="content-image mx-auto max-h-[220px] w-auto max-w-full object-contain rounded-lg"
      />
    );
  }
  return (
    <span className="block text-center text-sm sm:text-base leading-relaxed">
      {renderInlineMarkdown(face.text)}
    </span>
  );
}

/** Chữ đọc lên khi một mặt vừa lật ra. */
function faceText(face: FlipCardFace): string {
  if (face.kind === 'image') return face.alt || 'Hình ảnh';
  return toPlainText(face.text);
}

/**
 * One side of the card: its own border and background, since both are visible mid-turn.
 *
 * Không có vùng cuộn bên trong: nội dung nằm trong một nút bấm thì bàn phím không
 * cuộn tới được, nên thẻ cứ cao theo mặt dài hơn (lưới trong globals.css lo việc đó).
 */
function Face({
  face,
  label,
  seen,
  hidden,
  className,
}: {
  face: FlipCardFace;
  label: string;
  seen?: boolean;
  /** Mặt đang úp: ẩn khỏi trình đọc màn hình để tên nút chỉ gồm mặt đang hiện. */
  hidden: boolean;
  className: string;
}) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className={`flip-card-face rounded-xl border-2 p-4 pb-7 pr-9 ${className}`}
    >
      <span className="block w-full">
        <CardFace face={face} />
      </span>
      {seen && (
        <span className="absolute top-2 right-2 text-green-700">
          <Check className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
      <span className="absolute bottom-2 right-3 text-xs text-gray-600">{label}</span>
    </span>
  );
}

export default function FlipCardBlockComponent({ block, onComplete }: Props) {
  /** Cards currently showing their back. */
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  /** Cards flipped at least once — this, not `flipped`, is what unlocks Continue. */
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  const [message, announce] = useAnnouncer();

  const seenCount = Object.keys(seen).length;
  // A block with no cards has nothing to flip — completing immediately beats
  // leaving the lesson's Continue button permanently disabled.
  const finished = seenCount === block.cards.length;

  useEffect(() => {
    if (finished) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const toggle = (id: string) => {
    const card = block.cards.find((c) => c.id === id);
    const nowFlipped = !flipped[id];
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
    setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    // Trình đọc màn hình chỉ báo "đã nhấn", không tự đọc lại tên nút — nên đọc mặt vừa lật ra.
    if (card) {
      const count = seen[id] ? seenCount : seenCount + 1;
      announce(
        `${nowFlipped ? 'Mặt sau' : 'Mặt trước'}: ${faceText(nowFlipped ? card.back : card.front)}. Đã xem ${count}/${block.cards.length} thẻ.`
      );
    }
  };

  return (
    <BlockShell>
      <div className="flex items-center gap-2 mb-1">
        <SquareStack className="w-5 h-5 text-pink-500" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">{block.title || 'Lật thẻ'}</h2>
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
              {/* <span> chứ không phải <div>: trong <button> chỉ được chứa phần tử dòng. */}
              <span className="flip-card-inner">
                <Face
                  face={card.front}
                  label="Mặt trước"
                  seen={seen[card.id]}
                  hidden={isFlipped}
                  className="border-gray-200 bg-gray-50 text-gray-800"
                />
                <Face
                  face={card.back}
                  label="Mặt sau"
                  seen={seen[card.id]}
                  hidden={!isFlipped}
                  className="flip-card-back border-pink-300 bg-pink-50 text-pink-900"
                />
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">{message}</p>

      <div className="mt-4 text-sm">
        {finished ? (
          <span className="flex items-center gap-1.5 font-medium text-green-700">
            <Check className="w-4 h-4" aria-hidden="true" />
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
