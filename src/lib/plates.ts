import { getCollection, type CollectionEntry } from 'astro:content';

export type Plate = CollectionEntry<'plates'>;

/** URL slug: the file id without its numeric prefix ("03-gan-drs" → "gan-drs"). */
export const slugOf = (p: Plate | string) => (typeof p === 'string' ? p : p.id).replace(/^\d+-/, '');
export const hrefOf = (p: Plate | string) => `/projects/${slugOf(p)}/`;

/** All public plates, chronological (I → VII). */
export async function getPlates() {
  const all = await getCollection('plates', (p) => !p.data.draft && !p.data.hidden);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getAllPlatesInclHidden() {
  const all = await getCollection('plates', (p) => !p.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export const domainLabel: Record<Plate['data']['domain'], string> = {
  Generative: 'Generative',
  NLP: 'NLP',
  Medical: 'Medical',
  Tabular: 'Tabular',
  Meta: 'Meta',
};
