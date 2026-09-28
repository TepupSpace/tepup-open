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

export default function HeroScroller() {
  const page1Ref = useRef<HTMLElement>(null);
  const page2Ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const page1 = page1Ref.current;
    const page2 = page2Ref.current;
    if (!page1 || !page2) return;

    let played = false;
    let frame = 0;
    const clamp = (x: number) => Math.min(1, Math.max(0, x));

    const tick = () => {
      frame = 0;
      const progress = clamp(window.scrollY / (window.innerHeight * 1.5));

      // Trang 1 mờ đi sớm và dứt khoát, tắt hẳn ở 0.25; trang 2 vào liền tay
      // ngay sau đó thay vì chờ chồng mờ — chồng mờ làm cả hai cùng nhạt, nhìn
      // như trang bị lỗi tải.
      page1.style.opacity = String(clamp(1 - (progress - 0.05) / 0.2));
      page1.style.pointerEvents = progress > 0.2 ? 'none' : 'auto';
      page2.style.opacity = String(clamp((progress - 0.25) / 0.08));

      if (progress > 0.33 && !played) {
        played = true;
        page2.classList.add('is-playing');
      }
    };

    // Scroll bắn dày hơn tốc độ vẽ lại, nên gom về mỗi khung hình một lần.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="lp-scroller">
      {/* Neo cho link "Giới thiệu": nằm ở đoạn scroll mà section 2 đã hiện đủ. */}
      <span id="gioi-thieu" style={{ position: 'absolute', top: '55vh' }} aria-hidden="true" />

      <div className="lp-viewport">
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
