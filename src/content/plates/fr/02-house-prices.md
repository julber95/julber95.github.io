---
order: 2
title: Prédiction de prix immobiliers
label: Prix immobiliers
summary: Prédire le prix de biens immobiliers français à partir de 40 000 annonces incomplètes, avec imputation par plus proches voisins et un XGBoost réglé.
observed: 2024
period: année universitaire 2023–24
domain: Tabular
team: team of four
stack: [Python, XGBoost, scikit-learn, pandas, Jupyter]
abstract: >-
  Quarante mille annonces immobilières françaises, vingt-sept variables et beaucoup d’informations manquantes.
  Nous avons imputé les valeurs manquantes à partir des plus proches voisins, encodé des milliers de villes,
  et réglé un régresseur XGBoost profond par recherche sur grille.
engraving: pipeline
figCaption: La chaîne de traitement, étape par étape. Quarante mille annonces lacunaires sont encodées (étiquettes énergétiques en label encoding, type de bien en one-hot), complétées par un imputeur aux k plus proches voisins, puis quatre régresseurs sont comparés et XGBoost est réglé par recherche sur grille.
figAlt: Gravure d’un organigramme vertical à cinq cases, annonces brutes, encodage, imputation, comparaison et réglage, chacune avec ses paramètres, qui aboutit à une case arrondie marquée prix. De petits schémas à gauche montrent une matrice à trous, une table lettre-nombre, un nuage de plus proches voisins, quatre étiquettes de modèles et de petits arbres.
links:
  - { label: Dépôt, href: 'https://github.com/julber95/house-price-prediction-ML' }
  - { label: Page du challenge, href: 'https://challengedata.ens.fr/participants/challenges/68/' }
results: []
---

## Problème

Prédire le prix d’un bien à partir de son annonce (ENS Challenge Data n° 68) : ville, type, surfaces, pièces,
étiquettes énergie et gaz à effet de serre, orientation. La cible est très dispersée et les entrées incomplètes :
`CITY` compte à elle seule environ 8 000 valeurs distinctes, et plus de 18 000 annonces n’ont pas d’étiquette énergie.

## Méthode

Les étiquettes ordinales ont été encodées en entiers et les variables nominales en one-hot. Les surfaces et
nombres de pièces manquants ont été complétés par un **imputeur aux K plus proches voisins**. La régression
linéaire, les KNN et une forêt aléatoire ont été comparés à **XGBoost**, réglé avec `GridSearchCV`
(1 600 arbres, profondeur 10, taux d’apprentissage 0,04).

## Résultats

XGBoost était le meilleur des quatre modèles. Ajouter les photos des annonces en entrée n’a pas amélioré le score.
