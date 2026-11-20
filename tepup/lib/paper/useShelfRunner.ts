'use client';

/**
 * Bộ chạy kệ folder kiểu cover-flow (trang chi tiết câu chuyện), chuyển nguyên từ
 * demo-course-stories (§4 "Kệ folder"). Không dùng CSS transition: một vị trí liên
 * tục `pos` (đơn vị = folder) chạy về `target` bằng requestAnimationFrame.
 *
 * - Nhịp thường: tăng tốc êm → trần 1.2 folder/s → chậm dần, không nảy.
 * - Kéo: bám tay, trễ ~0.1s; nhả tay đậu folder gần nhất (> 1/10 bậc thì sang folder kế).
 * - Bấm folder cách ≥ 2 bậc: lướt nhanh 6 folder/s rồi đậu êm.
 * - Hai đầu kệ đứng yên.
 *
 * Các hàm thuần (tư thế, bước vật lý, chốt khi nhả tay, cổng vuốt trackpad) được
 * export để test (tests/unit/paper-shelf.test.ts). GIỮ NGUYÊN các hằng số: chúng là
 * "cảm giác" của kệ trong bản bàn giao.
 */

import { useEffect, useState } from 'react';

// ---- tư thế theo bậc (0 = folder giữa, 1..3 hai bên) ----
export const SHELF_RY = [0, 25, 45, 62];
export const SHELF_S = [1, 0.8, 0.66, 0.54];
export const SHELF_OP_R = [1, 0.75, 0.5, 0.3];
export const SHELF_OP_L = [1, 0.92, 0.7, 0.45];
export const SHELF_SHADE = [0, 0.45, 0.7, 0.9];
/** Khe hở giữa hai folder trên màn hình (px). */
export const SHELF_GAP = 16;

// ---- nhịp chạy ----
/** folder/giây, folder/giây² */
export const SHELF_VMAX = 1.2;
export const SHELF_ACC = 4;
/** Bấm folder xa: lướt nhanh (2 bậc ~0.9s, 3 bậc ~1.1s). */
export const FAST_VMAX = 6;
export const FAST_ACC = 10;
/** Lúc đang kéo tay: bám sát tay, trễ ~0.1s cho mượt. */
export const DRAG_LAG = 0.1;

/** Cỡ kệ: folder gốc 300×359 thu 85% (màn ≤600px: 68%). */
export function shelfBase(width: number): number {
  return width < 600 ? 0.68 : 0.85;
}

/** Phối cảnh riêng của từng folder, co theo cỡ kệ. */
export function shelfP(base: number): number {
  return 530 * base;
}

/**
 * x của từng bậc sao cho mép trong (sau phối cảnh) cách mép ngoài folder trước đúng
 * SHELF_GAP px. Phối cảnh tính quanh tâm từng folder: mép trong lùi xa (P + sn), mép
 * ngoài tiến gần (P − sn). Phần tử cuối (bậc 4+) nằm ẩn ngoài rìa.
 */
export function shelfXs(base: number): number[] {
  const xs = [0];
  const P = shelfP(base);
  let edge = 150 * base;
  for (let i = 1; i <= 3; i++) {
    const hw = 150 * base * SHELF_S[i];
    const r = (SHELF_RY[i] * Math.PI) / 180;
    const c = hw * Math.cos(r);
    const sn = hw * Math.sin(r);
    const x = edge + SHELF_GAP + (c * P) / (P + sn);
    xs.push(x);
    edge = x + (c * P) / (P - sn);
  }
  xs.push(edge + 200);
  return xs;
}

/** Bảng theo bậc, nội suy liên tục cho vị trí lẻ (đang kéo / đang chạy). */
export function lerpAt(tab: number[], a: number): number {
  const i = Math.min(Math.floor(a), tab.length - 2);
  const t = a - i;
  return tab[i] + (tab[i + 1] - tab[i]) * t;
}

