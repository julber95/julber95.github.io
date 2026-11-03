// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://julber95.github.io',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/plate-0') && !page.includes('/og/') })],
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
});
