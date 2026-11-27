import { describe, it, expect } from 'vitest';
import { judge, sentenceOfSegments, splitSentences, NO_BIAS } from '@/lib/blocks/bias-detector';
import { checkBlock, STRICT_BLOCK_SCHEMAS } from '@/lib/schemas/blocks';

describe('splitSentences', () => {
  it('splits on . ! ? … followed by a space, keeping char offsets', () => {
    const text = 'Câu một. Câu hai! Câu ba? Câu bốn… Hết';
    const spans = splitSentences(text);
    expect(spans.map((s) => s.text)).toEqual(['Câu một.', 'Câu hai!', 'Câu ba?', 'Câu bốn…', 'Hết']);
    for (const s of spans) expect(text.slice(s.start, s.end)).toBe(s.text);
  });

  it('does not split numbers, abbreviations or a dot not followed by a space', () => {
    const spans = splitSentences('Giá 8.000.000đ ở TP.HCM tăng 3.5%. Xong.');
    expect(spans.map((s) => s.text)).toEqual(['Giá 8.000.000đ ở TP.HCM tăng 3.5%.', 'Xong.']);
  });

  it('keeps closing quotes with the sentence and splits on new lines', () => {
    const spans = splitSentences('Anh ấy nói: "Ổn cả." Tôi tin.\nDòng không dấu chấm\n\nDòng cuối.');
    expect(spans.map((s) => s.text)).toEqual(['Anh ấy nói: "Ổn cả."', 'Tôi tin.', 'Dòng không dấu chấm', 'Dòng cuối.']);
  });

  it('maps segments to the sentence that contains them', () => {
    const text = 'Một hai ba. Bốn năm sáu.';
    const sens = splitSentences(text);
    expect(
      sentenceOfSegments(sens, [
        { startIndex: text.indexOf('năm'), text: 'năm' },
        { startIndex: text.indexOf('ba. Bốn'), text: 'ba. Bốn' },
      ])
    ).toEqual([1, -1]);
  });
});

describe('judge', () => {
  it('grades every combination', () => {
    expect(judge('a', 'a')).toBe('correct');
    expect(judge('a', 'b')).toBe('wrong-type');
    expect(judge('a', undefined)).toBe('missed');
    expect(judge('a', NO_BIAS)).toBe('missed');
    expect(judge(NO_BIAS, 'a')).toBe('false-alarm');
    expect(judge(undefined, 'a')).toBe('false-alarm');
    expect(judge(NO_BIAS, NO_BIAS)).toBe('correct');
    expect(judge(undefined, undefined)).toBe('clear');
  });
});

const article = 'Anh họ mình ra trường có việc ngay. Ngành này chắc chắn dễ xin việc. Hôm nay trời đẹp.';
const bias = (extra: object) => ({
  type: 'bias-detector',
  instruction: 'Tìm lỗi',
  article: { text: article },
  biasOptions: [{ id: 'avail', label: 'Sẵn có' }],
  segments: [],
  ...extra,
});

describe('bias-detector schema', () => {
  it('accepts a "none" distractor in marked mode and keeps old blocks valid', () => {
    const seg = { id: 's1', text: 'Hôm nay trời đẹp.', startIndex: article.indexOf('Hôm nay'), biasType: NO_BIAS, explanation: '' };
    expect(checkBlock(bias({ segments: [seg] })).ok).toBe(true);
  });

  it('find mode: a segment must sit inside one sentence, one per sentence, no "none"', () => {
    const ok = { id: 's1', text: 'Anh họ mình', startIndex: 0, biasType: 'avail', explanation: '' };
    expect(checkBlock(bias({ mode: 'find', segments: [ok] })).ok).toBe(true);

    const across = { id: 's2', text: 'ngay. Ngành', startIndex: article.indexOf('ngay. Ngành'), biasType: 'avail', explanation: '' };
    expect(checkBlock(bias({ mode: 'find', segments: [across] })).ok).toBe(false);

    const twin = { id: 's3', text: 'ra trường', startIndex: article.indexOf('ra trường'), biasType: 'avail', explanation: '' };
    expect(checkBlock(bias({ mode: 'find', segments: [ok, twin] })).ok).toBe(false);

    const none = { id: 's4', text: 'Hôm nay', startIndex: article.indexOf('Hôm nay'), biasType: NO_BIAS, explanation: '' };
    expect(checkBlock(bias({ mode: 'find', segments: [none] })).ok).toBe(false);
  });

  it('refuses "none" declared as an option', () => {
    expect(checkBlock(bias({ biasOptions: [{ id: NO_BIAS, label: 'x' }] })).ok).toBe(false);
  });
});

