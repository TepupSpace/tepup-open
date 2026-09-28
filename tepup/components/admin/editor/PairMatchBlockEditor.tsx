'use client';

import { AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import type { PairMatchBlock } from './types';
import CharCount from './CharCount';
import { PAIR_MATCH_LIMITS, isPairLopsided, pairLineGap } from '@/lib/blockLimits';

interface Props {
  block: PairMatchBlock;
  onChange: (block: PairMatchBlock) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

/** Ids only need to be unique within the block, and pairs are never reordered. */
function nextPairId(block: PairMatchBlock): string {
  return `p${Date.now().toString(36)}${block.pairs.length}`;
}

export default function PairMatchBlockEditor({ block, onChange }: Props) {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
        <input
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          placeholder="VD: Nối khái niệm với định nghĩa"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn</label>
        <input
          type="text"
          value={block.instruction ?? ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value || undefined })}
          placeholder="Để trống sẽ dùng hướng dẫn mặc định"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Các cặp <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Cột phải sẽ được xáo trộn khi hiển thị cho học viên. Giữ hai vế gần bằng nhau về độ
          dài — trên điện thoại mỗi ô chỉ rộng khoảng 21 ký tự một dòng, nên vế nào dài hơn hẳn
          sẽ kéo vế kia giãn theo.
        </p>
        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const lopsided = isPairLopsided(pair.left, pair.right);
            return (
              <div key={pair.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(e) => updatePair(index, { left: e.target.value })}
                    placeholder="Vế trái"
                    className={inputClass}
                  />
                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(e) => updatePair(index, { right: e.target.value })}
                    placeholder="Vế phải tương ứng"
                    className={inputClass}
                  />
                  <button
                    onClick={() => removePair(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    aria-label={`Xoá cặp ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bộ đếm xếp thẳng dưới ô của nó: chừa 20px cho số thứ tự, 16px cho
                    mũi tên giữa, 36px cho nút xoá bên phải. */}
                <div className="flex items-center gap-2 pl-7">
                  <span className="flex-1 text-right">
                    <CharCount value={pair.left} limit={PAIR_MATCH_LIMITS.left} />
                  </span>
                  <span className="w-4 shrink-0" />
                  <span className="flex-1 text-right">
                    <CharCount value={pair.right} limit={PAIR_MATCH_LIMITS.right} />
                  </span>
                  <span className="w-9 shrink-0" />
                </div>

                {lopsided && (
                  <p className="flex items-start gap-1.5 pl-7 text-xs text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
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
          onClick={addPair}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm cặp</span>
        </button>
      </div>
    </div>
  );
}
