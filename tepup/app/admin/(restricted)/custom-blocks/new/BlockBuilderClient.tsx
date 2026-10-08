'use client';

import { useState, useRef, useEffect, useId, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import {
  ChevronLeft,
  Sparkles,
  Loader2,
  Eye,
  Code2,
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SandpackProvider, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import type { CustomBlockTypeConfig } from '@/lib/types/custom-block';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import AdminDialog from '../../../_components/AdminDialog';
import ConfirmDialog from '../../../_components/ConfirmDialog';
import { FormError } from '../../../_components/form';

/** Tên khung xem trước: Sandpack đặt cứng title "Sandpack Preview" (tiếng Anh) cho iframe. */
function previewLabel(config: CustomBlockTypeConfig) {
  return `Xem trước block: ${config.name || 'chưa đặt tên'}`;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// ─── Sandpack live preview ─────────────────────────────────────────────────────

function SandpackStatusListener({ onReady, onError }: { onReady: () => void; onError: (msg: string) => void }) {
  const { sandpack } = useSandpack();
  useEffect(() => {
    if (sandpack.status === 'running') onReady();
    else if (sandpack.status === 'timeout') onError('Sandpack bundler bị timeout. Thử tải lại.');
  }, [sandpack.status, onReady, onError]);
  return null;
}

function BlockPreview({ config }: { config: CustomBlockTypeConfig }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [key, setKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const label = previewLabel(config);

  // Đặt tên cho iframe của Sandpack (như CustomBlock ở trang học). Theo dõi luôn vì
  // Sandpack có thể dựng lại iframe khi tải lại.
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    const apply = () => {
      const frame = root.querySelector('iframe');
      if (frame && frame.getAttribute('title') !== label) frame.setAttribute('title', label);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });
    return () => observer.disconnect();
  }, [label, key]);

  // Reset status when config changes
  useEffect(() => {
    setStatus('loading');
    setErrorMsg('');
    setKey(k => k + 1);
  }, [config]);

  // Timeout fallback: 60s
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error');
        setErrorMsg('Sandpack tải quá lâu (>60s). Kiểm tra mạng và thử lại.');
      }
    }, 60000);
    return () => clearTimeout(timer);
  }, [status, key]);

  if (!config.files?.['/App.jsx']) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Block chưa có /App.jsx
      </div>
    );
  }

  // Inject empty __BLOCK_FIELDS + custom index.js
  // Rename /App.jsx → /App.js so it overrides the Sandpack react template default /App.js
  const files: Record<string, string> = {};
  for (const [k, v] of Object.entries(config.files)) {
    files[k === '/App.jsx' ? '/App.js' : k] = v as string;
  }
  // Mẫu react của Sandpack khai báo <html lang="en">: trình đọc màn hình sẽ đọc tiếng Việt
  // bằng luật phát âm tiếng Anh. Block có file riêng thì giữ nguyên.
  if (!files['/public/index.html']) {
    files['/public/index.html'] =
      `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(label)}</title></head><body><div id="root"></div></body></html>`;
  }
  files['/index.js'] = [
    "window.__BLOCK_FIELDS = {};",
    "import React, { StrictMode } from 'react';",
    "import { createRoot } from 'react-dom/client';",
    "import App from './App';",
    "const root = createRoot(document.getElementById('root'));",
    "root.render(React.createElement(StrictMode, null, React.createElement(App)));",
  ].join('\n');

  const handleRetry = () => {
    setStatus('loading');
    setErrorMsg('');
    setKey(k => k + 1);
  };

  return (
    <div ref={previewRef} className="h-full overflow-hidden rounded-2xl border border-gray-200 relative">
      <div role="status" className="empty:hidden">
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Đang khởi động khung xem trước (Sandpack)...</p>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div role="alert" className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white gap-3">
          <AlertCircle className="w-10 h-10 text-red-600" />
          <p className="text-sm text-gray-600">{errorMsg}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      )}

      <SandpackProvider
        key={key}
        files={files}
        template="react"
        theme="light"
        options={{ bundlerTimeOut: 60000, externalResources: [] }}
      >
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton
          style={{ height: '100%', minHeight: '400px' }}
        />
        <SandpackStatusListener
          onReady={() => setStatus('ready')}
          onError={(msg) => { setStatus('error'); setErrorMsg(msg); }}
        />
      </SandpackProvider>
    </div>
  );
}

