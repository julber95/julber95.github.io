---
title: Rejection is a generator too
date: 2026-11-03
summary: Notes on discriminator rejection sampling, and why a weaker critic can make a better filter.
tags: [GANs, sampling]
plate: 03-gan-drs
draft: true
---

<span class="todo">TODO: this note is a placeholder. Write it, then set `draft: false` in the front matter to publish it (it will appear on /notes and in the RSS feed).</span>

Possible outline:

- What DRS does: the discriminator as a density-ratio estimator, used *after* training.
- Why a three-layer discriminator beat a four-layer one as a filter.
- Global vs per-batch normalisation: the M that decides who survives.
- Truncation as a blunt instrument; adaptive truncation as a scalpel.
- What Metropolis–Hastings would change.
