import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPlates, slugOf } from '../../lib/plates';
import { rng } from '../../lib/engrave';

const font = (f: string) => readFileSync(new URL(`../../../node_modules/@fontsource/${f}`, import.meta.url));
const fonts = [
  { name: 'Fraunces', data: font('fraunces/files/fraunces-latin-300-normal.woff'), weight: 300 as const, style: 'normal' as const },
  { name: 'Fraunces', data: font('fraunces/files/fraunces-latin-300-italic.woff'), weight: 300 as const, style: 'italic' as const },
  { name: 'Plex', data: font('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];

const C = { bg: '#F3EEE3', ink: '#1A1814', soft: '#5B554B', rule: '#CFC6B4', accent: '#B8432F' };

export async function getStaticPaths() {
  const plates = await getPlates();
  return [
    { params: { slug: 'index' }, props: { kicker: 'An Atlas of Learned Things', title: 'Julien Bernardi keeps an atlas of the models he has taken apart.', taxon: 'Vol. I · Plates I–VII', seed: 1 } },
    ...plates.map((p) => ({
      params: { slug: slugOf(p) },
      props: { kicker: `Plate ${p.data.numeral} · ${p.data.domain} · ${p.data.observed}`, title: p.data.title, taxon: p.data.taxon, seed: p.data.order * 101 },
    })),
  ];
}

/** A small stipple cluster, as an SVG data URI (satori renders <img> SVGs). */
function stippleSvg(seed: number) {
  const R = rng(seed);
  let d = '', a = '';
  for (let i = 0; i < 520; i++) {
    const x = 160 + R.gauss() * 52, y = 160 + R.gauss() * 52;
    const hot = i < 26;
    const s = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
    hot ? (a += s) : (d += s);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><path d="${d}" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".8"/><path d="${a}" stroke="${C.accent}" stroke-width="3" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}) =>
  ({ type, props: { style, children, ...extra } });

export const GET: APIRoute = async ({ props }) => {
  const { kicker, title, taxon, seed } = props as { kicker: string; title: string; taxon: string; seed: number };
  const tree = h('div', { width: 1200, height: 630, display: 'flex', position: 'relative', background: C.bg }, [
    h('div', { position: 'absolute', left: 28, top: 28, width: 1144, height: 574, border: `2px solid ${C.ink}` }),
    h('div', { position: 'absolute', left: 40, top: 40, width: 1120, height: 550, border: `1px solid ${C.rule}` }),
    h('div', { position: 'absolute', left: 96, top: 84, width: 1008, height: 462, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, [
      h('div', { display: 'flex', justifyContent: 'space-between', fontFamily: 'Plex', fontSize: 20, letterSpacing: 3, color: C.soft, textTransform: 'uppercase' }, [
        h('span', {}, kicker),
        h('span', {}, 'julber95.github.io'),
      ]),
      h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', flexDirection: 'column', width: 720 }, [
          h('div', { fontFamily: 'Fraunces', fontWeight: 300, fontSize: title.length > 60 ? 60 : 72, lineHeight: 1.02, color: C.ink, letterSpacing: -1.5 }, title),
          h('div', { fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 300, fontSize: 34, color: C.accent, marginTop: 20 }, taxon),
        ]),
        h('img', { width: 240, height: 240 }, undefined, { src: stippleSvg(seed), width: 240, height: 240 }),
      ]),
      h('div', { display: 'flex', fontFamily: 'Plex', fontSize: 20, color: C.ink, letterSpacing: 2 }, 'Julien Bernardi · AI/ML · Université PSL'),
    ]),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
