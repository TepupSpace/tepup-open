/**
 * Mô phỏng lực cho bản đồ thư viện (/thu-vien/ban-do).
 *
 * Cùng mô hình với graph view của Obsidian (sim.js của Obsidian là d3-force chạy trong một
 * Web Worker): năm lực, mỗi nhịp cộng vào vận tốc rồi vận tốc giảm dần.
 *   - kéo về tâm theo trục x và y (forceX/forceY);
 *   - lò xo theo liên kết, sức kéo 1/min(bậc hai đầu), nên một mục có nhiều liên kết không
 *     giật hết các mục lẻ về phía nó; đầu ít liên kết hơn di chuyển nhiều hơn;
 *   - đẩy nhau giữa mọi cặp (forceManyBody, khoảng cách tối thiểu để không văng);
 *   - chống chồng: hai chấm không lấn vào nhau (forceCollide);
 *   - "nhiệt" alpha nguội dần sau khoảng 300 nhịp; kéo một chấm hoặc lọc thì hâm lại.
 * Hệ số của Obsidian (độ dài liên kết 250, lực đẩy −1000…) được thu theo tỉ lệ khung của Tepup
 * (độ dài ×¼; lực đẩy chỉnh riêng, xem FORCES).
 *
 * Tính đúng từng cặp (O(n²)) thay cho cây tứ phân Barnes–Hut của d3: thư viện có vài trăm mục,
 * và bố cục đầu tiên chỉ tính một lần ở server rồi được cache cùng dữ liệu (getGraph).
 * Tất định: cùng dữ liệu → cùng hình, không dùng Math.random.
 */

export type Pos = { x: number; y: number };
export type SimNode = Pos & { vx: number; vy: number; fx: number | null; fy: number | null; r: number };
type SimLink = { s: number; t: number; strength: number; bias: number };

/** Bán kính chấm (điểm ảnh ở mức phóng 1) theo số liên kết. */
export const nodeRadius = (degree: number) => 5 + 2.5 * Math.sqrt(degree);

const ALPHA_MIN = 0.001;
const ALPHA_DECAY = 1 - Math.pow(ALPHA_MIN, 1 / 300);
/** Phần vận tốc còn lại sau mỗi nhịp (Obsidian: ×0.6). */
const VELOCITY_KEEP = 0.6;
const CHARGE_MIN_DIST2 = 8 * 8;
const COLLIDE_STRENGTH = 0.5;

/** Hệ số lực (Obsidian cho chỉnh bằng thanh trượt; ở đây cố định, để ngỏ cho test). */
export type Forces = { center: number; linkDistance: number; charge: number; collidePad: number };
// Lực đẩy mạnh hơn bản thu nhỏ của Obsidian (−60): Obsidian chỉnh cho kho hàng nghìn ghi chú; với
// vài trăm mục, −60 làm các cụm lẫn vào nhau. Thử trên đồ thị mẫu (tests/unit/library-graph-layout):
// −200 giữ mỗi mục gần mục chính của nó, không cạnh nào cắt nhau, hình vẫn gọn trong khung.
export const FORCES: Forces = { center: 0.1, linkDistance: 60, charge: -200, collidePad: 6 };
/** Nhiệt khi hâm lại (lọc, kéo chấm) — như Obsidian. */
export const REHEAT = 0.3;

export class ForceSim {
  readonly nodes: SimNode[];
  private readonly links: SimLink[];
  alpha = 1;
  alphaTarget = 0;
  private seed = 1;
  private readonly f: Forces;

  /**
   * @param start vị trí đầu cho từng chấm; `undefined` → xếp theo đường xoắn hướng dương
   *   (phyllotaxis, như d3), đều và tất định.
   * @param edges cặp chỉ số trong `start`.
   * @param radius bán kính từng chấm, để chống chồng.
   */
  constructor(start: (Pos | undefined)[], edges: { s: number; t: number }[], radius: number[], forces: Forces = FORCES) {
    this.f = forces;
    const golden = Math.PI * (3 - Math.sqrt(5));
    this.nodes = start.map((p, i) => {
      const r = 10 * Math.sqrt(0.5 + i);
      const a = i * golden;
      return {
        x: p ? p.x : r * Math.cos(a),
        y: p ? p.y : r * Math.sin(a),
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        r: radius[i] + forces.collidePad,
      };
    });
    const deg = new Array(start.length).fill(0);
    for (const e of edges) {
      deg[e.s]++;
      deg[e.t]++;
    }
    this.links = edges.map(({ s, t }) => ({
      s,
      t,
      strength: 1 / Math.min(deg[s], deg[t]),
      bias: deg[s] / (deg[s] + deg[t]),
    }));
  }

