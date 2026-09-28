'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { ImageBlock } from './BlockEditor';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function ImageBlockEditor({
  block,
  onChange,
}: ImageBlockEditorProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    uploadToStorage(fd, true).catch(err => {
      setErrorMsg((err as Error).message);
      setUploadState('error');
    });
  };

  const handleUrlBlur = () => {
    if (!block.src) return;
    if (block.src.includes('supabase.co/storage')) return;
    uploadToStorage(JSON.stringify({ url: block.src }), false).catch(err => {
      setErrorMsg((err as Error).message);
      setUploadState('error');
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop zone / Preview */}
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
          <img
            src={block.src}
            alt={block.alt || 'Preview'}
            className="max-w-full h-auto rounded-lg"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">
              {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc nhập URL bên dưới'}
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

      {/* URL input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hoặc nhập URL hình ảnh
        </label>
        <input
          type="url"
          value={block.src}
          onChange={(e) => {
            onChange({ ...block, src: e.target.value });
            setUploadState('idle');
          }}
          onBlur={handleUrlBlur}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Upload status */}
        {uploadState === 'uploading' && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Loader2 className="animate-spin w-3 h-3" />
            Đang tải ảnh vào storage...
          </p>
        )}
        {uploadState === 'done' && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã lưu vào storage
          </p>
        )}
        {uploadState === 'error' && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Lỗi: {errorMsg}
          </p>
        )}
      </div>

      {/* Alt text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả (alt text) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Mô tả hình ảnh cho accessibility..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chú thích (tùy chọn)
        </label>
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) =>
            onChange({ ...block, caption: e.target.value || undefined })
          }
          placeholder="Chú thích hiển thị dưới hình..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
