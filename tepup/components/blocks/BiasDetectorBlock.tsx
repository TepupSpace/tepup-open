'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { BiasDetectorBlock as BiasDetectorBlockType } from '@/lib/types/content';
import { AlertTriangle, Check, X, RotateCcw } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { NO_BIAS, NO_BIAS_LABEL, judge, sentenceOfSegments, splitSentences, type Verdict } from '@/lib/blocks/bias-detector';
import BlockShell from './BlockShell';
import { useAnnouncer, useFocusAfterRender } from './useAnnouncer';

interface Props {
  block: BiasDetectorBlockType;
  onComplete?: () => void;
}

/**
 * Một đơn vị người học xét: một cụm được tô (chế độ 'marked') hoặc một câu (chế độ
 * 'find'). `answer` là biasType đúng; `undefined` = câu không có lỗi (chế độ tự tìm).
 */
interface Unit {
  id: string;
  start: number;
  end: number;
  text: string;
  answer: string | undefined;
  explanation?: string;
  /** Trong chế độ tự tìm: cụm lỗi nằm trong câu (để trích khi giải thích). */
  quote?: string;
}

const VERDICT_STYLE: Record<Verdict, string> = {
  correct: 'bg-green-100 border-green-600 text-green-900',
  'wrong-type': 'bg-red-100 border-red-600 text-red-900',
  missed: 'bg-red-50 border-red-600 border-dashed text-red-900',
  'false-alarm': 'bg-orange-100 border-orange-600 text-orange-900',
  clear: '',
};

const VERDICT_TAG: Record<Verdict, string> = {
  correct: 'Đúng',
  'wrong-type': 'Sai loại',
  missed: 'Bỏ sót',
  'false-alarm': 'Bắt nhầm',
  clear: '',
};