export interface ShelfPose {
  x: number;
  s: number;
  ry: number;
  op: number;
  shade: number;
  side: -1 | 1;
  z: number;
}

/**
 * Tư thế của folder cách folder giữa d bậc (d lẻ được; d < 0: bên trái). Mọi thứ
 * liên tục quanh d = 0 nên lớp xếp, bóng, hướng đổ tối không đổi đột ngột.
 */
export function shelfPose(d: number, base: number, xs: number[]): ShelfPose {
  const a = Math.min(Math.abs(d), 4);
  const sg: -1 | 1 = d < 0 ? -1 : 1;
  const a3 = Math.min(a, 3);
  const opTab = d > 0 ? SHELF_OP_R : SHELF_OP_L;
  return {
    x: sg * lerpAt(xs, a),
    s: base * lerpAt(SHELF_S, a3),
    ry: -sg * lerpAt(SHELF_RY, a3), // mép ngoài xoay về phía người xem
    op: a >= 3 ? opTab[3] * (4 - a) : lerpAt(opTab, a), // bậc 3 → 4: mờ hẳn
    shade: lerpAt(SHELF_SHADE, a3),
    side: sg,
    z: Math.round(100 - a * 20),
  };
}

export interface ShelfMotion {
  pos: number;
  vel: number;
  target: number;
  held: boolean;
  fast: boolean;
}

/**
 * Một bước vật lý (dt giây). Tốc độ mong muốn: không quá VMAX, đủ chậm để hãm kịp
 * (√2·a·d), đoạn cuối tắt dần (d·6) cho đậu mềm. Đang kéo: đuổi theo tay, không trần.
 */
export function stepShelf(m: ShelfMotion, dt: number): { pos: number; vel: number } {
  const d = m.target - m.pos;
  const ad = Math.abs(d);
  if (m.held) {
    const np = m.pos + d * (1 - Math.exp(-dt / DRAG_LAG));
    return { pos: np, vel: dt > 0 ? (np - m.pos) / dt : 0 };
  }
  const vmax = m.fast ? FAST_VMAX : SHELF_VMAX;
  const acc = m.fast ? FAST_ACC : SHELF_ACC;
  const want = Math.sign(d) * Math.min(vmax, Math.sqrt(2 * acc * ad) * 0.9, ad * (m.fast ? 9 : 6));
  const dv = want - m.vel;
  let lim = acc;
  // vừa nhả tay khi đang nhanh: hãm vừa đủ để dừng đúng folder (v²/2d), không vượt rồi quay lại
  if (Math.abs(want) < Math.abs(m.vel) && want * m.vel >= 0) {
    lim = Math.max(lim, (m.vel * m.vel) / (2 * Math.max(ad, 0.05)));
  }
  lim *= dt;
  const vel = m.vel + Math.max(-lim, Math.min(lim, dv));
  return { pos: m.pos + vel * dt, vel };
}

/** Đã đứng yên chưa (không kéo, sát đích, gần như không còn vận tốc). */
export function shelfResting(m: ShelfMotion): boolean {
  return !m.held && Math.abs(m.target - m.pos) < 0.001 && Math.abs(m.vel) < 0.01;
}

/**
 * Nhả tay sau khi kéo từ `start` tới `target`: đậu folder gần nhất; kéo nhẹ (> 1/10 bậc)
 * thì ít nhất sang folder kế theo chiều kéo. Chưa kẹp hai đầu (goTo sẽ kẹp).
 */
export function dragSnap(start: number, target: number): number {
  const moved = target - start;
  let n = Math.round(target);
  if (Math.abs(moved) > 0.1) {
    const next = moved > 0 ? Math.floor(start + 0.05) + 1 : Math.ceil(start - 0.05) - 1;
    n = moved > 0 ? Math.max(n, next) : Math.min(n, next);
  }
  return n;
}

