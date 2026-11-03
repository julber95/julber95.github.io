// One-time staggered reveals, hairline draw-ins, numeral counters.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll<HTMLElement>('[data-reveal], [data-draw]');

if (reduce || !('IntersectionObserver' in window)) {
  els.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  els.forEach((el) => io.observe(el));
}

// Counters: <span data-count="7">VII</span> roll up through roman numerals once.
const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = (n: number) => { let s = ''; for (const [v, r] of ROMAN) while (n >= v) { s += r; n -= v; } return s || '0'; };
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if (!reduce && 'IntersectionObserver' in window) {
  const io2 = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io2.unobserve(e.target);
      const el = e.target as HTMLElement;
      const target = Number(el.dataset.count);
      const asRoman = el.dataset.roman !== undefined;
      const final = el.textContent;
      let n = 0;
      const step = () => {
        n += 1;
        el.textContent = asRoman ? roman(n) : String(n);
        if (n < target) setTimeout(step, 520 / target);
        else el.textContent = final;
      };
      el.textContent = asRoman ? '0' : '0';
      setTimeout(step, 180);
    }
  });
  counters.forEach((c) => io2.observe(c));
}
export {};
