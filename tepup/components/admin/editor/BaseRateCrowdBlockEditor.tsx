'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BaseRateCrowdBlock, BaseRateCrowdColor } from './types';

interface Props {
  block: BaseRateCrowdBlock;
  onChange: (block: BaseRateCrowdBlock) => void;
}

const INPUT =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';
const COLORS: { value: BaseRateCrowdColor; label: string }[] = [
  { value: 'sky', label: 'Xanh trời' },
  { value: 'amber', label: 'Hổ phách' },
  { value: 'emerald', label: 'Xanh lục' },
  { value: 'violet', label: 'Tím' },
];

export default function BaseRateCrowdBlockEditor({ block, onChange }: Props) {
  const uid = useId();
  const groups = block.groups ?? [];
  const total = groups.reduce((a, g) => a + (g.population > 0 ? g.population : 0), 0);
  const matched = groups.map((g) => (Math.max(0, g.population) * (g.matchPercent ?? 0)) / 100);
  const matchedTotal = matched.reduce((a, b) => a + b, 0);
  const ti = groups.findIndex((g) => g.id === block.targetGroupId);
  const chance = ti >= 0 && matchedTotal > 0 ? (matched[ti] / matchedTotal) * 100 : null;

  function updateGroup(i: number, patch: Partial<BaseRateCrowdBlock['groups'][number]>) {
    onChange({ ...block, groups: groups.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  }
  function addGroup() {
    if (groups.length >= 4) return;
    const id = `g${Math.max(0, ...groups.map((g) => Number(g.id.replace(/\D/g, '')) || 0)) + 1}`;
    const color = COLORS[groups.length % COLORS.length].value;
    onChange({ ...block, groups: [...groups, { id, label: '', population: 1000, matchPercent: 10, color }] });
  }
  function removeGroup(i: number) {
    if (groups.length <= 2) return;
    const next = groups.filter((_, j) => j !== i);
    const targetGroupId = next.some((g) => g.id === block.targetGroupId) ? block.targetGroupId : next[0].id;
    onChange({ ...block, groups: next, targetGroupId });
  }
  const num = (raw: string) => {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${uid}-title`} className={LABEL}>Tiêu đề</label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Đám đông theo tỉ lệ thật"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-instruction`} className={LABEL}>Hướng dẫn (tuỳ chọn)</label>
        <textarea
          id={`${uid}-instruction`}
          rows={2}
          value={block.instruction ?? ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="Bỏ trống để dùng lời mặc định: mỗi hình là một người, chỉnh % khớp mô tả, đoán trước rồi bấm lọc."
          className={`${INPUT} resize-none`}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-description`} className={LABEL}>
          Mô tả &quot;giống khuôn mẫu&quot; <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-description`}
          rows={2}
          aria-required="true"
          value={block.description ?? ''}
          onChange={(e) => onChange({ ...block, description: e.target.value })}
          placeholder="Anh Nam đeo kính, nói năng chừng mực, thích đọc sách…"
          className={`${INPUT} resize-none`}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-subject`} className={LABEL}>Người được mô tả (tuỳ chọn)</label>
        <input
          id={`${uid}-subject`}
          type="text"
          value={block.subject ?? ''}
          onChange={(e) => onChange({ ...block, subject: e.target.value })}
          placeholder="anh Nam (dùng trong câu “Khả năng anh Nam là …”)"
          className={INPUT}
        />
      </div>

      <fieldset>
        <legend className={LABEL}>Các nhóm (2-4) và nhóm đích</legend>
        <p className="mb-2 text-xs text-gray-500">
          Số người là số thật (ghi nguồn trong bài). Lưới 1.000 chấm chia theo tỉ lệ này; nhóm nhỏ vẫn có ít nhất 1 chấm.
          Nhóm đích là nhóm mà mô tả trông &quot;giống&quot;.
        </p>
        <div className="space-y-3">
          {groups.map((g, i) => (
            <div key={g.id} className="rounded-lg border border-gray-300 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${uid}-target`}
                  checked={block.targetGroupId === g.id}
                  onChange={() => onChange({ ...block, targetGroupId: g.id })}
                  aria-label={`Nhóm ${i + 1} là nhóm đích`}
                  className="h-4 w-4"
                />
                <input
                  type="text"
                  aria-label={`Tên nhóm ${i + 1}`}
                  value={g.label}
                  onChange={(e) => updateGroup(i, { label: e.target.value })}
                  placeholder={i === 0 ? 'Giảng viên đại học' : 'Người làm nông, lâm nghiệp, thuỷ sản'}
                  className={`${INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeGroup(i)}
                  aria-disabled={groups.length <= 2}
                  aria-label={`Xoá nhóm ${i + 1}`}
                  className="p-2 text-gray-500 hover:text-red-700 aria-disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="text-xs text-gray-600">
                  Số người
                  <input
                    type="number"
                    min={0}
                    value={g.population}
                    onChange={(e) => updateGroup(i, { population: num(e.target.value) })}
                    className={INPUT}
                  />
                </label>
                <label className="text-xs text-gray-600">
                  % khớp mô tả (mặc định)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={g.matchPercent}
                    onChange={(e) => updateGroup(i, { matchPercent: num(e.target.value) })}
                    className={INPUT}
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Màu
                  <select
                    value={g.color ?? COLORS[i % COLORS.length].value}
                    onChange={(e) => updateGroup(i, { color: e.target.value as BaseRateCrowdColor })}
                    className={INPUT}
                  >
                    {COLORS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
        {groups.length < 4 && (
          <button
            type="button"
            onClick={addGroup}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm nhóm
          </button>
        )}
        <p className="mt-2 text-xs font-medium text-gray-700">
          {total > 0 && chance !== null
            ? `Với số mặc định: khả năng thuộc nhóm đích ≈ ${chance.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%.`
            : 'Cần ít nhất một nhóm có số người > 0 và chọn nhóm đích.'}
        </p>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-insight`} className={LABEL}>Lời chốt (hiện sau khi bấm lọc)</label>
        <textarea
          id={`${uid}-insight`}
          rows={3}
          value={block.insight ?? ''}
          onChange={(e) => onChange({ ...block, insight: e.target.value })}
          placeholder="Mô tả giống giảng viên hơn, nhưng vì người làm nông đông hơn gấp ~150 lần…"
          className={`${INPUT} resize-none`}
        />
      </div>
    </div>
  );
}