/**
 * Vuốt 2 ngón: mỗi cú vuốt đúng 1 folder, nhẹ hay mạnh như nhau; đà trôi của macOS bị
 * bỏ qua. Cú mới = nghỉ > 160ms, đổi chiều, hoặc nhịp lăn vọt lên lại khi đà cũ đã giảm
 * (< 1/2 đỉnh) mà còn đang trôi (≥ 3 lần mức thấp nhất, cách cú trước > 250ms).
 * Trả về hàm nhận (deltaX px, now ms) → hướng bước (−1, 1) hoặc 0 (bỏ qua).
 */
export function createWheelGate() {
  const w = { dir: 0, lt: 0, hit: 0, low: 0, peak: 0, armed: false };
  const gate = (dx: number, now: number): -1 | 0 | 1 => {
    const dir = dx > 0 ? 1 : -1;
    const mag = Math.abs(dx);
    const fresh =
      dir !== w.dir || now - w.lt > 160 || (w.armed && now - w.hit > 250 && mag >= 12 && mag > w.low * 3);
    w.dir = dir;
    w.lt = now;
    if (fresh) {
      w.hit = now;
      w.peak = mag;
      w.low = mag;
      w.armed = false;
      return dir as -1 | 1;
    }
    w.peak = Math.max(w.peak, mag);
    if (!w.armed && mag < w.peak * 0.5) {
      w.armed = true; // đà cú trước đã giảm hẳn
      w.low = mag;
    } else if (w.armed) w.low = Math.min(w.low, mag);
    return 0;
  };
  gate.reset = () => {
    w.dir = 0;
    w.lt = 0;
  };
  return gate;
}

function easeOut(t: number): number {
  const u = 1 - Math.max(0, Math.min(1, t));
  return 1 - u * u * u;
}

/** Thời lượng hiệu ứng xếp folder lên kệ lúc mở trang (ms). */
export function enterDuration(count: number): number {
  return 260 + count * 110 + 1100;
}

/**
 * Xếp lên kệ lúc mở trang: folder đứng xa bên phải, mờ → lùa về chỗ chậm dần, nối
 * đuôi nhau. `elapsed` = ms từ lúc bắt đầu. Trả về tư thế đã chỉnh.
 */
export function applyEnter(p: ShelfPose, i: number, elapsed: number): ShelfPose {
  const e = easeOut((elapsed - 260 - i * 110) / 1100);
  return {
    ...p,
    x: p.x + (1 - e) * (520 + i * 90),
    ry: p.ry + (1 - e) * (-55 - p.ry),
    s: p.s * (0.6 + 0.4 * e),
    op: p.op * Math.max(0, Math.min(1, e * 1.6)),
  };
}

// ============================================================================
// Bộ chạy (rAF) + hook
// ============================================================================

export interface ShelfRunnerOptions {
  /** Số folder hiện có. */
  count: () => number;
  /** Bề ngang kệ (px) để chọn cỡ 85% / 68%. */
  width: () => number;
  /** Vẽ một khung: gọi cho từng folder với tư thế đã tính. */
  paint: (i: number, pose: ShelfPose, base: number) => void;
  /** Folder đang ở giữa (làm tròn) đổi. */
  onIndex: (at: number) => void;
  /** Giảm chuyển động: nhảy thẳng tới đích. */
  reducedMotion: () => boolean;
}

export class ShelfRunner {
  m: ShelfMotion = { pos: 0, vel: 0, target: 0, held: false, fast: false };
  private raf = 0;
  private last = 0;
  private enter = 0;
  private at = -1;
  constructor(private o: ShelfRunnerOptions) {}

  setOptions(o: ShelfRunnerOptions) {
    this.o = o;
  }

  private clamp(i: number) {
    return Math.max(0, Math.min(this.o.count() - 1, i));
  }

