---
numeral: I
order: 1
title: Fraud detection in consumer-credit baskets
short: Fraud detection
taxon: Silva gradientis
family: Boosted ensembles
habitat: BNP Paribas Personal Finance (ENS Challenge Data no. 104)
observed: 2024
period: Jun 2024
domain: Tabular
team: team of four
stack: [Python, scikit-learn, pandas, NumPy, Jupyter]
abstract: >-
  A purchase basket arrives; is it fraud? On 115,988 transactions with 1.4% positives,
  we flattened 24 item slots into basket-level features and compared four classifiers on
  precision–recall AUC. A gradient-boosted ensemble tuned with randomized search finished
  first on both the public and the private leaderboard.
featured: false
engraving: forest
figCaption: A forest of shallow trees, each correcting the last; the one leaf that flags the rare fraudulent basket is inked in red.
figAlt: Engraving of a small forest of decision trees drawn in hatched ink, receding in depth, each split marked with a node; one leaf on the frontmost tree is marked in vermilion.
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

BNP Paribas Personal Finance finances purchases through partner retailers, and wants to
flag fraudulent baskets *before* the credit is approved. Each observation is a basket of up to
24 items, described by category, price, manufacturer, model and quantity: 147 columns in all.
Only 1,319 of the 92,790 training baskets (1.42%) are fraudulent, so accuracy is meaningless.
The metric is the area under the precision–recall curve.

<aside class="note">PR-AUC is computed as average precision, Σ (Rₙ − Rₙ₋₁) Pₙ, which is what scikit-learn's <code>average_precision_score</code> implements. Under a 1.4% base rate, a random classifier scores about 0.014.</aside>

## Method

- Flattened the 24 item slots into basket-level aggregates (item count, total price, category indicators), merged duplicated categorical variables and dropped product codes that carried no signal.
- One-hot encoded categories rather than label encoding, so no false ordering was introduced.
- Stratified 80/20 split, keeping the fraud rate identical in both halves.
- Compared a decision tree, logistic regression, a random forest and gradient boosting; tuned the boosted model with `RandomizedSearchCV` under cross-validation.

## Results

Gradient boosting beat the other three models by a wide margin and placed **first on both
leaderboards**. The most informative features were the basket's size and total price,
a handful of high-risk categories (electronics, high-value items), and brand × model
interactions such as repeated purchases of high-end phones.

<aside class="note">Our held-out split: 23,198 baskets, 362 of them fraudulent.</aside>
