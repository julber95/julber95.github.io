import { getCollection } from 'astro:content';
/** Published notes, newest first. Drafts are visible in dev only. */
export async function getNotes() {
  const all = await getCollection('notes', (n) => import.meta.env.DEV || !n.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** True once at least one note is published (draft: false). */
export async function hasPublishedNotes() {
  return (await getCollection('notes', (n) => !n.data.draft)).length > 0;
}
