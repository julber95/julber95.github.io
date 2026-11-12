---
order: 1
title: Détection de fraude dans des paniers de crédit à la consommation
label: Détection de fraude
summary: Gradient boosting sur 116 000 paniers d’achat avec 1,4 % de fraude. Première place sur les deux classements du challenge BNP Paribas.
observed: 2024
period: juin 2024
domain: Tabular
team: team of four
stack: [Python, scikit-learn, pandas, NumPy, Jupyter]
abstract: >-
  Un panier d’achat arrive : est-ce une fraude ? Sur 115 988 transactions dont 1,4 % de positifs,
  nous avons aplati 24 emplacements d’articles en variables au niveau du panier et comparé quatre classifieurs
  selon l’AUC précision–rappel. Un ensemble de gradient boosting réglé par recherche aléatoire a terminé
  premier sur le classement public comme sur le classement privé.
engraving: threshold
figCaption: "Où couper. Les scores du modèle pour les paniers légitimes (98,6 %) et frauduleux (1,4 %), et le seuil qui sépare les paniers acceptés des paniers signalés. Le déplacer échange des fausses alertes contre des fraudes manquées : c’est ce que mesure l’AUC précision–rappel. Les formes des courbes sont illustratives."
figAlt: "Gravure de deux distributions de scores sur un même axe : une grande courbe hachurée pour les paniers légitimes à gauche et une petite courbe bleue pointillée pour les paniers frauduleux à droite, séparées par une ligne de seuil bleue en tirets."
links:
  - { label: Dépôt, href: 'https://github.com/julber95/fraud-detection-ML' }
  - { label: Page du challenge, href: 'https://challengedata.ens.fr/participants/challenges/104/' }
resultsCaption: PR-AUC de chaque modèle. Les deux scores du boosting sont les résultats officiels des classements.
results:
  - { label: Arbre de décision, value: '0,07' }
  - { label: Régression logistique, value: '0,01' }
  - { label: Forêt aléatoire, value: '0,22' }
  - { label: Gradient boosting (classement public), value: '0,2813', note: '1re place', best: true }
  - { label: Gradient boosting (classement privé), value: '0,3507', note: '1re place', best: true }
---

## Problème

BNP Paribas Personal Finance veut repérer les paniers frauduleux *avant* l’accord d’un crédit (ENS Challenge
Data n° 104). Chaque panier contient jusqu’à 24 articles décrits sur 147 colonnes, et seuls 1,42 % des 92 790
paniers d’entraînement sont frauduleux : la métrique est donc l’AUC précision–rappel.

## Méthode

Nous avons aplati les emplacements d’articles en agrégats au niveau du panier (nombre d’articles, prix total,
indicateurs de catégorie), encodé les catégories en one-hot et gardé le même taux de fraude dans un découpage
80/20. Un arbre de décision, une régression logistique, une forêt aléatoire et un gradient boosting ont été
comparés ; le modèle de boosting a été réglé par une recherche aléatoire d’hyperparamètres (`RandomizedSearchCV`)
en validation croisée.

## Résultats

Le gradient boosting a terminé **premier sur les deux classements**. Les variables les plus informatives étaient
la taille du panier et le prix total, quelques catégories à risque, et des interactions marque × modèle comme
des téléphones haut de gamme achetés en plusieurs exemplaires.
