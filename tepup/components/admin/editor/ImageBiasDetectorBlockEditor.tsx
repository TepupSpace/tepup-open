'use client';

import { useId, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ImageBiasDetectorBlock } from './types';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { useEditorMode } from './EditorModeContext';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { NO_BIAS, NO_BIAS_LABEL } from '@/lib/blocks/bias-detector';

interface Props {
  block: ImageBiasDetectorBlock;
  onChange: (block: ImageBiasDetectorBlock) => void;
}

type Region = ImageBiasDetectorBlock['regions'][number];

const inputClass =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const numClass =
  'w-16 px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export default function ImageBiasDetectorBlockEditor({ block, onChange }: Props) {
  const uid = useId();
  const canUpload = useEditorMode() === 'admin';
  const regions = block.regions ?? [];
  const options = block.biasOptions ?? [];
  const boxRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const set = (patch: Partial<ImageBiasDetectorBlock>) => onChange({ ...block, ...patch });
  const setRegion = (i: number, patch: Partial<Region>) =>
    set({ regions: regions.map((r, k) => (k === i ? { ...r, ...patch } : r)) });

  const addRegion = (r?: Partial<Region>) => {
    const id = `r${Date.now().toString(36)}${regions.length}`;
    set({
      regions: [
        ...regions,
        { id, label: '', x: 40, y: 40, w: 20, h: 20, biasType: options[0]?.id ?? NO_BIAS, explanation: '', ...r },
      ],
    });
    setSelected(id);
  };

  const pointAt = (e: React.PointerEvent) => {
    const rect = boxRef.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - rect.left) / rect.width) * 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100) };
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-region]')) return;
    const p = pointAt(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!draft) return;
    const p = pointAt(e);
    setDraft({ ...draft, x1: p.x, y1: p.y });
  };
  const onUp = () => {
    if (!draft) return;
    const x = Math.min(draft.x0, draft.x1);
    const y = Math.min(draft.y0, draft.y1);
    const w = Math.abs(draft.x1 - draft.x0);
    const h = Math.abs(draft.y1 - draft.y0);
    setDraft(null);
    if (w >= 2 && h >= 2) addRegion({ x: round1(x), y: round1(y), w: round1(w), h: round1(h) });
  };

  const showImage = Boolean(block.image?.src) && isAllowedMediaUrl(block.image.src);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${uid}-title`} className="mb-1 block text-sm font-medium text-gray-700">
          Tiêu đề
        </label>
        <input id={`${uid}-title`} type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-ins`} className="mb-1 block text-sm font-medium text-gray-700">
          Hướng dẫn
        </label>
        <input id={`${uid}-ins`} type="text" value={block.instruction ?? ''} onChange={(e) => set({ instruction: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-mode`} className="mb-1 block text-sm font-medium text-gray-700">
          Chế độ
        </label>
        <select
          id={`${uid}-mode`}
          value={block.mode ?? 'marked'}
          onChange={(e) => set({ mode: e.target.value as 'marked' | 'find' })}
          className={inputClass}
        >
          <option value="marked">Hiện vùng đánh số (người học xét từng vùng)</option>
          <option value="find">Ẩn vùng (người học tự tìm chỗ có lỗi)</option>
        </select>
      </div>

      {canUpload ? (
        <ImageUploadField
          label="Ảnh"
          hint="Ảnh ngang, chữ trong ảnh đủ lớn để đọc trên điện thoại."
          value={block.image?.src ?? ''}
          onChange={(src) => set({ image: { ...block.image, src } })}
        />
      ) : (
        <div>
          <label htmlFor={`${uid}-src`} className="mb-1 block text-sm font-medium text-gray-700">
            URL ảnh
          </label>
          <input id={`${uid}-src`} type="url" value={block.image?.src ?? ''} onChange={(e) => set({ image: { ...block.image, src: e.target.value } })} className={inputClass} />
          <p className="mt-1 text-xs text-gray-600">Chỉ dùng ảnh đã có trên kho của Tépup hoặc Wikimedia.</p>
        </div>
      )}
      <div>
        <label htmlFor={`${uid}-alt`} className="mb-1 block text-sm font-medium text-gray-700">
          Mô tả ảnh (alt), đọc cho người khiếm thị
        </label>
        <textarea id={`${uid}-alt`} rows={2} value={block.image?.alt ?? ''} onChange={(e) => set({ image: { ...block.image, alt: e.target.value } })} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-cap`} className="mb-1 block text-sm font-medium text-gray-700">
          Chú thích (tuỳ chọn)
        </label>
        <input id={`${uid}-cap`} type="text" value={block.image?.caption ?? ''} onChange={(e) => set({ image: { ...block.image, caption: e.target.value || undefined } })} className={inputClass} />
      </div>

      {/* Loại thiên kiến */}
      <div>
        <p id={`${uid}-opt`} className="mb-2 text-sm font-medium text-gray-700">
          Loại thiên kiến (người học chọn). &quot;{NO_BIAS_LABEL}&quot; tự thêm khi có vùng nhiễu, không cần khai.
        </p>
        <div role="group" aria-labelledby={`${uid}-opt`} className="space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Mã loại ${i + 1}`}
                value={o.id}
                onChange={(e) => set({ biasOptions: options.map((x, k) => (k === i ? { ...x, id: e.target.value } : x)) })}
                className="w-32 rounded-lg border border-gray-500 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                aria-label={`Nhãn loại ${i + 1}`}
                value={o.label}
                onChange={(e) => set({ biasOptions: options.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })}
                className={inputClass}
              />
              {options.length > 1 && (
                <button
                  type="button"
                  aria-label={`Xoá loại ${i + 1}`}
                  onClick={() => set({ biasOptions: options.filter((_, k) => k !== i) })}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set({ biasOptions: [...options, { id: `b${options.length + 1}`, label: '' }] })}
          className="mt-2 flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm loại
        </button>
      </div>

      {/* Vẽ vùng */}
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Vùng trên ảnh</p>
        <p className="mb-2 text-xs text-gray-600">
          Kéo chuột trên ảnh để vẽ một vùng mới, hoặc bấm &quot;Thêm vùng&quot; rồi nhập toạ độ (tính bằng % của ảnh). Thêm cả vùng
          không có lỗi để làm nhiễu.
        </p>
        {showImage ? (
          // Vẽ bằng chuột chỉ là lối tắt; bàn phím dùng nút "Thêm vùng" và các ô toạ độ bên dưới.
          <div
            ref={boxRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            className="relative mb-3 cursor-crosshair touch-none select-none overflow-hidden rounded-lg border border-gray-300"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.image.src} alt="" draggable={false} className="block h-auto w-full" />
            {regions.map((r, i) => (
              <button
                key={r.id}
                type="button"
                data-region
                aria-label={`Chọn vùng ${i + 1}${r.label ? `: ${r.label}` : ''}`}
                onClick={() => setSelected(r.id)}
                style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
                className={`absolute rounded border-2 ${
                  r.biasType === NO_BIAS ? 'border-dashed border-gray-600 bg-gray-400/10' : 'border-solid border-red-600 bg-red-500/10'
                } ${selected === r.id ? 'ring-4 ring-blue-600' : ''}`}
              >
                <span className="absolute -left-1 -top-1 rounded-full bg-gray-900 px-1.5 text-xs font-bold text-white">{i + 1}</span>
              </button>
            ))}
            {draft && (
              <div
                className="pointer-events-none absolute border-2 border-dashed border-blue-700 bg-blue-500/10"
                style={{
                  left: `${Math.min(draft.x0, draft.x1)}%`,
                  top: `${Math.min(draft.y0, draft.y1)}%`,
                  width: `${Math.abs(draft.x1 - draft.x0)}%`,
                  height: `${Math.abs(draft.y1 - draft.y0)}%`,
                }}
              />
            )}
          </div>
        ) : (
          <p className="mb-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">Chọn ảnh hợp lệ để vẽ vùng.</p>
        )}

        <div className="space-y-3">
          {regions.map((r, i) => (
            <div
              key={r.id}
              role="group"
              aria-label={`Vùng ${i + 1}`}
              className={`space-y-2 rounded-lg border p-3 ${selected === r.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{i + 1}.</span>
                <input
                  type="text"
                  aria-label={`Tên phần hình, vùng ${i + 1}`}
                  placeholder="Tên phần hình, VD: Giá gạch 890.000đ"
                  value={r.label}
                  onChange={(e) => setRegion(i, { label: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={`Xoá vùng ${i + 1}`}
                  onClick={() => set({ regions: regions.filter((_, k) => k !== i) })}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                {(['x', 'y', 'w', 'h'] as const).map((k) => (
                  <label key={k} className="flex items-center gap-1">
                    {k}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={r[k]}
                      onChange={(e) => setRegion(i, { [k]: clamp(Number(e.target.value)) })}
                      className={numClass}
                    />
                  </label>
                ))}
                <select
                  aria-label={`Đáp án của vùng ${i + 1}`}
                  value={r.biasType}
                  onChange={(e) => setRegion(i, { biasType: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-500 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label || o.id}
                    </option>
                  ))}
                  <option value={NO_BIAS}>{NO_BIAS_LABEL} (vùng nhiễu)</option>
                </select>
              </div>
              <textarea
                aria-label={`Giải thích vùng ${i + 1}`}
                placeholder="Giải thích, hiện sau khi người học kiểm tra"
                rows={2}
                value={r.explanation}
                onChange={(e) => setRegion(i, { explanation: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addRegion()} className="mt-2 flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm vùng
        </button>
      </div>
    </div>
  );
}
