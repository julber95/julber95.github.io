/* Engraving toolkit: deterministic, build-time SVG generation helpers.
   Every engraving imports from here. See docs/ENGRAVING-STYLE.md. */

export type P = [number, number];

/** Seeded PRNG: the same seed always draws the same plate. */
export function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = next();
    while (v === 0) v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const range = (a: number, b: number) => a + (b - a) * next();
  const pick = <T,>(xs: T[]) => xs[Math.floor(next() * xs.length)]!;
  return { next, gauss, range, pick };
}
export type Rng = ReturnType<typeof rng>;

/** Round to 1 decimal: keeps markup small. */
export const r1 = (n: number) => Math.round(n * 10) / 10;
const f = (p: P) => `${r1(p[0])} ${r1(p[1])}`;

/** Polyline → path data. */
export const line = (pts: P[]) => 'M' + pts.map(f).join('L');

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
export function smooth(pts: P[], tension = 0.5): string {
  if (pts.length < 3) return line(pts);
  let d = `M${f(pts[0]!)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[i + 2] ?? p2;
    const t = tension / 3;
    const c1: P = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: P = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  return d;
}

/** A hand-ruled line: slight wobble along a straight segment (engraver's burin, not a ruler). */
export function wobble(a: P, b: P, R: Rng, amp = 0.6, steps?: number): string {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = steps ?? Math.max(2, Math.round(len / 18));
  const nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, w = i === 0 || i === n ? 0 : R.gauss() * amp;
    pts.push([a[0] + (b[0] - a[0]) * t + nx * w, a[1] + (b[1] - a[1]) * t + ny * w]);
  }
  return smooth(pts, 0.4);
}

/** Parallel hatching across a bounding box at `angle` degrees, `gap` px apart.
 *  Clip it with <clipPath> to a shape. Lines get a tiny jitter so they look cut, not printed. */
export function hatch(box: { x: number; y: number; w: number; h: number }, angle: number, gap: number, R: Rng, jitter = 0.35): string {
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const half = Math.hypot(box.w, box.h) / 2 + gap;
  let d = '';
  for (let o = -half; o <= half; o += gap) {
    const off = o + R.gauss() * jitter;
    const x0 = cx - ca * half - sa * off, y0 = cy - sa * half + ca * off;
    const x1 = cx + ca * half - sa * off, y1 = cy + sa * half + ca * off;
    d += `M${r1(x0)} ${r1(y0)}L${r1(x1)} ${r1(y1)}`;
  }
  return d;
}

/** Stipple dots as zero-length round-capped segments in ONE path (tiny markup).
 *  Render with stroke-linecap="round" and stroke-width = dot diameter. */
export function dots(pts: P[]): string {
  return pts.map((p) => `M${f(p)}h0`).join('');
}

/** Rejection-sample `n` points inside a region, with optional density weighting (0–1). */
export function stipple(n: number, box: { x: number; y: number; w: number; h: number }, R: Rng,
  inside: (x: number, y: number) => boolean, density: (x: number, y: number) => number = () => 1): P[] {
  const out: P[] = [];
  let guard = n * 60;
  while (out.length < n && guard-- > 0) {
    const x = box.x + R.next() * box.w, y = box.y + R.next() * box.h;
    if (inside(x, y) && R.next() < density(x, y)) out.push([x, y]);
  }
  return out;
}

/** Ellipse / blob outline with organic irregularity. */
export function blob(cx: number, cy: number, rx: number, ry: number, R: Rng, irregular = 0.08, n = 28): P[] {
  const pts: P[] = [];
  const ph = R.next() * 6.28;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = 1 + Math.sin(t * 3 + ph) * irregular * 0.6 + R.gauss() * irregular * 0.4;
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  return pts;
}
/** Smooth closed outline through points. */
export function closed(pts: P[], tension = 0.5): string {
  const n = pts.length, t = tension / 3;
  let d = `M${f(pts[0]!)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!, p1 = pts[i]!, p2 = pts[(i + 1) % n]!, p3 = pts[(i + 2) % n]!;
    const c1: P = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: P = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  return d + 'Z';
}

/** Point-in-polygon (even-odd). */
export function inPoly(poly: P[], x: number, y: number) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!, [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Sample a Catmull-Rom curve through `pts` into `n` points per span. */
export function sampleCurve(pts: P[], n = 8): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[i + 2] ?? p2;
    for (let s = 0; s < n; s++) {
      const t = s / n, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]!);
  return out;
}

/** A tapered stroke (burin cut): closed outline along `pts`, width w0 → w1. Fill it with .fk / .fa. */
export function taper(pts: P[], w0: number, w1: number): string {
  const L: P[] = [], Rt: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]!, b = pts[Math.min(pts.length - 1, i + 1)]!;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const t = i / (pts.length - 1), w = (w0 + (w1 - w0) * t) / 2;
    const nx = (-dy / len) * w, ny = (dx / len) * w;
    L.push([pts[i]![0] + nx, pts[i]![1] + ny]);
    Rt.push([pts[i]![0] - nx, pts[i]![1] - ny]);
  }
  return line([...L, ...Rt.reverse()]) + 'Z';
}

/** Round every coordinate in a path to whole pixels: use for fine detail (dots, hairs, hatching). */
export const int = (d: string) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n))));