// ─── Editor Schema preview ─────────────────────────────────────────────────────

function EditorSchemaPreview({ config }: { config: CustomBlockTypeConfig }) {
  const idPrefix = useId();
  if (!config.editorSchema || config.editorSchema.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        Block này không có trường cấu hình.<br />
        Admin dùng block mà không cần điền thêm thông tin.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800 text-sm">Trường cấu hình (admin thấy khi thêm block)</h2>
        <p className="text-xs text-gray-600 mt-0.5">
          {config.editorSchema.length} trường · Admin điền khi đặt block vào bài học
        </p>
      </div>
      <div className="p-5 space-y-4">
        {config.editorSchema.map((field, i) => {
          const fieldId = `${idPrefix}-field-${i}`;
          return (
          <div key={i}>
            {/* Bản xem trước chỉ đọc của form; mỗi ô vẫn có nhãn gắn với nó. */}
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              <span className="ml-2 text-xs text-gray-500 font-normal">({field.type})</span>
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={fieldId}
                rows={3}
                defaultValue={field.defaultValue as string ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg resize-none bg-gray-50"
                readOnly
              />
            ) : field.type === 'number' ? (
              <input
                id={fieldId}
                type="number"
                defaultValue={field.defaultValue as number ?? 0}
                className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg bg-gray-50"
                readOnly
              />
            ) : field.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <input
                  id={fieldId}
                  type="checkbox"
                  role="switch"
                  checked={!!field.defaultValue}
                  readOnly
                  aria-readonly="true"
                  className="w-5 h-5 border-gray-500"
                />
                <span className="text-sm text-gray-600">{field.defaultValue ? 'Bật' : 'Tắt'}</span>
              </div>
            ) : field.type === 'select' && 'options' in field ? (
              <select id={fieldId} className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg bg-gray-50" disabled>
                {(field.options as { label: string; value: string }[]).map((opt) => (
                  <option key={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={fieldId}
                type="text"
                defaultValue={field.defaultValue as string ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg bg-gray-50"
                readOnly
              />
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Save Modal ────────────────────────────────────────────────────────────────

interface SaveModalProps {
  config: CustomBlockTypeConfig;
  onSave: (name: string, slug: string) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  /** Lỗi từ máy chủ khi lưu: hiện ngay trong hộp thoại. */
  saveError?: string;
  initialName?: string;
  initialSlug?: string;
}

function SaveModal({ config, onSave, onClose, isSaving, saveError = '', initialName, initialSlug }: SaveModalProps) {
  const [name, setName] = useState(initialName ?? config.name ?? '');
  const [slug, setSlug] = useState(
    initialSlug ?? (config.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );
  const [error, setError] = useState('');

  const [errorField, setErrorField] = useState<'name' | 'slug' | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút "Lưu" không bị `disabled` (để không mất focus): kiểm tra và chặn ở đây.
    if (isSaving) return;
    if (!name.trim()) {
      setError('Nhập tên block');
      setErrorField('name');
      return;
    }
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
      setErrorField('slug');
      return;
    }
    setError('');
    setErrorField(null);
    await onSave(name.trim(), slug.trim());
  }

  return (
    <AdminDialog
      title="Lưu loại block"
      onClose={onClose}
      busy={isSaving}
      closeOnBackdrop
      // Focus vào ô tên ngay khi mở: việc đầu tiên trong hộp thoại.
      initialFocus="#save-block-name"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="save-block-name" className="block text-sm font-medium text-gray-700 mb-1">Tên block</label>
          <input
            id="save-block-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-invalid={errorField === 'name' || undefined}
            aria-describedby={errorField === 'name' ? 'save-block-error' : undefined}
            className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 aria-[invalid=true]:border-red-600"
            placeholder="Ví dụ: Mô phỏng lạm phát"
          />
        </div>
        <div>
          <label htmlFor="save-block-slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (mã định danh, không trùng)
          </label>
          <input
            id="save-block-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            required
            aria-invalid={errorField === 'slug' || undefined}
            aria-describedby={errorField === 'slug' ? 'save-block-slug-hint save-block-error' : 'save-block-slug-hint'}
            className="w-full px-3 py-2 text-sm border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono aria-[invalid=true]:border-red-600"
            placeholder="vi-du-inflation-simulator"
          />
          <p id="save-block-slug-hint" className="mt-1 text-xs text-gray-600">
            Chỉ chữ thường không dấu, số và dấu gạch ngang.
          </p>
        </div>
        <FormError id="save-block-error" message={error || saveError} className="" />
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            aria-disabled={isSaving || undefined}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

// ─── History entry ─────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  config: CustomBlockTypeConfig;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

// Wrap in Suspense for useSearchParams
export default function BlockBuilderClient() {
  return (
    <Suspense fallback={
      <div role="status" className="h-full flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Đang tải...</span>
      </div>
    }>
      <BlockBuilderNewPageInner />
    </Suspense>
  );
}

function BlockBuilderNewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [step, setStep] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [lastFailedRaw, setLastFailedRaw] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<CustomBlockTypeConfig | null>(null);
  const [draftBanner, setDraftBanner] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [previewMode, setPreviewMode] = useState<'preview' | 'json'>('preview');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, announce] = useAnnouncer();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const DRAFT_KEY = 'tepup_block_builder_draft';

  // Load existing block type when ?edit= is present
  useEffect(() => {
    if (!editId) return;
    setIsLoadingEdit(true);
    fetch(`/api/admin/custom-block-types/${editId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data?.config) {
          const config = json.data.config as CustomBlockTypeConfig;
          setCurrentConfig(config);
          setEditSlug(json.data.slug);
          setEditName(json.data.name);
        }
      })
      .catch(() => { /* ignore — will show empty state */ })
      .finally(() => setIsLoadingEdit(false));
  }, [editId]);

  // On mount: check for saved draft (skip if editing)
  useEffect(() => {
    if (editId) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { config } = JSON.parse(saved) as { config: CustomBlockTypeConfig };
        if (config?.files?.['/App.jsx']) setDraftBanner(true);
      }
    } catch { /* ignore */ }
  }, [editId]);

  // Auto-save draft whenever config changes
  useEffect(() => {
    if (!currentConfig) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ config: currentConfig, savedAt: new Date().toISOString() }));
    } catch { /* ignore */ }
  }, [currentConfig]);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = promptRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    const userPrompt = prompt.trim();
    setPrompt('');
    setIsGenerating(true);
    setGenerateError('');
    setLastFailedRaw(null);
    setLastFailedPrompt(null);
    setShowRawOutput(false);

    try {
      const res = await fetch('/api/admin/ai/build-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          step,
          existingConfig: step === 2 ? currentConfig : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setGenerateError(json.error ?? 'Lỗi khi tạo block');
        setLastFailedRaw(json.raw ?? null);
        setLastFailedPrompt(userPrompt);
        return;
      }
      const generated = json.config as CustomBlockTypeConfig;
      setCurrentConfig(generated);
      setHistory((prev) => [
        { id: Date.now().toString(), prompt: userPrompt, timestamp: new Date(), config: generated },
        ...prev,
      ]);
      announce(`AI đã tạo xong block ${generated.name ?? ''}. Bản xem trước đã cập nhật.`);
    } catch {
      setGenerateError('Không thể kết nối đến AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFixWithAI() {
    if (!lastFailedRaw || isFixing) return;
    setIsFixing(true);
    setGenerateError('');

    try {
      const res = await fetch('/api/admin/ai/build-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lastFailedPrompt ?? 'fix',
          step: 'fix',
          existingConfig: step === 2 ? currentConfig : undefined,
          rawOutput: lastFailedRaw,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setGenerateError(json.error ?? 'Lỗi khi nhờ AI sửa');
        setLastFailedRaw(json.raw ?? lastFailedRaw);
        return;
      }
      const generated = json.config as CustomBlockTypeConfig;
      setCurrentConfig(generated);
      setLastFailedRaw(null);
      setLastFailedPrompt(null);
      setShowRawOutput(false);
      setHistory((prev) => [
        { id: Date.now().toString(), prompt: `[AI tự sửa] ${lastFailedPrompt ?? ''}`, timestamp: new Date(), config: generated },
        ...prev,
      ]);
      announce('AI đã sửa xong. Bản xem trước đã cập nhật.');
    } catch {
      setGenerateError('Không thể kết nối đến AI. Vui lòng thử lại.');
    } finally {
      setIsFixing(false);
    }
  }

  function handleRestoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { config } = JSON.parse(saved) as { config: CustomBlockTypeConfig };
        if (config) { setCurrentConfig(config); setDraftBanner(false); }
      }
    } catch { /* ignore */ }
  }

  function handleDiscardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setDraftBanner(false);
  }

  function handleRetryWithSamePrompt() {
    if (!lastFailedPrompt || isFixing) return;
    setPrompt(lastFailedPrompt);
    setLastFailedRaw(null);
    setLastFailedPrompt(null);
    setGenerateError('');
    setShowRawOutput(false);
    // Nút vừa bấm biến mất cùng khung lỗi: đưa focus về ô mô tả (đã điền lại mô tả cũ).
    promptRef.current?.focus();
  }

  function handleReset() {
    setCurrentConfig(null); setHistory([]); setStep(1); setGenerateError(''); setLastFailedRaw(null); setLastFailedPrompt(null); setShowRawOutput(false); localStorage.removeItem(DRAFT_KEY);
    setConfirmReset(false);
    announce('Đã làm mới. Bắt đầu lại từ bước 1.');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  async function handleSave(name: string, slug: string) {
    if (!currentConfig) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const configToSave = { ...currentConfig, name };
      const url = editId
        ? `/api/admin/custom-block-types/${editId}`
        : '/api/admin/custom-block-types';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, config: configToSave }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? 'Lỗi khi lưu');
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      setShowSaveModal(false);
      router.push('/admin/custom-blocks');
    } catch {
      setSaveError('Không thể kết nối server');
    } finally {
      setIsSaving(false);
    }
  }

  const EXAMPLE_PROMPTS = [
    'Tạo block mô phỏng lạm phát: người dùng kéo slider lượng tiền và tốc độ lưu thông, hiển thị tỉ lệ lạm phát và cảnh báo khi vượt ngưỡng',
    'Block minh họa biểu thuế TNCN Việt Nam: nhập thu nhập, hiển thị thuế theo từng bậc lũy tiến với biểu đồ trực quan',
    'Mini-game "Phát hiện thiên lệch": hiển thị một đoạn văn ngắn, người dùng chọn loại thiên lệch, xem giải thích',
  ];

  return (
    <div className="h-full flex flex-col">
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/custom-blocks"
            aria-label="Quay lại danh sách block tuỳ chỉnh"
            title="Quay lại danh sách block tuỳ chỉnh"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{editId ? 'Chỉnh sửa block' : 'Trình tạo block'}</h1>
            <p className="text-xs text-gray-600">{editId ? (editName ?? 'Đang tải...') : 'Tạo loại block tương tác mới bằng AI'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentConfig && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Làm mới
            </button>
          )}
          <button
            type="button"
            onClick={() => { setSaveError(''); setShowSaveModal(true); }}
            disabled={!currentConfig}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu block
          </button>
        </div>
      </div>

      {/* Save error banner (lỗi đã được đọc trong hộp thoại; đây chỉ là dấu vết sau khi đóng) */}
      {saveError && !showSaveModal && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2 items-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveError}
        </div>
      )}

      {/* Draft restore banner */}
      {draftBanner && !currentConfig && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 flex-shrink-0">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 flex-1">Bạn có bản nháp chưa lưu từ lần trước.</span>
          <button
            type="button"
            onClick={() => {
              handleRestoreDraft();
              // Khung thông báo biến mất cùng nút vừa bấm: đưa focus sang ô mô tả.
              promptRef.current?.focus();
              announce('Đã khôi phục bản nháp.');
            }}
            className="text-sm font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
          >
            Khôi phục<span className="sr-only"> bản nháp</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleDiscardDraft();
              promptRef.current?.focus();
              announce('Đã bỏ bản nháp.');
            }}
            className="text-sm text-amber-800 hover:text-amber-900"
          >
            Bỏ qua<span className="sr-only"> bản nháp</span>
          </button>
        </div>
      )}

      {/* Step tabs: nút bật/tắt (aria-pressed) trong một nhóm có tên; bước đang chọn không chỉ báo bằng màu nền. */}
      <div role="group" aria-label="Bước" className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl w-fit flex-shrink-0">
        <button
          type="button"
          onClick={() => setStep(1)}
          aria-pressed={step === 1}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            step === 1 ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-500' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          Bước 1: Giao diện người học
        </button>
        <button
          type="button"
          // aria-disabled thay cho disabled: vẫn Tab tới được để nghe lý do "(cần bước 1 trước)".
          onClick={() => { if (currentConfig) setStep(2); }}
          aria-disabled={!currentConfig || undefined}
          aria-pressed={step === 2}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            step === 2
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-500'
              : currentConfig
              ? 'text-gray-600 hover:text-gray-800'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Bước 2: Trường cấu hình
          {!currentConfig && <span className="text-xs text-gray-600">(cần bước 1 trước)</span>}
        </button>
      </div>

      {/* Loading edit mode */}
      <div role="status" className="empty:hidden contents">
        {isLoadingEdit && (
          <div className="flex-1 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Đang tải block...</span>
          </div>
        )}
      </div>

      {/* Main split pane */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 ${isLoadingEdit ? 'hidden' : ''}`}>

        {/* ── Left: Prompt pane ── */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Prompt input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <label htmlFor="block-prompt" className="text-sm font-medium text-gray-700">
                {step === 1 ? 'Mô tả block bạn muốn tạo' : 'Mô tả cách admin cần cấu hình block'}
              </label>
            </div>

            <textarea
              id="block-prompt"
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                step === 1
                  ? 'Ví dụ: Tạo block mô phỏng lạm phát...'
                  : 'Ví dụ: Thêm trường cho admin điền câu giải thích...'
              }
              aria-describedby={generateError ? 'block-prompt-hint block-generate-error' : 'block-prompt-hint'}
              className="w-full px-3 py-2.5 text-sm border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none min-h-[80px] max-h-[200px] overflow-y-auto aria-busy:bg-gray-50"
              // readOnly thay cho disabled khi AI đang tạo: người vừa nhấn Enter trong ô này không mất focus.
              readOnly={isGenerating}
              aria-busy={isGenerating}
            />
            <div id="block-prompt-hint" className="text-xs text-gray-500 text-right mt-1">Enter để gửi · Shift+Enter để xuống dòng</div>

            <div role="alert" className="empty:hidden">
            {generateError && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                {/* Error message */}
                <div id="block-generate-error" className="p-2.5 text-xs text-red-700 flex gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{generateError}</span>
                </div>

                {/* Action buttons — only show when raw output available */}
                {lastFailedRaw && (
                  <div className="px-2.5 pb-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRetryWithSamePrompt}
                      aria-disabled={isFixing || undefined}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors aria-disabled:opacity-60"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Thử lại
                    </button>
                    <button
                      type="button"
                      onClick={handleFixWithAI}
                      aria-disabled={isFixing || undefined}
                      aria-busy={isFixing}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors aria-disabled:opacity-70 aria-disabled:cursor-wait"
                    >
                      {isFixing ? (
                        <><Loader2 className="w-3 h-3 animate-spin" />Đang sửa...</>
                      ) : (
                        <><Wrench className="w-3 h-3" />Nhờ AI tự sửa</>
                      )}
                    </button>
                  </div>
                )}

                {/* Collapsible raw output — for developers */}
                {lastFailedRaw && (
                  <div className="border-t border-red-200">
                    <button
                      type="button"
                      onClick={() => setShowRawOutput((v) => !v)}
                      aria-expanded={showRawOutput}
                      aria-controls="block-raw-output"
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-red-700 hover:text-red-800 transition-colors"
                    >
                      <span>Chi tiết kết quả AI trả về</span>
                      {showRawOutput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showRawOutput && (
                      // Vùng cuộn được: cho phép Tab tới để cuộn bằng bàn phím.
                      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- vùng cuộn (max-h, overflow) phải focus được để cuộn bằng bàn phím (WCAG 2.1.1)
                      <pre id="block-raw-output" tabIndex={0} aria-label="Kết quả AI trả về" className="px-2.5 pb-2.5 text-xs font-mono text-red-700 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                        {lastFailedRaw}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              // aria-disabled thay cho disabled: nút vừa bấm không mất focus khi AI bắt đầu tạo.
              aria-disabled={!prompt.trim() || isGenerating || undefined}
              aria-busy={isGenerating}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Đang tạo block...</>
              ) : (
                <><Sparkles className="w-4 h-4" />{currentConfig ? 'Chỉnh sửa với AI' : 'Tạo block'}</>
              )}
            </button>
          </div>

          {/* Example prompts */}
          {!currentConfig && !isGenerating && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-shrink-0">
              <h2 className="text-xs font-medium text-gray-600 mb-3">Ví dụ mô tả</h2>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      setPrompt(p);
                      // Điền vào ô mô tả rồi đưa focus tới đó, để người dùng sửa hoặc nhấn Enter.
                      promptRef.current?.focus();
                    }}
                    className="w-full text-left text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-2.5 rounded-xl transition-colors leading-relaxed"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-1 min-h-0 overflow-y-auto">
              <h2 className="text-xs font-medium text-gray-600 mb-3">Lịch sử chỉnh sửa</h2>
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    onClick={() => {
                      setCurrentConfig(entry.config);
                      announce(`Đã quay về phiên bản lúc ${entry.timestamp.toLocaleTimeString('vi-VN')}.`);
                    }}
                    aria-current={currentConfig === entry.config ? 'true' : undefined}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 aria-[current=true]:border-blue-600 transition-colors"
                  >
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{entry.prompt}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.timestamp.toLocaleTimeString('vi-VN')} · {entry.config.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Config summary */}
          {currentConfig && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-shrink-0">
              <h2 className="text-xs font-medium text-gray-600 mb-2">Block đã tạo</h2>
              <div className="text-sm font-semibold text-gray-800">{currentConfig.name}</div>
              {currentConfig.description && (
                <p className="text-xs text-gray-600 mt-0.5">{currentConfig.description}</p>
              )}
              <div className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {Object.keys(currentConfig.files ?? {}).length} tệp · {(currentConfig.editorSchema ?? []).length} trường admin
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Preview pane ── */}
        <div className="flex flex-col min-h-0">
          {currentConfig && (
            <div role="group" aria-label="Chế độ xem" className="flex items-center gap-1 mb-3 p-1 bg-gray-100 rounded-xl w-fit flex-shrink-0">
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                aria-pressed={previewMode === 'preview'}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  previewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-500' : 'text-gray-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Xem trước
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('json')}
                aria-pressed={previewMode === 'json'}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  previewMode === 'json' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-500' : 'text-gray-600'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Mã nguồn
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isGenerating ? (
              <div role="status" className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">AI đang tạo block...</p>
                  <p className="text-sm text-gray-500 mt-1">Đang sinh component React</p>
                </div>
              </div>
            ) : !currentConfig ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Sparkles className="w-7 h-7 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Bản xem trước sẽ xuất hiện ở đây</p>
                  <p className="text-sm text-gray-500 mt-1">Nhập mô tả và nhấn &ldquo;Tạo block&rdquo;</p>
                </div>
              </div>
            ) : previewMode === 'json' ? (
              // Nền xám nhạt + chữ đậm (thay cho nền gray-900 + chữ green-400): đổi theo chế độ tối.
              <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden h-full min-h-[400px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <span id="block-files-label" className="text-xs text-gray-600 font-mono">Các tệp AI đã sinh</span>
                </div>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- vùng cuộn phải focus được để cuộn bằng bàn phím (WCAG 2.1.1) */}
                <pre tabIndex={0} aria-labelledby="block-files-label" className="p-4 text-xs text-gray-800 font-mono leading-relaxed overflow-auto h-[calc(100%-44px)]">
                  {Object.entries(currentConfig.files ?? {}).map(([path, content]) =>
                    `// ${path}\n${content}\n\n`
                  ).join('')}
                </pre>
              </div>
            ) : step === 1 ? (
              <BlockPreview config={currentConfig} />
            ) : (
              <EditorSchemaPreview config={currentConfig} />
            )}
          </div>
        </div>
      </div>

      {/* Save modal */}
      {showSaveModal && currentConfig && (
        <SaveModal
          config={currentConfig}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          isSaving={isSaving}
          saveError={saveError}
          initialName={editName ?? undefined}
          initialSlug={editSlug ?? undefined}
        />
      )}

      {/* "Làm mới" bỏ block đang tạo và bản nháp: hỏi lại trước. */}
      {confirmReset && (
        <ConfirmDialog
          title="Làm mới trình tạo block?"
          confirmLabel="Làm mới"
          busyLabel="Đang làm mới…"
          onCancel={() => setConfirmReset(false)}
          onConfirm={handleReset}
          fallbackFocus={() => promptRef.current}
        >
          Block đang tạo, lịch sử chỉnh sửa và bản nháp sẽ bị xoá. Không hoàn tác được.
        </ConfirmDialog>
      )}
    </div>
  );
}
