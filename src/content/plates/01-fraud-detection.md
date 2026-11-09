---
order: 1
title: Fraud detection in consumer-credit baskets
label: Fraud detection
summary: Gradient boosting on 116k purchase baskets with 1.4% fraud. First place on both leaderboards of the BNP Paribas challenge.
observed: 2024
period: Jun 2024
domain: Tabular
team: team of four
stack: [Python, scikit-learn, pandas, NumPy, Jupyter]
abstract: >-
  A purchase basket arrives; is it fraud? On 115,988 transactions with 1.4% positives,
  we flattened 24 item slots into basket-level features and compared four classifiers on
  precision–recall AUC. A gradient-boosted ensemble tuned with randomised search finished
  first on both the public and the private leaderboard.
engraving: threshold
figCaption: "Where to cut. Model scores for legitimate baskets (98.6%) and fraudulent ones (1.4%), and the threshold that separates approved from flagged. Moving it trades false alarms against missed fraud, which is what precision–recall AUC measures. The curve shapes are illustrative."
figAlt: "Engraving of two score distributions on one axis: a tall hatched curve for legitimate baskets on the left and a small blue stippled curve for fraudulent baskets on the right, divided by a dashed blue threshold line labelled approved and flagged for review."
links:
  - { label: Repository, href: 'https://github.com/julber95/fraud-detection-ML' }
  - { label: Challenge page, href: 'https://challengedata.ens.fr/participants/challenges/104/' }
resultsCaption: PR-AUC for each model. The two boosted scores are the official leaderboard results.
results:
  - { label: Decision tree, value: '0.07' }
  - { label: Logistic regression, value: '0.01' }
  - { label: Random forest, value: '0.22' }
  - { label: Gradient boosting (public leaderboard), value: '0.2813', note: '1st place', best: true }
  - { label: Gradient boosting (private leaderboard), value: '0.3507', note: '1st place', best: true }
---

## Problem

BNP Paribas Personal Finance wants to flag fraudulent baskets *before* a credit is approved (ENS Challenge
Data no. 104). Each basket holds up to 24 items described across 147 columns, and only 1.42% of the 92,790
training baskets are fraudulent, so the metric is precision–recall AUC.

## Method

We flattened the item slots into basket-level aggregates (item count, total price, category indicators),
one-hot encoded categories and kept the fraud rate identical across an 80/20 split. A decision tree, logistic
regression, a random forest and gradient boosting were compared; the boosted model was tuned with a randomised
hyperparameter search (`RandomizedSearchCV`) under cross-validation.

## Results

Gradient boosting placed **first on both leaderboards**. The most informative features were basket size and
total price, a few high-risk categories, and brand × model interactions such as repeated high-end phones.
