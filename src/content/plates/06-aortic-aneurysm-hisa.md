---
numeral: VI
order: 6
title: Predicting aortic-wall inflammation (HISA) in abdominal aneurysms
short: Aortic aneurysms (HISA)
taxon: Aorta inflammata
family: Linear probes on foundation embeddings
habitat: HistAAA cohort, three European centres
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
featured: true
engraving: aorta
figCaption: A section of aortic wall in stipple, from intima to adventitia. Inflammatory infiltrates are marked in red where the HISA score would count them.
figAlt: Stippled engraving of a curved band of arterial wall in cross-section, with layered elastic fibres drawn as fine wavy lines, calcified patches in dense dots and a few clusters of inflammatory cells in vermilion.
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

HISA (Histological Inflammation Scale of Aneurysms) grades how degraded and inflamed an aneurysmal
aortic wall is, and it is only available after surgery, from tissue. Kolbinger et al. showed that
attention-based multiple-instance learning on whole-slide images predicts it with an AUC of
0.77–0.79 on external validation. My question was the complementary one: **how much of that signal
survives in simpler, tabular representations?**

## Method

Four pipelines, each with its own preprocessing and a common model zoo (logistic regression, naive
Bayes, KNN, random forest and others), compared by 5-fold cross-validated AUC. The held-out test set
was used once.

1. **Clinical only.** Pre-operative variables: age, sex, BMI, aneurysm diameter, smoking.
2. **Combined.** All variables, *including* the inflammation grades. Kept on purpose, as a ceiling.
3. **Clinical + structural.** Adds calcification, fibrosis, angiogenesis and elastin degradation; feature selection with SelectKBest and RFECV.
4. **Image embeddings.** CTransPath features of each H&E slide, mean-pooled to one 768-d vector per patient, then PCA(150).

<aside class="note">Pipeline 2 is <em>conceptual leakage</em>: inflammation grades are used to predict an inflammation score. Its 0.961 shows what perfect information looks like. It isn't a result.</aside>

## Results

Pre-operative variables carry almost no signal: AUC 0.614 and recall 0.11 on the high-HISA class.
Structural histology adds nothing, and a **tabular ceiling of about 0.64** held across feature selection and
tuning. Mean-pooled slide embeddings recover the signal: **test AUC 0.717** (CV 0.820). The gap to the
paper's 0.77–0.79 is roughly what spatial attention buys when it finds the informative regions of a slide.

<aside class="note">Validation is internal only, on a random 80/20 split of the pooled centres, so these AUCs are likely optimistic compared with the paper's external cohorts.</aside>
