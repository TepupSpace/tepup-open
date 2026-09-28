'use client';

import { useRef, useState } from 'react';
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
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(body: BodyInit, isFormData: boolean) {
    setState('uploading');
    setErrorMsg('');
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
    } catch (err) {
      setErrorMsg((err as Error).message);
      setState('error');
    }
  }

  function uploadFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      <div className="flex items-start gap-4">
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
              ? 'border-blue-400 bg-blue-50'
              : value
              ? 'border-gray-200 bg-gray-100'
              : 'border-dashed border-gray-300 bg-gray-50'
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview URL tuỳ ý, không qua next/image
            <img src={value} alt="" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
          {state === 'uploading' && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setState('idle');
            }}
            onBlur={handleUrlBlur}
            placeholder="Dán URL ảnh hoặc chọn file"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={state === 'uploading'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Chọn file
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
                Bỏ ảnh
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                uploadFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          {state === 'error' && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Lỗi: {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
