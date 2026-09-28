'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
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
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
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
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 relative">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Đang khởi động Sandpack...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm text-gray-600">{errorMsg}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
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
  if (!config.editorSchema || config.editorSchema.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Block này không có trường cấu hình.<br />
        Admin dùng block mà không cần điền thêm thông tin.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm">Form cấu hình (admin thấy khi thêm block)</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {config.editorSchema.length} trường · Admin điền khi đặt block vào bài học
        </p>
      </div>
      <div className="p-5 space-y-4">
        {config.editorSchema.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              <span className="ml-2 text-xs text-gray-400 font-normal">{field.type}</span>
            </label>
            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                defaultValue={field.defaultValue as string ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none bg-gray-50"
                readOnly
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                defaultValue={field.defaultValue as number ?? 0}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-gray-50"
                readOnly
              />
            ) : field.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-gray-200 rounded-full" />
                <span className="text-sm text-gray-500">{field.defaultValue ? 'Bật' : 'Tắt'}</span>
              </div>
            ) : field.type === 'select' && 'options' in field ? (
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" disabled>
                {(field.options as { label: string; value: string }[]).map((opt) => (
                  <option key={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                defaultValue={field.defaultValue as string ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-gray-50"
                readOnly
              />
            )}
          </div>
        ))}
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
  initialName?: string;
  initialSlug?: string;
}

function SaveModal({ config, onSave, onClose, isSaving, initialName, initialSlug }: SaveModalProps) {
  const [name, setName] = useState(initialName ?? config.name ?? '');
  const [slug, setSlug] = useState(
    initialSlug ?? (config.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
      return;
    }
    setError('');
    await onSave(name.trim(), slug.trim());
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Lưu block type</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên block</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Mô phỏng lạm phát"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (unique ID)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="vi-du-inflation-simulator"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim() || !slug.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
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
export default function BlockBuilderNewPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center gap-2 text-gray-400">
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
    if (!lastFailedPrompt) return;
    setPrompt(lastFailedPrompt);
    setLastFailedRaw(null);
    setLastFailedPrompt(null);
    setGenerateError('');
    setShowRawOutput(false);
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
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/custom-blocks"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{editId ? 'Chỉnh sửa Block' : 'Block Builder'}</h1>
            <p className="text-xs text-gray-500">{editId ? (editName ?? 'Đang tải...') : 'Tạo loại block tương tác mới bằng AI'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentConfig && (
            <button
              onClick={() => { setCurrentConfig(null); setHistory([]); setStep(1); setGenerateError(''); setLastFailedRaw(null); setLastFailedPrompt(null); setShowRawOutput(false); localStorage.removeItem(DRAFT_KEY); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Làm mới
            </button>
          )}
          <button
            onClick={() => { setSaveError(''); setShowSaveModal(true); }}
            disabled={!currentConfig}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu block type
          </button>
        </div>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2 items-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveError}
        </div>
      )}

      {/* Draft restore banner */}
      {draftBanner && !currentConfig && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 flex-shrink-0">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm text-amber-700 flex-1">Bạn có bản nháp chưa lưu từ lần trước.</span>
          <button
            onClick={handleRestoreDraft}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            Khôi phục
          </button>
          <button
            onClick={handleDiscardDraft}
            className="text-sm text-amber-400 hover:text-amber-600"
          >
            Bỏ qua
          </button>
        </div>
      )}

      {/* Step tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl w-fit flex-shrink-0">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            step === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="w-4 h-4" />
          Bước 1: Learner View
        </button>
        <button
          onClick={() => setStep(2)}
          disabled={!currentConfig}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            step === 2
              ? 'bg-white text-gray-900 shadow-sm'
              : currentConfig
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Bước 2: Editor Schema
          {!currentConfig && <span className="text-xs text-gray-300">(cần bước 1 trước)</span>}
        </button>
      </div>

      {/* Loading edit mode */}
      {isLoadingEdit && (
        <div className="flex-1 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Đang tải block type...</span>
        </div>
      )}

      {/* Main split pane */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 ${isLoadingEdit ? 'hidden' : ''}`}>

        {/* ── Left: Prompt pane ── */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Prompt input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {step === 1 ? 'Mô tả block bạn muốn tạo' : 'Mô tả cách admin cần cấu hình block'}
              </span>
            </div>

            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                step === 1
                  ? 'Ví dụ: Tạo block mô phỏng lạm phát...'
                  : 'Ví dụ: Thêm trường cho admin điền câu giải thích...'
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[80px] max-h-[200px] overflow-y-auto"
              disabled={isGenerating}
            />
            <div className="text-xs text-gray-400 text-right mt-1">Enter để gửi · Shift+Enter để xuống dòng</div>

            {generateError && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                {/* Error message */}
                <div className="p-2.5 text-xs text-red-600 flex gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{generateError}</span>
                </div>

                {/* Action buttons — only show when raw output available */}
                {lastFailedRaw && (
                  <div className="px-2.5 pb-2.5 flex flex-wrap gap-2">
                    <button
                      onClick={handleRetryWithSamePrompt}
                      disabled={isFixing}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Thử lại
                    </button>
                    <button
                      onClick={handleFixWithAI}
                      disabled={isFixing}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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
                      onClick={() => setShowRawOutput((v) => !v)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      <span>Chi tiết output từ AI</span>
                      {showRawOutput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showRawOutput && (
                      <pre className="px-2.5 pb-2.5 text-xs font-mono text-red-700 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                        {lastFailedRaw}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              <p className="text-xs font-medium text-gray-500 mb-3">Ví dụ prompt</p>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-2.5 rounded-xl transition-colors leading-relaxed"
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
              <p className="text-xs font-medium text-gray-500 mb-3">Lịch sử chỉnh sửa</p>
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setCurrentConfig(entry.config)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{entry.prompt}</p>
                    <p className="text-xs text-gray-400 mt-1">
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
              <p className="text-xs font-medium text-gray-500 mb-2">Block đã tạo</p>
              <div className="text-sm font-semibold text-gray-800">{currentConfig.name}</div>
              {currentConfig.description && (
                <p className="text-xs text-gray-500 mt-0.5">{currentConfig.description}</p>
              )}
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {Object.keys(currentConfig.files ?? {}).length} files · {(currentConfig.editorSchema ?? []).length} trường admin
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Preview pane ── */}
        <div className="flex flex-col min-h-0">
          {currentConfig && (
            <div className="flex items-center gap-1 mb-3 p-1 bg-gray-100 rounded-xl w-fit flex-shrink-0">
              <button
                onClick={() => setPreviewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  previewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setPreviewMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  previewMode === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Files
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">AI đang tạo block...</p>
                  <p className="text-sm text-gray-400 mt-1">Đang sinh React component</p>
                </div>
              </div>
            ) : !currentConfig ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <Sparkles className="w-7 h-7 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Preview sẽ xuất hiện ở đây</p>
                  <p className="text-sm text-gray-400 mt-1">Nhập mô tả và nhấn "Tạo block"</p>
                </div>
              </div>
            ) : previewMode === 'json' ? (
              <div className="bg-gray-900 rounded-2xl overflow-hidden h-full min-h-[400px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-mono">Generated files</span>
                </div>
                <pre className="p-4 text-xs text-green-400 font-mono leading-relaxed overflow-auto h-[calc(100%-44px)]">
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
          initialName={editName ?? undefined}
          initialSlug={editSlug ?? undefined}
        />
      )}
    </div>
  );
}
