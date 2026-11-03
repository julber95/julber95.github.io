// Lazy engravings: <div data-eng-src="/engravings/x.svg"> gets the SVG injected inline when it nears the
// viewport. Inline (not <img>) so the engraving follows the theme and uses the site's fonts.
const cache = new Map<string, Promise<string>>();
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => (r.ok ? r.text() : Promise.reject(r.status))));
  return cache.get(src)!;
};
const inject = async (el: HTMLElement) => {
  const src = el.dataset.engSrc!;
  delete el.dataset.engSrc;
  try {
    const text = await load(src);
    el.innerHTML = text.replace(/ style="color:#1A1814"/, '');
    el.classList.add('is-loaded');
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
