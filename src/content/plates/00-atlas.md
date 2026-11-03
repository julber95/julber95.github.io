---
numeral: '0'
order: 0
title: The atlas itself
short: This atlas
taxon: Atlas ipsum
family: Static documents
habitat: julber95.github.io
observed: 2026
period: '2026'
domain: Meta
team: solo
stack: [Astro, TypeScript, Canvas 2D, SVG, CSS]
abstract: >-
  The plate that was not listed. A catalogue of models needs a specimen of the catalogue itself:
  a few thousand points that settle into clusters, seven engravings drawn in code, and a binder
  that counts to seven and stops.
featured: false
engraving: atlas
figCaption: The atlas as an object, open on its own frontispiece, which shows the same atlas open again.
figAlt: Engraving of an open book on a table; its left page shows a field of stippled dots gathered into seven clusters and its right page shows a smaller copy of the same open book.
links:
  - { label: Source, href: 'https://github.com/julber95/julber95.github.io' }
hidden: true
results: []
---

## Problem

A personal site for machine learning tends to become a résumé with a gradient. I wanted a single
metaphor, held everywhere: a nineteenth-century natural-history atlas whose specimens are models.

## Method

- **The specimen field** on the index is a few thousand ink points. They start as Gaussian noise and settle into clusters over a schedule that mimics denoising. The cursor disturbs them; each cluster is a plate.
- **Engravings** are inline SVG, hatched and stippled with a seeded random generator at build time, so every page load draws the same plate.
- **Typography** is Fraunces at large optical sizes, Hanken Grotesk for reading, IBM Plex Mono for the apparatus: plate numbers, coordinates, dates.
- **No framework at runtime**: static Astro pages, a little TypeScript, and the browser's own view transitions.

## Results

You are reading it. Press <kbd>?</kbd> anywhere for the errata.
