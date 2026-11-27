/**
 * Logic dùng chung của hai block "soi thiên kiến": `bias-detector` (văn bản) và
 * `image-bias-detector` (hình ảnh). Chạy được cả ở server (schema) lẫn trình duyệt
 * (component), nên không import gì từ React.
 */

/**
 * `biasType` đặc biệt: vùng/cụm này KHÔNG có lỗi (vùng nhiễu). Người học vẫn phải
 * xét nó; chọn một thiên kiến cho nó là "bắt nhầm". Không cần khai trong `biasOptions`:
 * renderer tự thêm lựa chọn "Không có lỗi" khi block có ít nhất một vùng như vậy.
 */
export const NO_BIAS = 'none';
export const NO_BIAS_LABEL = 'Không có lỗi';

export type DetectorMode = 'marked' | 'find';

export interface TextSpan {
  start: number;
  /** Vị trí ngay sau ký tự cuối (như `slice`). */
  end: number;
  text: string;
}

/** Dấu kết câu, và những gì được phép dính sau nó (ngoặc kép, ngoặc đóng). */
const SENTENCE_END = /[.!?…]+["”’»)\]]*/g;

/**
 * Tách một đoạn văn thành câu, giữ nguyên vị trí ký tự trong chuỗi gốc.
 *
 * Một câu kết thúc ở `. ! ? …` (kèm ngoặc kép, ngoặc đóng nếu có) khi ngay sau đó là
 * khoảng trắng hoặc hết chuỗi. Vì vậy "8.000.000đ", "TP.HCM" hay "3.5" không bị tách.
 * Xuống dòng cũng kết thúc một câu (dòng tiêu đề, gạch đầu dòng không có dấu chấm).
 * Khoảng trắng ở hai đầu mỗi câu bị bỏ khỏi span; câu rỗng bị bỏ.
 */
export function splitSentences(text: string): TextSpan[] {
  const cuts: number[] = [];
  for (const m of text.matchAll(SENTENCE_END)) {
    const after = m.index + m[0].length;
    if (after >= text.length || /\s/.test(text[after])) cuts.push(after);
  }
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') cuts.push(i);
  cuts.push(text.length);
  cuts.sort((a, b) => a - b);

  const spans: TextSpan[] = [];
  let from = 0;
  for (const cut of cuts) {
    if (cut <= from) continue;
    let s = from;
    let e = cut;
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (e > s) spans.push({ start: s, end: e, text: text.slice(s, e) });
    from = cut;
  }
  return spans;
}

/**
 * Chế độ "tự tìm": câu nào chứa cụm lỗi nào. Trả về chỉ số câu cho từng cụm
 * (-1 nếu cụm vắt qua hai câu hoặc không nằm trong câu nào).
 */
export function sentenceOfSegments(
  sentences: TextSpan[],
  segments: { startIndex: number; text: string }[]
): number[] {
  return segments.map((seg) => {
    const s = seg.startIndex;
    const e = seg.startIndex + seg.text.length;
    return sentences.findIndex((sen) => s >= sen.start && e <= sen.end);
  });
}

/** Kết quả chấm một lựa chọn của người học. */
export type Verdict = 'correct' | 'wrong-type' | 'missed' | 'false-alarm' | 'clear';

/**
 * Chấm một đơn vị (câu, cụm, vùng ảnh).
 * - `answer`: biasType đúng, `NO_BIAS` hoặc `undefined` (câu không có lỗi ở chế độ tự tìm).
 * - `picked`: lựa chọn của người học, hoặc `undefined` nếu không chọn.
 */
export function judge(answer: string | undefined, picked: string | undefined): Verdict {
  const hasBias = answer !== undefined && answer !== NO_BIAS;
  const pickedBias = picked !== undefined && picked !== NO_BIAS;
  if (hasBias) {
    if (!pickedBias) return 'missed';
    return picked === answer ? 'correct' : 'wrong-type';
  }
  if (pickedBias) return 'false-alarm';
  return picked === NO_BIAS ? 'correct' : 'clear';
}
