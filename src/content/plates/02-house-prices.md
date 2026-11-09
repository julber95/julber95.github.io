---
order: 2
title: Real-estate price prediction
label: House prices
summary: Predicting French property prices from 40,000 incomplete listings, with nearest-neighbour imputation and a tuned XGBoost regressor.
observed: 2024
period: 2023–24 academic year  # TODO: exact month(s)
domain: Tabular
team: team of four
stack: [Python, XGBoost, scikit-learn, pandas, Jupyter]
abstract: >-
  Forty thousand French property listings, twenty-seven features, and a great deal of missing
  information. We imputed what was missing from nearest neighbours, encoded thousands of cities,
  and tuned a deep XGBoost regressor with grid search.
engraving: pipeline
figCaption: The pipeline, step by step. Forty thousand listings with gaps are encoded (energy ratings as labels, property type one-hot), completed by a k-nearest-neighbours imputer, then four regressors are compared and XGBoost is tuned by grid search.
figAlt: Engraving of a vertical flowchart with five boxes, raw listings, encode, impute, compare and tune, each with its settings, ending in a rounded box marked price. Small diagrams on the left show a matrix with gaps, a grade-to-number table, a nearest-neighbour cloud, four model tags and small trees.
links:
  - { label: Repository, href: 'https://github.com/julber95/house-price-prediction-ML' }
  - { label: Challenge page, href: 'https://challengedata.ens.fr/participants/challenges/68/' }
results: []
# TODO: confirm the challenge metric (MAPE?) and the final score, then add them to `results` in the front matter.
# The presentation slides show “34%–37%”, “29%”, and “31.4” for an image-feature variant, without saying which is which.
---

## Problem

Predict a property's price from its listing (ENS Challenge Data no. 68): city, type, surfaces, rooms, energy
and greenhouse-gas ratings, orientation. The target is widely dispersed and the inputs are incomplete:
`CITY` alone has about 8,000 distinct values, and more than 18,000 listings have no energy rating.

## Method

Ordinal ratings were label-encoded and nominal variables one-hot encoded. Missing surfaces and room counts were
filled with a **K-nearest-neighbours imputer**. Linear regression, KNN and a random forest were compared with
**XGBoost**, which was tuned with `GridSearchCV` (1,600 trees, depth 10, learning rate 0.04).

## Results

XGBoost was the strongest model of the four. Adding listing photos as inputs did not improve the score.

