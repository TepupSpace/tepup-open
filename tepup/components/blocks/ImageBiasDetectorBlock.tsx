'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, ScanSearch, X } from 'lucide-react';
import type { ImageBiasDetectorBlock as ImageBiasDetectorBlockType } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { NO_BIAS, NO_BIAS_LABEL, judge, type Verdict } from '@/lib/blocks/bias-detector';
import { BlockedMedia } from '@/components/learn/BlockedMedia';
import BlockShell from './BlockShell';
import { useAnnouncer, useFocusAfterRender } from './useAnnouncer';

interface Props {
  block: ImageBiasDetectorBlockType;
  onComplete?: () => void;
}

const VERDICT_TAG: Record<Verdict, string> = {
  correct: 'Đúng',
  'wrong-type': 'Sai loại',
  missed: 'Bỏ sót',
  'false-alarm': 'Bắt nhầm',
  clear: '',
};

const VERDICT_BOX: Record<Verdict, string> = {
  correct: 'border-[3px] border-solid border-green-600 bg-green-500/15',
  'wrong-type': 'border-[3px] border-solid border-red-600 bg-red-500/15',
  missed: 'border-[3px] border-dashed border-red-600 bg-red-500/10',
  'false-alarm': 'border-[3px] border-solid border-orange-600 bg-orange-500/15',
  clear: 'border-0',
};

/**
 * Soi thiên kiến trên hình: chạm vào một vùng của ảnh, chọn loại thiên kiến (hoặc
 * "Không có lỗi"). Danh sách lựa chọn mở thành một khung ngay dưới ảnh (không nổi đè
 * lên ảnh), focus chuyển vào đó và Escape trả về vùng vừa chạm.
 */
