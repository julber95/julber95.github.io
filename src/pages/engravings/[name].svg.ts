/* Each engraving is also published as a standalone, cacheable SVG file. Pages inject it
   inline on demand (see src/scripts/engravings.ts), which keeps HTML documents small. */
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const modules = import.meta.glob<{ default: any }>('../../components/engravings/*.astro', { eager: true });
const names = Object.keys(modules).map((k) => k.split('/').pop()!.replace('.astro', '')).filter((n) => n !== 'Frame');

export function getStaticPaths() {
  return names.map((name) => ({ params: { name } }));
}

// Fallback styles, scoped to the standalone file (used when it is opened directly or via <noscript><img>).
const css = `.eng-file .k{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
.eng-file .a{fill:none;stroke:var(--accent,#0A5FE0);stroke-linecap:round;stroke-linejoin:round}
.eng-file .fk{fill:currentColor;stroke:none}.eng-file .fa{fill:var(--accent,#0A5FE0);stroke:none}
.eng-file .bg{fill:var(--bg,#F4F7FB);stroke:none}
.eng-file .w04{stroke-width:.4}.eng-file .w05{stroke-width:.5}.eng-file .w08{stroke-width:.8}.eng-file .w10{stroke-width:1}.eng-file .w13{stroke-width:1.3}.eng-file .w18{stroke-width:1.8}
.eng-file .faint{stroke-opacity:.45}.eng-file .mid{stroke-opacity:.7}
.eng-file .lbl{font-family:var(--f-mono,monospace);font-size:8.5px;letter-spacing:.08em;fill:var(--ink-soft,#5B554B);text-transform:uppercase}
.eng-file .lbl-k{font-family:var(--f-mono,monospace);font-size:8.5px;letter-spacing:.06em;fill:currentColor}
.eng-file .lbl-a{font-family:var(--f-mono,monospace);font-size:8.5px;letter-spacing:.06em;fill:var(--accent,#0A5FE0)}
.eng-file .lbl-i{font-family:var(--f-display,serif);font-style:italic;font-size:12px;fill:currentColor}`;

export const GET: APIRoute = async ({ params }) => {
  const name = params.name!;
  const Cmp = Object.entries(modules).find(([k]) => k.endsWith(`/${name}.astro`))![1].default;
  const container = await AstroContainer.create();
  const html = await container.renderToString(Cmp, { props: { uid: `eng-${name}`, title: '', desc: '' } });
  let svg = html.match(/<svg[\s\S]*<\/svg>/)![0];
  svg = svg
    .replace(/ data-astro-cid-[a-z0-9]+(="")?/g, '')
    .replace(/<title[^>]*><\/title>/, '')
    .replace(/<desc[^>]*><\/desc>/, '')
    .replace(/ aria-labelledby="[^"]*"/, '')
    .replace(/ role="img"/, ' aria-hidden="true"')
    .replace(/<svg /, `<svg class="eng-file" style="color:#0E2A47" `)
    .replace(/(<svg[^>]*>)/, `$1<style>${css}</style>`);
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
