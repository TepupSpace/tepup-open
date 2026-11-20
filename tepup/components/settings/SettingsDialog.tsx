'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { Settings, X, Sun, Moon, MonitorSmartphone, Minus, Plus, RefreshCw } from 'lucide-react';
import { REFRESH_NOW_EVENT } from '@/components/pwa/FreshContent';
import InstallGuide from './InstallGuide';
import TrackingToggle from '@/components/analytics/TrackingToggle';
import { OPEN_SETTINGS_EVENT, type SettingsSection } from '@/lib/pwa/platform';
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_EVENT,
  READER_SIZES,
  readReaderPrefs,
  writeReaderPrefs,
  type ReaderPrefs,
  type ReaderTheme,
} from '@/lib/reader-prefs';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import './settings.css';

const THEMES: { value: ReaderTheme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Sáng', Icon: Sun },
  { value: 'dark', label: 'Tối', Icon: Moon },
  { value: 'system', label: 'Theo máy', Icon: MonitorSmartphone },
];

/** Tuỳ chọn đọc: cùng dữ liệu với nút "Aa" trong trang học (lib/reader-prefs). */
function ReadingPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(() =>
    typeof window === 'undefined' ? DEFAULT_READER_PREFS : readReaderPrefs(),
  );
  const name = useId();

  useEffect(() => {
    const onChange = (e: Event) => setPrefs((e as CustomEvent<ReaderPrefs>).detail);
    window.addEventListener(READER_PREFS_EVENT, onChange);
    return () => window.removeEventListener(READER_PREFS_EVENT, onChange);
  }, []);

  const update = useCallback(
    (patch: Partial<ReaderPrefs>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      writeReaderPrefs(next);
    },
    [prefs],
  );

  const sizeLabel = READER_SIZES.find((s) => s.step === prefs.size)?.label ?? '100%';

  return (
    <div className="st-prefs">
      <p className="st-hint">Áp dụng cho trang học, thư viện và trang khoá học.</p>
      <fieldset className="st-field">
        <legend>Giao diện</legend>
        <div className="st-choices">
          {THEMES.map(({ value, label, Icon }) => (
            <label key={value} className="st-choice">
              <input
                type="radio"
                name={`${name}-theme`}
                value={value}
                checked={prefs.theme === value}
                onChange={() => update({ theme: value })}
              />
              <Icon aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="st-field">
        <legend>Phông chữ</legend>
        <div className="st-choices">
          <label className="st-choice">
            <input
              type="radio"
              name={`${name}-font`}
              checked={prefs.font === 'default'}
              onChange={() => update({ font: 'default' })}
            />
            Mặc định
          </label>
          <label className="st-choice">
            <input
              type="radio"
              name={`${name}-font`}
              checked={prefs.font === 'readable'}
              onChange={() => update({ font: 'readable' })}
            />
            Dễ đọc (Andika)
          </label>
        </div>
      </fieldset>
      <div className="st-field">
        <span className="st-legend" id={`${name}-size`}>
          Cỡ chữ
        </span>
        <div className="st-size" role="group" aria-labelledby={`${name}-size`}>
          <button
            type="button"
            className="st-round"
            aria-label="Giảm cỡ chữ"
            aria-disabled={prefs.size <= 1}
            onClick={() => prefs.size > 1 && update({ size: prefs.size - 1 })}
          >
            <Minus aria-hidden="true" />
          </button>
          <output aria-live="polite">{sizeLabel}</output>
          <button
            type="button"
            className="st-round"
            aria-label="Tăng cỡ chữ"
            aria-disabled={prefs.size >= 5}
            onClick={() => prefs.size < 5 && update({ size: prefs.size + 1 })}
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Nút ⚙ ở góc trên bên phải header (trang giấy, landing) và bảng Cài đặt:
 * hướng dẫn cài Tépup về máy (iOS / Android), tuỳ chọn đọc và quyền riêng tư (số liệu ẩn danh).
 *
 * Mở từ chỗ khác bằng `openSettings('install')` (lib/pwa/platform). Hộp thoại
 * modal: focus vào nút đóng, Tab ở lại bên trong, Esc đóng, focus trả về nút ⚙.
 */
export default function SettingsDialog({ buttonClassName = 'st-open' }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SettingsSection>('install');
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Chạm trên điện thoại còn bắn thêm mousedown/click "giả" ~300ms sau, rơi trúng
  // nền tối vừa hiện dưới ngón tay → bảng vừa mở đã đóng. Bỏ qua trong lúc đó.
  const openedAt = useRef(0);
  const show = useCallback((s: SettingsSection) => {
    openedAt.current = performance.now();
    setSection(s);
    setOpen(true);
  }, []);
  const closeFromBackdrop = () => {
    if (performance.now() - openedAt.current > 450) setOpen(false);
  };

  useEffect(() => {
    const onOpen = (e: Event) => show((e as CustomEvent<SettingsSection>).detail ?? 'install');
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, [show]);

  // Cuộn tới phần được yêu cầu khi mở.
  useEffect(() => {
    // Phần cài đặt nằm đầu bảng sẵn rồi; chỉ cuộn khi mở thẳng tới phần khác.
    if (!open || section === 'install') return;
    requestAnimationFrame(() =>
      document.getElementById(`${titleId}-${section}`)?.scrollIntoView({ block: 'start' }),
    );
  }, [open, section, titleId]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        aria-label="Cài đặt"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Cài đặt"
        onClick={() => show('install')}
      >
        <Settings aria-hidden="true" />
      </button>

      {/* Portal ra <body>: header tạo lớp xếp chồng riêng (sticky + z-index), ở trong đó
          thì thanh tab đáy và nút cuộn sẽ đè lên bảng. */}
      {open && createPortal(
        <div className={`st-root ${fraunces.variable} ${beVietnam.variable}`}>
          <div className="st-backdrop" aria-hidden="true" onClick={closeFromBackdrop} />
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              clickOutsideDeactivates: false,
              initialFocus: `#${CSS.escape(`${titleId}-close`)}`,
              // Không đóng trong onDeactivate: StrictMode (dev) gỡ rồi gắn lại trap ngay khi
              // mở, gọi onDeactivate và đóng luôn bảng. Chỉ Esc mới đóng.
              escapeDeactivates: () => {
                setOpen(false);
                return true;
              },
              returnFocusOnDeactivate: true,
              setReturnFocus: () => buttonRef.current ?? false,
            }}
          >
            <div className="st-wrap">
              <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="st-dialog">
                <div className="st-head">
                  <h2 id={titleId}>Cài đặt</h2>
                  <button
                    id={`${titleId}-close`}
                    type="button"
                    className="st-round"
                    aria-label="Đóng cài đặt"
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className="st-body">
                  <section aria-labelledby={`${titleId}-install`} className="st-section">
                    <h3 id={`${titleId}-install`}>Cài Tépup về máy</h3>
                    <InstallGuide />
                  </section>
                  <section aria-labelledby={`${titleId}-refresh`} className="st-section">
                    <h3 id={`${titleId}-refresh`}>Nội dung mới</h3>
                    <p className="st-hint">
                      Tépup tự cập nhật khi bạn mở lại ứng dụng. Nếu vẫn thấy bài cũ, bấm để tải lại ngay.
                    </p>
                    <button
                      type="button"
                      className="ig-btn ig-btn--primary st-refresh"
                      onClick={() => window.dispatchEvent(new Event(REFRESH_NOW_EVENT))}
                    >
                      <RefreshCw aria-hidden="true" />
                      Tải nội dung mới nhất
                    </button>
                  </section>
                  <section aria-labelledby={`${titleId}-reading`} className="st-section">
                    <h3 id={`${titleId}-reading`}>Tuỳ chọn đọc</h3>
                    <ReadingPrefs />
                  </section>
                  <section aria-labelledby={`${titleId}-privacy`} className="st-section">
                    <h3 id={`${titleId}-privacy`}>Quyền riêng tư</h3>
                    <TrackingToggle />
                  </section>
                </div>
              </div>
            </div>
          </FocusTrap>
        </div>,
        document.body,
      )}
    </>
  );
}
