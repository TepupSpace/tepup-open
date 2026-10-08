'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ALargeSmall, Minus, Plus, Sun, Moon, MonitorSmartphone } from 'lucide-react';
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_EVENT,
  READER_SIZES,
  applyReaderPrefs,
  readReaderPrefs,
  writeReaderPrefs,
  type ReaderPrefs,
  type ReaderTheme,
} from '@/lib/reader-prefs';

const THEMES: { value: ReaderTheme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Sáng', Icon: Sun },
  { value: 'dark', label: 'Tối', Icon: Moon },
  { value: 'system', label: 'Theo máy', Icon: MonitorSmartphone },
];

const FONTS: { value: ReaderPrefs['font']; label: string; hint: string; sampleClass: string }[] = [
  { value: 'default', label: 'Mặc định', hint: 'Geist', sampleClass: 'font-sans' },
  { value: 'readable', label: 'Dễ đọc', hint: 'Andika', sampleClass: 'font-[family-name:var(--font-andika)]' },
];

/** Ô lựa chọn dạng nút: radio thật (bàn phím, trình đọc màn hình) mặc áo nút bấm. */
const choiceClass =
  'flex-1 flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-sm cursor-pointer transition-colors ' +
  'border-gray-200 text-gray-700 hover:bg-gray-50 ' +
  'has-[:checked]:border-gray-900 has-[:checked]:bg-gray-900 has-[:checked]:text-white ' +
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 has-[:focus-visible]:ring-offset-2';

/**
 * Nút "Aa" mở bảng tuỳ chọn đọc: giao diện sáng/tối, phông dễ đọc, cỡ chữ. Dùng ở
 * thanh đầu trình phát bài và đầu trang khoá học/câu chuyện.
 */
export default function ReaderSettings({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // Đọc localStorage ngay khi khởi tạo ở trình duyệt (server dùng mặc định). Không
  // lệch hydrate: mọi thứ phụ thuộc `prefs` chỉ render khi bảng đã mở.
  const [prefs, setPrefs] = useState<ReaderPrefs>(() =>
    typeof window === 'undefined' ? DEFAULT_READER_PREFS : readReaderPrefs(),
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const name = useId();

  // Đồng bộ khi nút "Aa" khác trên trang (hoặc tab khác cùng phiên) đổi tuỳ chọn.
  useEffect(() => {
    const onChange = (e: Event) => setPrefs((e as CustomEvent<ReaderPrefs>).detail);
    window.addEventListener(READER_PREFS_EVENT, onChange);
    return () => window.removeEventListener(READER_PREFS_EVENT, onChange);
  }, []);

  // "Theo máy": máy đổi sáng/tối giữa chừng thì trang đổi theo.
  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onSystemChange = () => applyReaderPrefs(prefs);
    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  }, [prefs]);

  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    writeReaderPrefs(next);
  }, [prefs]);

  // Đóng khi bấm ra ngoài, hoặc Esc khi focus đang ở trong bảng/nút "Aa" (Esc trả focus về
  // nút). Esc ở chỗ khác thuộc về hộp thoại khác, không được cướp focus.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !wrapRef.current?.contains(document.activeElement)) return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    // Tab ra khỏi bảng thì đóng lại, để bảng không che nội dung người dùng vừa tab tới.
    const onFocusIn = (e: FocusEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open]);

  const sizeLabel = READER_SIZES.find((s) => s.step === prefs.size)?.label ?? '100%';

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Tuỳ chọn đọc: giao diện, phông chữ, cỡ chữ"
        title="Tuỳ chọn đọc"
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <ALargeSmall className="w-6 h-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={panelId}
          // Bảng mở rộng không chặn (disclosure), nằm ngay sau nút "Aa" trong thứ tự Tab.
          role="group"
          aria-label="Tuỳ chọn đọc"
          className="absolute right-0 top-full mt-2 z-[61] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl text-gray-900"
        >
          <fieldset>
            <legend className="text-sm font-semibold mb-2">Giao diện</legend>
            <div className="flex gap-2">
              {THEMES.map(({ value, label, Icon }) => (
                <label key={value} className={choiceClass}>
                  <input
                    type="radio"
                    name={`${name}-theme`}
                    value={value}
                    checked={prefs.theme === value}
                    onChange={() => update({ theme: value })}
                    className="sr-only"
                  />
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold mb-2">Phông chữ</legend>
            <div className="flex gap-2">
              {FONTS.map(({ value, label, hint, sampleClass }) => (
                <label key={value} className={choiceClass}>
                  <input
                    type="radio"
                    name={`${name}-font`}
                    value={value}
                    checked={prefs.font === value}
                    onChange={() => update({ font: value })}
                    className="sr-only"
                  />
                  <span className={`text-xl leading-none ${sampleClass}`} aria-hidden="true">
                    Aă
                  </span>
                  <span>
                    {label} <span>· {hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span id={`${name}-size`} className="text-sm font-semibold">
                Cỡ chữ
              </span>
              <output aria-live="polite" className="text-sm text-gray-600">
                {sizeLabel}
              </output>
            </div>
            <div className="flex items-center gap-3" role="group" aria-labelledby={`${name}-size`}>
              <button
                type="button"
                // aria-disabled thay vì disabled: tới giới hạn thì nút không đánh rơi focus.
                onClick={() => prefs.size > 1 && update({ size: prefs.size - 1 })}
                aria-disabled={prefs.size <= 1}
                aria-label="Giảm cỡ chữ"
                className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              {/* Thang 5 bậc; chấm đậm là bậc hiện tại. Chỉ để nhìn — nút +/− mới là điều khiển. */}
              <div className="flex-1 flex items-center justify-between px-1" aria-hidden="true">
                {READER_SIZES.map(({ step }) => (
                  <span
                    key={step}
                    className={`rounded-full transition-colors ${
                      step <= prefs.size ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                    style={{ width: 4 + step * 2, height: 4 + step * 2 }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => prefs.size < 5 && update({ size: prefs.size + 1 })}
                aria-disabled={prefs.size >= 5}
                aria-label="Tăng cỡ chữ"
                className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => update(DEFAULT_READER_PREFS)}
            className="mt-4 text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            Về mặc định
          </button>
        </div>
      )}
    </div>
  );
}
