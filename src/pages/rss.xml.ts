import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', (n) => !n.data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: `${site.name}: Notes`,
    description: 'Notes from An Atlas of Learned Things, on machine learning, sampling, decoding and explainability.',
    site: context.site ?? site.url,
    items: notes.map((n) => ({ title: n.data.title, pubDate: n.data.date, description: n.data.summary, link: `/notes/${n.id}/` })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en</language><atom:link href="${new URL('rss.xml', context.site ?? site.url).href}" rel="self" type="application/rss+xml"/>`,
  });
}
