'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import StoryBook, { RISE_EASE, SWAP_IN, storyHref } from './StoryBook';
import type { BookCharacter, BookTopic } from './book-data';

interface CharacterStoriesProps {
  characters: BookCharacter[];
  /** slug nhân vật → các câu chuyện (đã sắp thứ tự). */
  topics: Record<string, BookTopic[]>;
  initialIndex: number;
}

/**
 * Trang câu chuyện của nhân vật (demo màn 2, `#minh`): sổ tem ở chế độ "story"
 * + "Lắng nghe câu chuyện của X" + lưới thẻ giấy.
 *
 * Đổi nhân vật trên sổ thì đổi thẻ NGAY TẠI CHỖ (như demo: thẻ cũ mờ đi khi tem
 * bắt đầu xếp, thẻ mới nổi lên đậu cùng lúc tem đậu) và thay URL bằng
 * history.replaceState sang /story/<slug> (Next đồng bộ router với lệnh này), đổi
 * document.title. Dữ liệu của mọi nhân vật đã có sẵn từ server, nên không cần
 * điều hướng: không nháy skeleton, sổ không bị dựng lại giữa chừng. Tải lại trang
 * thì server render đúng nhân vật theo URL mới. Trang vẫn giống nhau cho mọi người
 * xem (cache an toàn): mọi thứ theo người xem chỉ xảy ra ở client.
 */
