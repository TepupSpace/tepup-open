'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import type { CharacterDisplay } from '@/lib/types/content';
import { IconArrowRight } from './icons';

/** Mỗi nhân vật đứng bao lâu trước khi tự chuyển. */
const AUTO_MS = 5000;
/** Chữ trên thẻ trích dẫn tan đi trong khoảng này rồi mới đổi nội dung. */
const SWAP_MS = 250;

interface StoryShowcaseProps {
  characters: CharacterDisplay[];
}

/**
 * Khối "Học qua Câu chuyện": chọn một trong các nhân vật, ảnh lớn và thẻ trích
 * dẫn đổi theo.
 *
 * Tự chuyển nhân vật mỗi 5 giây khi khối nằm trong tầm nhìn. Rê chuột vào thì tạm
 * dừng (giữ phần thời gian còn lại), tab bị ẩn cũng dừng. Người xem bấm chọn một
 * nhân vật là giành quyền điều khiển, nên tự chuyển ngừng hẳn.
 */
export default function StoryShowcase({ characters }: StoryShowcaseProps) {
  const [current, setCurrent] = useState(0);
  // Thẻ trích dẫn đổi chữ trễ hơn ảnh một nhịp, nên giữ riêng chỉ số đang hiện.
  const [shown, setShown] = useState(0);
  const [swapping, setSwapping] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const currentRef = useRef(0);
  const swapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const select = useCallback((index: number) => {
    if (index === currentRef.current) return;
    currentRef.current = index;
    setCurrent(index);
    setSwapping(true);
    clearTimeout(swapTimer.current);
    swapTimer.current = setTimeout(() => {
      setShown(index);
      setSwapping(false);
    }, SWAP_MS);
  }, []);

  // Điều khiển tự chuyển. Toàn bộ trạng thái nằm trong closure của effect vì nó
  // chỉ phục vụ bộ hẹn giờ, không cần render lại.
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => {
    const section = sectionRef.current;
    const count = characters.length;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!section || count < 2 || reduced) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let remain = AUTO_MS;
    let startedAt = 0;
    let stopped = false;
    let hovered = false;
    let visible = false;

    const arm = (ms: number) => {
      if (timer) clearTimeout(timer);
      remain = ms;
      startedAt = Date.now();
      timer = setTimeout(advance, ms);
    };
    const disarm = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      remain = Math.max(0, remain - (Date.now() - startedAt));
    };
    function advance() {
      select((currentRef.current + 1) % count);
      arm(AUTO_MS);
    }
    const play = () => {
      if (stopped || !visible || hovered || timer || document.hidden) return;
      arm(remain > 0 ? remain : AUTO_MS);
    };
    const pause = () => {
      if (!stopped) disarm();
    };
    stopRef.current = () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      timer = null;
    };

    const onEnter = () => {
      hovered = true;
      pause();
    };
    const onLeave = () => {
      hovered = false;
      play();
    };
    const onVisibility = () => (document.hidden ? pause() : play());

    section.addEventListener('mouseenter', onEnter);
    section.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          if (visible) play();
          else pause();
        },
        { threshold: 0.35 },
      );
      observer.observe(section);
    } else {
      visible = true;
      play();
    }

    return () => {
      if (timer) clearTimeout(timer);
      section.removeEventListener('mouseenter', onEnter);
      section.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      stopRef.current = () => {};
    };
  }, [characters.length, select]);

  useEffect(() => () => clearTimeout(swapTimer.current), []);

  if (characters.length === 0) return null;

  const active = characters[current];
  const quoted = characters[shown] ?? active;

  return (
    <section className="ch-story" ref={sectionRef} aria-labelledby="ch-story-title">
      <div className="ch-story__head">
        <h2 id="ch-story-title" className="ch-serif">
          Học qua <em>Câu chuyện</em>
        </h2>
        <p>Khám phá kiến thức qua hành trình của các nhân vật</p>
      </div>

      <div className="ch-story__panel">
        <div className="ch-cast" role="group" aria-label="Chọn nhân vật">
          {characters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="ch-cast__item"
              aria-pressed={i === current}
              onClick={() => {
                stopRef.current();
                select(i);
              }}
            >
              {c.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar 70px từ Supabase Storage
                <img className="ch-cast__avatar" src={c.avatarUrl} alt="" width={70} height={70} />
              ) : (
                <span className="ch-cast__avatar ch-cast__avatar--blank" aria-hidden="true">
                  {c.name.charAt(0)}
                </span>
              )}
              <span className="ch-cast__text">
                <span className="ch-cast__name ch-serif">{c.name}</span>
                <span className="ch-cast__role">{c.role}</span>
              </span>
            </button>
          ))}
        </div>

        <Link className="ch-story__cta" href={`/story/${active.slug}`}>
          Khám phá hành trình
          <IconArrowRight color="#E03E28" />
        </Link>
      </div>

      <div className="ch-story__figure">
        <div className="ch-story__stage">
          {characters.map((c, i) =>
            c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- các ảnh chồng lên nhau và mờ dần bằng CSS, cần tải sẵn cả bộ
              <img
                key={c.id}
                src={c.imageUrl}
                alt={i === current ? `${c.name}, ${c.role.toLowerCase()}` : ''}
                aria-hidden={i !== current}
                className={i === current ? 'is-on' : undefined}
                fetchPriority={i === 0 ? 'high' : undefined}
              />
            ) : null,
          )}
        </div>

        <div className="ch-quote">
          <div className={`ch-quote__body${swapping ? ' is-swapping' : ''}`}>
            <div>
              <div className="ch-quote__name ch-serif">{quoted.name}</div>
              <div className="ch-quote__role">{quoted.role}</div>
            </div>
            {quoted.description && <p className="ch-quote__text">“{quoted.description}”</p>}
          </div>
          <Link
            className="ch-quote__go"
            href={`/story/${active.slug}`}
            aria-label={`Xem hành trình của ${active.name}`}
          >
            <IconArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
