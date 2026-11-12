---
order: 1
title: Plume
kind: Application de prise de notes manuscrites (PWA)
period: '2026'
stack: [TypeScript, PDF.js, IndexedDB, OneDrive API]
summary: >-
  Un carnet manuscrit pour tablette et stylet. Chaque carnet est un PDF dans OneDrive qui reste modifiable
  trait par trait : un stylo sensible à la pression, un crayon au grain de graphite, un surligneur, une sélection
  au lasso et la reconnaissance de formes (gardez le stylet immobile et un cercle tremblé devient un cercle).
  Elle fonctionne hors ligne et garde les deux versions quand un carnet a été modifié à deux endroits.
links:
  - { label: Dépôt, href: 'https://github.com/julber95/plume-notes' }
---

Les données modifiables voyagent dans le PDF lui-même, dans des dictionnaires `PieceInfo`, le mécanisme que le
format PDF prévoit pour les données privées d’une application. Un carnet est un seul fichier, qu’on peut déplacer
ou renommer librement.
