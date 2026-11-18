'use client';

import { useId, useRef, useState } from 'react';
import { Check, FlaskConical, RotateCcw, X } from 'lucide-react';
import type { RuleDiscoveryBlock as RuleDiscoveryBlockType } from '@/lib/types/content';
import { evaluateCondition } from '@/lib/security/safe-expr';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer, useFocusAfterRender } from './useAnnouncer';

interface Props {
  block: RuleDiscoveryBlockType;
  onComplete?: () => void;
}

type Triple = [number, number, number];

const DEFAULT_RULES = [
  'Nhập ba số bất kỳ.',
  'Mình sẽ cho biết bộ số có đúng quy luật không.',
  'Khi đã chắc, hãy chọn quy luật bí mật.',
];

/** Giới hạn lịch sử để một người bấm mãi không làm danh sách dài vô tận. */
const MAX_TESTS = 50;

/**
 * Đọc "1, 5, 9" / "1 5 9" / "1;5;9" thành ba số. Dấu phẩy là dấu tách, nên số thập
 * phân dùng dấu chấm ("1.5"). Trả về chuỗi lỗi để hiện cho người học.
 */
function parseTriple(raw: string): Triple | string {
  const parts = raw.trim().split(/[\s,;]+/).filter(Boolean);
  if (parts.length !== 3) return 'Hãy nhập đúng ba số, cách nhau bằng dấu phẩy hoặc khoảng trắng.';
  const nums = parts.map((p) => (/^[-+]?\d{1,12}(\.\d{1,6})?$/.test(p) ? Number(p) : NaN));
  if (nums.some((n) => !Number.isFinite(n))) {
    return 'Chỉ nhập số (số thập phân dùng dấu chấm, ví dụ 1.5).';
  }
  return nums as Triple;
}

function fmt(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 6 });
}

const showTriple = (t: Triple) => t.map(fmt).join(' – ');
const sayTriple = (t: Triple) => t.map(fmt).join(', ');

