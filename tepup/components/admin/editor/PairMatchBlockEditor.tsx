'use client';

import { useId } from 'react';
import { AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import type { PairMatchBlock } from './types';
import CharCount from './CharCount';
import { PAIR_MATCH_LIMITS, isPairLopsided, pairLineGap } from '@/lib/blockLimits';

interface Props {
  block: PairMatchBlock;
  onChange: (block: PairMatchBlock) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

/** Ids only need to be unique within the block, and pairs are never reordered. */
function nextPairId(block: PairMatchBlock): string {
  return `p${Date.now().toString(36)}${block.pairs.length}`;
}

export default function PairMatchBlockEditor({ block, onChange }: Props) {
  const uid = useId();
  const pairs = block.pairs ?? [];

  function updatePair(index: number, patch: Partial<PairMatchBlock['pairs'][number]>) {
    onChange({
      ...block,
      pairs: pairs.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    });
  }

  function addPair() {
    onChange({ ...block, pairs: [...pairs, { id: nextPairId(block), left: '', right: '' }] });
  }

  function removePair(index: number) {
    onChange({ ...block, pairs: pairs.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          placeholder="VD: Nối khái niệm với định nghĩa"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={`${uid}-instruction`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Hướng dẫn
        </label>
        <input
          id={`${uid}-instruction`}
          type="text"
          value={block.instruction ?? ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value || undefined })}
          placeholder="Để trống sẽ dùng hướng dẫn mặc định"
          className={inputClass}
        />
      </div>

      <div>
        <p id={`${uid}-pairs-heading`} className="block text-sm font-medium text-gray-700 mb-1">
          Các cặp <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <p id={`${uid}-pairs-hint`} className="text-xs text-gray-500 mb-2">
          Cột phải sẽ được xáo trộn khi hiển thị cho học viên. Giữ hai vế gần bằng nhau về độ
          dài — trên điện thoại mỗi ô chỉ rộng khoảng 21 ký tự một dòng, nên vế nào dài hơn hẳn
          sẽ kéo vế kia giãn theo.
        </p>
        <div
          role="group"
          aria-labelledby={`${uid}-pairs-heading`}
          aria-describedby={`${uid}-pairs-hint`}
          className="space-y-3"
        >
          {pairs.map((pair, index) => {
            const lopsided = isPairLopsided(pair.left, pair.right);
            const warnId = `${uid}-pair-${index}-warn`;
            return (
              <div
                key={pair.id}
                role="group"
                aria-label={`Cặp ${index + 1}`}
                className="space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-5 shrink-0" aria-hidden="true">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(e) => updatePair(index, { left: e.target.value })}
                    placeholder="Vế trái"
                    aria-label={`Vế trái cặp ${index + 1}`}
                    aria-describedby={`${uid}-pair-${index}-left-count${lopsided ? ` ${warnId}` : ''}`}
                    className={inputClass}
                  />
                  <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(e) => updatePair(index, { right: e.target.value })}
                    placeholder="Vế phải tương ứng"
                    aria-label={`Vế phải cặp ${index + 1}`}
                    aria-describedby={`${uid}-pair-${index}-right-count${lopsided ? ` ${warnId}` : ''}`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removePair(index)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    aria-label={`Xoá cặp ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Bộ đếm xếp thẳng dưới ô của nó: chừa 20px cho số thứ tự, 16px cho
                    mũi tên giữa, 36px cho nút xoá bên phải. */}
                <div className="flex items-center gap-2 pl-7">
                  <span id={`${uid}-pair-${index}-left-count`} className="flex-1 text-right">
                    <CharCount value={pair.left} limit={PAIR_MATCH_LIMITS.left} />
                  </span>
                  <span className="w-4 shrink-0" />
                  <span id={`${uid}-pair-${index}-right-count`} className="flex-1 text-right">
                    <CharCount value={pair.right} limit={PAIR_MATCH_LIMITS.right} />
                  </span>
                  <span className="w-9 shrink-0" />
                </div>

                {lopsided && (
                  <p id={warnId} className="flex items-start gap-1.5 pl-7 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                    <span>
                      Trên điện thoại hai vế này chênh nhau khoảng{' '}
                      {pairLineGap(pair.left, pair.right)} dòng — thẻ ngắn sẽ bị kéo giãn cho bằng
                      thẻ dài, để lại một mảng trắng lớn.
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addPair}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm cặp</span>
        </button>
      </div>
    </div>
  );
}
