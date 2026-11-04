---
order: 7
title: Interpretable text classification at INSEE
label: Interpretable NAF coding
summary: Lightweight, explainable classifiers that file French company descriptions under ~700 NAF codes, with a model that predicts all five levels at once.
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
engraving: roots
figCaption: The NAF nomenclature drawn as a root system. Five levels, down to about 700 sub-classes, all fed by one shared stem; the blue root is a single prediction.
figAlt: Botanical engraving of a root system growing from a short stem labelled encoder, dividing across five labelled depths, with one path from stem to tip inked in blue.
links:
  - { label: Report & demo, href: 'https://julber95.github.io/interpretable-text-classification/' }
  - { label: Repository, href: 'https://github.com/julber95/interpretable-text-classification' }
  - { label: torchTextClassifiers, href: 'https://github.com/InseeFrLab/torchTextClassifiers' }
resultsCaption: Multi-level vs single-level NAF models, among wrong sub-class predictions (report and defense slides).
results:
  - { label: '“Completely wrong” errors (miss even the section), single-level', value: '≈ 47%' }
  - { label: '“Completely wrong” errors, multi-level heads', value: '29–34%', best: true }
  - { label: Section / division recovered vs truncation (FastText), value: '+8.6 / +9.6 pp' }
  - { label: Section / division recovered vs truncation (Label Attention), value: '+9.9 / +13.1 pp', best: true }
# TODO: add the headline top-1 sub-class accuracy of the best single-level and multi-level models
# (it is in the report's figures, not in its text), as rows in `results`.
---

## Problem

INSEE codes each new company's free-text activity description against the five-level NAF nomenclature
(section → division → group → class → sub-class). Can **lightweight** models match the production FastText
baseline at a fraction of an LLM's cost, and can their predictions be **explained** faithfully?

## Method

Built on INSEE's [`torchTextClassifiers`](https://github.com/InseeFrLab/torchTextClassifiers): FastText and
small transformer encoders (FATE), each with mean pooling or label attention, benchmarked on Amazon Reviews,
CLINC150 and NAF 2025 (~1.2M training examples). A **multi-level model** feeds one shared encoder into five
per-level heads. Explanations from Captum Integrated Gradients and label-attention weights were checked with a
word-deletion faithfulness test.

## Results

Per-level heads change *how* the models are wrong rather than how often (table below). The heads can still
disagree with each other, which remains open. The full interactive report is at
[julber95.github.io/interpretable-text-classification](https://julber95.github.io/interpretable-text-classification/).

