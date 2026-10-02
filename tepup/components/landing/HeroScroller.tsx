'use client';

import { useEffect, useRef } from 'react';

/**
 * Hai section đầu của landing v2 — port 1:1 từ tepup-demo-v2/demo-landing-v2.html.
 *
 * Cơ chế: một dải cuộn cao 250vh bọc lấy khung nhìn `position: sticky`. Hai
 * "trang" nằm chồng lên nhau trong khung đó và đổi chỗ cho nhau theo scrollY,
 * nên người xem thấy như hai màn hình nối tiếp dù chỉ cuộn một mạch.
 *
 * Toàn bộ toạ độ trong CSS đi kèm tính bằng design-px của khung Figma 1512×982
 * nhân với biến --u, nên tỉ lệ chữ so với nhân vật không đổi ở mọi kích cỡ màn.
 */

/** Nét vẽ tay nối các nhân vật ở section 2 (Figma: Vector 2). */
const REDLINE_PATH =
  'M0.542088 218.878C31.7088 233.878 112.842 229.878 176.042 167.878C255.042 90.378 275.542 26.878 344.042 47.878C393.121 62.9242 373.042 167.878 344.042 241.878C314.811 316.467 307.542 500.356 634.042 532.856C681.375 535.356 772.542 532.856 785.042 479.856C795.768 434.378 738.042 484.856 766.042 532.856C794.042 580.856 890.314 582.149 983.542 542.378C1092.54 495.878 1157.04 476.378 1219.04 495.378C1281.04 514.378 1486.38 556.354 1433.54 388.378C1366.54 175.378 1391.04 82.878 1473.54 22.378C1495.38 8.88528 1536.44 -10.7221 1606.04 10.8779';

/** 7 nhân vật của đoàn diễu hành. */
const CAST = ['p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19'];

/**
 * 5 nhân vật duotone ở section 2.
 *
 * `delay` được canh để mỗi người hiện ra đúng 0.2s trước khi đầu nét vẽ chạm
 * tới chỗ mình — nét chạy 3.4s linear sau độ trễ 0.1s, nên đây là vị trí của
 * từng người dọc theo nét, quy ra giây.
 */
const CHARACTERS = [
  { key: '10', img: 'd10', rot: '-5.92deg', delay: '0.38s' },
  { key: '07', img: 'd07', rot: '-4.76deg', delay: '3.12s' },
  { key: '04', img: 'd04', rot: '-5.83deg', delay: '1.04s' },
  { key: '05', img: 'd05', rot: '1.25deg', delay: '0.08s' },
  { key: '06', img: 'd06', rot: '10.2deg', delay: '2.28s' },
];

/**
 * Kịch bản chuyển cảnh, tính bằng số viewport đã cuộn (v = scrollY / 100vh).
 * Dải cuộn cao 185vh (xem .lp-scroller) nên khung nhìn dính tới v = 0.85 rồi
 * nhả cho section 3 trôi lên như cuộn thường.
 *
 * - Ảnh: trang 1 mờ dần trong 0.04 → 0.40, trang 2 chồng lên trong 0.12 → 0.44.
 *   Hai đoạn gối nhau đủ dài để lúc nào trên màn cũng có nhân vật, không còn
 *   khoảnh khắc màn hình trống trơn ở giữa.
 * - Chữ thì KHÔNG chồng nhau (chữ đè chữ mới là thứ nhìn như lỗi tải): khối
 *   chữ trang 1 trôi nhẹ lên và tắt ở 0.26; tiêu đề trang 2 hiện trong
 *   0.22 → 0.42, body 0.28 → 0.50, trôi từ dưới lên theo vị trí cuộn (không chờ
 *   animation theo thời gian), nên tới đâu đọc được tới đó.
 * - 0.50 → 0.85: trang 2 đứng yên đủ đọc (~0.35 màn), rồi nhả.
 */
const P1_OUT: Range = [0.04, 0.4];
const P1_TEXT_OUT: Range = [0.04, 0.26];
const P2_IN: Range = [0.12, 0.44];
/** Độ hiện THỰC của tiêu đề/body trên màn (đã tính cả độ mờ của trang 2). */
const TITLE_IN: Range = [0.22, 0.42];
const BODY_IN: Range = [0.28, 0.5];
/** Nét đỏ và 5 nhân vật (hoạt cảnh theo thời gian) bắt đầu khi trang 2 bắt đầu hiện. */
const PLAY_AT = P2_IN[0];
/** Quãng trôi của chữ, tính theo phần của chiều cao khung nhìn. */
const P1_RISE = 0.06;
const TITLE_RISE = 0.05;
const BODY_RISE = 0.07;

