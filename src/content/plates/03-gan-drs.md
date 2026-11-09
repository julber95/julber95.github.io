---
order: 3
title: Discriminator rejection sampling for GANs
label: Rejection sampling for GANs
summary: Four variants of discriminator rejection sampling on MNIST, from a naive rule to adaptive truncation, and the quality–diversity trade-off each makes.
observed: 2024
period: Nov–Dec 2024
domain: Generative
team: solo
stack: [Python, PyTorch, torchvision, NumPy, scikit-learn]
abstract: >-
  A trained GAN's discriminator still knows things the generator never learned. Discriminator
  rejection sampling uses it as a filter at sampling time. I implemented four successive variants on
  MNIST, from a naive acceptance rule to an adaptive soft truncation of the latent code, and traced how
  each one trades sample quality against diversity.
engraving: rejection
figCaption: "Rejection sampling with real-looking MNIST samples. Each generated digit sits at a random height under the generator's envelope M·q(x): below the data density p(x) it is kept, above it is rejected, so the kept digits follow the two humps of the data. In DRS the ratio p/q comes from the discriminator. Densities are illustrative."
figAlt: "Engraving of two curves over one axis: a dashed wide hump for the generator and a blue two-humped curve for the data. Stippled handwritten digits are scattered under the dashed curve; those below the blue curve are inked in blue, those above it are faint and struck through."
links:
  - { label: Repository, href: 'https://github.com/julber95/gan-drs-enhancement-DL' }
resultsCaption: Precision and recall of the generated distribution for each sampling variant (project report).
results:
  - { label: Basic DRS (global M), value: 'P 0.48–0.50 · R 0.21' }
  - { label: Ratio-based DRS (per-batch M), value: 'P 0.51–0.52 · R 0.22' }
  - { label: DRS + soft truncation, value: 'P 0.55 · R 0.16' }
  - { label: DRS + adaptive soft truncation, value: 'P 0.53 · R 0.24', note: 'best balance', best: true }
---

## Problem

GANs still produce artefacts and miss modes. *Discriminator Rejection Sampling* (Azadi et al., 2019) keeps each
generated sample with a probability that depends on the discriminator's score D(x). The question is how to set
that probability so quality improves without diversity collapsing.

## Method

A fully connected GAN on MNIST: a four-layer generator and a three-layer discriminator (a weaker discriminator
turned out to be a better filter). I built four variants in turn: basic DRS with a global normaliser, a
ratio-based rule recomputed per batch, DRS with soft truncation of the latent code, and an adaptive soft
truncation that only touches samples the discriminator scores poorly.

## Results

Soft truncation buys the best precision at the cost of the worst recall; the adaptive variant keeps most of
that precision and reaches the highest recall of the four. A Metropolis–Hastings sampler is the natural next step.
