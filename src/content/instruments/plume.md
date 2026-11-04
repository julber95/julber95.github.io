---
order: 1
title: Plume
kind: Handwritten note-taking app (PWA)
period: '2026'
stack: [TypeScript, PDF.js, IndexedDB, OneDrive API]
summary: >-
  A handwriting notebook for a tablet and a stylus. Each notebook is a PDF in OneDrive that stays editable
  stroke by stroke: a pressure-sensitive pen, a pencil with graphite grain, a highlighter, lasso selection and
  shape recognition (hold the pen still and a wobbly circle becomes a circle). It works offline and keeps
  both versions when a notebook was edited in two places.
links:
  - { label: Open Plume, href: 'https://julber95.github.io/plume-notes/' }
  - { label: Repository, href: 'https://github.com/julber95/plume-notes' }
---

The editable data travels inside the PDF itself, in `PieceInfo` dictionaries, the mechanism the PDF format
provides for an application's private data. One notebook is one file, which can be moved or renamed freely.
