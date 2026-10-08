'use client';

import { useId, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import type { ImageBlock } from './BlockEditor';
import { useEditorMode, CONTRIBUTOR_NO_UPLOAD_MESSAGE } from './EditorModeContext';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function ImageBlockEditor({
  block,
  onChange,
}: ImageBlockEditorProps) {
  const uid = useId();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Contributors can't upload (admin-only endpoint): URL only, no drop, no re-hosting.
  const canUpload = useEditorMode() === 'admin';

  const uploadToStorage = async (body: BodyInit, isFormData: boolean) => {
    setUploadState('uploading');
    setErrorMsg('');
    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    onChange({ ...block, src: data.publicUrl });
    setUploadState('done');
  };

  const uploadFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    uploadToStorage(fd, true).catch(err => {
      setErrorMsg((err as Error).message);
      setUploadState('error');
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canUpload) {
      setErrorMsg(CONTRIBUTOR_NO_UPLOAD_MESSAGE);
      setUploadState('error');
      return;
    }
    uploadFile(e.dataTransfer.files[0]);
  };

  const handleUrlBlur = () => {
    if (!block.src || !canUpload) return;
    if (block.src.includes('supabase.co/storage')) return;
    uploadToStorage(JSON.stringify({ url: block.src }), false).catch(err => {
      setErrorMsg((err as Error).message);
      setUploadState('error');
    });
  };

  // Read out by the always-mounted live region below (the visible lines are mounted with their text).
  const statusMessage =
    uploadState === 'uploading'
      ? 'Đang tải ảnh vào storage...'
      : uploadState === 'done'
      ? 'Đã lưu vào storage'
      : uploadState === 'error'
      ? `Lỗi: ${errorMsg}`
      : '';

  return (
    <div className="space-y-4">
      {/* Drop zone / Preview. Dropping a file is a pointer-only shortcut: keyboard users have
          the "Chọn ảnh từ máy" button and the URL field below. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-and-drop target only, not clickable; keyboard alternative is the file button and URL field */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 transition-colors overflow-hidden ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : block.src
            ? 'border-gray-200 bg-transparent'
            : 'border-dashed border-gray-300 bg-gray-50'
        }`}
      >
        {block.src ? (
          // onError is an image-load event (hides a broken preview), not a user interaction.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element -- see above; arbitrary external URLs, so no next/image
          <img
            src={block.src}
            alt={block.alt || 'Ảnh xem trước'}
            className="max-w-full h-auto rounded-lg"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm">
              {!canUpload ? 'Nhập URL ảnh bên dưới' : isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh, chọn ảnh từ máy hoặc nhập URL bên dưới'}
            </p>
          </div>
        )}
        {isDragging && block.src && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <p className="text-blue-700 font-medium text-sm bg-white/80 px-3 py-1 rounded-lg">
              Thả để thay thế ảnh
            </p>
          </div>
        )}
      </div>

      {/* Keyboard / tap alternative to dropping a file (admins only, like the drop zone). */}
      {canUpload && (
        <div>
          <button
            type="button"
            onClick={() => {
              if (uploadState === 'uploading') return;
              fileRef.current?.click();
            }}
            aria-disabled={uploadState === 'uploading'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-500 rounded-lg hover:bg-gray-50 aria-disabled:opacity-50"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Chọn ảnh từ máy
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              uploadFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* URL input */}
      <div>
        <label htmlFor={`${uid}-src`} className="block text-sm font-medium text-gray-700 mb-1">
          Hoặc nhập URL hình ảnh
        </label>
        <input
          id={`${uid}-src`}
          type="url"
          value={block.src}
          onChange={(e) => {
            onChange({ ...block, src: e.target.value });
            setUploadState('idle');
          }}
          onBlur={handleUrlBlur}
          aria-describedby={!canUpload ? `${uid}-src-hint` : undefined}
          placeholder={canUpload ? 'https://example.com/image.jpg' : 'https://upload.wikimedia.org/wikipedia/…'}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {!canUpload && <p id={`${uid}-src-hint`} className="text-xs text-gray-500 mt-1">{CONTRIBUTOR_NO_UPLOAD_MESSAGE}</p>}
        <p className="sr-only" aria-live="polite">{statusMessage}</p>
        {/* Upload status */}
        {uploadState === 'uploading' && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Loader2 className="animate-spin w-3 h-3" aria-hidden="true" />
            Đang tải ảnh vào storage...
          </p>
        )}
        {uploadState === 'done' && (
          <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            Đã lưu vào storage
          </p>
        )}
        {uploadState === 'error' && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            Lỗi: {errorMsg}
          </p>
        )}
      </div>

      {/* Alt text */}
      <div>
        <label htmlFor={`${uid}-alt`} className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả (alt text) <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-alt`}
          type="text"
          aria-required="true"
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Mô tả hình ảnh cho accessibility..."
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Caption */}
      <div>
        <label htmlFor={`${uid}-caption`} className="block text-sm font-medium text-gray-700 mb-1">
          Chú thích (tùy chọn)
        </label>
        <input
          id={`${uid}-caption`}
          type="text"
          value={block.caption || ''}
          onChange={(e) =>
            onChange({ ...block, caption: e.target.value || undefined })
          }
          placeholder="Chú thích hiển thị dưới hình..."
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
