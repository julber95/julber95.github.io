---
numeral: V
order: 5
title: Lymph-node metastasis detection
short: Lymph-node metastases
taxon: Nodus lymphaticus
family: Image classifiers
habitat: ENS Challenge Data no. 18
observed: 2025
period: Apr–May 2025
domain: Medical
# TODO: add `team: solo` or `team: team of four` once confirmed
stack: [Python]  # TODO: add the libraries you used (PyTorch? scikit-learn?)
abstract: >-
  Detecting metastases of breast cancer in lymph-node histology: a challenge from ENS Challenge Data,
  approached with classical machine-learning baselines and deep models on tissue images.
featured: false
engraving: lymph
figCaption: A lymph node in section, drawn in stipple. One cluster of atypical cells is marked in red.
figAlt: Stippled engraving of a lymph node cross-section with capsule, cortex and follicles drawn as dot clusters; a small irregular group of denser cells is circled in vermilion.
links:
  - { label: Challenge page, href: 'https://challengedata.ens.fr/participants/challenges/18/' }
results: []
---

## Problem

Whether a breast cancer has spread to the lymph nodes changes its staging and its treatment.
The challenge asks for an automatic decision from histological images of lymph-node tissue.

<!-- TODO: add a "## Method" section (models tried, features or pretrained encoder, validation)
     and a "## Results" section (challenge metric, your score or rank). -->

## Notes

I explored machine-learning and deep-learning models for this challenge. There is no public repository,
so this plate stays short for now.

