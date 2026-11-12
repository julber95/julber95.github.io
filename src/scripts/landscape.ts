/* Loss landscape: the homepage figure.
   ℒ(u,v) = gentle bowl + ripples − Σ basins − cursor well. Contours by marching squares on a coarse grid.
   Drag the ball and let go: it descends the gradient (momentum + decaying noise, like SGD), settles in a
   basin and opens that section. The cursor digs a small well that bends the contours toward it.
   Nothing is drawn while idle; reduced motion settles instantly. */
import type { Basin } from '../data/landscape';

type V2 = [number, number];
interface Data { basins: Basin[]; ball: V2 }

const N = 96;            // grid cells per side
const LEVELS = 17;       // iso-lines
const WELL_DEPTH = 0.55, WELL_WIDTH = 0.07;

export function mountLandscape(root: HTMLElement) {
  const canvas = root.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const defaultCaption = caption.innerHTML;
  const ballEl = root.querySelector<HTMLButtonElement>('[data-ball]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  const labels = [...root.querySelectorAll<HTMLAnchorElement>('[data-basin]')];
  const { basins, ball: ballStart, settled = "Settled in <em>{x}</em>. Opening…" } = JSON.parse(root.dataset.landscape!) as Data & { settled?: string };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── the field ──────────────────────────────────
  let wellAmp = 0, wellTarget = 0;
  let well: V2 = [0.5, 0.5], wellGoal: V2 = [0.5, 0.5];
  const L = (u: number, v: number) => {
    const du = u - 0.5, dv = v - 0.5;
    let s = 1.15 * (du * du + dv * dv) + 0.045 * Math.sin(u * 9.1 + 0.6) * Math.cos(v * 7.3) + 0.03 * Math.sin((u + v) * 13.7);
    for (const b of basins) {
      const x = u - b.at[0], y = v - b.at[1];
      s -= b.depth * Math.exp(-(x * x + y * y) / (2 * b.width * b.width));
    }
    if (wellAmp > 0.001) {
      const x = u - well[0], y = v - well[1];
      s -= wellAmp * Math.exp(-(x * x + y * y) / (2 * WELL_WIDTH * WELL_WIDTH));
    }
    return s;
  };
  const grad = (u: number, v: number): V2 => {
    const h = 0.0025;
    return [(L(u + h, v) - L(u - h, v)) / (2 * h), (L(u, v + h) - L(u, v - h)) / (2 * h)];
  };

  // ── state ──────────────────────────────────────
  let S = 0, dpr = 1;
  let ink = '26 24 20', accent = '162 58 39';
  let ball: V2 = [...ballStart] as V2;
  let vel: V2 = [0, 0];
  let trail: { p: V2; t: number }[] = [];
  let mode: 'rest' | 'drag' | 'roll' | 'done' = 'rest';
  let rollStart = 0, steps = 0;
  let active = -1;
  let pointerIn = false;
  let raf = 0, running = false, visible = true;
  let contourInk: Path2D[] = [], contourHot: Path2D | null = null, levels: number[] = [];
  let fieldDirty = true;

  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    ink = cs.getPropertyValue('--field-ink').trim() || ink;
    accent = cs.getPropertyValue('--field-accent').trim() || accent;
  };

  // levels are fixed from the undisturbed field so contours don't "breathe" when the well moves
  function computeLevels() {
    const saved = wellAmp; wellAmp = 0;
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j <= N; j += 2) for (let i = 0; i <= N; i += 2) { const z = L(i / N, j / N); lo = Math.min(lo, z); hi = Math.max(hi, z); }
    wellAmp = saved;
    levels = Array.from({ length: LEVELS }, (_, k) => lo + ((k + 0.6) / LEVELS) * (hi - lo) * 0.92);
  }

  // marching squares → one Path2D per level (+ one for the highlighted basin).
  // The undisturbed field is cached; only the cells near the cursor well are re-sampled,
  // and each cell only visits the levels between its min and max corner.
  const W = N + 1;
  const base = new Float32Array(W * W);
  const grid = new Float32Array(W * W);
  let baseDirty = true;
  function sampleBase() {
    const saved = wellAmp; wellAmp = 0;
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) base[j * W + i] = L(i / N, j / N);
    wellAmp = saved;
    baseDirty = false;
  }
  function sampleGrid() {
    if (baseDirty) sampleBase();
    grid.set(base);
    if (wellAmp <= 0.001) return;
    const r = WELL_WIDTH * 4, k = 1 / (2 * WELL_WIDTH * WELL_WIDTH);
    const i0 = Math.max(0, Math.floor((well[0] - r) * N)), i1 = Math.min(N, Math.ceil((well[0] + r) * N));
    const j0 = Math.max(0, Math.floor((well[1] - r) * N)), j1 = Math.min(N, Math.ceil((well[1] + r) * N));
    for (let j = j0; j <= j1; j++) {
      const y = j / N - well[1];
      for (let i = i0; i <= i1; i++) {
        const x = i / N - well[0];
        grid[j * W + i]! -= wellAmp * Math.exp(-(x * x + y * y) * k);
      }
    }
  }
  function buildContours() {
    sampleGrid();
    const c = S / N;
    const hot = active >= 0 ? basins[active]! : null;
    const hotR2 = hot ? (hot.width * 1.7) ** 2 : 0;
    const hx = hot ? hot.at[0] * S : 0, hy = hot ? hot.at[1] * S : 0, s2 = S * S;
    contourHot = hot ? new Path2D() : null;
    contourInk = levels.map(() => new Path2D());
    const seg = (k: number, px: number, py: number, qx: number, qy: number) => {
      let target = contourInk[k]!;
      if (hot && k < 6) {
        const mx = (px + qx) / 2 - hx, my = (py + qy) / 2 - hy;
        if (mx * mx + my * my < hotR2 * s2) target = contourHot!;
      }
      target.moveTo(px, py); target.lineTo(qx, qy);
    };
    const nl = levels.length;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const A = grid[j * W + i]!, B = grid[j * W + i + 1]!, D = grid[(j + 1) * W + i]!, E = grid[(j + 1) * W + i + 1]!;
      const lo = Math.min(A, B, D, E), hi = Math.max(A, B, D, E);
      if (hi < levels[0]! || lo > levels[nl - 1]!) continue;
      const x = i * c, y = j * c;
      for (let k = 0; k < nl; k++) {
        const lv = levels[k]!;
        if (lv <= lo) continue;
        if (lv > hi) break;
        const a = A - lv, b = B - lv, d = D - lv, e = E - lv;
        const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (e > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const tx = x + c * (a / (a - b)), ry = y + c * (b / (b - e));
        const bx = x + c * (d / (d - e)), ly = y + c * (a / (a - d));
        switch (idx) {
          case 1: case 14: seg(k, x, ly, bx, y + c); break;
          case 2: case 13: seg(k, bx, y + c, x + c, ry); break;
          case 3: case 12: seg(k, x, ly, x + c, ry); break;
          case 4: case 11: seg(k, tx, y, x + c, ry); break;
          case 6: case 9: seg(k, tx, y, bx, y + c); break;
          case 7: case 8: seg(k, x, ly, tx, y); break;
          case 5: seg(k, x, ly, tx, y); seg(k, bx, y + c, x + c, ry); break;
          case 10: seg(k, x, ly, bx, y + c); seg(k, tx, y, x + c, ry); break;
        }
      }
    }
    fieldDirty = false;
  }

  // ── drawing ────────────────────────────────────
  function draw(now: number) {
    if (fieldDirty) buildContours();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    ctx.lineWidth = 0.8;
    contourInk.forEach((p, k) => {
      ctx.strokeStyle = `rgb(${ink} / ${(0.62 - (k / LEVELS) * 0.42).toFixed(3)})`;
      ctx.stroke(p);
    });
    if (contourHot) { ctx.strokeStyle = `rgb(${accent} / 0.9)`; ctx.lineWidth = 1.1; ctx.stroke(contourHot); }
    // trail
    for (const t of trail) {
      const age = (now - t.t) / 1400;
      if (age >= 1) continue;
      ctx.fillStyle = `rgb(${accent} / ${(0.85 * (1 - age)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(t.p[0] * S, t.p[1] * S, 1.7, 0, Math.PI * 2); ctx.fill();
    }
    trail = trail.filter((t) => now - t.t < 1400);
    // ball
    ctx.fillStyle = `rgb(${accent})`;
    ctx.beginPath(); ctx.arc(ball[0] * S, ball[1] * S, mode === 'drag' ? 8 : 6.5, 0, Math.PI * 2); ctx.fill();
    ballEl.style.left = `${(ball[0] * 100).toFixed(2)}%`;
    ballEl.style.top = `${(ball[1] * 100).toFixed(2)}%`;
  }

  // ── animation ──────────────────────────────────
  function tick(now: number) {
    let busy = false;
    // gravity well spring
    const ga = wellTarget - wellAmp;
    if (Math.abs(ga) > 0.004 || Math.hypot(wellGoal[0] - well[0], wellGoal[1] - well[1]) > 0.001) {
      wellAmp += ga * 0.16;
      well = [well[0] + (wellGoal[0] - well[0]) * 0.18, well[1] + (wellGoal[1] - well[1]) * 0.18];
      fieldDirty = true; busy = true;
    } else if (wellAmp !== wellTarget) { wellAmp = wellTarget; fieldDirty = true; }
    if (mode === 'roll') { busy = true; step(now); }
    if (mode === 'drag' || trail.length) busy = true;
    draw(now);
    if (busy && visible) raf = requestAnimationFrame(tick);
    else running = false;
  }
  const wake = () => { if (!running && visible) { running = true; raf = requestAnimationFrame(tick); } };

  function step(now: number) {
    const g = grad(ball[0], ball[1]);
    const noise = 0.0018 * Math.max(0, 1 - steps / 40);
    vel = [vel[0] * 0.55 - 0.0016 * g[0] + (Math.random() - 0.5) * noise, vel[1] * 0.55 - 0.0016 * g[1] + (Math.random() - 0.5) * noise];
    ball = [Math.min(0.97, Math.max(0.03, ball[0] + vel[0])), Math.min(0.97, Math.max(0.03, ball[1] + vel[1]))];
    steps++;
    if (steps % 2 === 0) trail.push({ p: [...ball] as V2, t: now });
    if ((Math.hypot(vel[0], vel[1]) < 0.0006 && steps > 12) || steps > 90 || now - rollStart > 1500) settle();
  }

  function nearestBasin(p: V2) {
    let best = 0, bd = Infinity;
    basins.forEach((b, i) => { const d = Math.hypot(p[0] - b.at[0], p[1] - b.at[1]) / b.width; if (d < bd) { bd = d; best = i; } });
    return best;
  }

  function settle() {
    mode = 'done';
    const i = nearestBasin(ball);
    setActive(i, true);
    caption.innerHTML = settled.replace("{x}", basins[i]!.label);
    setTimeout(() => { location.href = basins[i]!.href; }, reduce ? 150 : 420);
  }

  function release() {
    hint?.classList.add('is-gone');
    wellTarget = 0; // the cursor well would trap the ball
    if (reduce) {
      // descend without animation
      for (steps = 0; steps < 200; steps++) {
        const g = grad(ball[0], ball[1]);
        ball = [Math.min(0.97, Math.max(0.03, ball[0] - 0.0016 * g[0] * 1.6)), Math.min(0.97, Math.max(0.03, ball[1] - 0.0016 * g[1] * 1.6))];
      }
      draw(performance.now());
      settle();
      return;
    }
    mode = 'roll'; steps = 0; vel = [0, 0]; rollStart = performance.now(); trail = [];
    wake();
  }

  function setActive(i: number, force = false) {
    if (i === active && !force) return;
    active = i;
    labels.forEach((l, k) => l.classList.toggle('is-active', k === i));
    if (mode !== 'done') {
      caption.innerHTML = i < 0 ? defaultCaption : `<em>${basins[i]!.label}</em>: ${basins[i]!.caption}`;
    }
    fieldDirty = true;
    if (!running) draw(performance.now());
  }

  // ── input ──────────────────────────────────────
  const local = (e: PointerEvent): V2 => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const startDrag = (e: PointerEvent) => {
    if (mode === 'roll' || mode === 'done') return;
    e.preventDefault();
    mode = 'drag'; hint?.classList.add('is-gone');
    wellTarget = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
    ball = local(e); wake();
  };
  const moveDrag = (e: PointerEvent) => {
    if (mode === 'drag') { ball = local(e).map((x) => Math.min(0.97, Math.max(0.03, x))) as V2; setActive(nearestBasin(ball)); wake(); return; }
    if (e.pointerType === 'touch' || mode !== 'rest') return;
    // gravity: the cursor digs a small well
    pointerIn = true;
    wellGoal = local(e);
    if (wellAmp < 0.01) well = [...wellGoal] as V2;
    wellTarget = reduce ? 0 : WELL_DEPTH;
    let best = -1, bc = 0;
    basins.forEach((b, i) => {
      const x = wellGoal[0] - b.at[0], y = wellGoal[1] - b.at[1];
      const c = b.depth * Math.exp(-(x * x + y * y) / (2 * b.width * b.width));
      if (c > bc && c > 0.25) { bc = c; best = i; }
    });
    setActive(best);
    wake();
  };
  const endDrag = (e: PointerEvent) => {
    if (mode !== 'drag') return;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* already released */ }
    release();
  };

  // mouse: grab anywhere on the plate; touch/pen: grab the ball itself (the plate keeps scrolling the page)
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') startDrag(e); });
  ballEl.addEventListener('pointerdown', startDrag);
  for (const el of [canvas, ballEl] as HTMLElement[]) {
    el.addEventListener('pointermove', moveDrag);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }
  canvas.addEventListener('pointerleave', () => {
    if (mode === 'drag') return;
    pointerIn = false; wellTarget = 0;
    if (mode === 'rest') setActive(-1);
    wake();
  });
  // keyboard: Enter/Space on the ball lets it roll from where it is
  ballEl.addEventListener('click', (e) => { if (e.detail === 0 && mode === 'rest') release(); });
  labels.forEach((l, i) => {
    l.addEventListener('focus', () => { if (mode === 'rest') setActive(i); });
    l.addEventListener('blur', () => { if (mode === 'rest' && !pointerIn) setActive(-1); });
    l.addEventListener('pointerenter', () => { if (mode === 'rest') setActive(i); });
  });

  // ── layout ─────────────────────────────────────
  function placeLabels() {
    const pad = 6;
    labels.forEach((l, i) => {
      const b = basins[i]!;
      const w = l.offsetWidth;
      const cx = b.at[0] * S, y = (b.at[1] + b.width * (b.labelDy ?? 1.35)) * S;
      const left = Math.min(S - w - pad, Math.max(pad, cx - w / 2));
      l.style.left = `${left}px`; l.style.top = `${Math.max(4, Math.min(S - 30, y))}px`; l.style.transform = 'none';
    });
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    S = Math.max(1, Math.round(r.width));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = S * dpr; canvas.height = S * dpr;
    fieldDirty = true;
    placeLabels();
    draw(performance.now());
  }

  new IntersectionObserver(([en]) => { visible = !!en?.isIntersecting; if (!visible) { cancelAnimationFrame(raf); running = false; } else wake(); }).observe(root);
  new ResizeObserver(resize).observe(canvas);
  const recolor = () => { readColors(); draw(performance.now()); };
  window.addEventListener('atlas:theme', recolor);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);

  readColors();
  computeLevels();
  root.classList.add('is-live');
  resize();
}
