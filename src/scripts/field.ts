/* Specimen field: a few thousand ink points that denoise into one cluster per plate.
   Canvas 2D, no dependencies. Pauses off-screen; static under prefers-reduced-motion. */
import type { ClusterSpec, Shape } from '../data/field';

interface ClusterRuntime extends ClusterSpec { href: string; title: string; numeral: string; taxon: string; cx: number; cy: number; R: number; start: number; count: number; }

type Pt = [number, number];

// ── deterministic randomness ─────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1871);
const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ── cluster shapes (unit radius, y down) ─────────
function sampleSegments(segs: [Pt, Pt, number][], n: number, jitter: number): Pt[] {
  const lens = segs.map(([a, b, w]) => Math.hypot(b[0] - a[0], b[1] - a[1]) * w);
  const total = lens.reduce((s, l) => s + l, 0);
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    let r = rand() * total, k = 0;
    while (r > lens[k]! && k < segs.length - 1) { r -= lens[k]!; k++; }
    const [a, b, w] = segs[k]!;
    const t = rand();
    const j = jitter * (0.6 + w * 0.6);
    out.push([a[0] + (b[0] - a[0]) * t + gauss() * j, a[1] + (b[1] - a[1]) * t + gauss() * j]);
  }
  return out;
}

const shapes: Record<Shape, (n: number) => Pt[]> = {
  ensemble(n) {
    const trees: Pt[] = [[-0.55, -0.1], [-0.05, -0.45], [0.5, -0.05], [-0.25, 0.45], [0.3, 0.5]];
    return Array.from({ length: n }, () => {
      const c = trees[Math.floor(rand() * trees.length)]!;
      // little crown above a trunk
      if (rand() < 0.2) return [c[0] + gauss() * 0.025, c[1] + 0.12 + rand() * 0.22] as Pt;
      return [c[0] + gauss() * 0.15, c[1] - 0.05 + gauss() * 0.12] as Pt;
    });
  },
  house(n) {
    return Array.from({ length: n }, () => {
      const u = rand();
      if (u < 0.62) return [(rand() * 2 - 1) * 0.72 + gauss() * 0.03, -0.05 + rand() * 0.8 + gauss() * 0.03] as Pt;
      if (u < 0.92) { // roof
        const x = rand() * 2 - 1, y = -0.05 - (1 - Math.abs(x)) * 0.72 * rand();
        return [x * 0.86 + gauss() * 0.02, y + gauss() * 0.02] as Pt;
      }
      return [0.48 + gauss() * 0.04, -0.62 - rand() * 0.2] as Pt; // chimney
    });
  },
  digits(n) {
    return Array.from({ length: n }, () => {
      const i = Math.floor(rand() * 9), gx = (i % 3) - 1, gy = Math.floor(i / 3) - 1;
      const rejected = i === 2 || i === 6;
      const s = rejected ? 0.17 : 0.1;
      return [gx * 0.62 + gauss() * s, gy * 0.62 + gauss() * s] as Pt;
    });
  },
  beamtree(n) {
    // a left-to-right search tree with a short stem; pruned branches are short and faint
    const segs: [Pt, Pt, number][] = [[[-1, 0], [-0.62, 0], 1]];
    const nodes: Pt[] = [];
    const grow = (p: Pt, depth: number, spread: number, alive: boolean) => {
      nodes.push(p);
      if (depth === 4) return;
      for (const s of [-1, 1]) {
        const keep = alive && !(depth === 1 && s === 1) && !(depth === 2 && s === -1);
        const q: Pt = [p[0] + (keep ? 0.46 : 0.26), p[1] + s * spread * (keep ? 1 : 0.6)];
        segs.push([p, q, keep ? 1 : 0.35]);
        if (keep) grow(q, depth + 1, spread * 0.55, true);
        else nodes.push(q);
      }
    };
    grow([-0.62, 0], 0, 0.38, true);
    const pts = sampleSegments(segs, Math.round(n * 0.8), 0.022);
    for (let i = pts.length; i < n; i++) {
      const c = nodes[Math.floor(rand() * nodes.length)]!;
      pts.push([c[0] + gauss() * 0.035, c[1] + gauss() * 0.035]);
    }
    return pts;
  },
  lymph(n) {
    const follicles: Pt[] = [[-0.45, -0.35], [0.4, -0.45], [0.55, 0.3], [-0.5, 0.4], [0.0, 0.6]];
    return Array.from({ length: n }, () => {
      const u = rand();
      if (u < 0.42) { const a = rand() * Math.PI * 2, r = 0.92 + gauss() * 0.035; return [Math.cos(a) * r, Math.sin(a) * r * 0.82] as Pt; }
      if (u < 0.8) { const c = follicles[Math.floor(rand() * follicles.length)]!; return [c[0] + gauss() * 0.11, c[1] * 0.82 + gauss() * 0.1] as Pt; }
      return [gauss() * 0.28, gauss() * 0.22] as Pt;
    });
  },
  aorta(n) {
    return Array.from({ length: n }, () => {
      const a = Math.PI * (1.1 + rand() * 0.8);
      const layer = rand();
      const r = 0.62 + layer * 0.42 + gauss() * 0.02;
      return [Math.cos(a) * r, Math.sin(a) * r + 0.55] as Pt;
    });
  },
  roots(n) {
    const segs: [Pt, Pt, number][] = [[[0, -1.0], [0, -0.7], 1.6]];
    const grow = (p: Pt, angle: number, len: number, depth: number) => {
      if (depth > 5) return;
      // roots wander: two half-segments with a slight bend
      const mid: Pt = [p[0] + Math.sin(angle) * len * 0.5, p[1] + Math.cos(angle) * len * 0.5];
      const a2 = angle + gauss() * 0.22;
      const q: Pt = [mid[0] + Math.sin(a2) * len * 0.5, mid[1] + Math.cos(a2) * len * 0.5];
      const w = (6 - depth) / 4.5;
      segs.push([p, mid, w], [mid, q, w]);
      const kids = depth === 1 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        const spread = depth === 1 ? 1.0 : depth === 2 ? 0.7 : 0.5;
        grow(q, a2 + (k - (kids - 1) / 2) * spread + gauss() * 0.1, len * 0.7, depth + 1);
      }
    };
    grow([0, -0.7], 0, 0.42, 1);
    return sampleSegments(segs, n, 0.02);
  },
};

