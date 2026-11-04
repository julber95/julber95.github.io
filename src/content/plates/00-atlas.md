---
order: 0
title: The atlas itself
label: This atlas
summary: 'The page that wasn’t listed: the site itself, taken apart.'
observed: 2026
period: '2026'
domain: Meta
team: solo
stack: [Astro, TypeScript, Canvas 2D, SVG, CSS]
abstract: >-
  A site about models taken apart should take itself apart too: a loss landscape whose basins are the
  site's sections, engravings drawn in code, and a list of projects that keeps one more.
engraving: atlas
figCaption: The atlas as an object, open on its own frontispiece, which shows the same atlas open again.
figAlt: Engraving of an open book; its left page shows stippled clusters and its right page a smaller copy of the same open book.
links:
  - { label: Source, href: 'https://github.com/julber95/julber95.github.io' }
hidden: true
results: []
---

## Problem

A personal site for machine learning tends to become a résumé with a gradient. I wanted one metaphor, held
quietly: an atlas of models taken apart.

## Method

- **The figure** on the index is a loss landscape: drag the ball and it descends the gradient into a section; the cursor digs a small well.
- **Engravings** are inline SVG, hatched and stippled with a seeded random generator at build time.
- **Typography** is Space Grotesk, IBM Plex Sans and IBM Plex Mono. **No framework at runtime**: static Astro pages and a little TypeScript.

## Results

You are reading it. Press <kbd>?</kbd> anywhere for the errata.
