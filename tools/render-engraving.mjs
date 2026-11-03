// Render one engraving from the running dev server to PNG (no browser needed).
// Usage: node tools/render-engraving.mjs <name> [dark]   → .playwright-mcp/eng-<name>[-dark].png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';

const [name, theme] = process.argv.slice(2);
if (!name) { console.error('usage: node tools/render-engraving.mjs <name> [dark]'); process.exit(1); }
const dark = theme === 'dark';
const c = dark
  ? { bg: '#0E1116', ink: '#E9E3D6', soft: '#9A9384', accent: '#D2573F' }
  : { bg: '#F3EEE3', ink: '#1A1814', soft: '#5B554B', accent: '#B8432F' };

const res = await fetch(`http://127.0.0.1:4321/engravings/${name}.svg`);
if (!res.ok) { console.error(`No engraving at /engravings/${name}.svg (is \`npm run dev\` running?)`); process.exit(1); }
const m = [null, (await res.text()).replace(/<style>[\s\S]*?<\/style>/, '')];
let svg = m[1];
const css = `
.k{fill:none;stroke:${c.ink};stroke-linecap:round;stroke-linejoin:round}
.a{fill:none;stroke:${c.accent};stroke-linecap:round;stroke-linejoin:round}
.fk{fill:${c.ink};stroke:none}.fa{fill:${c.accent};stroke:none}.bg{fill:${c.bg};stroke:none}
.w04{stroke-width:.4}.w05{stroke-width:.5}.w08{stroke-width:.8}.w10{stroke-width:1}.w13{stroke-width:1.3}.w18{stroke-width:1.8}
.faint{stroke-opacity:.45}.mid{stroke-opacity:.7}
.lbl{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:${c.soft};text-transform:uppercase}
.lbl-k{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:${c.ink}}
.lbl-a{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:${c.accent}}
.lbl-i{font-family:Fraunces,serif;font-style:italic;font-size:12px;fill:${c.ink}}`;
svg = svg.replace(/currentColor/g, c.ink).replace(/var\(--accent\)/g, c.accent).replace(/var\(--bg\)/g, c.bg);
svg = svg.replace(/<svg([^>]*)>/, `<svg$1><style>${css}</style><rect width="600" height="450" fill="${c.bg}"/>`);
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } }).render().asPng();
mkdirSync('.playwright-mcp', { recursive: true });
const out = `.playwright-mcp/eng-${name}${dark ? '-dark' : ''}.png`;
writeFileSync(out, png);
console.log(`${out}  (svg markup ${(m[1].length / 1024).toFixed(1)} KB)`);
