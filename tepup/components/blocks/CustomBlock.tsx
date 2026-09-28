'use client';

import { useEffect, useRef, useState } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import type { CustomBlockInstance } from '@/lib/types/custom-block';
import { Puzzle, AlertCircle } from 'lucide-react';
import BlockShell from './BlockShell';

interface Props {
  block: CustomBlockInstance;
  onComplete?: () => void;
}

export default function CustomBlock({ block, onComplete }: Props) {
  const config = block.configSnapshot;
  const [isCompleted, setIsCompleted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Listen for completion signal from Sandpack iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'tepup:complete' && !isCompleted) {
        setIsCompleted(true);
        onCompleteRef.current?.();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isCompleted]);

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
    '/index.js': `import './setup.js';\nimport React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nconst root = createRoot(document.getElementById('root'));\nroot.render(React.createElement(App));`,
  };

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Block header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
        <Puzzle className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <span className="text-sm font-medium text-violet-700">{config.name}</span>
        {isCompleted && (
          <span className="ml-auto text-xs text-emerald-600 font-medium">✓ Hoàn thành</span>
        )}
      </div>

      {/* Sandpack preview — editor hidden, only preview shown */}
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
    </div>
  );
}
