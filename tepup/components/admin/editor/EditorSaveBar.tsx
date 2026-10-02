'use client';

/**
 * Thanh lưu dính đầu trang cho trình soạn bài học / chương.
 *
 * Chỉ hiển thị: không gọi API, không giữ state của editor. Trang cha (qua hook autosave)
 * truyền trạng thái vào và xử lý `onSaveDraft` / `onPublish` / `onDiscardDraft`.
 *
 * Bố cục: thanh nằm trong `<main className="p-6">` của admin layout, nên dùng
 * `-mx-6 -mt-6 px-6` để kéo sát mép và sát AdminHeader. Hãy đặt nó là phần tử đầu tiên
 * của trang (không có gì phía trên), và không bọc trong phần tử có `overflow` khác
 * `visible` (sticky sẽ không hoạt động).
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowLeft, Check, Loader2, Save, Upload } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import type { AutosaveStatus } from '@/lib/types/drafts';

export interface EditorSaveBarProps {
  backHref: string;
  /** VD: "Nội dung bài học" */
  title: string;
  /** VD: "Khoá học > Cấp độ > Bài học" (một dòng, bị cắt nếu dài) */
  breadcrumb?: ReactNode;
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  /** Lỗi lưu nháp (hiển thị cho người dùng) */
  error: string | null;
  /** Có bản nháp đã lưu khác với bản người học đang thấy */
  hasUnpublishedDraft: boolean;
  /** Khi tải trang và tiếp tục một bản nháp trên server */
  draftInfo?: { updatedBy: string | null; updatedAt: string } | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  publishing: boolean;
  publishDisabled?: boolean;
  /** Chú thích khi rê chuột / focus vào "Xuất bản" (mặc định: giải thích chung) */
  publishHint?: string;
  /** Chú thích khi rê chuột / focus vào "Lưu nháp" */
  saveDraftHint?: string;
  /** Chỉ hiện (nút chữ "Bỏ nháp") khi hasUnpublishedDraft */
  onDiscardDraft?: () => void;
  /** VD: nút "Xem trước" của trình soạn chương, hiển thị trước các nút lưu */
  extraActions?: ReactNode;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const DEFAULT_PUBLISH_HINT =
  'Xuất bản: đưa nội dung đang soạn lên cho người học xem (trang cập nhật trong vài phút).';
const DEFAULT_SAVE_HINT =
  'Lưu nháp: chỉ người quản trị thấy, người học không thấy. Nháp cũng tự lưu vài giây sau khi bạn ngừng gõ. Phím tắt: Ctrl+S.';

/**
 * Chú thích hiện ngay khi rê chuột hoặc focus bằng bàn phím (thuộc tính `title` của
 * trình duyệt hiện chậm và không hiện khi focus). Nút bên trong trỏ tới nó bằng
 * aria-describedby.
 */
function HoverTip({ id, text, children }: { id: string; text: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex shrink-0 group/tip">
      {children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-full mt-2 z-40 w-72 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-snug text-white shadow-lg whitespace-normal"
      >
        {text}
      </span>
    </span>
  );
}

function StatusText({
  status,
  lastSavedAt,
  error,
}: Pick<EditorSaveBarProps, 'status' | 'lastSavedAt' | 'error'>) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
        Đang lưu nháp…
      </span>
    );
  }
  if (status === 'error') {
    const text = `Chưa lưu được nháp${error ? `: ${error}` : ''}`;
    return (
      <span className="inline-flex items-center gap-1.5 min-w-0 text-red-600" title={text}>
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span className="truncate">{text}</span>
      </span>
    );
  }
  if (status === 'dirty') {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
        Có thay đổi chưa lưu
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        <Check className="w-3.5 h-3.5 text-green-600" aria-hidden />
        Đã lưu nháp lúc {formatTime(lastSavedAt)}
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        <Check className="w-3.5 h-3.5 text-green-600" aria-hidden />
        Đã lưu nháp
      </span>
    );
  }
  return null;
}

export default function EditorSaveBar({
  backHref,
  title,
  breadcrumb,
  status,
  lastSavedAt,
  error,
  hasUnpublishedDraft,
  draftInfo,
  onSaveDraft,
  onPublish,
  publishing,
  publishDisabled = false,
  publishHint = DEFAULT_PUBLISH_HINT,
  saveDraftHint = DEFAULT_SAVE_HINT,
  onDiscardDraft,
  extraActions,
}: EditorSaveBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const saveDisabled = status === 'saving' || publishing;

  // Bóng đổ chỉ khi thanh đã dính lên đầu viewport (trang cuộn bằng window).
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = barRef.current;
      if (!el) return;
      setStuck(window.scrollY > 0 && el.getBoundingClientRect().top <= 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Ctrl+S / Cmd+S ở bất kỳ đâu trên trang: lưu nháp thay vì hộp thoại lưu của trình duyệt.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== 's' && e.code !== 'KeyS') return;
      e.preventDefault();
      if (e.repeat || saveDisabled) return;
      onSaveDraft();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSaveDraft, saveDisabled]);

  const draftTooltip = draftInfo
    ? `Lưu bởi ${draftInfo.updatedBy ?? 'không rõ'} lúc ${formatDateTime(draftInfo.updatedAt)}`
    : 'Người học vẫn đang thấy phiên bản cũ cho đến khi bạn xuất bản';

  return (
    <div
      ref={barRef}
      className={`sticky top-0 z-30 -mx-6 -mt-6 mb-6 px-6 py-2 min-h-16 flex items-center justify-between gap-4 bg-white/95 backdrop-blur border-b border-gray-200 transition-shadow ${
        stuck ? 'shadow-sm' : ''
      }`}
    >
      {/* Trái: quay lại, tiêu đề, breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href={backHref}
          aria-label="Quay lại"
          className="p-2 -ml-2 shrink-0 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{breadcrumb}</p>
          )}
        </div>
      </div>

      {/* Phải: trạng thái, bản nháp, hành động */}
      <div className="flex items-center gap-3 min-w-0">
        <div aria-live="polite" className="text-xs min-w-0 max-w-64 flex whitespace-nowrap">
          <StatusText status={status} lastSavedAt={lastSavedAt} error={error} />
        </div>

        {hasUnpublishedDraft && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              title={draftTooltip}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium whitespace-nowrap"
            >
              Bản nháp chưa xuất bản
            </span>
            {onDiscardDraft && (
              <button
                type="button"
                onClick={onDiscardDraft}
                disabled={publishing || status === 'saving'}
                className="text-xs text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline disabled:hover:text-gray-500 whitespace-nowrap"
              >
                Bỏ nháp
              </button>
            )}
          </div>
        )}

        {extraActions}

        <HoverTip id="editor-save-draft-hint" text={saveDraftHint}>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saveDisabled}
            aria-describedby="editor-save-draft-hint"
            className="flex items-center gap-2 px-4 py-2 shrink-0 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Lưu nháp</span>
          </button>
        </HoverTip>
        <HoverTip id="editor-publish-hint" text={publishHint}>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || publishDisabled}
            aria-describedby="editor-publish-hint"
            className="flex items-center gap-2 px-4 py-2 shrink-0 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-colors whitespace-nowrap"
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{publishing ? 'Đang xuất bản…' : 'Xuất bản'}</span>
          </button>
        </HoverTip>
      </div>
    </div>
  );
}
