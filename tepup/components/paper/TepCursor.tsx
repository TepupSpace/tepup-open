'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './tep-cursor.css';

/**
 * Con trỏ hình tôm + nét toả khi bấm, cho trang học viên (demo-course-stories §4).
 *
 * - Con trỏ tự vẽ chỉ bật ở máy có chuột/trackpad (`hover: hover` và `pointer: fine`).
 *   Điểm bấm = đầu tôm (18, 7.5 trong ô 36px); ở chỗ bấm được tôm nghiêng 32°.
 *   Kéo (phần tử có `data-dragging="true"`) và ô nhập chữ dùng con trỏ hệ thống.
 * - Nét toả: 4 nét cong cam, ~0.7s, ở mọi chỗ bấm; tắt khi giảm chuyển động.
 * - Con trỏ chỉ là trang trí: không đổi focus, không chặn sự kiện (pointer-events: none).
 *
 * Gắn một lần ở app/layout.tsx. Tắt ở khu vực nhân viên (/admin, /contributor, /dev):
 * rời sang đó thì gỡ hết con trỏ và class trên <html>.
 */

const HOT =
  'button:not(:disabled):not([aria-disabled="true"]),a[href],[role=link],[role=button],[role=option],[role=tab],label,select,summary,input[type=range],input[type=checkbox],input[type=radio],[data-cursor="hot"]';
const NATIVE =
  '[data-dragging="true"],input:not([type]),input[type=text],input[type=search],input[type=number],input[type=email],input[type=password],textarea,[contenteditable="true"]';

// 4 nét: chếch phải, thẳng lên, chếch trái, trái (ô 85 hiện 60px).
const BURST = [
  '<path transform="translate(-2.12 2.12)" d="M 48.5 36.5 Q 57.5 21.5 60.5 24.5 T 72.6 12.4"/>',
  '<path transform="translate(0 3)" d="M 42.5 34 Q 38.25 17 42.5 17 T 42.5 0"/>',
  '<path transform="translate(2.12 2.12)" d="M 36.5 36.5 Q 21.5 27.5 24.5 24.5 T 12.4 12.4"/>',
  '<path transform="translate(3 0)" d="M 34 42.5 Q 17 46.75 17 42.5 T 0 42.5"/>',
].join('');
const BURST_MS = 700;

const STAFF_AREAS = /^\/(admin|contributor|dev)(\/|$)/;

export default function TepCursor() {
  const pathname = usePathname();
  const enabled = !STAFF_AREAS.test(pathname ?? '');

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups: Array<() => void> = [];

    // CSS dự phòng: có ngay cả khi phần con trỏ tự vẽ bên dưới không chạy.
    root.classList.add('tep-cursor-css');
    cleanups.push(() => root.classList.remove('tep-cursor-css'));

    // ---------- nét toả ----------
    const onDown = (e: PointerEvent) => {
      if (reducedMq.matches || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'tap-burst');
      svg.setAttribute('viewBox', '0 0 85 85');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.left = `${e.clientX}px`;
      svg.style.top = `${e.clientY}px`;
      svg.innerHTML = BURST;
      document.body.appendChild(svg);
      const paths = Array.from(svg.querySelectorAll('path'));
      const lens = paths.map((p) => p.getTotalLength());
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / BURST_MS);
        const p = 1 - Math.pow(1 - t, 3); // nhanh lúc đầu, chậm dần
        paths.forEach((el, i) => {
          const L = lens[i];
          const tail = L * p;
          const head = Math.min(L, L * p * 2); // đầu chạm mép ngoài ở nửa chặng, đuôi rút theo
          el.style.strokeDasharray = `${Math.max(0.01, head - tail)} ${L}`;
          el.style.strokeDashoffset = `${-tail}`;
          el.style.opacity = `${Math.min(1, (head - tail) / 5)}`;
        });
        if (t < 1) requestAnimationFrame(frame);
        else svg.remove();
      };
      requestAnimationFrame(frame);
    };
    document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
    cleanups.push(() => document.removeEventListener('pointerdown', onDown, { capture: true }));

    // ---------- con trỏ tự vẽ ----------
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const cur = document.createElement('div');
      cur.className = 'tcur';
      cur.setAttribute('aria-hidden', 'true');
      cur.innerHTML = '<img src="/paper/cursor-tep@2x.png" alt="" width="36" height="36">';
      document.body.appendChild(cur);
      root.classList.add('has-tcur');
      let mx = -99;
      let my = -99;

      const paint = (target: EventTarget | null) => {
        const t = target instanceof Element ? target : null;
        const native = !!(t?.closest(NATIVE) || document.querySelector('[data-dragging="true"]'));
        const hot = !!(t?.closest(HOT) && !t.closest('[aria-disabled="true"]'));
        cur.classList.toggle('is-on', !native && mx > -99);
        cur.classList.toggle('is-hot', hot);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX;
        my = e.clientY;
        cur.style.transform = `translate3d(${mx - 18}px,${my - 7.5}px,0)`; // đầu tôm = đúng điểm chuột
        paint(e.target);
      };
      // cuộn / nhấn mà chuột đứng yên: phần tử dưới chuột có thể đã đổi
      const onStill = () => {
        if (mx > -99) paint(document.elementFromPoint(mx, my));
      };
      const hide = () => cur.classList.remove('is-on');

      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('scroll', onStill, { capture: true, passive: true });
      document.addEventListener('pointerup', onStill, { capture: true, passive: true });
      root.addEventListener('mouseleave', hide);
      window.addEventListener('blur', hide);
      cleanups.push(() => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('scroll', onStill, { capture: true });
        document.removeEventListener('pointerup', onStill, { capture: true });
        root.removeEventListener('mouseleave', hide);
        window.removeEventListener('blur', hide);
        root.classList.remove('has-tcur');
        cur.remove();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [enabled]);

  return null;
}
