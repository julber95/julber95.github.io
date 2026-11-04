// Lazy engravings: <div data-eng-src="/engravings/x.svg"> gets the SVG injected inline when it nears the
// viewport. Inline (not <img>) so the engraving follows the theme and uses the site's fonts.
// Denoise on scroll: each engraving first appears "noisy" (a mask of random holes), and the holes close
// as it scrolls into view, once. Skipped under reduced motion.
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cache = new Map<string, Promise<string>>();
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => (r.ok ? r.text() : Promise.reject(r.status))));
  return cache.get(src)!;
};

let uid = 0;
function addNoise(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  const w = vb.width || 600, h = vb.height || 450;
  const id = `dn-${++uid}`;
  const mask = document.createElementNS(NS, 'mask');
  mask.id = id;
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
  mask.setAttribute('width', String(w)); mask.setAttribute('height', String(h));
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', String(w)); bg.setAttribute('height', String(h)); bg.setAttribute('fill', 'white');
  mask.appendChild(bg);
  // seeded holes: dense enough that the drawing reads as noise before it resolves
  let s = 1013 + uid * 97;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const holes: SVGCircleElement[] = [];
  // fewer, larger holes on thumbnails: same look, a fraction of the cost
  const small = svg.getBoundingClientRect().width < 260;
  const count = small ? 70 : 320;
  for (let i = 0; i < count; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (rnd() * w).toFixed(1));
    c.setAttribute('cy', (rnd() * h).toFixed(1));
    const r = small ? 14 + rnd() * 30 : 4 + rnd() * 16;
    c.setAttribute('r', r.toFixed(1));
    c.style.setProperty('r', `${r.toFixed(1)}px`);
    c.setAttribute('fill', 'black');
    c.style.transition = `r 700ms cubic-bezier(.2,.7,.1,1) ${(rnd() * 650).toFixed(0)}ms`;
    mask.appendChild(c);
    holes.push(c);
  }
  const defs = svg.querySelector('defs') ?? svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
  defs.appendChild(mask);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('mask', `url(#${id})`);
  for (const child of [...svg.childNodes]) {
    if (child === defs || (child instanceof Element && /^(title|desc|style)$/.test(child.tagName))) continue;
    g.appendChild(child);
  }
  svg.appendChild(g);
  return () => {
    holes.forEach((c) => c.style.setProperty('r', '0px'));
    // once resolved, drop the mask entirely (keeps later repaints cheap)
    setTimeout(() => {
      g.removeAttribute('mask');
      mask.remove();
    }, 1500);
  };
}

const denoiseIO = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        denoiseIO!.unobserve(e.target);
        (e.target as HTMLElement & { _resolve?: () => void })._resolve?.();
      }
    }, { threshold: 0.3 })
  : null;

const inject = async (el: HTMLElement) => {
  const src = el.dataset.engSrc!;
  delete el.dataset.engSrc;
  try {
    const text = await load(src);
    el.innerHTML = text.replace(/ style="color:#0E2A47"/, '');
    el.classList.add('is-loaded');
    const svg = el.querySelector('svg');
    if (svg && !reduce && denoiseIO) {
      (el as HTMLElement & { _resolve?: () => void })._resolve = addNoise(svg as SVGSVGElement);
      denoiseIO.observe(el);
    }
  } catch { /* keep the empty frame */ }
};

const els = [...document.querySelectorAll<HTMLElement>('[data-eng-src]')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); inject(e.target as HTMLElement); }
  }, { rootMargin: '900px 0px' });
  els.forEach((el) => io.observe(el));
} else els.forEach(inject);
export {};