// ── field ────────────────────────────────────────
export function mountField(root: HTMLElement) {
  const canvas = root.querySelector('canvas')!;
  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const labels = [...root.querySelectorAll<HTMLAnchorElement>('[data-cluster]')];
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const specs: ClusterRuntime[] = JSON.parse(root.dataset.clusters!);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let W = 0, H = 0, dpr = 1, mobile = false;
  let N = 0;
  // typed arrays: target(x,y), noise offset(x,y), displacement(x,y), phase, size, alphaBucket, cluster index
  let tx: Float32Array, ty: Float32Array, ex: Float32Array, ey: Float32Array, dx: Float32Array, dy: Float32Array, ph: Float32Array, sz: Float32Array;
  let ab: Uint8Array, ci: Int8Array;
  let unit: Pt[][] = [];       // unit-shape samples per cluster (stable across resizes)
  let strayUnit: Pt[] = [];

  let ink = '26 24 20', accent = '184 67 47';
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    ink = cs.getPropertyValue('--field-ink').trim() || ink;
    accent = cs.getPropertyValue('--field-accent').trim() || accent;
  };

  let active = -1;               // highlighted cluster
  let pointer = { x: -1e4, y: -1e4, on: false };
  let t0 = 0, running = false, visible = true, raf = 0;
  const SETTLE = reduce ? 0 : 1500;
  // the field drifts for a few seconds after settling, then rests (WCAG 2.2.2); the cursor wakes it
  const IDLE = 4500;
  let lastWake = 0;

  function build() {
    // narrow or near-square fields (phones, tablets) use the stacked map
    mobile = W < 720 || W / H < 0.95;
    const total = mobile ? 1000 : coarse ? 1800 : 3000;
    const strays = Math.round(total * 0.07);
    const weights = specs.map((s) => s.r * s.r);
    const wsum = weights.reduce((a, b) => a + b, 0);
    const counts = weights.map((w) => Math.round(((total - strays) * w) / wsum));
    if (unit.length !== specs.length || unit[0]!.length !== counts[0]) {
      unit = specs.map((s, i) => shapes[s.shape](counts[i]!));
      strayUnit = Array.from({ length: strays }, () => [rand(), rand()] as Pt);
    }
    N = counts.reduce((a, b) => a + b, 0) + strays;
    tx = new Float32Array(N); ty = new Float32Array(N); ex = new Float32Array(N); ey = new Float32Array(N);
    dx = new Float32Array(N); dy = new Float32Array(N); ph = new Float32Array(N); sz = new Float32Array(N);
    ab = new Uint8Array(N); ci = new Int8Array(N);
    const m = Math.min(W, H);
    const pr = mulberry32(7);
    let k = 0;
    specs.forEach((s, i) => {
      const [nx, ny] = mobile ? s.m : s.d;
      s.cx = nx * W; s.cy = ny * H; s.R = s.r * m * (mobile ? 1.35 : W < 1100 ? 0.8 : 1);
      s.start = k; s.count = counts[i]!;
      for (const [ux, uy] of unit[i]!) {
        tx[k] = s.cx + ux * s.R; ty[k] = s.cy + uy * s.R; ci[k] = i; k++;
      }
    });
    for (const [ux, uy] of strayUnit) { tx[k] = ux * W; ty[k] = uy * H; ci[k] = -1; k++; }
    for (let j = 0; j < N; j++) {
      // noise offset from the canvas centre (the "x_T" of the denoising process)
      ex[j] = gaussP(pr) * W * 0.3;
      ey[j] = gaussP(pr) * H * 0.3;
      ph[j] = pr() * Math.PI * 2;
      sz[j] = 1.1 + pr() * 1.3;
      ab[j] = pr() < 0.55 ? 0 : pr() < 0.7 ? 1 : 2;
    }
    labels.forEach((a, i) => placeLabel(a, specs[i]!));
  }
  function gaussP(r: () => number) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  function placeLabel(a: HTMLElement, s: ClusterRuntime) {
    const off = s.R * 0.72;
    const x = s.cx + (s.label.includes('e') ? off : -off);
    const y = s.cy + (s.label.includes('s') ? off * 0.8 : -off * 0.8);
    a.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${s.label.includes('e') ? '0' : '-100%'}, -50%)`;
  }

  function resize() {
    const r = root.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    build();
    root.classList.add('is-live');
    if (!running) draw(performance.now());
  }

  const alphas = [0.88, 0.6, 0.32];
  function draw(now: number) {
    const el = reduce ? 1 : Math.min(1, (now - t0) / SETTLE);
    // cosine schedule: signal rises, noise falls (a² + b² = 1)
    const th = (1 - Math.cos(Math.PI * easeInOut(el))) * 0.25 * Math.PI;
    const a = Math.sin(th), b = Math.cos(th);
    const shimmer = reduce ? 0 : b * 2.2;
    const time = now / 1000;
    const R = coarse ? 70 : 110, R2 = R * R;
    const px = pointer.x, py = pointer.y, pon = pointer.on && el >= 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (let pass = 0; pass < 4; pass++) {
      // passes 0–2: ink buckets; pass 3: active cluster in accent
      ctx.fillStyle = pass < 3 ? `rgb(${ink} / ${alphas[pass]})` : `rgb(${accent} / 0.92)`;
      ctx.beginPath();
      for (let j = 0; j < N; j++) {
        const isActive = ci[j] === active && active >= 0;
        if (pass < 3 ? (ab[j] !== pass || isActive) : !isActive) continue;
        // base position from the denoising schedule
        let x = tx[j]! - (1 - a) * (tx[j]! - W / 2) + b * ex[j]! * 0.9;
        let y = ty[j]! - (1 - a) * (ty[j]! - H / 2) + b * ey[j]! * 0.9;
        if (!reduce) {
          x += Math.sin(time * 0.6 + ph[j]!) * 0.9 + (shimmer ? gauss() * shimmer : 0);
          y += Math.cos(time * 0.5 + ph[j]! * 1.3) * 0.9;
        }
        // cursor field (spring toward a radial push)
        let gx = 0, gy = 0;
        if (pon) {
          const ddx = x - px, ddy = y - py, d2 = ddx * ddx + ddy * ddy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R);
            const push = f * f * 30;
            gx = (ddx / d) * push; gy = (ddy / d) * push;
          }
        }
        dx[j] = dx[j]! + (gx - dx[j]!) * 0.14;
        dy[j] = dy[j]! + (gy - dy[j]!) * 0.14;
        x += dx[j]!; y += dy[j]!;
        const s = sz[j]! * (isActive ? 1.25 : 1);
        ctx.rect(x - s / 2, y - s / 2, s, s);
      }
      ctx.fill();
    }
  }
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function loop(now: number) {
    draw(now);
    if (now - t0 > SETTLE && now - lastWake > IDLE) { running = false; return; }
    raf = requestAnimationFrame(loop);
  }
  const wake = () => { lastWake = performance.now(); start(); };
  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // ── interaction ──
  const hit = (x: number, y: number) => {
    let best = -1, bd = Infinity;
    specs.forEach((s, i) => {
      const d = Math.hypot(x - s.cx, y - s.cy) / (s.R * 1.15);
      if (d < 1 && d < bd) { bd = d; best = i; }
    });
    return best;
  };
  function setActive(i: number) {
    if (i === active) return;
    active = i;
    labels.forEach((l, k) => l.classList.toggle('is-active', k === i));
    if (i < 0) { caption.classList.remove('is-on'); root.style.cursor = ''; }
    else {
      const s = specs[i]!;
      caption.querySelector('[data-c-num]')!.textContent = `Plate ${s.numeral}`;
      caption.querySelector('[data-c-title]')!.textContent = s.title;
      caption.querySelector('[data-c-taxon]')!.textContent = s.taxon;
      const right = s.cx < W * 0.62;
      const cx = right ? s.cx + s.R * 1.1 : s.cx - s.R * 1.1;
      caption.style.transform = `translate(${cx.toFixed(0)}px, ${(s.cy + s.R * 0.2).toFixed(0)}px) translateX(${right ? '0' : '-100%'})`;
      caption.classList.add('is-measuring');
      caption.dataset.side = right ? 'r' : 'l';
      // never let the caption sit on the headline: lift it above the cluster if they would touch
      const head = root.querySelector<HTMLElement>('.field__title');
      if (head) {
        // try positions in order (beside, below, above) and keep the first that clears the headline's text lines
        const rr = root.getBoundingClientRect(), cr = caption.getBoundingClientRect();
        const range = document.createRange(); range.selectNodeContents(head);
        const lines = [...range.getClientRects()].map((l) => ({ x: l.left - rr.left, y: l.top - rr.top, w: l.width, h: l.height }));
        const w = cr.width, h = cr.height, pad = 16;
        const clear = (x: number, y: number) => !lines.some((l) => x < l.x + l.w + pad && x + w > l.x - pad && y < l.y + l.h && y + h > l.y - pad);
        const candidates: [number, number][] = [
          [right ? cx : cx - w, s.cy + s.R * 0.2],
          [Math.min(W - w - 16, s.cx + s.R - w), s.cy + s.R * 0.95],
          [right ? cx : cx - w, s.cy - s.R * 1.05 - h],
        ];
        const pick = candidates.find(([x, y]) => clear(x, y)) ?? candidates[0]!;
        caption.style.transform = `translate(${pick[0].toFixed(0)}px, ${pick[1].toFixed(0)}px)`;
      }
      caption.classList.remove('is-measuring');
      caption.classList.add('is-on');
      root.style.cursor = 'pointer';
    }
    if (!running) draw(performance.now());
  }
  const local = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  root.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const p = local(e);
    pointer = { ...p, on: true };
    wake();
    setActive(hit(p.x, p.y));
  });
  root.addEventListener('pointerleave', () => { pointer.on = false; setActive(-1); });
  root.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) return;
    const p = local(e as PointerEvent);
    const i = hit(p.x, p.y);
    const touch = (e as PointerEvent).pointerType === 'touch' || coarse;
    if (i < 0) { setActive(-1); return; }
    if (touch && active !== i) { pointer = { ...p, on: true }; setActive(i); return; } // first tap identifies
    location.href = specs[i]!.href;
  });
  labels.forEach((l, i) => {
    l.addEventListener('focus', () => setActive(i));
    l.addEventListener('blur', () => setActive(-1));
    l.addEventListener('pointerenter', () => setActive(i));
  });

  const io = new IntersectionObserver(([en]) => { visible = !!en?.isIntersecting; visible ? start() : stop(); });
  io.observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(() => resize()).observe(root);
  const recolor = () => { readColors(); if (!running) draw(performance.now()); };
  window.addEventListener('atlas:theme', recolor);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);

  readColors();
  t0 = performance.now();
  lastWake = t0;
  resize();
  start();
}