export default function ImageBiasDetectorBlockComponent({ block, onComplete }: Props) {
  const find = block.mode === 'find';
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [message, announce] = useAnnouncer();
  const regionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const focusAfterRender = useFocusAfterRender();

  const regions = block.regions;
  const hasNoBias = regions.some((r) => r.biasType === NO_BIAS);
  const options = useMemo(
    () => (hasNoBias || find ? [...block.biasOptions, { id: NO_BIAS, label: NO_BIAS_LABEL }] : block.biasOptions),
    [block.biasOptions, hasNoBias, find]
  );
  const labelOf = (id: string | undefined) => options.find((o) => o.id === id)?.label ?? id ?? '';
  const numberOf = (id: string) => regions.findIndex((r) => r.id === id) + 1;

  // Ở chế độ tự tìm, chọn "Không có lỗi" = không đánh dấu vùng đó.
  const marked = (id: string) => (find ? picks[id] && picks[id] !== NO_BIAS : Boolean(picks[id]));
  const pickedCount = regions.filter((r) => marked(r.id)).length;
  const ready = find ? pickedCount > 0 : regions.length > 0 && pickedCount === regions.length;

  const verdicts = useMemo(() => {
    const out: Record<string, Verdict> = {};
    regions.forEach((r) => {
      const p = picks[r.id];
      out[r.id] = judge(r.biasType, find && p === NO_BIAS ? undefined : p);
    });
    return out;
  }, [regions, picks, find]);
  const count = (v: Verdict) => regions.filter((r) => verdicts[r.id] === v).length;
  const biasRegions = regions.filter((r) => r.biasType !== NO_BIAS).length;

  const openRegion = (id: string) => {
    if (checked) return;
    if (active === id) {
      setActive(null);
      return;
    }
    setActive(id);
    focusAfterRender(() => panelRef.current?.querySelector<HTMLElement>('button') ?? null);
  };

  const closePanel = () => {
    const id = active;
    setActive(null);
    if (id) regionRefs.current[id]?.focus();
  };

  const pick = (optionId: string | null) => {
    if (!active) return;
    const region = regions.find((r) => r.id === active)!;
    setPicks((prev) => {
      const next = { ...prev };
      if (optionId) next[active] = optionId;
      else delete next[active];
      return next;
    });
    const n = regions.filter((r) => {
      const v = r.id === active ? optionId ?? undefined : picks[r.id];
      return find ? v && v !== NO_BIAS : Boolean(v);
    }).length;
    announce(
      `${region.label}: ${optionId ? `đã chọn ${labelOf(optionId)}` : 'đã bỏ chọn'}. ${
        find ? `Đã đánh dấu ${n} vùng.` : `Đã xét ${n}/${regions.length} vùng.`
      }`
    );
    closePanel();
  };

  const handleCheck = () => {
    setChecked(true);
    setActive(null);
    onComplete?.();
    focusAfterRender(() => summaryRef.current);
  };

  const handleReset = () => {
    setPicks({});
    setChecked(false);
    announce('Đã làm lại từ đầu.');
    const first = regions[0]?.id;
    focusAfterRender(() => (first ? regionRefs.current[first] : null));
  };

  const imageOk = Boolean(block.image.src) && isAllowedMediaUrl(block.image.src);
  const activeRegion = regions.find((r) => r.id === active);
  const allRight = find ? count('correct') === biasRegions && count('false-alarm') === 0 : count('correct') === regions.length;

  const regionLook = (id: string) => {
    if (checked) return VERDICT_BOX[verdicts[id]];
    if (active === id) return 'border-[3px] border-solid border-amber-600 bg-amber-400/25';
    if (marked(id)) return 'border-[3px] border-solid border-amber-600 bg-amber-400/15';
    if (!find && picks[id]) return 'border-[3px] border-solid border-gray-600 bg-gray-400/10';
    return find ? 'border-0' : 'border-[3px] border-dashed border-amber-600 hover:bg-amber-400/15';
  };

  const showBadge = (id: string) => !find || marked(id) || (checked && verdicts[id] !== 'clear');

  return (
    <BlockShell skin="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="mb-3 flex items-center gap-2">
        <ScanSearch className="h-6 w-6 text-yellow-700" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-900">{block.title || 'Soi thiên kiến trong hình'}</h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">{renderInlineMarkdown(block.instruction)}</p>

      {!imageOk ? (
        <BlockedMedia kind="image" label={block.image.alt} />
      ) : (
        <figure className="mb-4">
          {/* Màn hẹp: ảnh giữ tối thiểu 40rem để chữ trong ảnh còn đọc được, vuốt ngang trong khung
              (trang không cuộn ngang). Vùng tính bằng % nên vẫn khớp. */}
          <div className="overflow-x-auto rounded-xl">
          <div
            className={`relative min-w-[40rem] overflow-hidden rounded-xl border border-yellow-100 bg-white ${find && !checked ? 'cursor-crosshair' : ''}`}
            role="group"
            aria-label={`Hình: ${block.image.alt}. ${regions.length} vùng để xét.`}
          >
            {/* Ảnh tải lên Supabase Storage; next/image không khai remotePatterns, nên dùng <img> như ImageBlock. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.image.src} alt="" className="block h-auto w-full select-none" draggable={false} />
            {regions.map((r, i) => (
              <button
                key={r.id}
                ref={(el) => {
                  regionRefs.current[r.id] = el;
                }}
                type="button"
                aria-disabled={checked || undefined}
                aria-expanded={checked ? undefined : active === r.id}
                aria-label={`Vùng ${i + 1}: ${r.label}${
                  checked
                    ? verdicts[r.id] !== 'clear'
                      ? `. ${VERDICT_TAG[verdicts[r.id]]}`
                      : ''
                    : picks[r.id]
                      ? `. Đã chọn: ${labelOf(picks[r.id])}`
                      : ''
                }`}
                onClick={() => openRegion(r.id)}
                onKeyDown={(e) => e.key === 'Escape' && active === r.id && closePanel()}
                style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
                className={`absolute rounded-md transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700 ${regionLook(r.id)} ${checked ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {showBadge(r.id) && (
                  <span
                    aria-hidden="true"
                    className={`absolute ${r.x >= 5 ? 'right-full top-0 mr-1' : 'left-1 top-1'} inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1 text-xs font-bold text-white shadow ${
                      checked
                        ? verdicts[r.id] === 'correct'
                          ? 'bg-green-700'
                          : verdicts[r.id] === 'false-alarm'
                            ? 'bg-orange-700'
                            : 'bg-red-700'
                        : 'bg-amber-700'
                    }`}
                  >
                    {checked && verdicts[r.id] !== 'clear' ? (
                      verdicts[r.id] === 'correct' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
          </div>
          {regions.length > 0 && <p className="mt-1 text-xs text-gray-600 sm:hidden">Vuốt ngang để xem hết hình.</p>}
          {block.image.caption && <figcaption className="mt-2 text-xs italic text-gray-500">{block.image.caption}</figcaption>}
        </figure>
      )}

      {activeRegion && !checked && (
        <div
          ref={panelRef}
          role="group"
          aria-label={`Chọn loại cho vùng ${numberOf(activeRegion.id)}: ${activeRegion.label}`}
          className="mb-4 rounded-xl border-2 border-amber-300 bg-white p-3"
        >
          <p className="mb-2 text-sm font-semibold text-gray-900">
            Vùng {numberOf(activeRegion.id)}: {activeRegion.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={picks[activeRegion.id] === o.id}
                onClick={() => pick(o.id)}
                onKeyDown={(e) => e.key === 'Escape' && closePanel()}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${
                  picks[activeRegion.id] === o.id
                    ? 'border-amber-600 bg-amber-100 font-medium text-amber-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </button>
            ))}
            {picks[activeRegion.id] && (
              <button
                type="button"
                onClick={() => pick(null)}
                onKeyDown={(e) => e.key === 'Escape' && closePanel()}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 underline hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                Bỏ chọn
              </button>
            )}
          </div>
        </div>
      )}

      {!checked && (
        <>
          {pickedCount > 0 && (
            <ul className="mb-3 space-y-1 text-sm text-gray-700">
              {regions
                .filter((r) => marked(r.id) || (!find && picks[r.id]))
                .map((r) => (
                  <li key={r.id}>
                    <span className="font-semibold">{numberOf(r.id)}.</span> {r.label}: <span className="font-medium text-amber-900">{labelOf(picks[r.id])}</span>
                  </li>
                ))}
            </ul>
          )}
          <p className="mb-3 text-xs text-gray-600">
            {find
              ? 'Chạm vào phần nào của hình bạn cho là có lỗi, rồi chọn loại lỗi. Phần không chạm vào được coi là không có lỗi.'
              : `Chạm vào từng vùng được đánh số rồi chọn loại${hasNoBias ? ', hoặc "Không có lỗi"' : ''}.`}
          </p>
          {ready ? (
            <button
              type="button"
              onClick={handleCheck}
              className="w-full rounded-xl bg-yellow-700 py-3 font-semibold text-white transition-colors hover:bg-yellow-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-800 focus-visible:ring-offset-2"
            >
              {find ? `Kiểm tra (${pickedCount} vùng đã đánh dấu)` : `Kiểm tra tất cả (${regions.length} vùng)`}
            </button>
          ) : (
            <p className="text-center text-sm text-gray-600">
              {find ? 'Chưa đánh dấu vùng nào' : `Đã xét ${pickedCount}/${regions.length} vùng`}
            </p>
          )}
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {checked && (
        <div className="space-y-3">
          <div
            ref={summaryRef}
            tabIndex={-1}
            className={`rounded-xl border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${allRight ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}
          >
            {find ? (
              <>
                <p className={`font-semibold ${allRight ? 'text-green-800' : 'text-blue-800'}`}>
                  Bắt đúng {count('correct')}/{biasRegions} chỗ có lỗi
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {count('wrong-type') > 0 && <li>Nhận ra chỗ có lỗi nhưng chọn sai loại: {count('wrong-type')}</li>}
                  <li>Bỏ sót: {count('missed')}</li>
                  <li>Bắt nhầm (chỗ không có lỗi): {count('false-alarm')}</li>
                </ul>
              </>
            ) : (
              <p className={`font-semibold ${allRight ? 'text-green-800' : 'text-blue-800'}`}>
                Kết quả: {count('correct')}/{regions.length} đúng
              </p>
            )}
            <span className="sr-only">Giải thích từng vùng ở bên dưới.</span>
          </div>

          {regions
            .filter((r) => verdicts[r.id] !== 'clear')
            .map((r) => {
              const v = verdicts[r.id];
              const good = v === 'correct';
              return (
                <div key={r.id} className={`rounded-xl border p-3 ${good ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <p className="text-sm">
                    <span className={`font-semibold ${good ? 'text-green-800' : 'text-red-800'}`}>
                      {good ? <Check className="mr-1 inline h-4 w-4" aria-hidden="true" /> : <X className="mr-1 inline h-4 w-4" aria-hidden="true" />}
                      {VERDICT_TAG[v]}
                    </span>
                    <span className="text-gray-700">
                      {' '}
                      · Vùng {numberOf(r.id)}, {r.label} · Đáp án:{' '}
                    </span>
                    <span className="font-semibold text-gray-900">{labelOf(r.biasType)}</span>
                    {v !== 'correct' && picks[r.id] && <span className="text-gray-700"> (bạn chọn: {labelOf(picks[r.id])})</span>}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{renderInlineMarkdown(r.explanation)}</p>
                </div>
              );
            })}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Làm lại
          </button>
        </div>
      )}
    </BlockShell>
  );
}
