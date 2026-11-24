import { describe, it, expect } from 'vitest';
import { allocateDots } from '@/lib/utils/allocateDots';
import { checkBlock, STRICT_BLOCK_SCHEMAS } from '@/lib/schemas/blocks';

describe('allocateDots', () => {
  it('always sums to the total', () => {
    for (const pops of [[90_700, 13_700_000], [1, 1, 1], [5, 0, 7], [3, 3, 3, 1]]) {
      expect(allocateDots(pops, 1000).reduce((a, b) => a + b, 0)).toBe(1000);
    }
  });

  it('follows the real proportions', () => {
    // 90.700 giảng viên / 13,7 triệu người làm nông → khoảng 7 trên 1.000.
    expect(allocateDots([90_700, 13_700_000], 1000)).toEqual([7, 993]);
  });

  it('gives a non-empty group at least one dot, an empty group none', () => {
    const [tiny, big, none] = allocateDots([1, 10_000_000, 0], 1000);
    expect(tiny).toBe(1);
    expect(big).toBe(999);
    expect(none).toBe(0);
  });

  it('handles no population', () => {
    expect(allocateDots([0, 0], 1000)).toEqual([0, 0]);
  });
});

const valid = {
  type: 'base-rate-crowd',
  description: 'Anh Nam đeo kính, thích đọc sách.',
  groups: [
    { id: 'g1', label: 'Giảng viên', population: 90_700, matchPercent: 30 },
    { id: 'g2', label: 'Làm nông', population: 13_700_000, matchPercent: 1 },
  ],
  targetGroupId: 'g1',
};

describe('base-rate-crowd schemas', () => {
  it('accepts a valid block', () => {
    expect(checkBlock(valid).ok).toBe(true);
    expect(STRICT_BLOCK_SCHEMAS['base-rate-crowd'].safeParse(valid).success).toBe(true);
  });

  it('rejects a target that is not a group', () => {
    const r = checkBlock({ ...valid, targetGroupId: 'g9' });
    expect(r.ok).toBe(false);
    expect(STRICT_BLOCK_SCHEMAS['base-rate-crowd'].safeParse({ ...valid, targetGroupId: 'g9' }).success).toBe(false);
  });

  it('rejects one group, duplicate ids, bad numbers', () => {
    expect(checkBlock({ ...valid, groups: [valid.groups[0]] }).ok).toBe(false);
    expect(checkBlock({ ...valid, groups: [valid.groups[0], { ...valid.groups[1], id: 'g1' }] }).ok).toBe(false);
    expect(checkBlock({ ...valid, groups: [valid.groups[0], { ...valid.groups[1], matchPercent: 120 }] }).ok).toBe(false);
    expect(checkBlock({ ...valid, groups: [valid.groups[0], { ...valid.groups[1], population: 0 }] }).ok).toBe(false);
  });
});
