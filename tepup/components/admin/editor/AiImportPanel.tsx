'use client';
import { useState } from 'react';
import { Bot, Copy, Check, Download, Undo2, BookOpen, AlertTriangle, ChevronDown } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import { applyImportedJson } from '@/lib/ai-import/apply';
import { buildBlockPrompt, buildFixPrompt, type CustomTypeInfo } from '@/lib/ai-import/build-doc';
import type { ContentBlock } from '@/lib/types/content';

interface Props {
  block: ContentBlock;
  onApply: (block: ContentBlock) => void;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Trình duyệt chặn clipboard API (http, iframe) — dùng cách cũ.
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

function customInfo(block: ContentBlock): CustomTypeInfo | undefined {
  if (block.type !== 'custom') return undefined;
  const snap = block.configSnapshot;
  return { name: snap?.name ?? '', description: snap?.description, editorSchema: snap?.editorSchema ?? [] };
}

/**
 * "Dùng AI của bạn": copy prompt / tải đặc tả → người dùng hỏi AI riêng → dán JSON
 * về đây. Không gọi AI nào phía server.
 *
 * Mặc định thu gọn và nằm dưới form của block: ô nhập của nó từng nằm trên cùng và
 * bị nhầm là ô nhập câu hỏi.
 */
export default function AiImportPanel({ block, onApply }: Props) {
  const [idea, setIdea] = useState('');
  const [pasted, setPasted] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<'prompt' | 'fix' | null>(null);
  const [previous, setPrevious] = useState<ContentBlock | null>(null);
  const [applied, setApplied] = useState(false);
  const [open, setOpen] = useState(false);

  const custom = customInfo(block);
  const query =
    block.type === 'custom'
      ? `type=custom&customBlockTypeId=${encodeURIComponent(block.customBlockTypeId)}`
      : `type=${encodeURIComponent(block.type)}`;

  const flash = (which: 'prompt' | 'fix') => {
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyPrompt = async () => {
    await copyText(buildBlockPrompt(block as unknown as Record<string, unknown>, idea, custom));
    flash('prompt');
  };

  const apply = () => {
    const result = applyImportedJson(block, pasted);
    if (!result.ok) {
      setErrors(result.errors);
      setApplied(false);
      return;
    }
    setErrors([]);
    setPrevious(block);
    setApplied(true);
    setPasted('');
    onApply(result.block);
  };

  const undo = () => {
    if (!previous) return;
    onApply(previous);
    setPrevious(null);
    setApplied(false);
  };

  const copyFix = async () => {
    await copyText(buildFixPrompt(block.type, errors, pasted));
    flash('fix');
  };

  const btn =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50';

  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-1.5 text-left text-sm font-medium text-violet-700"
        >
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
          <Bot className="w-4 h-4 shrink-0" />
          <span>
            Tuỳ chọn: Dùng AI của bạn
            {!open && (
              <span className="block text-xs font-normal text-gray-500">
                Nhờ ChatGPT / Claude / Gemini soạn block này rồi dán kết quả vào
              </span>
            )}
          </span>
        </button>
        <Link href="/contributor/ai-guide" className="inline-flex shrink-0 items-center gap-1 text-xs text-violet-600 hover:underline">
          <BookOpen className="w-3.5 h-3.5" /> Hướng dẫn
        </Link>
      </div>

      {open && (
      <>

      {/* Bước 1 */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600">
          <b>1.</b> Mô tả nội dung (tuỳ chọn), rồi copy prompt hoặc tải file đặc tả để gửi cho ChatGPT / Claude / Gemini.
        </p>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={2}
          placeholder="Vd: Nối cặp 4 loại thuế với ví dụ đời thường…"
          className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-y bg-white"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={copyPrompt} className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}>
            {copied === 'prompt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'prompt' ? 'Đã copy' : 'Copy prompt'}
          </button>
          <a
            href={`/api/block-schemas?${query}&format=md`}
            download
            className={`${btn} bg-white border border-violet-200 text-violet-700 hover:bg-violet-100`}
          >
            <Download className="w-4 h-4" /> Tải đặc tả (.md)
          </a>
          <a href={`/api/block-schemas?${query}&format=json`} download className="text-xs text-violet-600 hover:underline">
            .json
          </a>
        </div>
      </div>

      {/* Bước 2 */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600">
          <b>2.</b> Bấm nút <b>Copy</b> trên khối code AI trả về rồi dán vào đây. Nội dung block sẽ được thay khi bấm Áp
          dụng, rồi kiểm tra lại các ô phía trên.
        </p>
        <textarea
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value);
            setApplied(false);
          }}
          rows={4}
          spellCheck={false}
          placeholder='{ "type": "…", … }'
          className="w-full px-3 py-2 border border-violet-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-y bg-white"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={apply}
            disabled={!pasted.trim()}
            className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}
          >
            Áp dụng
          </button>
          {previous && (
            <button type="button" onClick={undo} className={`${btn} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
              <Undo2 className="w-4 h-4" /> Hoàn tác
            </button>
          )}
          {applied && <span className="text-xs text-emerald-700">Đã áp dụng — kiểm tra lại các ô phía trên.</span>}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 space-y-2" role="alert">
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
            <AlertTriangle className="w-4 h-4" /> JSON chưa hợp lệ ({errors.length} lỗi)
          </p>
          <ul className="list-disc pl-5 text-xs text-red-700 space-y-0.5 max-h-40 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="break-words">{e}</li>
            ))}
          </ul>
          <button type="button" onClick={copyFix} className={`${btn} bg-white border border-red-200 text-red-700 hover:bg-red-100`}>
            {copied === 'fix' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'fix' ? 'Đã copy' : 'Copy lỗi để AI sửa'}
          </button>
        </div>
      )}
      </>
      )}
    </section>
  );
}