export default function RuleDiscoveryBlockComponent({ block, onComplete }: Props) {
  const uid = useId();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<{ triple: Triple; ok: boolean }[]>([]);
  const [answering, setAnswering] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);
  const [message, announce] = useAnnouncer();
  const focusAfterRender = useFocusAfterRender();
  const inputRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const matches = (t: Triple) => evaluateCondition(block.rule, { a: t[0], b: t[1], c: t[2] });
  const example = (Array.isArray(block.example) && block.example.length === 3 ? block.example : null) as Triple | null;
  const options = block.options ?? [];
  const picked = options.find((o) => o.id === selected);
  const isCorrect = committed && !!picked?.isCorrect;
  const rejected = tests.filter((t) => !t.ok).length;
  const full = tests.length >= MAX_TESTS;

  const handleTest = () => {
    if (committed) return;
    if (full) {
      announce(`Đã thử tối đa ${MAX_TESTS} bộ số. Hãy chọn quy luật.`);
      return;
    }
    if (!input.trim()) {
      setError('Hãy nhập ba số.');
      announce('Hãy nhập ba số.');
      inputRef.current?.focus();
      return;
    }
    const parsed = parseTriple(input);
    if (typeof parsed === 'string') {
      setError(parsed);
      announce(parsed);
      inputRef.current?.focus();
      return;
    }
    const ok = matches(parsed);
    setTests((prev) => [...prev, { triple: parsed, ok }]);
    setInput('');
    setError(null);
    // Lịch sử thử không phải vùng live; đọc kết quả lần này riêng. Focus ở lại ô nhập.
    announce(`${sayTriple(parsed)}: ${ok ? 'đúng quy luật' : 'không đúng quy luật'}.`);
    inputRef.current?.focus();
  };

  const handleStartAnswer = () => {
    setAnswering(true);
    // Nút vừa bấm biến mất; đưa focus tới câu hỏi vừa hiện.
    focusAfterRender(() => questionRef.current);
  };

  const handleCommit = () => {
    if (!selected || committed) return;
    setCommitted(true);
    // Hoàn thành khi đã chốt, đúng hay sai — như block question: lựa chọn bị khoá
    // sau khi chốt, đòi chọn đúng sẽ làm kẹt nút Tiếp tục của bài.
    onComplete?.();
    focusAfterRender(() => resultRef.current);
  };

  const handleReset = () => {
    setInput('');
    setError(null);
    setTests([]);
    setAnswering(false);
    setSelected(null);
    setCommitted(false);
    announce('Đã bắt đầu lại.');
    focusAfterRender(() => inputRef.current);
  };

  const correctText = options
    .filter((o) => o.isCorrect)
    .map((o) => toPlainText(o.text))
    .join('; ');

  return (
    <BlockShell>
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-5 h-5 text-indigo-600" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">{block.title || 'Tìm quy luật bí mật'}</h2>
      </div>

      {block.instruction?.trim() ? (
        <p className="text-gray-700 mb-4 leading-relaxed">{renderInlineMarkdown(block.instruction)}</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
          {DEFAULT_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}

      {example && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 mb-4">
          <span className="text-sm text-gray-700">
            Bộ số mẫu: <span className="font-semibold text-gray-900 tabular-nums">{showTriple(example)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Đúng
          </span>
        </div>
      )}

      {/* Nhập thử */}
      {!committed && (
        <div className="mb-4">
          <label htmlFor={`${uid}-input`} className="block text-sm font-medium text-gray-600 mb-1.5">
            Nhập ba số (ví dụ: 1, 5, 9)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              id={`${uid}-input`}
              type="text"
              inputMode="text"
              autoComplete="off"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTest();
                }
              }}
              placeholder="Ví dụ: 1, 5, 9"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${uid}-error` : undefined}
              className="flex-1 min-w-0 rounded-full border-2 border-gray-300 px-4 py-2.5 text-lg tabular-nums focus:border-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            />
            <button
              type="button"
              onClick={handleTest}
              aria-disabled={!input.trim() || full}
              className={`rounded-full px-5 py-2.5 font-semibold transition-colors ${
                input.trim() && !full
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              Kiểm tra giả thuyết
            </button>
          </div>
          {error && (
            <p id={`${uid}-error`} className="mt-1.5 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Lịch sử thử */}
      {tests.length > 0 && (
        <div className="mb-4">
          <h3 id={`${uid}-history`} className="font-semibold text-gray-900 mb-2">
            Kết quả thử nghiệm
          </h3>
          <ol aria-labelledby={`${uid}-history`} className="divide-y divide-gray-100">
            {tests.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span className="text-lg tabular-nums text-gray-900">{showTriple(t.triple)}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${
                    t.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {t.ok ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <X className="w-3.5 h-3.5" aria-hidden="true" />}
                  {t.ok ? 'Đúng' : 'Không đúng'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Mở phần chốt quy luật */}
      {!answering && tests.length > 0 && (
        <button
          type="button"
          onClick={handleStartAnswer}
          className="w-full rounded-full border-2 border-indigo-600 px-5 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          Tôi đoán được quy luật rồi
        </button>
      )}
      {!answering && tests.length === 0 && (
        <p className="text-sm text-gray-500">Thử ít nhất một bộ số trước khi chọn quy luật.</p>
      )}

      {/* Câu hỏi chốt */}
      {answering && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
          <p
            ref={questionRef}
            id={`${uid}-question`}
            tabIndex={-1}
            className="font-medium text-gray-900 mb-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            {renderInlineMarkdown(block.question || 'Theo bạn, quy luật bí mật là gì?')}
          </p>
          <div role="group" aria-labelledby={`${uid}-question`} className="space-y-2">
            {options.map((o) => {
              const isSel = selected === o.id;
              const showRight = committed && o.isCorrect;
              const showWrong = committed && isSel && !o.isCorrect;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={isSel}
                  aria-disabled={committed}
                  onClick={() => !committed && setSelected(o.id)}
                  className={`w-full rounded-xl border-2 p-3 text-left text-sm transition-all ${
                    showRight
                      ? 'border-green-600 bg-green-50'
                      : showWrong
                        ? 'border-red-600 bg-red-50'
                        : isSel
                          ? 'border-indigo-600 bg-white'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${committed ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        showRight
                          ? 'border-green-600 bg-green-600'
                          : showWrong
                            ? 'border-red-600 bg-red-600'
                            : isSel
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-400'
                      }`}
                    >
                      {showRight && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                      {showWrong && <X className="h-3 w-3 text-white" aria-hidden="true" />}
                      {isSel && !committed && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span className={showRight ? 'font-medium text-green-800' : showWrong ? 'text-red-800' : 'text-gray-800'}>
                      {renderInlineMarkdown(o.text, { links: false })}
                      {showRight && <span className="sr-only"> — đáp án đúng</span>}
                      {showWrong && <span className="sr-only"> — bạn chọn, sai</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {!committed && (
            <button
              type="button"
              onClick={handleCommit}
              aria-disabled={!selected}
              className={`mt-3 rounded-full px-6 py-2.5 font-semibold transition-colors ${
                selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              Chốt đáp án
            </button>
          )}

          {committed && (
            <div
              ref={resultRef}
              tabIndex={-1}
              className={`mt-4 rounded-xl border p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
                {isCorrect ? 'Chính xác!' : `Chưa đúng. Quy luật là: ${correctText}`}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Bạn đã thử {tests.length} bộ số, {rejected === 0 ? 'không bộ nào' : `${rejected} bộ`} bị trả lời
                “Không đúng”.
                {rejected === 0 &&
                  ' Bộ số bị bác bỏ thường cho nhiều thông tin nhất: nó cho biết phỏng đoán của mình có đang quá hẹp không.'}
              </p>
              {block.explanation && (
                <p className="text-gray-700 leading-relaxed">{renderInlineMarkdown(block.explanation)}</p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {(tests.length > 0 || committed) && (
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Chơi lại
        </button>
      )}
    </BlockShell>
  );
}
