'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, GitBranch, RotateCcw, X, ArrowRight } from 'lucide-react';
import type { BranchDiagnosisBlock as BranchDiagnosisBlockType } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer, useFocusAfterRender } from './useAnnouncer';

interface Props {
  block: BranchDiagnosisBlockType;
  onComplete?: () => void;
}

type Node = BranchDiagnosisBlockType['nodes'][number];
type Case = BranchDiagnosisBlockType['cases'][number];

/** Một bước đã làm xong của tình huống đang xét. */
interface DoneStep {
  question: string;
  answer: string;
  explanation: string;
}

/**
 * Chẩn đoán theo nhánh. Mỗi tình huống: đi từ gốc cây xuống lá (chọn sai thì thử lại
 * ở bước đó), rồi trả lời bước cuối nếu có. Xong một tình huống thì hiện cây nhỏ với
 * đường đúng được tô. Điểm = số tình huống làm đúng ngay từ lần chọn đầu ở mọi bước.
 */
export default function BranchDiagnosisBlockComponent({ block, onComplete }: Props) {
  const nodes = useMemo(() => new Map(block.nodes.map((n) => [n.id, n])), [block.nodes]);
  const cases = block.cases;

  const [caseIndex, setCaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  /** Lựa chọn sai đã thử ở bước hiện tại. */
  const [wrong, setWrong] = useState<string[]>([]);
  const [slipped, setSlipped] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [message, announce] = useAnnouncer();
  const questionRef = useRef<HTMLHeadingElement>(null);
  const caseRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const focusAfterRender = useFocusAfterRender();

  const current: Case | undefined = cases[caseIndex];

  /** Các nút trên đường đúng của tình huống: nút ở bước k là nút đang đứng trước khi chọn bước k. */
  const pathNodes = useMemo(() => {
    const out: Node[] = [];
    if (!current) return out;
    let node = nodes.get(block.rootId);
    for (const step of current.steps) {
      if (!node) break;
      out.push(node);
      const choice = node.choices.find((c) => c.id === step.choiceId);
      node = choice?.next ? nodes.get(choice.next) : undefined;
    }
    return out;
  }, [current, nodes, block.rootId]);

  if (!current || pathNodes.length === 0) {
    return (
      <BlockShell>
        <p className="text-sm text-gray-600">Block chẩn đoán theo nhánh chưa có tình huống.</p>
      </BlockShell>
    );
  }

  const totalSteps = current.steps.length + (block.final ? 1 : 0);
  const inFinal = stepIndex >= current.steps.length;
  const caseDone = stepIndex >= totalSteps;

  const done: DoneStep[] = [];
  for (let k = 0; k < Math.min(stepIndex, current.steps.length); k++) {
    const node = pathNodes[k];
    const step = current.steps[k];
    done.push({
      question: node.question,
      answer: node.choices.find((c) => c.id === step.choiceId)?.label ?? '',
      explanation: step.explanation,
    });
  }
  if (block.final && current.finalAnswer && stepIndex > current.steps.length) {
    done.push({
      question: block.final.question,
      answer: block.final.options.find((o) => o.id === current.finalAnswer!.optionId)?.label ?? '',
      explanation: current.finalAnswer.explanation,
    });
  }

  const question = inFinal ? block.final?.question ?? '' : pathNodes[stepIndex]?.question ?? '';
  const choices: { id: string; label: string }[] = inFinal ? block.final?.options ?? [] : pathNodes[stepIndex]?.choices ?? [];
  const rightId = inFinal ? current.finalAnswer?.optionId : current.steps[stepIndex]?.choiceId;

  const choose = (id: string) => {
    if (caseDone || wrong.includes(id)) return;
    if (id !== rightId) {
      setWrong((w) => [...w, id]);
      setSlipped(true);
      announce('Chưa đúng. Đọc lại tình huống và thử lựa chọn khác.');
      return;
    }
    const label = choices.find((c) => c.id === id)?.label ?? '';
    const next = stepIndex + 1;
    setStepIndex(next);
    setWrong([]);
    if (next >= totalSteps) {
      const ok = !slipped;
      setResults((r) => {
        const copy = [...r];
        copy[caseIndex] = ok;
        return copy;
      });
      announce(`Đúng: ${label}. Xong tình huống ${caseIndex + 1}${ok ? ', đúng ngay từ đầu' : ''}. Giải thích và cây ở bên dưới.`);
      focusAfterRender(() => caseRef.current);
    } else {
      announce(`Đúng: ${label}. Sang bước tiếp theo.`);
      focusAfterRender(() => questionRef.current);
    }
  };

  const nextCase = () => {
    if (caseIndex + 1 >= cases.length) {
      setFinished(true);
      onComplete?.();
      focusAfterRender(() => summaryRef.current);
      return;
    }
    setCaseIndex(caseIndex + 1);
    setStepIndex(0);
    setWrong([]);
    setSlipped(false);
    announce(`Tình huống ${caseIndex + 2} trên ${cases.length}.`);
    focusAfterRender(() => caseRef.current);
  };

  const restart = () => {
    setCaseIndex(0);
    setStepIndex(0);
    setWrong([]);
    setSlipped(false);
    setResults([]);
    setFinished(false);
    announce('Làm lại từ tình huống 1.');
    focusAfterRender(() => caseRef.current);
  };

  // --- cây nhỏ với đường đúng được tô ----------------------------------------
  const onPath = new Set(current.steps.map((s) => s.choiceId));
  const finalLabel = block.final?.options.find((o) => o.id === current.finalAnswer?.optionId)?.label;
  const renderTree = (node: Node, depth: number, seen: Set<string>): React.ReactNode => {
    if (seen.has(node.id) || depth > 6) return null;
    const nextSeen = new Set(seen).add(node.id);
    return (
      <ul className={depth === 0 ? 'space-y-1' : 'ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3'}>
        {node.choices.map((c) => {
          const on = onPath.has(c.id) && pathNodes.includes(node);
          const child = c.next ? nodes.get(c.next) : undefined;
          return (
            <li key={c.id}>
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm ${
                  on ? 'bg-indigo-100 font-semibold text-indigo-900 ring-1 ring-indigo-400' : 'text-gray-600'
                }`}
              >
                {on && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                {c.label}
                {on && <span className="sr-only"> (đường đúng)</span>}
              </span>
              {on && !child && finalLabel && (
                <span className="ml-2 inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-sm font-semibold text-green-900">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {finalLabel}
                </span>
              )}
              {child && renderTree(child, depth + 1, nextSeen)}
            </li>
          );
        })}
      </ul>
    );
  };

  const firstTry = results.filter(Boolean).length;
  const root = nodes.get(block.rootId)!;

  return (
    <BlockShell skin="bg-gradient-to-br from-indigo-50 to-sky-50 border-2 border-indigo-200" accent="indigo">
      <div className="mb-2 flex items-center gap-2">
        <GitBranch className="h-6 w-6 text-indigo-700" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-900">{block.title || 'Chẩn đoán theo nhánh'}</h2>
      </div>
      {block.instruction && <p className="mb-4 text-sm text-gray-600">{renderInlineMarkdown(block.instruction)}</p>}

      {finished ? (
        <div className="space-y-3">
          <div ref={summaryRef} tabIndex={-1} className="rounded-xl border border-indigo-200 bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700">
            <p className="font-semibold text-indigo-900">
              Đúng ngay từ đầu: {firstTry}/{cases.length} tình huống
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {cases.map((c, i) => (
                <li key={c.id} className="flex items-start gap-2">
                  {results[i] ? (
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-700" aria-hidden="true" />
                  )}
                  <span>
                    <span className="sr-only">{results[i] ? 'Đúng ngay từ đầu: ' : 'Có bước phải thử lại: '}</span>
                    {i + 1}. {toPlainText(c.text).slice(0, 90)}
                    {toPlainText(c.text).length > 90 ? '…' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Làm lại từ đầu
          </button>
        </div>
      ) : (
        <>
          <div ref={caseRef} tabIndex={-1} className="mb-4 rounded-xl border border-indigo-100 bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Tình huống {caseIndex + 1}/{cases.length}
            </p>
            <p className="text-[0.95rem] leading-relaxed text-gray-800">{renderInlineMarkdown(current.text)}</p>
          </div>

          {done.length > 0 && (
            <ol className="mb-4 space-y-2">
              {done.map((d, i) => (
                <li key={i} className="rounded-xl border border-green-200 bg-green-50 p-3">
                  <p className="text-xs text-gray-600">{toPlainText(d.question)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-green-900">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Đúng: </span>
                    {d.answer}
                  </p>
                  {d.explanation && <p className="mt-1 text-sm text-gray-700">{renderInlineMarkdown(d.explanation)}</p>}
                </li>
              ))}
            </ol>
          )}

          {!caseDone ? (
            <div className="mb-2">
              <h3 ref={questionRef} tabIndex={-1} className="mb-2 text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700">
                <span className="mr-1 text-indigo-700">Bước {stepIndex + 1}/{totalSteps}:</span>
                {renderInlineMarkdown(question, { links: false })}
              </h3>
              <div role="group" aria-label={toPlainText(question)} className="grid gap-2 sm:grid-cols-2">
                {choices.map((c) => {
                  const isWrong = wrong.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-disabled={isWrong || undefined}
                      onClick={() => choose(c.id)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
                        isWrong
                          ? 'cursor-not-allowed border-red-300 bg-red-50 text-red-900 line-through decoration-red-400'
                          : 'border-indigo-200 bg-white text-gray-800 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      {isWrong && <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                      <span>
                        {renderInlineMarkdown(c.label, { links: false })}
                        {isWrong && <span className="sr-only"> (chưa đúng)</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {wrong.length > 0 && <p className="mt-2 text-sm text-red-800">Chưa đúng. Đọc lại tình huống và thử lựa chọn khác.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-white p-3">
                <p className="mb-2 text-sm font-semibold text-gray-900">Đường đi trên cây</p>
                <p className="mb-1 text-xs text-gray-600">{toPlainText(root.question)}</p>
                {renderTree(root, 0, new Set())}
              </div>
              <button
                type="button"
                onClick={nextCase}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-800 focus-visible:ring-offset-2"
              >
                {caseIndex + 1 >= cases.length ? 'Xem kết quả' : 'Tình huống tiếp'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </BlockShell>
  );
}
