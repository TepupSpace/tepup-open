'use client';

import { useEffect, useRef, useState } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import type { CustomBlockInstance } from '@/lib/types/custom-block';
import { Puzzle, AlertCircle } from 'lucide-react';
import BlockShell from './BlockShell';
import { useAnnouncer, useFocusAfterRender } from './useAnnouncer';

/** Sau chừng này, nút "Bỏ qua bài tập" hiện ra cho mọi người (bàn phím thấy ngay khi Tab tới). */
const SKIP_VISIBLE_AFTER_MS = 20_000;

interface Props {
  block: CustomBlockInstance;
  onComplete?: () => void;
}

export default function CustomBlock({ block, onComplete }: Props) {
  const config = block.configSnapshot;
  const [isCompleted, setIsCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const [message, announce] = useAnnouncer();
  const previewRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const focusAfterRender = useFocusAfterRender();
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  const regionLabel = config?.name || 'Bài tập tuỳ chỉnh';

  // Listen for completion signal from Sandpack iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'tepup:complete' && !isCompleted) {
        setIsCompleted(true);
        onCompleteRef.current?.();
        announce('Đã hoàn thành bài tập.');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isCompleted, announce]);

  useEffect(() => {
    const t = window.setTimeout(() => setSkipVisible(true), SKIP_VISIBLE_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Sandpack đặt cứng title "Sandpack Preview" cho iframe; đổi thành tên bài tập để trình
  // đọc màn hình biết khung này là gì. Theo dõi luôn: Sandpack có thể dựng lại iframe.
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    const apply = () => {
      const frame = root.querySelector('iframe');
      if (frame && frame.getAttribute('title') !== regionLabel) frame.setAttribute('title', regionLabel);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });
    return () => observer.disconnect();
  }, [regionLabel]);

  /**
   * Lối thoát: nội dung trong sandbox do tác giả viết và có thể không dùng được bằng
   * bàn phím. Không có nút này, người học kẹt lại vì bài chỉ hoàn thành khi sandbox
   * gửi `tepup:complete`. Gọi đúng callback hoàn thành mà sandbox dùng.
   */
  const handleSkip = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    setSkipped(true);
    onCompleteRef.current?.();
    // Nút biến mất; focus sang dòng trạng thái "Đã bỏ qua" thay chỗ nó (dòng đó tự
    // được đọc), vùng live chỉ nói phần còn thiếu.
    focusAfterRender(() => statusRef.current);
    announce('Bạn có thể học tiếp.');
  };

  if (!config) {
    return (
      <BlockShell skin="bg-gray-50 border border-gray-200" className="flex items-center gap-3 text-gray-500">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">Block không có cấu hình. Vui lòng liên hệ admin.</span>
      </BlockShell>
    );
  }

  if (!config.files?.['/App.jsx']) {
    return (
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-8 flex items-center gap-3 text-gray-500">
        <Puzzle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">Block chưa có nội dung.</span>
      </div>
    );
  }

  // Inject __BLOCK_FIELDS into the sandbox via a dedicated setup file
  const fieldsSetup = `window.__BLOCK_FIELDS = ${JSON.stringify(block.fields ?? {})};`;

  // Merge: setup file runs before App, then App.jsx from config
  // Rename /App.jsx → /App.js so it overrides the Sandpack react template default
  const files: Record<string, string> = {
    '/setup.js': fieldsSetup,
    ...Object.fromEntries(
      Object.entries(config.files).map(([k, v]) => [
        k === '/App.jsx' ? '/App.js' : k, v
      ])
    ),
    // Mẫu react của Sandpack khai báo <html lang="en"> và title "Document": trình đọc màn
    // hình sẽ đọc nội dung tiếng Việt bằng luật phát âm tiếng Anh. Tác giả có file riêng thì giữ.
    '/public/index.html':
      config.files['/public/index.html'] ??
      `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(regionLabel)}</title></head><body><div id="root"></div></body></html>`,
    '/index.js': `import './setup.js';\nimport React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nconst root = createRoot(document.getElementById('root'));\nroot.render(React.createElement(App));`,
  };

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Block header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
        <Puzzle className="w-4 h-4 text-violet-500 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium text-violet-700">{config.name}</span>
        {isCompleted ? (
          <span ref={statusRef} tabIndex={-1} className="ml-auto text-xs text-emerald-700 font-medium">
            {skipped ? 'Đã bỏ qua' : '✓ Hoàn thành'}
          </span>
        ) : (
          // Người dùng bàn phím gặp nút ngay khi Tab tới; người khác thấy sau ~20 giây.
          <button
            type="button"
            onClick={handleSkip}
            className={
              skipVisible
                ? 'ml-auto text-xs font-medium text-violet-700 underline hover:text-violet-900 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'
                : 'sr-only focus:not-sr-only focus:ml-auto focus:text-xs focus:font-medium focus:text-violet-700 focus:underline focus:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'
            }
          >
            Bỏ qua bài tập
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">{message}</p>

      {/* Sandpack preview — editor hidden, only preview shown */}
      <section ref={previewRef} aria-label={regionLabel}>
      <SandpackProvider
        files={files}
        template="react"
        theme="light"
        options={{
          externalResources: [],
        }}
      >
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          style={{ minHeight: '300px' }}
        />
      </SandpackProvider>
      </section>
    </div>
  );
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
