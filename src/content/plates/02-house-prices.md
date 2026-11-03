---
numeral: II
order: 2
title: Real-estate price prediction
short: House prices
taxon: Pretium domus
family: Boosted trees
habitat: ENS Challenge Data no. 68
observed: 2024
period: 2023–24 academic year  # TODO: exact month(s)
domain: Tabular
team: team of four
stack: [Python, XGBoost, scikit-learn, pandas, Jupyter]
abstract: >-
  Forty thousand French property listings, twenty-seven features, and a great deal of missing
  information. We imputed what was missing from nearest neighbours, encoded thousands of cities,
  and tuned a deep XGBoost regressor with grid search.
featured: false
engraving: house
figCaption: A house in cross-section, with its rooms, surfaces and energy rating dimensioned like a surveyor's drawing; only the price is left unmeasured.
figAlt: Engraving of a two-storey house in cross-section with hatched walls, dimension lines marking floor area and land size, room labels and an energy-rating scale; a price tag hangs blank.
links:
  - { label: Repository, href: 'https://github.com/julber95/house-price-prediction-ML' }
  - { label: Challenge page, href: 'https://challengedata.ens.fr/participants/challenges/68/' }
results: []
---

## Problem

Predict the price of a property from its listing: city, property type, living and land area,
rooms, bedrooms, bathrooms, energy and greenhouse-gas ratings, orientation. The target is
continuous and widely dispersed, and the inputs are incomplete. `CITY` alone has about
8,000 distinct values, and more than 18,000 listings have no energy rating.

<aside class="note">About 75% of <code>EXPOSITION</code> values are missing, and <code>FLOOR</code> is missing in 27,625 of the 40,000 rows.</aside>

## Method

- Label encoding for ordinal ratings (energy performance), one-hot encoding for nominal variables (city, property type).
- A **K-nearest-neighbours imputer** for numerical gaps: each missing surface or room count is estimated from the most similar listings. We also tried iterative imputation.
- Removed redundant variables, standardised numerical features.
- Compared linear regression, KNN and a random forest against **XGBoost**, then tuned XGBoost with `GridSearchCV` (1,600 trees, depth 10, learning rate 0.04, subsample 0.91).

## Results

XGBoost was the strongest model of the four.

<!-- TODO: confirm the challenge metric (MAPE?) and the final score, then add them to `results` in the front matter.
     The presentation slides show “34%–37%”, “29%”, and “31.4” for an image-feature variant, without saying which is which. -->

## Notes

We also tested listing photos as extra inputs; after optimisation they did not improve the score.