const image = (regions: object[]) => ({
  type: 'image-bias-detector',
  instruction: 'Chạm',
  image: { src: '', alt: 'Banner' },
  biasOptions: [{ id: 'anchoring', label: 'Mỏ neo' }],
  regions,
});

describe('image-bias-detector schema', () => {
  const r = { id: 'r1', label: 'Giá gạch', x: 10, y: 10, w: 30, h: 20, biasType: 'anchoring', explanation: '' };
  it('accepts regions inside the image, including "none"', () => {
    expect(checkBlock(image([r, { ...r, id: 'r2', biasType: NO_BIAS }])).ok).toBe(true);
    expect(STRICT_BLOCK_SCHEMAS['image-bias-detector'].safeParse(image([r])).success).toBe(true);
  });
  it('refuses regions outside the image or with unknown types', () => {
    expect(checkBlock(image([{ ...r, x: 80, w: 30 }])).ok).toBe(false);
    expect(checkBlock(image([{ ...r, w: 0 }])).ok).toBe(false);
    expect(checkBlock(image([{ ...r, biasType: 'x' }])).ok).toBe(false);
  });
});

const tree = {
  type: 'branch-diagnosis',
  rootId: 'n0',
  nodes: [
    { id: 'n0', question: 'Bước 0', choices: [{ id: 'doan', label: 'Đoán nhanh' }, { id: 'giu', label: 'Giữ', next: 'n1' }] },
    { id: 'n1', question: 'Thách thức', choices: [{ id: 'moi', label: 'Tin mới' }, { id: 'bac', label: 'Bị bác' }] },
  ],
  final: { question: 'Tự vệ?', options: [{ id: 'o', label: 'Outside' }, { id: 'p', label: 'Popper' }] },
};
const withCases = (cases: object[], patch: object = {}) => ({ ...tree, ...patch, cases });

describe('branch-diagnosis schema', () => {
  const good = { id: 'c1', text: 't', steps: [{ choiceId: 'giu', explanation: '' }, { choiceId: 'moi', explanation: '' }], finalAnswer: { optionId: 'p', explanation: '' } };
  it('accepts a path from the root to a leaf', () => {
    expect(checkBlock(withCases([good])).ok).toBe(true);
    expect(STRICT_BLOCK_SCHEMAS['branch-diagnosis'].safeParse(withCases([good])).success).toBe(true);
  });
  it('refuses a path that stops early, overshoots, or picks a choice of another node', () => {
    expect(checkBlock(withCases([{ ...good, steps: [{ choiceId: 'giu', explanation: '' }] }])).ok).toBe(false);
    expect(checkBlock(withCases([{ ...good, steps: [{ choiceId: 'doan', explanation: '' }, { choiceId: 'moi', explanation: '' }] }])).ok).toBe(false);
    expect(checkBlock(withCases([{ ...good, steps: [{ choiceId: 'moi', explanation: '' }] }])).ok).toBe(false);
  });
  it('requires a valid final answer when the block has a final step', () => {
    expect(checkBlock(withCases([{ ...good, finalAnswer: undefined }])).ok).toBe(false);
    expect(checkBlock(withCases([{ ...good, finalAnswer: { optionId: 'zz', explanation: '' } }])).ok).toBe(false);
  });
  it('refuses a cycle', () => {
    const cyclic = {
      nodes: [
        { id: 'n0', question: 'a', choices: [{ id: 'x', label: 'x', next: 'n1' }, { id: 'y', label: 'y' }] },
        { id: 'n1', question: 'b', choices: [{ id: 'z', label: 'z', next: 'n0' }, { id: 'w', label: 'w' }] },
      ],
      final: undefined,
    };
    expect(checkBlock(withCases([], cyclic)).ok).toBe(false);
  });
});

describe('demo mocks', () => {
  it('all validate', async () => {
    const m = await import('@/lib/blocks/demo-mocks');
    for (const b of [m.mockBiasDetectorFind, m.mockImageBiasDetector, m.mockBranchDiagnosis]) {
      const r = checkBlock(b);
      expect(r.ok ? [] : r.errors).toEqual([]);
    }
  });
});