type Range = readonly [number, number];

/** 0 → 1 trên đoạn [a, b], làm mềm hai đầu (smoothstep). */
function ease(v: number, [a, b]: Range) {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function HeroScroller() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLElement>(null);
  const page2Ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const viewport = viewportRef.current;
    const page1 = page1Ref.current;
    const page2 = page2Ref.current;
    if (!scroller || !viewport || !page1 || !page2) return;
    const p1Text = page1.querySelector<HTMLElement>('.lp-p1-center');
    const title = page2.querySelector<HTMLElement>('.lp-p2-title');
    const body = page2.querySelector<HTMLElement>('.lp-p2-body');
    if (!p1Text || !title || !body) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Mọi thứ ghi ra DOM đều qua đây: chỉ ghi khi giá trị đổi, nên lúc đã qua
    // đoạn chuyển cảnh thì cuộn tiếp không đụng tới style nữa.
    const last = new Map<string, string>();
    const set = (el: HTMLElement, key: string, prop: 'opacity' | 'translate' | 'pointerEvents', value: string) => {
      if (last.get(key) === value) return;
      last.set(key, value);
      el.style[prop] = value;
    };

    // Đo hình học một lần (và khi resize), không đo trong lúc cuộn. Lấy chiều
    // cao thật của khung dính chứ không dùng innerHeight: trên mobile hai số
    // này lệch nhau mỗi khi thanh địa chỉ co giãn.
    let vh = 1;
    let top = 0;
    const measure = () => {
      vh = viewport.clientHeight || window.innerHeight;
      top = scroller.getBoundingClientRect().top + window.scrollY;
    };

    let played = false;
    let flat = false;
    let frame = 0;
    // Độ mờ thấp nhất của mỗi trang. Trình duyệt không vẽ (và không giải mã ảnh
    // của) lớp opacity 0, nên trang 2 để 0 thì đúng khung hình nó bắt đầu hiện
    // phải giải mã 5 ảnh duotone một lượt — đo được cú giật 50–170ms giữa lúc
    // cuộn. Để 0.001 (mắt không thấy, < 1/255) từ sau khi tải xong thì việc đó
    // làm sẵn lúc rảnh; trang 1 cũng vậy khi cuộn ngược lên.
    let floor = 0;

    const tick = () => {
      frame = 0;

      if (reduced.matches) {
        // Giảm chuyển động: CSS trải hai trang ra thành hai màn cuộn thường,
        // JS chỉ cần gỡ hết style đã ghi (một lần) rồi đứng ngoài.
        if (!flat) {
          flat = true;
          for (const el of [page1, page2, p1Text, title, body]) el.removeAttribute('style');
          page1.classList.remove('is-off');
          last.clear();
        }
        return;
      }
      flat = false;

      const v = (window.scrollY - top) / vh;
      const out1 = ease(v, P1_OUT);
      const out1Text = ease(v, P1_TEXT_OUT);
      const in2 = ease(v, P2_IN);
      const inTitle = ease(v, TITLE_IN);
      const inBody = ease(v, BODY_IN);
      const r = (x: number) => String(Math.round(x * 1000) / 1000);

      set(page1, 'p1o', 'opacity', r(Math.max(floor, 1 - out1)));
      // Trang đã tắt hẳn thì dừng băng chuyền (CSS .is-off) và thôi bắt chuột.
      // Cố ý không dùng visibility: hidden, cùng lý do với `floor` ở trên.
      page1.classList.toggle('is-off', out1 >= 1);
      set(page1, 'p1e', 'pointerEvents', out1 >= 1 ? 'none' : '');
      set(p1Text, 'p1to', 'opacity', r(1 - out1Text));
      set(p1Text, 'p1t', 'translate', `0 ${Math.round(-out1Text * P1_RISE * vh)}px`);

      set(page2, 'p2o', 'opacity', r(Math.max(floor, in2)));
      set(page2, 'p2e', 'pointerEvents', in2 >= 1 ? 'auto' : '');
      // Chữ nằm trong trang 2 nên độ mờ nhân với của trang; chia lại để độ hiện
      // thực trên màn đúng bằng TITLE_IN/BODY_IN.
      const own = (x: number) => (in2 > 0.001 ? Math.min(1, x / in2) : 0);
      set(title, 'tto', 'opacity', r(own(inTitle)));
      set(title, 'ttt', 'translate', `0 ${Math.round((1 - inTitle) * TITLE_RISE * vh)}px`);
      set(body, 'bdo', 'opacity', r(own(inBody)));
      set(body, 'bdt', 'translate', `0 ${Math.round((1 - inBody) * BODY_RISE * vh)}px`);

      if (!played && v >= PLAY_AT) {
        played = true;
        page2.classList.add('is-playing');
      }
    };

    // Scroll bắn dày hơn tốc độ vẽ lại, nên gom về mỗi khung hình một lần.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // Chờ hero vào xong phần chính rồi mới "vẽ sẵn" trang 2 (xem `floor`).
    const idle = window.setTimeout(() => {
      floor = 0.001;
      onScroll();
    }, 1200);

    measure();
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    reduced.addEventListener('change', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', onScroll);
    };
  }, []);

  return (
    <div className="lp-scroller" ref={scrollerRef}>
      {/* Neo cho link "Giới thiệu": nằm ở đoạn scroll mà section 2 đã hiện đủ
          và khung nhìn còn đang dính (xem .lp-anchor). */}
      <span id="gioi-thieu" className="lp-anchor" aria-hidden="true" />

      <div className="lp-viewport" ref={viewportRef}>
        <div className="lp-bg" />

        {/* ---------- SECTION 1 ---------- */}
        <section className="lp-page lp-page--1" ref={page1Ref} aria-label="Tépup">
          <div className="lp-stage">
            <div className="lp-p1-center">
              <h1 className="lp-slogan">
                <span>Tép riu</span>
                <span className="lp-up">Stép up</span>
                <span>Stép out</span>
              </h1>
              <p className="lp-p1-sub">
                Nền tảng học những điều cơ bản về xã hội bạn đang sống{' '}
                <br />— thuế, tư duy, quyền số — theo cách dễ hiểu, gần gũi,{' '}
                <br />
                và hoàn toàn miễn phí.
              </p>
            </div>
          </div>

          <div className="lp-parade">
            {[0, 1, 2].map((copy) => (
              <div className="lp-cast" key={copy}>
                {CAST.map((name, i) => (
                  // eslint-disable-next-line @next/next/no-img-element -- ảnh đã nén sẵn và đo bằng vw/--u, next/image không giúp gì thêm
                  <img
                    key={name}
                    className={`lp-p lp-c${13 + i}`}
                    src={`/landing/${name}.webp`}
                    alt=""
                    aria-hidden="true"
                    loading={copy === 0 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="lp-ground">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG trang trí, kéo giãn hết bề ngang */}
            <img src="/landing/ground.svg" alt="" aria-hidden="true" />
          </div>
        </section>

        {/* ---------- SECTION 2 ---------- */}
        <section className="lp-page lp-page--2" ref={page2Ref} aria-label="Tépup là gì?">
          <div className="lp-stage">
            <div className="lp-redline">
              <svg viewBox="0 0 1606.41 571.906" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength={1} d={REDLINE_PATH} stroke="#E03E28" strokeWidth={2.5} />
              </svg>
            </div>

            {CHARACTERS.map((c) => (
              <div
                key={c.key}
                className={`lp-ch lp-ch--${c.key}`}
                style={{ '--rot': c.rot, '--d': c.delay } as React.CSSProperties}
              >
                <div className="lp-rot">
                  {/* eslint-disable-next-line @next/next/no-img-element -- minh hoạ duotone, đo bằng --u */}
                  <img src={`/landing/${c.img}.webp`} alt="" aria-hidden="true" loading="lazy" />
                </div>
              </div>
            ))}

            <div className="lp-p2-center">
              <h2 className="lp-p2-title">
                Tépup <span className="lp-b">là gì?</span>
              </h2>
              <div className="lp-p2-body">
                <p>
                  <span className="lp-em">Tepup</span> là nền tảng giúp bạn hiểu những điều thiết
                  thực về xã hội mình đang sống —{' '}
                  <br />
                  làm sao để nhận diện thông tin sai lệch, làm sao bảo vệ chính mình trên không gian
                  số.
                </p>
                <p>
                  Tất cả bằng tiếng Việt, qua các <span className="lp-em">câu chuyện ngắn</span> và{' '}
                  <span className="lp-em">tương tác</span>,{' '}
                  <br />
                  dựa trên đời sống thực tế ở Việt Nam. Không lý thuyết xa vời, không thuật ngữ khó
                  hiểu — chỉ có kiến thức bạn có thể dùng ngay.
                </p>
                <p>
                  <span className="lp-em">Miễn phí</span>, mã nguồn mở và{' '}
                  <span className="lp-em">không lưu dữ liệu cá nhân</span> của bạn.{' '}
                  <br />
                  Bạn có thể học ẩn danh, bất cứ lúc nào.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
