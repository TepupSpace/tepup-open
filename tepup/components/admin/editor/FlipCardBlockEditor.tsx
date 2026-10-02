'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2, Plus, Trash2, Type as TypeIcon } from 'lucide-react';
import type { FlipCardBlock, FlipCardFace } from './types';
import CharCount from './CharCount';
import { FLIP_CARD_LIMITS } from '@/lib/blockLimits';
import { useEditorMode, CONTRIBUTOR_NO_UPLOAD_MESSAGE } from './EditorModeContext';

interface Props {
  block: FlipCardBlock;
  onChange: (block: FlipCardBlock) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

function nextCardId(block: FlipCardBlock): string {
  return `c${Date.now().toString(36)}${block.cards.length}`;
}

/**
 * One side of a card. Text and image are mutually exclusive, so switching kind
 * replaces the face wholesale rather than keeping stale fields around.
 */
function FaceEditor({
  label,
  face,
  onChange,
}: {
  label: string;
  face: FlipCardFace;
  onChange: (face: FlipCardFace) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  // Contributors can't upload (admin-only endpoint): they paste an allowed image URL.
  const canUpload = useEditorMode() === 'admin';

  // Same endpoint ImageBlockEditor and the Notion editor use.
  async function upload(file: File) {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload thất bại');
      onChange({ kind: 'image', src: data.publicUrl, alt: face.kind === 'image' ? face.alt : '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChange({ kind: 'text', text: '' })}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
              face.kind === 'text'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TypeIcon className="w-3 h-3" /> Chữ
          </button>
          <button
            type="button"
            onClick={() => onChange({ kind: 'image', src: '', alt: '' })}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
              face.kind === 'image'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ImageIcon className="w-3 h-3" /> Ảnh
          </button>
        </div>
      </div>

      {face.kind === 'text' ? (
        <div className="space-y-1">
          <textarea
            value={face.text}
            onChange={(e) => onChange({ kind: 'text', text: e.target.value })}
            placeholder="Nội dung mặt này..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
          <div className="flex justify-end">
            <CharCount value={face.text} limit={FLIP_CARD_LIMITS.face} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {face.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={face.src}
              alt={face.alt || ''}
              className="max-h-28 w-auto rounded border border-gray-100"
            />
          )}
          {canUpload ? (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          ) : (
            <>
              <input
                type="url"
                value={face.src ?? ''}
                onChange={(e) => onChange({ kind: 'image', src: e.target.value, alt: face.alt ?? '' })}
                placeholder="https://upload.wikimedia.org/wikipedia/…"
                aria-label="URL ảnh"
                className={`${inputClass} text-sm`}
              />
              <p className="text-xs text-gray-500">{CONTRIBUTOR_NO_UPLOAD_MESSAGE}</p>
            </>
          )}
          <input
            type="text"
            value={face.alt ?? ''}
            onChange={(e) => onChange({ ...face, alt: e.target.value })}
            placeholder="Mô tả ảnh (để trống nếu ảnh chỉ để trang trí)"
            className={`${inputClass} text-sm`}
          />
          {uploading && (
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
            </p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function FlipCardBlockEditor({ block, onChange }: Props) {
  const cards = block.cards ?? [];

  function updateCard(index: number, patch: Partial<FlipCardBlock['cards'][number]>) {
    onChange({ ...block, cards: cards.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  }

  function addCard() {
    onChange({
      ...block,
      cards: [
        ...cards,
        { id: nextCardId(block), front: { kind: 'text', text: '' }, back: { kind: 'text', text: '' } },
      ],
    });
  }

  function removeCard(index: number) {
    onChange({ ...block, cards: cards.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
        <input
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          placeholder="VD: Thuật ngữ cần nhớ"
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
          Các thẻ <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Học viên phải lật hết mọi thẻ mới qua được bước tiếp theo. Mọi thẻ trong block cao bằng
          thẻ dài nhất, nên một mặt viết quá dài sẽ kéo cả bộ cao lên theo; vượt{' '}
          {FLIP_CARD_LIMITS.face} ký tự thì thẻ chạm trần và người học phải cuộn bên trong.
        </p>
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div key={card.id} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Thẻ {index + 1}</span>
                <button
                  onClick={() => removeCard(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  aria-label={`Xoá thẻ ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FaceEditor
                  label="Mặt trước"
                  face={card.front}
                  onChange={(front) => updateCard(index, { front })}
                />
                <FaceEditor
                  label="Mặt sau"
                  face={card.back}
                  onChange={(back) => updateCard(index, { back })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addCard}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thẻ</span>
        </button>
      </div>
    </div>
  );
}
