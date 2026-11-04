---
order: 6
title: Predicting aortic-wall inflammation in abdominal aneurysms
label: Aortic-wall inflammation (HISA)
summary: Four feature pipelines for the HISA inflammation score on 369 patients. Charts plateau near chance; slide embeddings reach a test AUC of 0.717.
observed: 2026
period: Apr 2026
domain: Medical
team: solo
stack: [Python, scikit-learn, pandas, NumPy, h5py, Matplotlib]
abstract: >-
  Can a patient's chart predict how inflamed their aortic wall is? On the HistAAA cohort (369 patients
  with abdominal aortic aneurysms), I benchmarked four feature pipelines for the HISA inflammation score,
  as a tabular complement to the original whole-slide deep-learning paper. Clinical and structural
  variables plateau near chance. Mean-pooled CTransPath embeddings of H&E slides reach a test AUC of 0.717.
engraving: aorta
figCaption: A section of aortic wall in stipple, from intima to adventitia. Inflammatory infiltrates are marked in red.
figAlt: Stippled engraving of a curved band of arterial wall in cross-section with layered elastic fibres, calcified patches and a few clusters of inflammatory cells in blue.
links:
  - { label: Repository, href: 'https://github.com/julber95/aortic-aneurysm-hisa-prediction' }
  - { label: Report (PDF), href: 'https://github.com/julber95/aortic-aneurysm-hisa-prediction/blob/main/report.pdf' }
  - { label: Dataset (Zenodo), href: 'https://zenodo.org/records/10998464' }
  - { label: Reference paper, href: 'https://doi.org/10.1186/s13000-025-01684-5' }
resultsCaption: Held-out test AUC for HISA (binary), best model per pipeline. Model selection on 5-fold CV AUC; test n = 71.
results:
  - { label: Clinical only (Naive Bayes), value: '0.614', note: 'recall (high) 0.11' }
  - { label: Clinical + structural (logistic reg.), value: '0.591' }
  - { label: H&E mean-pooled CTransPath (logistic reg.), value: '0.717', note: 'CV AUC 0.820 ± 0.054', best: true }
  - { label: Combined incl. inflammation grades (random forest), value: '0.961', note: 'leakage: upper bound only' }
  - { label: 'Reference: attention-MIL on whole slides', value: '0.77–0.79', note: 'Kolbinger et al., external validation' }
---

## Problem

HISA grades how inflamed an aneurysmal aortic wall is, and it is only available after surgery, from tissue.
Kolbinger et al. predict it from whole-slide images with attention-based MIL (AUC 0.77–0.79). My question:
**how much of that signal survives in simpler, tabular representations?**

## Method

Four pipelines, compared by 5-fold cross-validated AUC with a single use of the held-out test set:
pre-operative clinical variables; clinical plus structural histology (with SelectKBest and RFECV); all variables
including inflammation grades, kept on purpose as a leakage ceiling; and CTransPath H&E embeddings mean-pooled
per patient, then PCA(150).

## Results

Pre-operative and structural variables carry almost no signal; mean-pooled slide embeddings recover much of it,
still short of the paper's attention-based model. Validation is internal only, so these AUCs are likely optimistic compared
with the paper's external cohorts.
