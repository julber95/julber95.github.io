---
numeral: III
order: 3
title: Discriminator rejection sampling for GANs
short: GANs & rejection sampling
taxon: Generator selectus
family: Adversarial networks
habitat: MNIST
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
featured: true
engraving: digits
figCaption: Generated digits as they leave the sampler. Accepted samples are inked; rejected ones are struck through with a single red stroke. The scores shown are illustrative.
figAlt: Engraving of a grid of handwritten digits made of stippled dots; most are clean and accepted, a few are faint or malformed and crossed out with a vermilion line, with acceptance scores written beneath in small type.
links:
  - { label: Repository, href: 'https://github.com/julber95/gan-drs-enhancement-DL' }
resultsCaption: Precision and recall of the generated distribution for each sampling variant (report, Annexes A–D).
results:
  - { label: Basic DRS (global M), value: 'P 0.48–0.50 · R 0.21' }
  - { label: Ratio-based DRS (per-batch M), value: 'P 0.51–0.52 · R 0.22' }
  - { label: DRS + soft truncation, value: 'P 0.55 · R 0.16' }
  - { label: DRS + adaptive soft truncation, value: 'P 0.53 · R 0.24', note: 'best balance', best: true }
---

## Problem

GANs trained on simple data still produce two kinds of failure: samples with artefacts, and
missing modes. *Discriminator Rejection Sampling* (Azadi et al., 2019) post-processes the
generator: each sample x is kept with a probability that depends on the discriminator's score D(x).
The question is how to set that probability so that quality goes up without diversity collapsing.

<aside class="note">References: Goodfellow et al. (2014), <em>Generative Adversarial Networks</em>; Salimans et al. (2016), <em>Improved Techniques for Training GANs</em>; Azadi et al. (2019), <em>Discriminator Rejection Sampling</em>.</aside>

## Method

A fully connected GAN on MNIST: a four-layer generator from a 100-dimensional latent vector, and a
three-layer discriminator.

<aside class="note">A <em>weaker</em> discriminator turned out to be better for DRS. The four-layer one was so strict that it rejected too much.</aside>

1. **Basic DRS.** Accept x with probability D(x)/M, with M a global maximum of D over batches. Too strict: diversity drops.
2. **Ratio-based DRS.** Use the density-ratio form D(x) / (1 − D(x) + ε), and recompute M per batch so that rare but good samples keep a fair chance.
3. **Soft truncation.** Rescale the latent code (z ← z · s) to pull samples away from the tails. Precision rises, recall falls.
4. **Adaptive soft truncation.** Truncate only the samples the discriminator scores poorly; leave confident samples untouched.

## Results

The progression is the classic quality–diversity trade-off, made visible. Global truncation buys
the best precision (0.55) at the cost of the worst recall (0.16). The adaptive variant keeps most of
that precision (0.53) and reaches the **highest recall of all four (0.24)**, the best balance.

## Notes

All four methods are limited by the fully connected models. The natural next step is a
Metropolis–Hastings-style sampler, which approximates the target distribution with fewer assumptions
than plain rejection.
