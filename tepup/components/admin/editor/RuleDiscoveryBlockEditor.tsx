'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RuleDiscoveryBlock } from './types';
import { checkExpression, RULE_DISCOVERY_VARS } from '@/lib/schemas/blocks';
import { evaluateCondition } from '@/lib/security/safe-expr';

interface Props {
  block: RuleDiscoveryBlock;
  onChange: (block: RuleDiscoveryBlock) => void;
}

const INPUT =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

export default function RuleDiscoveryBlockEditor({ block, onChange }: Props) {
  const uid = useId();
  const example = block.example ?? [2, 4, 6];
  const options = block.options ?? [];

  const ruleError = block.rule?.trim() ? checkExpression(block.rule, RULE_DISCOVERY_VARS) : 'chưa có quy luật';
  const exampleOk =
    !ruleError && evaluateCondition(block.rule, { a: example[0], b: example[1], c: example[2] });

  function setExample(i: number, raw: string) {
    const n = Number(raw);
    const next = [...example] as [number, number, number];
    next[i] = Number.isFinite(n) ? n : 0;
    onChange({ ...block, example: next });
  }

  function updateOption(i: number, text: string) {
    onChange({ ...block, options: options.map((o, j) => (j === i ? { ...o, text } : o)) });
  }
  function setCorrect(i: number) {
    onChange({ ...block, options: options.map((o, j) => ({ ...o, isCorrect: j === i })) });
  }
  function addOption() {
    const id = String(Math.max(0, ...options.map((o) => Number(o.id) || 0)) + 1);
    onChange({ ...block, options: [...options, { id, text: '', isCorrect: false }] });
  }
  function removeOption(i: number) {
    if (options.length <= 2) return;
    const next = options.filter((_, j) => j !== i);
    // Xoá đúng lựa chọn đúng thì gán lại cho lựa chọn đầu, để luôn có đúng 1 đáp án đúng.
    if (!next.some((o) => o.isCorrect)) next[0] = { ...next[0], isCorrect: true };
    onChange({ ...block, options: next });
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${uid}-title`} className={LABEL}>Tiêu đề</label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Tìm quy luật bí mật"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-instruction`} className={LABEL}>Luật chơi (tuỳ chọn)</label>
        <textarea
          id={`${uid}-instruction`}
          rows={2}
          value={block.instruction ?? ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="Bỏ trống để dùng lời mặc định: nhập ba số, xem đúng/sai, rồi chọn quy luật."
          className={`${INPUT} resize-none`}
        />
      </div>

      <fieldset>
        <legend className={LABEL}>Bộ số mẫu (hiện sẵn là “Đúng”)</legend>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="number"
              aria-label={`Số mẫu ${i + 1}`}
              value={example[i]}
              onChange={(e) => setExample(i, e.target.value)}
              className={`${INPUT} w-24`}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-rule`} className={LABEL}>
          Quy luật bí mật <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-rule`}
          type="text"
          aria-required="true"
          aria-describedby={`${uid}-rule-help ${uid}-rule-status`}
          value={block.rule ?? ''}
          onChange={(e) => onChange({ ...block, rule: e.target.value })}
          placeholder="a < b && b < c"
          className={`${INPUT} font-mono`}
        />
        <p id={`${uid}-rule-help`} className="mt-1 text-xs text-gray-500">
          Điều kiện theo ba số <code>a</code>, <code>b</code>, <code>c</code>. Dùng <code>&lt; &lt;= &gt; &gt;= == !=</code>,{' '}
          <code>&amp;&amp; ||</code>, <code>+ - * / % **</code>, <code>min/max/abs/round</code>. Ví dụ: <code>a &lt; b &amp;&amp; b &lt; c</code>{' '}
          (tăng dần), <code>a % 2 == 0 &amp;&amp; b % 2 == 0 &amp;&amp; c % 2 == 0</code> (đều chẵn).
        </p>
        <p
          id={`${uid}-rule-status`}
          className={`mt-1 text-xs font-medium ${ruleError || !exampleOk ? 'text-red-700' : 'text-green-700'}`}
        >
          {ruleError
            ? `Quy luật chưa hợp lệ: ${ruleError}`
            : exampleOk
              ? 'Hợp lệ — bộ số mẫu thoả quy luật.'
              : 'Bộ số mẫu KHÔNG thoả quy luật — người học sẽ thấy mẫu sai.'}
        </p>
      </div>

      <div>
        <label htmlFor={`${uid}-question`} className={LABEL}>
          Câu hỏi chốt <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-question`}
          type="text"
          aria-required="true"
          value={block.question ?? ''}
          onChange={(e) => onChange({ ...block, question: e.target.value })}
          placeholder="Theo bạn, quy luật bí mật là gì?"
          className={INPUT}
        />
      </div>

      <fieldset>
        <legend className={LABEL}>Các lựa chọn (chọn một đáp án đúng)</legend>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`${uid}-correct`}
                checked={o.isCorrect}
                onChange={() => setCorrect(i)}
                aria-label={`Lựa chọn ${i + 1} là đáp án đúng`}
                className="h-4 w-4"
              />
              <input
                type="text"
                aria-label={`Nội dung lựa chọn ${i + 1}`}
                value={o.text}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={i === 0 ? 'Ba số tăng dần' : 'Một quy luật hẹp hơn, vd. Ba số chẵn liên tiếp'}
                className={`${INPUT} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                aria-disabled={options.length <= 2}
                aria-label={`Xoá lựa chọn ${i + 1}`}
                className="p-2 text-gray-500 hover:text-red-700 aria-disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm lựa chọn
        </button>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-explanation`} className={LABEL}>Lời giải (hiện sau khi chốt)</label>
        <textarea
          id={`${uid}-explanation`}
          rows={3}
          value={block.explanation ?? ''}
          onChange={(e) => onChange({ ...block, explanation: e.target.value })}
          placeholder="Quy luật chỉ là “ba số tăng dần”… (ghi nguồn)"
          className={`${INPUT} resize-none`}
        />
      </div>
    </div>
  );
}
