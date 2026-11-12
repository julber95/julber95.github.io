---
order: 4
title: Stratégies de décodage autorégressif
label: Stratégies de décodage
summary: Greedy, beam search, top-k et nucleus sampling comparés sur un modèle de langage LSTM entraîné sur WikiText-2.
observed: 2025
period: mai 2025
domain: NLP
team: solo
stack: [Python, PyTorch, NLTK, NumPy, Matplotlib, NetworkX]
abstract: >-
  Un même modèle de langage n’écrit pas pareil selon la façon dont on le lit. J’ai entraîné un LSTM à deux couches
  sur WikiText-2 et comparé le décodage greedy, le beam search, le top-k et le nucleus sampling, avec des scores
  BLEU et ROUGE et des dessins du processus de décodage lui-même.
engraving: decoders
figCaption: Quatre façons de choisir le mot suivant. Greedy suit la branche la plus probable ; le beam search garde les trois meilleures phrases partielles (en bleu) ; le top-k lance un dé parmi un ensemble fixe ; le nucleus échantillonne dans un ensemble qui grandit et rétrécit avec la confiance du modèle. Les arbres sont illustratifs.
figAlt: Gravure en quatre panneaux, chacun un petit arbre qui pousse de gauche à droite. Greedy suit une seule branche ; le beam search garde trois branches dans des capsules en tirets, tracées en bleu ; le top-k marque trois candidats d’une accolade et d’un dé ; le nucleus marque une accolade dont la taille change à chaque pas.
links:
  - { label: Dépôt, href: 'https://github.com/julber95/autoregressive-decoding-strategies' }
results: []
---

## Problème

Un modèle de langage produit une distribution sur le token suivant ; la *manière* d’y piocher décide si le texte
sera répétitif, cohérent ou surprenant. L’objectif : coder à la main les quatre stratégies classiques et observer
le compromis qualité–diversité de chacune.

## Méthode

Un LSTM au niveau du mot (embeddings de dimension 300, deux couches de 512 unités, dropout 0,5) entraîné 30 époques
sur WikiText-2. Greedy, beam search (largeur 5 et 10), top-k (k = 5, 10) et nucleus sampling (p = 0,6) ont été
écrits from scratch, évalués avec BLEU et ROUGE, et visualisés sous forme d’arbres de beam et de seuils de probabilité.

## Résultats

Le beam search de largeur 10 a obtenu le meilleur BLEU, à égalité avec la largeur 5 pour le meilleur ROUGE-L.
Greedy et nucleus (p = 0,6) ont produit des continuations identiques : sur un petit modèle, un nucleus serré
semble se réduire à l’argmax.
