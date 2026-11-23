import { describe, it, expect } from 'vitest';
import { changeLabel, MAX_PERIOD_DAYS, presetPeriod, previousOf, resolvePeriod, vnToday } from '@/lib/analytics/period';

describe('report periods (Vietnam days)', () => {
  it('uses the Vietnam calendar day', () => {
    expect(vnToday(Date.UTC(2026, 10, 22, 16, 59))).toBe('2026-11-22');
    expect(vnToday(Date.UTC(2026, 10, 22, 17, 0))).toBe('2026-11-23');
  });

  it('builds presets', () => {
    const today = '2026-11-23';
    expect(presetPeriod('this-month', today)).toEqual({ from: '2026-11-01', to: '2026-11-23', days: 23 });
    expect(presetPeriod('last-month', today)).toEqual({ from: '2026-10-01', to: '2026-10-31', days: 31 });
    expect(presetPeriod('this-quarter', today)).toEqual({ from: '2026-10-01', to: '2026-11-23', days: 54 });
    expect(presetPeriod('last-quarter', today)).toEqual({ from: '2026-07-01', to: '2026-09-30', days: 92 });
    expect(presetPeriod('last-12-months', today).days).toBe(365);
    expect(presetPeriod('last-month', '2026-01-15')).toEqual({ from: '2025-12-01', to: '2025-12-31', days: 31 });
    expect(presetPeriod('last-quarter', '2026-02-10').from).toBe('2025-10-01');
  });

  it('gives the previous period of the same length', () => {
    expect(previousOf({ from: '2026-11-01', to: '2026-11-30', days: 30 })).toEqual({ from: '2026-10-02', to: '2026-10-31', days: 30 });
  });

  it('falls back to this month for bad input, clamps to today, caps the length', () => {
    const today = '2026-11-23';
    const month = { from: '2026-11-01', to: '2026-11-23', days: 23 };
    expect(resolvePeriod(undefined, undefined, today).current).toEqual(month);
    expect(resolvePeriod('2026-11-10', '2026-11-01', today).current).toEqual(month);
    expect(resolvePeriod('2026-02-30', '2026-03-01', today).current).toEqual(month);
    expect(resolvePeriod("2026-11-01'; drop", '2026-11-02', today).current).toEqual(month);
    expect(resolvePeriod('2026-11-20', '2026-12-31', today).current).toEqual({ from: '2026-11-20', to: '2026-11-23', days: 4 });
    expect(resolvePeriod('2024-01-01', '2026-11-01', today).current).toEqual(month);
    expect(resolvePeriod('2025-11-23', '2026-11-23', today).current.days).toBe(MAX_PERIOD_DAYS);
  });

  it('labels change against the previous period', () => {
    expect(changeLabel(112, 100)).toBe('+12%');
    expect(changeLabel(95, 100)).toBe('−5%');
    expect(changeLabel(5, 0)).toBe('—');
    expect(changeLabel(100, 100)).toBe('0%');
  });
});