  get running() {
    return this.alpha >= ALPHA_MIN || this.alphaTarget > 0;
  }

  /** Hâm lại: dùng khi dữ liệu đổi hoặc bắt đầu kéo. */
  reheat(alpha = REHEAT) {
    this.alpha = Math.max(this.alpha, alpha);
  }

  /** Một nhịp mô phỏng (Obsidian chạy 60 nhịp mỗi giây). */
  tick() {
    const { nodes, links } = this;
    const { center, linkDistance, charge } = this.f;
    const n = nodes.length;
    const alpha = (this.alpha += (this.alphaTarget - this.alpha) * ALPHA_DECAY);

    for (const p of nodes) {
      p.vx -= p.x * center * alpha;
      p.vy -= p.y * center * alpha;
    }

    for (const l of links) {
      const a = nodes[l.s];
      const b = nodes[l.t];
      let dx = b.x + b.vx - a.x - a.vx || this.jiggle();
      let dy = b.y + b.vy - a.y - a.vy || this.jiggle();
      const d = Math.sqrt(dx * dx + dy * dy);
      const k = ((d - linkDistance) / d) * alpha * l.strength;
      dx *= k;
      dy *= k;
      b.vx -= dx * l.bias;
      b.vy -= dy * l.bias;
      a.vx += dx * (1 - l.bias);
      a.vy += dy * (1 - l.bias);
    }

    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (dx === 0) d2 += (dx = this.jiggle()) * dx;
        if (dy === 0) d2 += (dy = this.jiggle()) * dy;
        if (d2 < CHARGE_MIN_DIST2) d2 = Math.sqrt(CHARGE_MIN_DIST2 * d2);
        const w = (charge * alpha) / d2;
        a.vx += dx * w;
        a.vy += dy * w;
        b.vx -= dx * w;
        b.vy -= dy * w;
      }
    }

    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        const rr = a.r + b.r;
        let dx = a.x + a.vx - b.x - b.vx;
        let dy = a.y + a.vy - b.y - b.vy;
        let d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr) continue;
        if (dx === 0) d2 += (dx = this.jiggle()) * dx;
        if (dy === 0) d2 += (dy = this.jiggle()) * dy;
        const d = Math.sqrt(d2);
        const k = ((rr - d) / d) * COLLIDE_STRENGTH;
        // Chấm nhỏ nhường chỗ nhiều hơn.
        const share = (b.r * b.r) / (a.r * a.r + b.r * b.r);
        a.vx += dx * k * share;
        a.vy += dy * k * share;
        b.vx -= dx * k * (1 - share);
        b.vy -= dy * k * (1 - share);
      }
    }

    for (const p of nodes) {
      if (p.fx === null) p.x += p.vx *= VELOCITY_KEEP;
      else {
        p.x = p.fx;
        p.vx = 0;
      }
      if (p.fy === null) p.y += p.vy *= VELOCITY_KEEP;
      else {
        p.y = p.fy;
        p.vy = 0;
      }
    }
  }

  /** Chạy tới khi nguội (tối đa `max` nhịp). */
  settle(max = 1000) {
    for (let i = 0; i < max && this.running; i++) this.tick();
  }

  /** Nhiễu rất nhỏ khi hai chấm trùng chỗ, từ một bộ sinh số tất định (LCG, như d3). */
  private jiggle() {
    this.seed = (1664525 * this.seed + 1013904223) % 4294967296;
    return (this.seed / 4294967296 - 0.5) * 1e-6;
  }
}

/** Bố cục ban đầu cho cả thư viện: chạy tới khi nguội, làm tròn 0,1 cho gọn khi gửi xuống. */
export function layoutGraph(count: number, edges: { s: number; t: number }[], forces: Forces = FORCES): Pos[] {
  const deg = new Array(count).fill(0);
  for (const e of edges) {
    deg[e.s]++;
    deg[e.t]++;
  }
  const sim = new ForceSim(new Array(count).fill(undefined), edges, deg.map(nodeRadius), forces);
  sim.settle();
  return sim.nodes.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
}
