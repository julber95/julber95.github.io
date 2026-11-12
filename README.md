# Julien Bernardi: an atlas of models taken apart

Personal site of Julien Bernardi, AI/ML student. Cobalt theme (light and dark), project engravings drawn in code, and a 3D loss landscape on the index: drop the ball and it rolls into a section.
Static [Astro](https://astro.build) site, deployed to GitHub Pages at <https://julber95.github.io>.

## Run it locally

Requires Node 22.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # type-checks, then builds to dist/
npm run preview   # serves dist/
```

## Where things live

| What | Where |
|---|---|
| Projects | `src/content/plates/NN-slug.md` |
| Appendices (tools you built) | `src/content/instruments/*.md` |
| Background (education and experience) | `src/content/log/*.md` |
| Notes (writing, RSS) | `src/content/notes/*.md` |
| About essay | `src/content/about.md` |
| Index of Instruments (skills) | `src/data/skills.ts` |
| Name, links, status line | `src/data/site.ts` |
| Homepage loss landscape (one basin per section) | `src/data/landscape.ts` (drawn by `src/scripts/landscape3d.ts`, 2D fallback `src/scripts/landscape.ts`) |
| Engravings | `src/components/engravings/*.astro` (style guide: `docs/ENGRAVING-STYLE.md`) |
| Colours, type scale, spacing | `src/styles/tokens.css` |
| CV | `public/cv-en.pdf` and `public/cv-fr.pdf` (replace with the same names) |

Every front-matter field is validated by the schemas in `src/content.config.ts`. If you make a typo, the build stops and
names the file and the field.

## Add a project

1. Create `src/content/plates/08-my-project.md`. The number orders the projects; the rest of the name becomes the URL (`/projects/my-project/`).
2. Copy the front matter of an existing project and fill it in:
   `order` (8), `title`, `label` (short name), `summary` (one line, 155 characters at most), `observed` (year), `period`,
   `domain` (`Generative`, `NLP`, `Medical` or `Tabular`), `team` (`solo` or `team of four`), `stack`, `abstract`,
   `engraving`, `figCaption`, `figAlt`, `links`, `results`.
   Mark the best row of `results` with `best: true`. Only put real, measured numbers there.
   The most recent project (highest `order`) is shown as "Latest project" on the index, with its `summary` and its `best` result.
3. Write the body in Markdown with `## Problem`, `## Method` and `## Results`. A margin note is
   `<aside class="note">…</aside>` placed right after the paragraph it belongs to.
4. **Engraving.** Draw `src/components/engravings/<name>.astro` following `docs/ENGRAVING-STYLE.md`, add `<name>`
   to the `engraving` enum in `src/content.config.ts`, and set `engraving: <name>` on the plate.
   Until it exists, the plate shows an empty frame.


## Add a note

Create `src/content/notes/my-note.md`:

```md
---
title: My note
date: 2026-12-01
summary: One sentence for the list and the RSS feed.
tags: [GANs]
plate: 03-gan-drs   # optional: links the note to a plate
draft: false        # drafts show in `npm run dev` only
---

Text…
```

It appears on `/notes` and in `/rss.xml`.

## Deploy

The site deploys from the repository **`julber95/julber95.github.io`** (a GitHub user site).

1. Create that repository on GitHub, empty.
2. In this folder:
   ```sh
   git init -b main
   git add .
   git commit -m "First edition of the atlas"
   git remote add origin git@github.com:julber95/julber95.github.io.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Every push to `main` now runs `.github/workflows/deploy.yml` (build, then deploy). The first run takes about a minute.

Your other project pages (`/interpretable-text-classification/`, `/plume-notes/`) live in their own
repositories and keep working under the same domain.

## Small print

- Keyboard: press `?` on any page for the errata sheet and its shortcuts.
- Themes: light and dark (the toggle is labelled “darkroom”). The toggle is remembered; the default follows the OS.
- Everything respects `prefers-reduced-motion`. The landscape then drops the ball straight into its basin, without animation.
- There is an unlisted page (`/plate-0/`).
