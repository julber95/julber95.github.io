// Keyboard directions + errata sheet + plate-0 door.
const routes: Record<string, string> = { i: '/', p: '/projects/', b: '/background/', a: '/about/', n: '/notes/', c: '/contact/' };

const dialog = document.querySelector<HTMLDialogElement>('[data-errata]');
const openErrata = () => { if (dialog && !dialog.open) dialog.showModal(); };
document.querySelectorAll('[data-errata-open]').forEach((b) => b.addEventListener('click', openErrata));
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// single-key shortcuts can be switched off (WCAG 2.1.4); remembered per browser
let keysOn = true;
try { keysOn = localStorage.getItem('atlas-keys') !== 'off'; } catch {}
const keysToggle = document.querySelector<HTMLInputElement>('[data-keys-toggle]');
if (keysToggle) {
  keysToggle.checked = keysOn;
  keysToggle.addEventListener('change', () => {
    keysOn = keysToggle.checked;
    try { localStorage.setItem('atlas-keys', keysOn ? 'on' : 'off'); } catch {}
  });
}

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

let pendingG = 0;
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
  if (e.key === '?') { e.preventDefault(); openErrata(); return; }
  if (dialog?.open || !keysOn) return;
  if (e.key === 't') { dispatchEvent(new CustomEvent('atlas:toggle-theme')); return; }
  if (e.key === '[' || e.key === ']') {
    const a = document.querySelector<HTMLAnchorElement>(e.key === '[' ? '[data-prev]' : '[data-next]');
    if (a) location.href = a.href;
    return;
  }
  if (e.key === 'g') { pendingG = Date.now(); return; }
  if (pendingG && Date.now() - pendingG < 900 && routes[e.key]) {
    pendingG = 0;
    // French pages stay in French (notes only exist in English)
    const fr = document.documentElement.lang === 'fr' && e.key !== 'n';
    location.href = (fr ? '/fr' : '') + routes[e.key]!;
  }
});
export {};
