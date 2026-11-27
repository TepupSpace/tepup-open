'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BranchDiagnosisBlock } from './types';

interface Props {
  block: BranchDiagnosisBlock;
  onChange: (block: BranchDiagnosisBlock) => void;
}

type Node = BranchDiagnosisBlock['nodes'][number];
type Case = BranchDiagnosisBlock['cases'][number];

const inputClass =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const smallInput =
  'px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

const newId = (prefix: string, n: number) => `${prefix}${Date.now().toString(36)}${n}`;

/**
 * Soạn cây (nút → lựa chọn → nút tiếp hoặc lá), bước cuối tuỳ chọn, và các tình
 * huống. Đường đúng của mỗi tình huống được chọn lần lượt từ gốc: đổi một bước thì
 * các bước sau bị bỏ, vì chúng phụ thuộc vào nhánh đã chọn.
 */
export default function BranchDiagnosisBlockEditor({ block, onChange }: Props) {
  const uid = useId();
  const nodes = block.nodes ?? [];
  const cases = block.cases ?? [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const set = (patch: Partial<BranchDiagnosisBlock>) => onChange({ ...block, ...patch });

  const setNode = (i: number, patch: Partial<Node>) => set({ nodes: nodes.map((n, k) => (k === i ? { ...n, ...patch } : n)) });
  const setCase = (i: number, patch: Partial<Case>) => set({ cases: cases.map((c, k) => (k === i ? { ...c, ...patch } : c)) });

  /** Nút đang đứng trước bước k của một tình huống (undefined = đã tới lá / đường hỏng). */
  const nodeBefore = (c: Case, k: number): Node | undefined => {
    let node = byId.get(block.rootId);
    for (let j = 0; j < k; j++) {
      const ch = node?.choices.find((x) => x.id === c.steps[j]?.choiceId);
      node = ch?.next ? byId.get(ch.next) : undefined;
    }
    return node;
  };

  const chooseStep = (ci: number, k: number, choiceId: string) => {
    const c = cases[ci];
    const steps = c.steps.slice(0, k);
    steps.push({ choiceId, explanation: c.steps[k]?.explanation ?? '' });
    setCase(ci, { steps });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor={`${uid}-t`} className="mb-1 block text-sm font-medium text-gray-700">
          Tiêu đề
        </label>
        <input id={`${uid}-t`} type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-i`} className="mb-1 block text-sm font-medium text-gray-700">
          Hướng dẫn
        </label>
        <input id={`${uid}-i`} type="text" value={block.instruction ?? ''} onChange={(e) => set({ instruction: e.target.value })} className={inputClass} />
      </div>

      {/* Cây */}
      <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3">
        <legend className="px-1 text-sm font-medium text-gray-700">Cây quyết định</legend>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={`${uid}-root`} className="text-gray-700">
            Nút gốc
          </label>
          <select id={`${uid}-root`} value={block.rootId} onChange={(e) => set({ rootId: e.target.value })} className={smallInput}>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </div>
        {nodes.map((n, i) => (
          <div key={i} role="group" aria-label={`Nút ${n.id}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Mã nút ${i + 1}`}
                value={n.id}
                onChange={(e) => setNode(i, { id: e.target.value })}
                className={`${smallInput} w-24 font-mono`}
              />
              <input
                type="text"
                aria-label={`Câu hỏi của nút ${n.id}`}
                placeholder="Câu hỏi, VD: Bước 0: lúc này mình đang…"
                value={n.question}
                onChange={(e) => setNode(i, { question: e.target.value })}
                className={inputClass}
              />
              {nodes.length > 1 && (
                <button type="button" aria-label={`Xoá nút ${n.id}`} onClick={() => set({ nodes: nodes.filter((_, k) => k !== i) })} className="p-2 text-gray-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {n.choices.map((c, j) => (
              <div key={j} className="ml-4 flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Mã lựa chọn ${j + 1} của nút ${n.id}`}
                  value={c.id}
                  onChange={(e) => setNode(i, { choices: n.choices.map((x, k) => (k === j ? { ...x, id: e.target.value } : x)) })}
                  className={`${smallInput} w-20 font-mono`}
                />
                <input
                  type="text"
                  aria-label={`Nhãn lựa chọn ${j + 1} của nút ${n.id}`}
                  value={c.label}
                  onChange={(e) => setNode(i, { choices: n.choices.map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) })}
                  className={inputClass}
                />
                <select
                  aria-label={`Lựa chọn ${j + 1} dẫn tới`}
                  value={c.next ?? ''}
                  onChange={(e) =>
                    setNode(i, { choices: n.choices.map((x, k) => (k === j ? { ...x, next: e.target.value || undefined } : x)) })
                  }
                  className={smallInput}
                >
                  <option value="">(lá)</option>
                  {nodes
                    .filter((m) => m.id !== n.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        → {m.id}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  aria-label={`Xoá lựa chọn ${j + 1} của nút ${n.id}`}
                  onClick={() => setNode(i, { choices: n.choices.filter((_, k) => k !== j) })}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNode(i, { choices: [...n.choices, { id: newId('c', n.choices.length), label: '' }] })}
              className="ml-4 flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Thêm lựa chọn
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ nodes: [...nodes, { id: `n${nodes.length + 1}`, question: '', choices: [{ id: newId('c', 0), label: '' }, { id: newId('c', 1), label: '' }] }] })}
          className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm nút
        </button>
      </fieldset>

      {/* Bước cuối */}
      <fieldset className="space-y-2 rounded-lg border border-gray-200 p-3">
        <legend className="px-1 text-sm font-medium text-gray-700">Bước cuối (tuỳ chọn, VD: cách tự vệ)</legend>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(block.final)}
            onChange={(e) => set({ final: e.target.checked ? { question: '', options: [{ id: 'f1', label: '' }, { id: 'f2', label: '' }] } : undefined })}
          />
          Có bước cuối
        </label>
        {block.final && (
          <>
            <input
              type="text"
              aria-label="Câu hỏi bước cuối"
              placeholder="VD: Cách tự vệ hợp nhất?"
              value={block.final.question}
              onChange={(e) => set({ final: { ...block.final!, question: e.target.value } })}
              className={inputClass}
            />
            {block.final.options.map((o, j) => (
              <div key={j} className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Mã đáp án cuối ${j + 1}`}
                  value={o.id}
                  onChange={(e) => set({ final: { ...block.final!, options: block.final!.options.map((x, k) => (k === j ? { ...x, id: e.target.value } : x)) } })}
                  className={`${smallInput} w-20 font-mono`}
                />
                <input
                  type="text"
                  aria-label={`Nhãn đáp án cuối ${j + 1}`}
                  value={o.label}
                  onChange={(e) => set({ final: { ...block.final!, options: block.final!.options.map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) } })}
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={`Xoá đáp án cuối ${j + 1}`}
                  onClick={() => set({ final: { ...block.final!, options: block.final!.options.filter((_, k) => k !== j) } })}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set({ final: { ...block.final!, options: [...block.final!.options, { id: `f${block.final!.options.length + 1}`, label: '' }] } })}
              className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Thêm đáp án
            </button>
          </>
        )}
      </fieldset>

      {/* Tình huống */}
      <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3">
        <legend className="px-1 text-sm font-medium text-gray-700">Tình huống ({cases.length})</legend>
        {cases.map((c, ci) => {
          const rows: React.ReactNode[] = [];
          for (let k = 0; k <= c.steps.length; k++) {
            const node = nodeBefore(c, k);
            if (!node) break;
            rows.push(
              <div key={k} className="ml-4 space-y-1">
                <label className="block text-xs text-gray-700">
                  Bước {k + 1}: {node.question || node.id}
                  <select
                    value={c.steps[k]?.choiceId ?? ''}
                    onChange={(e) => e.target.value && chooseStep(ci, k, e.target.value)}
                    className={`${smallInput} ml-2`}
                  >
                    <option value="">-- chọn đáp án đúng --</option>
                    {node.choices.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label || ch.id}
                      </option>
                    ))}
                  </select>
                </label>
                {c.steps[k] && (
                  <textarea
                    aria-label={`Giải thích bước ${k + 1}, tình huống ${ci + 1}`}
                    placeholder="Giải thích, hiện khi người học chọn đúng"
                    rows={2}
                    value={c.steps[k].explanation}
                    onChange={(e) => setCase(ci, { steps: c.steps.map((s, j) => (j === k ? { ...s, explanation: e.target.value } : s)) })}
                    className={inputClass}
                  />
                )}
              </div>
            );
          }
          return (
            <div key={ci} role="group" aria-label={`Tình huống ${ci + 1}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
              <div className="flex items-start gap-2">
                <span className="pt-2 text-sm font-semibold text-gray-900">{ci + 1}.</span>
                <textarea
                  aria-label={`Nội dung tình huống ${ci + 1}`}
                  rows={3}
                  value={c.text}
                  onChange={(e) => setCase(ci, { text: e.target.value })}
                  className={inputClass}
                />
                <button type="button" aria-label={`Xoá tình huống ${ci + 1}`} onClick={() => set({ cases: cases.filter((_, k) => k !== ci) })} className="p-2 text-gray-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {rows}
              {block.final && (
                <div className="ml-4 space-y-1">
                  <label className="block text-xs text-gray-700">
                    Bước cuối: {block.final.question}
                    <select
                      value={c.finalAnswer?.optionId ?? ''}
                      onChange={(e) => setCase(ci, { finalAnswer: { optionId: e.target.value, explanation: c.finalAnswer?.explanation ?? '' } })}
                      className={`${smallInput} ml-2`}
                    >
                      <option value="">-- chọn --</option>
                      {block.final.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label || o.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <textarea
                    aria-label={`Giải thích bước cuối, tình huống ${ci + 1}`}
                    rows={2}
                    value={c.finalAnswer?.explanation ?? ''}
                    onChange={(e) => setCase(ci, { finalAnswer: { optionId: c.finalAnswer?.optionId ?? '', explanation: e.target.value } })}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => set({ cases: [...cases, { id: newId('case', cases.length), text: '', steps: [] }] })}
          className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm tình huống
        </button>
      </fieldset>
    </div>
  );
}
