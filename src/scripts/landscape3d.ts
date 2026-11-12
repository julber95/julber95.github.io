/* Loss landscape, in 3D: the homepage figure.
   Same field as the 2D version (landscape.ts): ℒ(u,v) = gentle bowl + ripples − Σ basins − cursor well,
   drawn as glowing iso-lines on a WebGL2 height field seen from above at an angle.
   Drag the ball and let go: it descends the gradient (momentum + decaying noise, like SGD), settles in a basin
   and opens that section. The cursor digs a small well that bends the surface. Nothing is drawn while idle.
   Falls back to the 2D figure when WebGL2 is unavailable. */
import type { Basin } from '../data/landscape';
import { mountLandscape as mount2d } from './landscape';

type V2 = [number, number];
type V3 = [number, number, number];
interface Data { basins: Basin[]; ball: V2 }

const LEVELS = 17;
const WELL_DEPTH = 0.55, WELL_WIDTH = 0.07;
const SPAN = 10;      // world width of the unit square
const LIFT = 3.0;     // world height per unit of loss
const GRID = 150;     // mesh resolution

export function mountLandscape(root: HTMLElement) {
  const canvas = root.querySelector('canvas')!;
  const ctx = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!ctx) { mount2d(root); return; }
  const gl: WebGL2RenderingContext = ctx;
  root.classList.add('is-3d');

  const plate = canvas.parentElement!;
  const over = document.createElement('canvas'); // ball + trail, drawn in 2D on top
  over.className = 'lf__over'; over.setAttribute('aria-hidden', 'true');
  plate.insertBefore(over, canvas.nextSibling);
  const octx = over.getContext('2d')!;

  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const defaultCaption = caption.innerHTML;
  const ballEl = root.querySelector<HTMLButtonElement>('[data-ball]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  const labels = [...root.querySelectorAll<HTMLAnchorElement>('[data-basin]')];
  const { basins, ball: ballStart, settled = "Settled in <em>{x}</em>. Opening…" } = JSON.parse(root.dataset.landscape!) as Data & { settled?: string };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── the field (identical to the 2D figure) ─────
  let wellAmp = 0, wellTarget = 0;
  let well: V2 = [0.5, 0.5], wellGoal: V2 = [0.5, 0.5];
  const L = (u: number, v: number, withWell = true) => {
    const du = u - 0.5, dv = v - 0.5;
    let s = 1.15 * (du * du + dv * dv) + 0.045 * Math.sin(u * 9.1 + 0.6) * Math.cos(v * 7.3) + 0.03 * Math.sin((u + v) * 13.7);
    for (const b of basins) {
      const x = u - b.at[0], y = v - b.at[1];
      s -= b.depth * Math.exp(-(x * x + y * y) / (2 * b.width * b.width));
    }
    if (withWell && wellAmp > 0.001) {
      const x = u - well[0], y = v - well[1];
      s -= wellAmp * Math.exp(-(x * x + y * y) / (2 * WELL_WIDTH * WELL_WIDTH));
    }
    return s;
  };
  const grad = (u: number, v: number): V2 => {
    const h = 0.0025;
    return [(L(u + h, v) - L(u - h, v)) / (2 * h), (L(u, v + h) - L(u, v - h)) / (2 * h)];
  };
  // fixed iso-levels from the undisturbed field, so contours bend with the well instead of re-spacing
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= 48; j++) for (let i = 0; i <= 48; i++) { const z = L(i / 48, j / 48, false); lo = Math.min(lo, z); hi = Math.max(hi, z); }
  const world = (u: number, v: number, withWell = true): V3 => [(u - 0.5) * SPAN, L(u, v, withWell) * LIFT, (v - 0.5) * SPAN];

  // ── WebGL ──────────────────────────────────────
  const VS = `#version 300 es
  in vec2 p; uniform mat4 mvp; uniform vec4 B[6]; uniform int nB; uniform vec3 W;
  out vec2 uv; out float L; out vec3 wp;
  float field(vec2 q){
    vec2 d0 = q - .5;
    float s = 1.15*dot(d0,d0) + .045*sin(q.x*9.1+.6)*cos(q.y*7.3) + .03*sin((q.x+q.y)*13.7);
    for (int i=0;i<6;i++){ if (i>=nB) break; vec2 d = q-B[i].xy; s -= B[i].z*exp(-dot(d,d)/(2.*B[i].w*B[i].w)); }
    vec2 m = q-W.xy; s -= W.z*exp(-dot(m,m)/(2.*${WELL_WIDTH}*${WELL_WIDTH}));
    return s; }
  void main(){ uv = p; L = field(p); wp = vec3((p.x-.5)*${SPAN.toFixed(1)}, L*${LIFT.toFixed(2)}, (p.y-.5)*${SPAN.toFixed(1)}); gl_Position = mvp*vec4(wp,1.); }`;
  const FS = `#version 300 es
  precision highp float; in vec2 uv; in float L; in vec3 wp;
  uniform vec3 ink, acc; uniform float lo, hi, hotOn, hotR; uniform vec2 hot; out vec4 o;
  void main(){
    float t = (L - lo)/(hi - lo);
    float v = t*${LEVELS}.0/.92 - .6;
    float f = abs(fract(v - .5) - .5)/fwidth(v);
    float line = 1. - min(f/1.05, 1.);
    float k = clamp(v/${LEVELS}.0, 0., 1.);
    float a = .66 - k*.46;                                   // deeper contours read darker, like the 2D plate
    float h = hotOn*smoothstep(hotR, hotR*.45, distance(uv, hot))*step(v, 6.5);
    vec3 c = mix(ink, acc, h);
    float edge = smoothstep(0., .05, min(min(uv.x, uv.y), min(1.-uv.x, 1.-uv.y)));
    float al = line*edge*mix(a, .95, h);
    o = vec4(c*al, al); }`;
  const sh = (t: number, src: string) => { const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { over.remove(); root.classList.remove('is-3d'); mount2d(root); return; }
  gl.useProgram(pr);
  const verts = new Float32Array((GRID + 1) * (GRID + 1) * 2), idx = new Uint32Array(GRID * GRID * 6);
  for (let j = 0, k = 0; j <= GRID; j++) for (let i = 0; i <= GRID; i++) { verts[k++] = i / GRID; verts[k++] = j / GRID; }
  for (let j = 0, k = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) { const a = j * (GRID + 1) + i, b = a + 1, c = a + GRID + 1, d = c + 1; idx.set([a, c, b, b, c, d], k); k += 6; }
  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  const U = (n: string) => gl.getUniformLocation(pr, n);
  const bArr = new Float32Array(24); basins.slice(0, 6).forEach((b, i) => bArr.set([b.at[0], b.at[1], b.depth, b.width], i * 4));
  gl.uniform4fv(U('B'), bArr); gl.uniform1i(U('nB'), Math.min(6, basins.length));
  gl.uniform1f(U('lo'), lo); gl.uniform1f(U('hi'), hi);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // camera: fixed oblique view that frames the whole square
  const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function mvpFor(eye: V3, tgt: V3, t: number, ox = 0, oy = 0) {
    const z = nrm(sub3(eye, tgt)), x = nrm(cross([0, 1, 0], z)), y = cross(z, x);
    const V = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    const n = .1, f = 60;
    const P = [t, 0, 0, 0, 0, t, 0, 0, ox, oy, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0];
    const o = new Array<number>(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += P[k * 4 + i]! * V[j * 4 + k]!;
    return o;
  }
  const EYE: V3 = [0, 10.2, 7.4], TGT: V3 = [0, -1.0, 0.1];
  let mvp = mvpFor(EYE, TGT, 1 / Math.tan(0.39));
  // frame the surface so it fills the square: measure its projected extent, then rescale and recentre
  function fit() {
    const t0 = 1 / Math.tan(0.39); mvp = mvpFor(EYE, TGT, t0);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let j = 0; j <= 24; j++) for (let i = 0; i <= 24; i++) {
      const u = i / 24, v = j / 24, e = Math.min(u, v, 1 - u, 1 - v); if (e < .03) continue; // the faded rim does not count
      const p = world(u, v, false), m = mvp, w = m[3]! * p[0] + m[7]! * p[1] + m[11]! * p[2] + m[15]!;
      const x = (m[0]! * p[0] + m[4]! * p[1] + m[8]! * p[2] + m[12]!) / w, y = (m[1]! * p[0] + m[5]! * p[1] + m[9]! * p[2] + m[13]!) / w;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const k = 1.9 / Math.max((x1 - x0) * .78, y1 - y0); // overfill the sides a little: a plane in perspective is a trapezoid
    mvp = mvpFor(EYE, TGT, t0 * k, (x0 + x1) / 2 * k, (y0 + y1) / 2 * k - .02);
  }
  let S = 1, dpr = 1;
  const toScreen = (p: V3): V3 => {
    const m = mvp, w = m[3]! * p[0] + m[7]! * p[1] + m[11]! * p[2] + m[15]!;
    return [((m[0]! * p[0] + m[4]! * p[1] + m[8]! * p[2] + m[12]!) / w * .5 + .5) * S, (-(m[1]! * p[0] + m[5]! * p[1] + m[9]! * p[2] + m[13]!) / w * .5 + .5) * S, w];
  };
  // screen → surface: nearest projected point of a grid on the undisturbed field
  const PICK: { uv: V2; s: V3 }[] = [];
  function buildPick() { PICK.length = 0; for (let j = 0; j <= 56; j++) for (let i = 0; i <= 56; i++) { const uv: V2 = [i / 56, j / 56]; PICK.push({ uv, s: toScreen(world(uv[0], uv[1], false)) }); } }
  function pick(x: number, y: number, maxPx = 40): V2 | null {
    let best: V2 | null = null, bd = maxPx * maxPx;
    for (const p of PICK) { const d = (p.s[0] - x) ** 2 + (p.s[1] - y) ** 2; if (d < bd) { bd = d; best = p.uv; } }
    return best;
  }

  // ── state ──────────────────────────────────────
  let ink: V3 = [26 / 255, 24 / 255, 20 / 255], accent: V3 = [184 / 255, 67 / 255, 47 / 255], accentCss = '184 67 47';
  let ball: V2 = [...ballStart] as V2;
  let vel: V2 = [0, 0];
  let trail: { p: V2; t: number }[] = [];
  let mode: 'rest' | 'drag' | 'roll' | 'done' = 'rest';
  let rollStart = 0, steps = 0;
  let active = -1, hotOn = 0;
  let pointerIn = false;
  let raf = 0, running = false, visible = true;
  const tri = (s: string): V3 => { const a = s.trim().split(/\s+/).map(Number); return [a[0]! / 255, a[1]! / 255, a[2]! / 255]; };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    const i = cs.getPropertyValue('--field-ink'), a = cs.getPropertyValue('--field-accent');
    if (i.trim()) ink = tri(i);
    if (a.trim()) { accent = tri(a); accentCss = a.trim(); }
  };

  // ── drawing ────────────────────────────────────
  function draw(now: number) {
    hotOn += ((active >= 0 ? 1 : 0) - hotOn) * (reduce ? 1 : .18);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(U('mvp'), false, mvp);
    gl.uniform3f(U('W'), well[0], well[1], wellAmp);
    gl.uniform3fv(U('ink'), ink); gl.uniform3fv(U('acc'), accent);
    const hb = active >= 0 ? basins[active]! : basins[0]!;
    gl.uniform2f(U('hot'), hb.at[0], hb.at[1]); gl.uniform1f(U('hotR'), hb.width * 1.9); gl.uniform1f(U('hotOn'), hotOn);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
    // ball, trail and a soft contact shadow, projected onto the surface
    octx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.clearRect(0, 0, S, S);
    for (const t of trail) {
      const age = (now - t.t) / 1400; if (age >= 1) continue;
      const q = toScreen(world(t.p[0], t.p[1]));
      octx.fillStyle = `rgb(${accentCss} / ${(0.85 * (1 - age)).toFixed(3)})`;
      octx.beginPath(); octx.arc(q[0], q[1], 1.6, 0, Math.PI * 2); octx.fill();
    }
    trail = trail.filter((t) => now - t.t < 1400);
    const g = world(ball[0], ball[1]), lift = mode === 'drag' ? 0.55 : 0.18;
    const floor = toScreen(g), top = toScreen([g[0], g[1] + lift, g[2]]);
    const r = Math.max(4, (mode === 'drag' ? 9.5 : 7.5) * 10 / top[2]);
    octx.fillStyle = `rgb(${ink.map((c) => Math.round(c * 255)).join(' ')} / .18)`;
    octx.beginPath(); octx.ellipse(floor[0], floor[1], r * 1.1, r * .45, 0, 0, Math.PI * 2); octx.fill();
    octx.fillStyle = `rgb(${accentCss})`;
    octx.beginPath(); octx.arc(top[0], top[1] - r * .6, r, 0, Math.PI * 2); octx.fill();
    ballEl.style.left = `${(top[0] / S * 100).toFixed(2)}%`;
    ballEl.style.top = `${((top[1] - r * .6) / S * 100).toFixed(2)}%`;
  }

  // ── animation ──────────────────────────────────
  function tick(now: number) {
    let busy = false;
    const ga = wellTarget - wellAmp;
    if (Math.abs(ga) > 0.004 || Math.hypot(wellGoal[0] - well[0], wellGoal[1] - well[1]) > 0.001) {
      wellAmp += ga * 0.16;
      well = [well[0] + (wellGoal[0] - well[0]) * 0.18, well[1] + (wellGoal[1] - well[1]) * 0.18];
      busy = true;
    } else if (wellAmp !== wellTarget) wellAmp = wellTarget;
    if (Math.abs((active >= 0 ? 1 : 0) - hotOn) > .01) busy = true;
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
    wellTarget = 0;
    if (reduce) {
      for (steps = 0; steps < 200; steps++) {
        const g = grad(ball[0], ball[1]);
        ball = [Math.min(0.97, Math.max(0.03, ball[0] - 0.0026 * g[0])), Math.min(0.97, Math.max(0.03, ball[1] - 0.0026 * g[1]))];
      }
      draw(performance.now()); settle(); return;
    }
    mode = 'roll'; steps = 0; vel = [0, 0]; rollStart = performance.now(); trail = [];
    wake();
  }
  function setActive(i: number, force = false) {
    if (i === active && !force) return;
    active = i;
    labels.forEach((l, k) => l.classList.toggle('is-active', k === i));
    if (mode !== 'done') caption.innerHTML = i < 0 ? defaultCaption : `<em>${basins[i]!.label}</em>: ${basins[i]!.caption}`;
    wake();
  }

  // ── input ──────────────────────────────────────
  const local = (e: PointerEvent): [number, number] => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * S / r.width, (e.clientY - r.top) * S / r.height]; };
  const startDrag = (e: PointerEvent) => {
    if (mode === 'roll' || mode === 'done') return;
    e.preventDefault();
    mode = 'drag'; hint?.classList.add('is-gone');
    wellTarget = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
    const [x, y] = local(e); const q = pick(x, y, Infinity); if (q) ball = [Math.min(.97, Math.max(.03, q[0])), Math.min(.97, Math.max(.03, q[1]))];
    wake();
  };
  const moveDrag = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (mode === 'drag') { const q = pick(x, y, Infinity); if (q) { ball = [Math.min(.97, Math.max(.03, q[0])), Math.min(.97, Math.max(.03, q[1]))]; setActive(nearestBasin(ball)); } wake(); return; }
    if (e.pointerType === 'touch' || mode !== 'rest') return;
    const q = pick(x, y);
    if (!q) { wellTarget = 0; if (pointerIn) setActive(-1); pointerIn = false; wake(); return; }
    pointerIn = true;
    wellGoal = q;
    if (wellAmp < 0.01) well = [...q] as V2;
    wellTarget = reduce ? 0 : WELL_DEPTH;
    let best = -1, bc = 0;
    basins.forEach((b, i) => {
      const dx = q[0] - b.at[0], dy = q[1] - b.at[1];
      const c = b.depth * Math.exp(-(dx * dx + dy * dy) / (2 * b.width * b.width));
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
      const g = world(b.at[0], b.at[1], false);
      const p = toScreen([g[0], g[1] + 1.15, g[2]]);
      const w = l.offsetWidth;
      l.style.left = `${Math.min(S - w - pad, Math.max(pad, p[0] - w / 2))}px`;
      l.style.top = `${Math.min(S - 30, Math.max(pad, p[1] - 26))}px`;
      l.style.transform = 'none';
    });
    if (hint) { const s = toScreen(world(ballStart[0], ballStart[1], false)); hint.style.left = `${(s[0] / S * 100).toFixed(2)}%`; hint.style.top = `${((s[1] - 12) / S * 100).toFixed(2)}%`; }
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    S = Math.max(1, Math.round(r.width));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = S * dpr; canvas.height = S * dpr;
    over.width = S * dpr; over.height = S * dpr;
    fit();
    buildPick(); placeLabels();
    draw(performance.now());
  }

  new IntersectionObserver(([en]) => { visible = !!en?.isIntersecting; if (!visible) { cancelAnimationFrame(raf); running = false; } else wake(); }).observe(root);
  new ResizeObserver(resize).observe(canvas);
  const recolor = () => { readColors(); draw(performance.now()); };
  window.addEventListener('atlas:theme', recolor);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);

  readColors();
  root.classList.add('is-live');
  resize();
}