export default function BiasDetectorBlockComponent({ block, onComplete }: Props) {
  const find = block.mode === 'find';
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [message, announce] = useAnnouncer();
  const unitRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const menuRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const focusAfterRender = useFocusAfterRender();

  const text = block.article.text;
  const hasNoBias = !find && block.segments.some((s) => s.biasType === NO_BIAS);
  const options = useMemo(
    () => (hasNoBias ? [...block.biasOptions, { id: NO_BIAS, label: NO_BIAS_LABEL }] : block.biasOptions),
    [block.biasOptions, hasNoBias]
  );
  const labelOf = (id: string | undefined) => options.find((o) => o.id === id)?.label ?? id ?? '';

  const units: Unit[] = useMemo(() => {
    // startIndex lệch (nội dung cũ) thì tìm lại cụm trong văn bản; không thấy thì bỏ,
    // thay vì cắt sai chữ.
    const segments = block.segments
      .map((s) =>
        s.text && text.slice(s.startIndex, s.startIndex + s.text.length) !== s.text
          ? { ...s, startIndex: text.indexOf(s.text) }
          : s
      )
      .filter((s) => s.text && s.startIndex >= 0)
      .sort((a, b) => a.startIndex - b.startIndex);
    if (!find) {
      let last = 0;
      return segments
        .filter((s) => {
          const ok = s.startIndex >= last;
          if (ok) last = s.startIndex + s.text.length;
          return ok;
        })
        .map((s) => ({
          id: s.id,
          start: s.startIndex,
          end: s.startIndex + s.text.length,
          text: s.text,
          answer: s.biasType,
          explanation: s.explanation,
        }));
    }
    const sentences = splitSentences(text);
    const owner = sentenceOfSegments(sentences, segments);
    return sentences.map((sen, i) => {
      const k = owner.indexOf(i);
      const seg = k >= 0 ? segments[k] : undefined;
      return {
        id: `sen-${i}`,
        start: sen.start,
        end: sen.end,
        text: sen.text,
        answer: seg?.biasType,
        explanation: seg?.explanation,
        quote: seg && seg.text !== sen.text ? seg.text : undefined,
      };
    });
  }, [block.segments, text, find]);

  const pickedCount = units.filter((u) => picks[u.id]).length;
  const ready = find ? pickedCount > 0 : units.length > 0 && pickedCount === units.length;

  // Bấm ra ngoài danh sách thì đóng.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || unitRefs.current[active]?.contains(t)) return;
      setActive(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [active]);

  const closeMenu = (unitId: string) => {
    setActive(null);
    unitRefs.current[unitId]?.focus();
  };

  const pick = (unit: Unit, optionId: string | null) => {
    setPicks((prev) => {
      const next = { ...prev };
      if (optionId) next[unit.id] = optionId;
      else delete next[unit.id];
      return next;
    });
    closeMenu(unit.id);
    const n = units.filter((u) => (u.id === unit.id ? optionId : picks[u.id])).length;
    const where = find ? `Câu "${unit.text.slice(0, 60)}"` : `"${unit.text}"`;
    announce(
      optionId
        ? `${where}: đã chọn ${labelOf(optionId)}. ${find ? `Đã đánh dấu ${n} câu.` : `Đã phân loại ${n}/${units.length} cụm.`}`
        : `${where}: đã bỏ chọn. Đã đánh dấu ${n} câu.`
    );
  };

  const verdicts = useMemo(() => {
    const out: Record<string, Verdict> = {};
    units.forEach((u) => (out[u.id] = judge(u.answer, picks[u.id])));
    return out;
  }, [units, picks]);

  const count = (v: Verdict) => units.filter((u) => verdicts[u.id] === v).length;
  const biasUnits = units.filter((u) => u.answer !== undefined && u.answer !== NO_BIAS).length;

  const handleCheck = () => {
    setChecked(true);
    setActive(null);
    onComplete?.();
    focusAfterRender(() => summaryRef.current);
  };

  const handleReset = () => {
    setPicks({});
    setChecked(false);
    announce('Đã làm lại từ đầu.');
    const first = units[0]?.id;
    focusAfterRender(() => (first ? unitRefs.current[first] : null));
  };

  // --- đoạn văn -------------------------------------------------------------
  const renderUnit = (unit: Unit, index: number) => {
    const picked = picks[unit.id];
    const isActive = active === unit.id;
    const verdict = checked ? verdicts[unit.id] : undefined;
    const showVerdict = verdict && verdict !== 'clear';

    let look: string;
    if (showVerdict) look = `border-b-2 ${VERDICT_STYLE[verdict]}`;
    else if (checked) look = '';
    else if (picked) look = 'border-b-2 border-amber-600 bg-amber-100 text-amber-950';
    else if (find) look = isActive ? 'bg-amber-100' : 'hover:bg-amber-50';
    else look = isActive ? 'border-b-2 border-amber-600 bg-amber-200' : 'border-b-2 border-amber-500 bg-amber-50 hover:bg-amber-100';

    const interactive = !checked;
    const open = () => setActive(isActive ? null : unit.id);

    const cls = `rounded-sm px-0.5 [-webkit-box-decoration-break:clone] [box-decoration-break:clone] transition-colors ${look}`;
    const inner = (
      <>
        {!find && (
          <span
            aria-hidden="true"
            className="mr-1 inline-block min-w-[1.25rem] rounded bg-amber-700 px-1 text-center align-[0.1em] text-xs font-bold leading-5 text-white"
          >
            {index + 1}
          </span>
        )}
        <span className="sr-only">{find ? `Câu ${index + 1}: ` : `Cụm ${index + 1}: `}</span>
        {unit.text}
        {picked && !checked && <span className="sr-only">{`, đã chọn: ${labelOf(picked)}`}</span>}
      </>
    );

    return (
      <span key={unit.id} className="relative">
        {interactive ? (
          // Không dùng <button>: button là khối liền, không ngắt dòng như chữ, nên cụm dài
          // bị bật ra thành một khối căn giữa và đoạn văn vỡ. Span role="button" chạy liền
          // trong câu như chữ thường, vẫn Tab tới và bấm Enter/Space được.
          <span
            ref={(el) => {
              unitRefs.current[unit.id] = el;
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-haspopup="true"
            onClick={open}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
              } else if (e.key === 'Escape' && isActive) closeMenu(unit.id);
            }}
            className={`${cls} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700`}
          >
            {inner}
          </span>
        ) : (
          <span className={cls}>{inner}</span>
        )}
        {picked && !checked && (
          <span
            aria-hidden="true"
            className="ml-1 inline-block rounded bg-amber-200 px-1.5 align-[0.1em] text-xs font-bold leading-5 text-amber-900"
          >
            {labelOf(picked)}
          </span>
        )}
        {showVerdict && (
          <span
            className={`ml-1 inline-flex items-center gap-0.5 rounded px-1.5 align-[0.1em] text-xs font-bold leading-5 ${
              verdict === 'correct' ? 'bg-green-200 text-green-900' : verdict === 'false-alarm' ? 'bg-orange-200 text-orange-900' : 'bg-red-200 text-red-900'
            }`}
          >
            {verdict === 'correct' ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
            {VERDICT_TAG[verdict]}
            {verdict !== 'missed' && picked ? `: ${labelOf(picked)}` : ''}
          </span>
        )}
        {isActive && interactive && (
          <div
            ref={menuRef}
            role="group"
            aria-label={find ? `Chọn lỗi cho câu ${index + 1}` : `Chọn loại cho cụm ${index + 1}`}
            className="fixed inset-x-3 bottom-[calc(0.75rem+var(--bottom-chrome,0px)+var(--safe-bottom))] z-[58] max-h-[55dvh] overflow-y-auto rounded-xl border-2 border-amber-300 bg-white p-2 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:z-10 sm:mt-1 sm:max-h-none sm:w-max sm:min-w-[200px] sm:max-w-xs sm:shadow-lg"
          >
            <p className="mb-1 px-2 text-xs font-medium text-gray-600">{find ? 'Câu này mắc lỗi gì?' : 'Cụm này thuộc loại nào?'}</p>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={picked === option.id}
                onClick={() => pick(unit, option.id)}
                onKeyDown={(e) => e.key === 'Escape' && closeMenu(unit.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${
                  picked === option.id ? 'bg-amber-100 font-medium text-amber-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
            {find && picked && (
              <button
                type="button"
                onClick={() => pick(unit, null)}
                onKeyDown={(e) => e.key === 'Escape' && closeMenu(unit.id)}
                className="mt-1 block w-full rounded-lg border-t border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                Bỏ chọn câu này
              </button>
            )}
          </div>
        )}
      </span>
    );
  };

  const renderArticle = () => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    units.forEach((u, i) => {
      if (u.start > last) parts.push(<span key={`t-${last}`}>{text.slice(last, u.start)}</span>);
      parts.push(renderUnit(u, i));
      last = u.end;
    });
    if (last < text.length) parts.push(<span key="t-end">{text.slice(last)}</span>);
    return parts;
  };

  // --- giải thích sau khi kiểm tra -------------------------------------------
  const explained = units.filter((u) => {
    const v = verdicts[u.id];
    return v !== 'clear';
  });

  const allRight = find ? count('correct') === biasUnits && count('false-alarm') === 0 : count('correct') === units.length;

  return (
    <BlockShell skin="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-yellow-700" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-900">{block.title || 'Phát hiện thiên lệch'}</h2>
      </div>

      <p className="mb-4 text-sm text-gray-600">{renderInlineMarkdown(block.instruction)}</p>

      <div className="mb-4 rounded-xl border border-yellow-100 bg-white/80 p-4 sm:p-5">
        <div className="whitespace-pre-line text-left text-[0.95rem] leading-loose text-gray-800">{renderArticle()}</div>
        {block.article.source && <p className="mt-3 text-xs italic text-gray-500">— {block.article.source}</p>}
      </div>

      {!checked && (
        <>
          <p className="mb-3 text-xs text-gray-600">
            {find
              ? 'Bấm vào câu bạn cho là có lỗi rồi chọn loại lỗi. Câu không bấm vào được coi là không có lỗi.'
              : `Bấm vào từng cụm được đánh số rồi chọn loại${hasNoBias ? ', hoặc "Không có lỗi"' : ''}.`}
          </p>
          {ready ? (
            <button
              type="button"
              onClick={handleCheck}
              className="w-full rounded-xl bg-yellow-700 py-3 font-semibold text-white transition-colors hover:bg-yellow-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-800 focus-visible:ring-offset-2"
            >
              {find ? `Kiểm tra (${pickedCount} câu đã đánh dấu)` : `Kiểm tra tất cả (${units.length} cụm)`}
            </button>
          ) : (
            <p className="text-center text-sm text-gray-600">
              {find ? 'Chưa đánh dấu câu nào' : `Đã phân loại ${pickedCount}/${units.length} cụm`}
            </p>
          )}
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {checked && (
        <div className="space-y-3">
          <div
            ref={summaryRef}
            tabIndex={-1}
            className={`rounded-xl border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${allRight ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}
          >
            {find ? (
              <>
                <p className={`font-semibold ${allRight ? 'text-green-800' : 'text-blue-800'}`}>
                  Bắt đúng {count('correct')}/{biasUnits} câu có lỗi
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {count('wrong-type') > 0 && <li>Nhận ra câu có lỗi nhưng chọn sai loại: {count('wrong-type')}</li>}
                  <li>Bỏ sót: {count('missed')}</li>
                  <li>Bắt nhầm (câu không có lỗi): {count('false-alarm')}</li>
                </ul>
              </>
            ) : (
              <p className={`font-semibold ${allRight ? 'text-green-800' : 'text-blue-800'}`}>
                Kết quả: {count('correct')}/{units.length} đúng
              </p>
            )}
            <span className="sr-only">Giải thích từng {find ? 'câu' : 'cụm'} ở bên dưới.</span>
          </div>

          {explained.map((u) => {
            const v = verdicts[u.id];
            const good = v === 'correct';
            const answerLabel = u.answer === undefined ? NO_BIAS_LABEL : labelOf(u.answer);
            return (
              <div key={u.id} className={`rounded-xl border p-3 ${good ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-sm">
                  <span className={`font-semibold ${good ? 'text-green-800' : 'text-red-800'}`}>
                    {good ? <Check className="mr-1 inline h-4 w-4" aria-hidden="true" /> : <X className="mr-1 inline h-4 w-4" aria-hidden="true" />}
                    {VERDICT_TAG[v]}
                  </span>
                  <span className="text-gray-700"> · &ldquo;{u.quote ?? u.text}&rdquo; · Đáp án: </span>
                  <span className="font-semibold text-gray-900">{answerLabel}</span>
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {u.explanation
                    ? renderInlineMarkdown(u.explanation)
                    : 'Câu này không mắc lỗi nào trong danh sách. Thấy lỗi ở khắp nơi cũng là một kiểu lệch.'}
                </p>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Làm lại
          </button>
        </div>
      )}
    </BlockShell>
  );
}