export default function CharacterStories({ characters, topics, initialIndex }: CharacterStoriesProps) {
  const [view, setView] = useState({ index: initialIndex, tick: 0 });
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const swap = useRef<{ anims: Animation[]; timer: number; faded: boolean; inDur: number | null }>({
    anims: [],
    timer: 0,
    faded: false,
    inDur: null,
  });

  const parts = useCallback((): HTMLElement[] => {
    const cells = listRef.current ? Array.from(listRef.current.children as HTMLCollectionOf<HTMLElement>) : [];
    const empty = headRef.current?.parentElement?.querySelector<HTMLElement>('.sb-topics__empty');
    return [headRef.current, ...cells, ...(empty ? [empty] : [])].filter(Boolean) as HTMLElement[];
  }, []);

  // mô tả cắt "..." theo số dòng còn trống dưới tiêu đề (tiêu đề 1 hay 2 dòng)
  const clampTopics = useCallback(() => {
    listRef.current?.querySelectorAll<HTMLElement>('.sb-topic__text').forEach((box) => {
      const title = box.querySelector<HTMLElement>('.sb-topic__title');
      const desc = box.querySelector<HTMLElement>('.sb-topic__desc');
      if (!title || !desc) return;
      const free = box.clientHeight - title.offsetHeight - 8;
      desc.style.webkitLineClamp = String(Math.max(1, Math.floor(free / 24)));
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', clampTopics);
    document.fonts?.ready.then(clampTopics);
    const s = swap.current;
    return () => {
      window.removeEventListener('resize', clampTopics);
      window.clearTimeout(s.timer);
      s.anims.forEach((an) => an.cancel());
    };
  }, [clampTopics]);

  // Sau mỗi lần vẽ thẻ: đo lại số dòng; nếu là lượt đổi có hiệu ứng thì cho thẻ mới nổi lên.
  useLayoutEffect(() => {
    clampTopics();
    const s = swap.current;
    const dur = s.inDur;
    if (dur === null) return;
    s.inDur = null;
    s.anims.forEach((an) => an.cancel());
    s.anims = [];
    s.faded = false;
    parts().forEach((el, i) => {
      const head = i === 0;
      s.anims.push(
        el.animate([{ opacity: 0, transform: `translateY(${head ? 24 : 60}px)` }, { opacity: 1, transform: 'none' }], {
          duration: head ? dur - 150 : dur - 120,
          delay: head ? 0 : 120,
          easing: 'cubic-bezier(.16,1,.3,1)',
          fill: 'backwards',
        }),
      );
    });
  }, [view, clampTopics, parts]);

  const onFront = useCallback(
    (index: number) => {
      const c = characters[index];
      if (!c) return;
      window.history.replaceState(null, '', storyHref(c.slug));
      document.title = `Câu chuyện của ${c.name} | Tepup`;
    },
    [characters],
  );

  // câu chuyện đổi theo tem: cũ mờ đi ngay khi bắt đầu xếp
  const onSwapOut = useCallback(() => {
    const s = swap.current;
    window.clearTimeout(s.timer);
    if (s.faded) return;
    s.faded = true;
    parts().forEach((el) => {
      s.anims.push(
        el.animate([{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], {
          duration: 250,
          easing: 'ease-in',
          fill: 'forwards',
        }),
      );
    });
  }, [parts]);

  // mới (tiêu đề trước, các thẻ trượt lên) đậu đúng lúc tem đậu
  const onSwapIn = useCallback((index: number, endIn: number) => {
    const s = swap.current;
    window.clearTimeout(s.timer);
    if (endIn <= 0) {
      s.anims.forEach((an) => an.cancel());
      s.anims = [];
      s.faded = false;
      s.inDur = null;
      setView((v) => ({ index, tick: v.tick + 1 }));
      return;
    }
    const dur = Math.min(SWAP_IN, endIn);
    s.timer = window.setTimeout(() => {
      s.inDur = dur;
      setView((v) => ({ index, tick: v.tick + 1 }));
    }, Math.max(0, endIn - dur));
  }, []);

  // vừa tới từ /courses: tiêu đề trước, rồi các thẻ cùng lúc trượt từ dưới lên
  const onArrive = useCallback(
    (delay: number) => {
      const s = swap.current;
      parts().forEach((el, i) => {
        const head = i === 0;
        s.anims.push(
          el.animate([{ opacity: 0, transform: `translateY(${head ? 24 : 60}px)` }, { opacity: 1, transform: 'none' }], {
            duration: 800,
            delay: head ? delay : delay + 200,
            easing: RISE_EASE,
            fill: 'backwards',
          }),
        );
      });
    },
    [parts],
  );

  const character = characters[view.index] ?? characters[0];
  const list = topics[character.slug] ?? [];

  return (
    <>
      <StoryBook
        characters={characters}
        mode="story"
        initialIndex={initialIndex}
        onFront={onFront}
        onSwapOut={onSwapOut}
        onSwapIn={onSwapIn}
        onArrive={onArrive}
      />
      <section className="sb-listen" aria-labelledby="sb-listen-title">
        <div className="paper-head" ref={headRef}>
          <h1 id="sb-listen-title" className="paper-serif">
            Lắng nghe câu chuyện của <em>{character.name}</em>
          </h1>
          <p>Khám phá kiến thức qua những trải nghiệm thực tế</p>
        </div>
        {list.length > 0 ? (
          <ul className="sb-topics" ref={listRef}>
            {list.map((t) => (
              <li key={`${character.slug}/${t.slug}`} className="sb-topics__cell">
                <Link className="sb-topic" href={`${storyHref(character.slug)}/${t.slug}`}>
                  <div className="sb-topic__back" aria-hidden="true" />
                  <div className="sb-topic__front">
                    <div className="sb-topic__body">
                      <div className="sb-topic__text">
                        <h2 className="sb-topic__title paper-serif">{t.title}</h2>
                        {t.teaser && <p className="sb-topic__desc">{t.teaser}</p>}
                      </div>
                      {character.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ nhân vật từ Supabase Storage (đã qua isAllowedMediaUrl)
                        <img className="sb-topic__thumb" src={character.thumb} alt="" width={90} height={90} />
                      ) : (
                        <span className="sb-topic__thumb sb-topic__thumb--blank" aria-hidden="true" />
                      )}
                      <span className="sb-topic__arrow" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
                        <img src="/paper/icon-topic-arrow.svg" alt="" />
                        {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
                        <img src="/paper/icon-topic-arrow-on.svg" alt="" />
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element -- chấm trang trí */}
                      <img className="sb-topic__dot" src="/paper/icon-topic-dot.svg" alt="" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sb-topics__empty">Câu chuyện của {character.name} đang được viết.</p>
        )}
      </section>
    </>
  );
}
