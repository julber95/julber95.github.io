import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Plate = CollectionEntry<'plates'>;

/** French entries live in a fr/ subfolder of each collection. */
export const isFr = (e: { id: string }) => e.id.startsWith('fr/');
export const inLang = (lang: Lang) => (e: { id: string }) => isFr(e) === (lang === 'fr');

/** URL slug: the file id without its language folder and numeric prefix ("fr/03-gan-drs" → "gan-drs"). */
export const slugOf = (p: Plate | string) => (typeof p === 'string' ? p : p.id).replace(/^fr\//, '').replace(/^\d+-/, '');
export const hrefOf = (p: Plate) => `${isFr(p) ? '/fr' : ''}/projects/${slugOf(p)}/`;

/** All public plates in one language, chronological (I → VII). */
export async function getPlates(lang: Lang = 'en') {
  const all = await getCollection('plates', (p) => !p.data.draft && !p.data.hidden && inLang(lang)(p));
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getAllPlatesInclHidden(lang: Lang = 'en') {
  const all = await getCollection('plates', (p) => !p.data.draft && inLang(lang)(p));
  return all.sort((a, b) => a.data.order - b.data.order);
}
