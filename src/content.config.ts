import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

const plates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/plates' }),
  schema: z.object({
    numeral: z.string(),                          // 'I' … 'VII', '0'
    order: z.number().int(),                      // chronological position
    title: z.string(),
    short: z.string(),                            // short name for captions/hero
    taxon: z.string(),                            // Latin-ish binomial
    family: z.string(),
    habitat: z.string(),
    observed: z.number().int(),
    period: z.string(),
    domain: z.enum(['Generative', 'NLP', 'Medical', 'Tabular', 'Meta']),
    team: z.enum(['solo', 'team of four']).optional(),
    stack: z.array(z.string()),
    abstract: z.string(),
    featured: z.boolean().default(false),
    engraving: z.enum(['forest', 'house', 'digits', 'beamtree', 'lymph', 'aorta', 'roots', 'atlas']),
    figCaption: z.string(),
    figAlt: z.string(),
    links: z.array(link).default([]),
    results: z
      .array(z.object({ label: z.string(), value: z.string(), note: z.string().optional(), best: z.boolean().optional() }))
      .default([]),
    resultsCaption: z.string().optional(),
    hidden: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const instruments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/instruments' }),
  schema: z.object({
    letter: z.string(),
    title: z.string(),
    kind: z.string(),
    period: z.string().optional(),
    stack: z.array(z.string()),
    summary: z.string(),
    links: z.array(link).default([]),
  }),
});

const log = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
  schema: z.object({
    kind: z.enum(['education', 'experience']),
    title: z.string(),
    org: z.string(),
    place: z.string(),
    coords: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date(),
    when: z.string(),                             // human-readable span
    courses: z.array(z.string()).default([]),
    plates: z.array(reference('plates')).default([]),
    summary: z.string().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    plate: reference('plates').optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: 'now.md', base: './src/content' }),
  schema: z.object({ updated: z.coerce.date(), place: z.string().optional() }),
});

const pages = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({ title: z.string(), lede: z.string() }),
});

export const collections = { plates, instruments, log, notes, now, pages };