  render(now: number) {
    const base = shelfBase(this.o.width());
    const xs = shelfXs(base);
    const n = this.o.count();
    for (let i = 0; i < n; i++) {
      let p = shelfPose(i - this.m.pos, base, xs);
      if (this.enter) p = applyEnter(p, i, now - this.enter);
      this.o.paint(i, p, base);
    }
    const at = this.clamp(Math.round(this.m.pos));
    if (at !== this.at) {
      this.at = at;
      this.o.onIndex(at);
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.032, (now - (this.last || now)) / 1000);
    this.last = now;
    if (this.o.reducedMotion()) {
      this.m.pos = this.m.target;
      this.m.vel = 0;
    } else {
      const s = stepShelf(this.m, dt);
      this.m.pos = s.pos;
      this.m.vel = s.vel;
    }
    this.render(now);
    const entering = this.enter && now - this.enter < enterDuration(this.o.count());
    if (!entering) this.enter = 0;
    if (shelfResting(this.m) && !entering) {
      this.m.pos = this.m.target;
      this.m.vel = 0;
      this.render(now);
      this.raf = 0;
      this.last = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  wake() {
    if (!this.raf) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  /** Vẽ lại ngay (đổi cỡ màn, sau khi đổi số folder). */
  layout() {
    this.render(performance.now());
  }

  /** Đặt kệ đứng yên ở folder `at`, không hiệu ứng. */
  reset(at: number) {
    this.stop();
    this.m = { pos: at, vel: 0, target: at, held: false, fast: false };
    this.enter = 0;
    this.at = -1;
    this.layout();
  }

  /** Hiệu ứng xếp folder lên kệ lúc mở trang (bỏ qua nếu giảm chuyển động). */
  startEnter() {
    if (this.o.reducedMotion()) return this.layout();
    this.enter = performance.now();
    this.layout();
    this.wake();
  }

  /** Chạy tới folder i (kẹp hai đầu). `fast`: lướt nhanh rồi đậu êm. */
  goTo(i: number, fast = false) {
    this.m.target = this.clamp(i);
    this.m.fast = fast;
    this.m.held = false;
    this.wake();
  }

  /** Đích hiện tại (đã làm tròn): phím ← → cộng dồn từ đây. */
  get targetIndex() {
    return Math.round(this.m.target);
  }

  /** Bắt đầu kéo: trả về vị trí kệ lúc bắt (kéo từ chỗ đang chạy, không giật). */
  hold(): number {
    this.m.held = true;
    return this.m.pos;
  }

  /** Đang kéo: đích = chỗ tay đang chỉ (kẹp trong hai đầu). */
  dragTo(pos: number) {
    this.m.target = Math.max(0, Math.min(this.o.count() - 1, pos));
    this.wake();
  }

  release(start: number) {
    this.m.held = false;
    this.goTo(dragSnap(start, this.m.target));
  }

  /** Đứng yên đúng ở folder i? (bấm folder giữa mới vào học) */
  settledAt(i: number) {
    return i === this.m.target && Math.abs(this.m.pos - i) < 0.02;
  }

  /** px trên màn hình của một bậc (giữa → bậc 1). */
  stepPx() {
    return shelfXs(shelfBase(this.o.width()))[1];
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.last = 0;
  }
}

/** Tạo một ShelfRunner sống theo component; huỷ rAF khi unmount. */
export function useShelfRunner(options: ShelfRunnerOptions): ShelfRunner {
  const [runner] = useState(() => new ShelfRunner(options));
  // Callbacks mới nhất sau mỗi render (runner chỉ tạo một lần).
  useEffect(() => {
    runner.setOptions(options);
  });
  useEffect(() => () => runner.stop(), [runner]);
  return runner;
}

// ============================================================================
// Trạng thái chương (theo tiến độ, không theo vị trí)
// ============================================================================

export type ChapterState = 'go' | 'skip' | 'done';

/** Học xong → Hoàn thành; chương đầu tiên chưa học → Học ngay; còn lại → Nhảy cóc. */
export function chapterStates(done: boolean[]): ChapterState[] {
  let go = false;
  return done.map((d) => {
    if (d) return 'done';
    if (!go) {
      go = true;
      return 'go';
    }
    return 'skip';
  });
}
