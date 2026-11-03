---
numeral: VII
order: 7
title: Interpretable text classification for NAF coding at INSEE
short: Interpretable NAF coding
taxon: Classificator interpretabilis
family: Transformers
habitat: INSEE
observed: 2026
period: Apr–Jul 2026
domain: NLP
team: solo
stack: [Python, PyTorch, PyTorch Lightning, Hydra, MLflow, Captum, uv, Argo Workflows, Quarto]
abstract: >-
  Every new French company describes its activity in a line of free text, and INSEE has to file it under
  one of about 700 codes of the NAF nomenclature. I compared lightweight, explainable architectures for
  this task, from FastText to small transformers with label attention, and built a multi-level model
  that predicts all five levels of the hierarchy jointly. I also tested whether the explanations are faithful.
featured: true
engraving: roots
figCaption: The NAF nomenclature drawn as a root system. Five levels, from 21 sections down to about 700 sub-classes, all fed by one shared stem. The red root is a single prediction traced through every level.
figAlt: Botanical engraving of a root system growing downward from a short stem labelled “encoder”; it divides into thick primary roots, then finer and finer rootlets across five labelled depths (section, division, group, class, sub-class), with one continuous path from stem to tip inked in vermilion.
links:
  - { label: Report & demo, href: 'https://julber95.github.io/interpretable-text-classification/' }
  - { label: Repository, href: 'https://github.com/julber95/interpretable-text-classification' }
  - { label: torchTextClassifiers, href: 'https://github.com/InseeFrLab/torchTextClassifiers' }
resultsCaption: Multi-level vs single-level NAF models, analysis of wrong sub-class predictions (report, NAF pages).
results:
  - { label: '“Completely wrong” errors (miss even the section), single-level', value: '≈ 47%' }
  - { label: '“Completely wrong” errors, multi-level heads', value: '29–34%', best: true }
  - { label: Section / division recovered vs truncation (FastText), value: '+8.6 / +9.6 pp' }
  - { label: Section / division recovered vs truncation (Label Attention), value: '+9.9 / +13.1 pp', best: true }
---

## Problem

When a company is created, its declarant describes the activity in free text, and INSEE must assign it a
code from the **NAF** (*Nomenclature d'activités française*, aligned with NACE Rev. 2.1). The production
system is a single-level FastText model that predicts the finest code directly. Two questions:

1. Can **lightweight** architectures, at a fraction of the cost of a large language model, match or improve on it, and how do they behave as capacity, vocabulary and training-data volume change?
2. Can their predictions be **explained**, and are those explanations **faithful** across NAF's five nested levels?

<aside class="note">NAF is a five-level tree: section → division → group → class → sub-class, from 21 sections down to about 750 official codes. 679 sub-classes appear in the training split.</aside>

## Method

All models are built on INSEE's [`torchTextClassifiers`](https://github.com/InseeFrLab/torchTextClassifiers).
There are four architectures, from two encoders crossed with two ways of aggregating tokens:

- **FastText**: averaged token embeddings and a linear head. No attention.
- **FastText + Label Attention**: one learned query per class cross-attends over the tokens.
- **FATE** (FastText Attentive Transformer Encoder): transformer blocks before mean pooling.
- **FATE + Label Attention**: both.

I benchmarked them in increasing order of difficulty: Amazon Reviews (5 classes) → CLINC150 (150) → NAF 2025
(~700 sub-classes, ~1.2M training examples). For NAF I designed a **multi-level model**: one shared
encoder feeds five *independent* per-level heads, trained jointly with a cross-entropy loss weighted by
each level's class count.

**Explainability.** I used Captum's Layer Integrated Gradients for every architecture, and the label-attention
weights themselves where the model has them. Both were checked with a *comprehensiveness* test:
delete the most-attributed words and see whether confidence falls faster than when deleting random words.

<aside class="note">Training sweeps ran as Argo Workflows on a Kubernetes GPU cluster. Every run is tracked in MLflow and configured with Hydra; dependencies are pinned with uv.</aside>

## Results

The multi-level model changes *how* the models are wrong. Among wrong sub-class predictions, about
47% of a single-level model's errors miss even the section. With dedicated per-level heads, that falls to
**29–34%**. Asking the section and division heads directly recovers +8.6 / +9.6 points for FastText and
**+9.9 / +13.1 points for Label Attention**, compared with truncating a wrong sub-class prediction.
The cost is that the heads can disagree with each other, which this internship left open.

<!-- TODO: add the headline top-1 sub-class accuracy of the best single-level and multi-level models
     (it is in the report's figures, not in its text), as rows in `results`. -->

The full write-up is an interactive Quarto report with every figure, sweep and explanation:
[julber95.github.io/interpretable-text-classification](https://julber95.github.io/interpretable-text-classification/).
