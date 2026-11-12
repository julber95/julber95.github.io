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
  redirects: {
    '/path/': '/background/',
    '/now/': '/background/',
    '/work/': '/projects/',
    '/work/fraud-detection/': '/projects/fraud-detection/',
    '/work/house-prices/': '/projects/house-prices/',
    '/work/gan-drs/': '/projects/gan-drs/',
    '/work/decoding-strategies/': '/projects/decoding-strategies/',
    '/work/lymph-node-metastases/': '/projects/lymph-node-metastases/',
    '/work/aortic-aneurysm-hisa/': '/projects/aortic-aneurysm-hisa/',
    '/work/interpretable-text-classification/': '/projects/interpretable-text-classification/',
  },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/plate-0') && !page.includes('/og/') && (hasPublishedNotes || !page.includes('/notes/')) })],
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
});
