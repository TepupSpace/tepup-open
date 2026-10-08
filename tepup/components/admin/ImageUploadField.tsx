'use client';

import { useId, useRef, useState } from 'react';
import { AlertCircle, ImageIcon, Loader2, Upload, X } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** Khung preview, vd. 'w-24 h-24 rounded-full' hoặc 'w-[110px] h-[140px] rounded-xl'. */
  previewClassName?: string;
}

/**
 * Ô ảnh cho form admin: chọn/kéo thả file hoặc dán URL, đều đẩy vào Supabase
 * Storage qua /api/admin/upload-image (cùng luồng với ImageBlockEditor).
 */
export default function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  previewClassName = 'w-24 h-24 rounded-xl',
}: ImageUploadFieldProps) {
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  // Always-mounted status line for screen readers ("đang tải", "đã tải"); errors use role="alert".
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const inputId = `${uid}-url`;
  const hintId = `${uid}-hint`;

  async function upload(body: BodyInit, isFormData: boolean) {
    setState('uploading');
    setErrorMsg('');
    setStatus('Đang tải ảnh lên…');
    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload thất bại');
      onChange(data.publicUrl);
      setState('idle');
      setStatus('Đã tải ảnh lên.');
    } catch (err) {
      setErrorMsg((err as Error).message);
      setState('error');
      setStatus('');
    }
  }

  function uploadFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Tệp này không phải ảnh.');
      setState('error');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    void upload(fd, true);
  }

  function handleUrlBlur() {
    if (!value || value.includes('supabase.co/storage')) return;
    void upload(JSON.stringify({ url: value }), false);
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 mb-2">
          {hint}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      <div className="flex items-start gap-4">
        {/* Drop target for a dragged file; the "Chọn file" button and the URL box are the
            keyboard alternatives. */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-and-drop target only, see above */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            uploadFile(e.dataTransfer.files[0]);
          }}
          className={`relative flex-shrink-0 overflow-hidden border-2 flex items-center justify-center ${previewClassName} ${
            isDragging
              ? 'border-blue-600 bg-blue-50'
              : value
              ? 'border-gray-200 bg-gray-100'
              : 'border-dashed border-gray-300 bg-gray-50'
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview URL tuỳ ý, không qua next/image
            <img src={value} alt="" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-500" aria-hidden="true" />
          )}
          {state === 'uploading' && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            id={inputId}
            type="url"
            aria-describedby={hint ? hintId : undefined}
            aria-invalid={state === 'error' || undefined}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setState('idle');
            }}
            onBlur={handleUrlBlur}
            placeholder="Dán URL ảnh hoặc chọn file"
            className="w-full px-4 py-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (state !== 'uploading') fileRef.current?.click();
              }}
              // aria-disabled, not disabled: focus stays on the button while the upload runs.
              aria-disabled={state === 'uploading'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-500 rounded-lg hover:bg-gray-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Chọn file
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setStatus('Đã bỏ ảnh.');
                  // The button disappears with the image: keep focus in the field.
                  document.getElementById(inputId)?.focus();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Bỏ ảnh
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              onChange={(e) => {
                uploadFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          {/* Always mounted, so the error is read when it appears. */}
          <div role="alert">
            {state === 'error' && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                Lỗi: {errorMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
