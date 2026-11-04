// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// /notes/ stays reachable but out of the sitemap until a note is published (draft: false)
const notesDir = new URL('./src/content/notes/', import.meta.url);
const hasPublishedNotes = readdirSync(notesDir).some((f) => /\.mdx?$/.test(f) && !/^draft:\s*true\s*$/m.test(readFileSync(new URL(f, notesDir), 'utf8')));


export default defineConfig({
  site: 'https://julber95.github.io',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/plate-0') && !page.includes('/og/') && (hasPublishedNotes || !page.includes('/notes/')) })],
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
});
